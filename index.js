'use strict';

 const FrdlFrameworkAspectsOID = '1.3.6.1.4.1.37553.8.1.8.8.11';


	  var frdl = (process.shim && 'frdl'===process.shim)
                     ? require.main.frdl
	                 : require('@frdl/functions');

 
      var download =(process.shim && 'frdl'===process.shim)
                     ?  require.main.frdl.dl
                     :  require('@frdl/simple-downloader');
 

     var remoteRequire = (process.shim && 'frdl'===process.shim)
                     ?  require.main.requireRemoteModulePromise
                     :  require('require-from-web');



	  var emitter = (process.shim && 'frdl'===process.shim)
                     ? require('@frdl/eventemitter')[Symbol.for('main')]
	                 : require('@frdl/eventemitter');





    var helperReady = require("@frdl/helper")(frdl, emitter);


/*
webfantize(flavor, pkg)
getAttachmentDownloadUrl(identifier, filename)
getAspectItem(name)
getOid(OID)
*/
exports = module.exports = {
	webfantize : webfantize,
	oid : {
	   getAttachmentDownloadUrl : getAttachmentDownloadUrl,
	   getAspectItem : getAspectItem,
	   getOid : getOid,
	   getOidWhoisUrl : getOidWhoisUrl
	}
};



      function getOidWhoisUrl(OID){
			 return new Promise(function(resolve,reject){
					Promise.all([helperReady, download('https://discover.api.webfan.de/.well-known/frdlweb.json')])
	                      .then(function(data){
                             resolve(frdl.templater(data[1].repository.oid[0].url, {
							    query : OID
							 }));
							
						  }).catch(function(e){
							 console.error(e);
							 reject(e);
						 });
					   });	  
	  }


      function getOid(OID){
        

				 return new Promise(function(resolve,reject){
					download('https://look-up.webfan3.de/plugins/publicPages/100_whois/whois/webwhois.php?format=json&query=oid%3A' + OID)
	                      .then(function(data){
                             resolve(data);
							
						  }).catch(function(e){
							 console.error(e);
							 reject(e);
						 });
					   });
   }
				   
				   
function getAspectItem(name){


 return new Promise(function(resolve, reject){
  getOid(FrdlFrameworkAspectsOID) 
  .then(function(data){

       
   frdl.each(data.whois[1].subordinate, function(i,str){
           var item = str.match(/oid\:(?<oid>[0-9\.]+)\s\((?<title>[A-Za-z\-]+)\)/).groups;
           if(name===item.title){
		    getOid(item.oid)  .then(function(oid){
			    resolve(oid);
			}).catch(function(e){
							 console.error(e);
							 reject(e);
						 });
		    
		    return false;
		 }
    });
  });
 });
}
		



function getAttachmentDownloadUrl(identifier, filename){

 return new Promise(function(resolve,reject){

  getAspectItem(identifier).then(function(oid){

 	    if(frdl.is.undefined(oid.whois[1]["attachment-name"])){
                 oid.whois[1]["attachment-name"] = [];
            }else if(true!==frdl.is.array(oid.whois[1]["attachment-name"])){
                 oid.whois[1]["attachment-name"] = [oid.whois[1]["attachment-name"]];
            } 


 	    if(frdl.is.undefined(oid.whois[1]["attachment-url"])){
                 oid.whois[1]["attachment-url"] = [];
            }else if(true!==frdl.is.array(oid.whois[1]["attachment-url"])){
                 oid.whois[1]["attachment-url"] = [oid.whois[1]["attachment-url"]];
            } 

           frdl.each(oid.whois[1]["attachment-name"], function(i, name){
                 if(name===filename){
                        resolve(oid.whois[1]["attachment-url"][i]);
                     return false; 
                  }
           });
  }).catch(function(e){
							 console.error(e);
							 reject(e);
						 });

 });
}



function webfantize(flavor, pkg){
 return new Promise(function(resolve,reject){	
	
	getAttachmentDownloadUrl(flavor, 'webfantize.js')
	 .then(function(url){	
		remoteRequire(url).then(function(webfanTizePackage){
               var newPkg = webfanTizePackage(pkg);
               resolve(newPkg);
         }).catch(function(e){
							 console.error(e);
							 reject(e);
						 }); 	
	}).catch(function(e){
							 console.error(e);
							 reject(e);
						 });
	
 });
}

