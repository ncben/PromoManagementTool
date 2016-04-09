var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

var cacheHostnamePID = function(req, domain, isDelete, cb){
	
	var fs = require('fs');
	fs.readFile(__dirname+'/writable/config.hostname.pid.json', {flag: 'a+'}, function (err, data) {
		if (err) throw err;
		var data = JSON.parse(data);
							
		var appNamespaces = data;
		
		if(typeof appNamespaces[req.body.pid] == 'undefined')appNamespaces[req.body.pid] = {};
		if(typeof appNamespaces[req.body.pid].domain == 'undefined')appNamespaces[req.body.pid].domain = [];
		if(isDelete == 'delete'){
			
			if(appNamespaces[req.body.pid].domain.indexOf(domain) !== -1){
				appNamespaces[req.body.pid].domain.splice(appNamespaces[req.body.pid].domain.indexOf(domain), 1);
			}
			
		}else{
			
			if(appNamespaces[req.body.pid].domain.indexOf(domain) === -1)appNamespaces[req.body.pid].domain.push(domain);		
		}

		var writeData = JSON.stringify(appNamespaces);
							
		fs.writeFile(__dirname+'/writable/config.hostname.pid.json', writeData, function (err) {
		  if (err) throw err;
		  delete require.cache[require.resolve('./writable/config.hostname.pid.json')];
		  
		    fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
				if (err) throw err;
				var data = JSON.parse(data);
									
				var appNamespaces = data;
				
				if(typeof appNamespaces == 'undefined')appNamespaces = {};
				if(typeof appNamespaces['landing-page'] == 'undefined')appNamespaces['landing-page'] = {};
				
				
				if(isDelete == 'delete'){
				
					delete appNamespaces['landing-page'][req.body['domain-old-value']];
					
				}else{
					
					appNamespaces['landing-page'][req.body['domain']] = req.body['landing-page'];
				}
				
				var writeData = JSON.stringify(appNamespaces);
									
				fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
				  if (err) throw err;
				  delete require.cache[require.resolve('./writable/config.hostname.pid.json')];
				  if(typeof cb == 'function')cb(req);
				});
				
			})
		  
		  
		});
		
	  });	
	
}

exports.updatePromoTitle = function(req, res) {
	
	var run = function(req, res){	 
			  
			  
		if(!req.body.promoTitle || !/^.+$/.test(req.body.promoTitle.trim())){
		
			res.json(200, {error:'Please enter a promotion title.', field: 'promoTitle'});
			return;
			
		}	
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'basic:promoTitle', value: req.body.promoTitle })
		 ];	 
		var fs = require('fs');
		fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
			if (err) throw err;
			var data = JSON.parse(data);
								
			var appNamespaces = data;
			
			if(typeof appNamespaces == 'undefined')appNamespaces = {};
			
			appNamespaces['pageName'] = req.body['promoTitle'];
			
			var writeData = JSON.stringify(appNamespaces);
								
			fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
			  if (err) throw err;
			  delete require.cache[require.resolve('./writable/config.hostname.pid.json')];
			  
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
											 
					if(!err){
												  
					  res.json({error:'', pid: req.body.pid});
						
					}else{
						res.writeHead(500);
						res.end(); 
					}
				});
			})
									  
		});
				  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};

exports.deleteDomain = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.domainItemId){
		
			res.writeHead(500);
			res.end(); 
			return;
			
		}
		
		if(typeof req.body['domain'] != 'undefined')req.body['domain'] = req.body['domain'].toLowerCase().trim();	
		
		var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'basic:url:'+req.body.domainItemId+':protocol', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'basic:url:'+req.body.domainItemId+':domain-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'basic:url:'+req.body.domainItemId+':domain', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'basic:url:'+req.body.domainItemId+':landing-page', isDelete: true })
		];
		 
		var deleteRecord = function(){
			
			 if(req.body['domain-type'] == 'apps.dja.com'){
				 
				 req.body['domain-old-value'] = req.body['domain'];
				 cacheHostnamePID(req, 'apps.dja.com/'+req.body['domain'], 'delete');
				 
			 }else if(req.body['domain-type'] == '*.dja.com'){
				 req.body['domain-old-value'] = req.body['domain'];
				 cacheHostnamePID(req, req.body['domain']+'.dja.com', 'delete');
				 
			 }else if(req.body['domain-type'] == 'custom'){
				 req.body['domain-old-value'] = req.body['domain'];
				 cacheHostnamePID(req, req.body['domain'], 'delete');
			 }
		 		 
					
			db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
				if(err){
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
		
					
				}
														 
				if(!err){
											  
				  res.json({error:'', pid: req.body.pid, domainItemId: req.body.domainItemId});
					
				}
			});
			  
			 
		}
		 
		 if(req.body['domain-type'] == 'apps.dja.com'){
			 var fileToDeleteKey = '/writable/config.hostname.apps.dja.com.json';
			 
		 }else if(req.body['domain-type'] == '*.dja.com'){
			 var fileToDeleteKey = '/writable/config.hostname.wildcard.dja.com.json';
			 
		 }else if(req.body['domain-type'] == 'custom'){
			 var fileToDeleteKey = '/writable/config.hostname.custom.json';
		 }
		 		 
		 var fs = require('fs');	
					
		 fs.readFile(__dirname+fileToDeleteKey, function (err, data) {
			if (err) throw err;
			var data = JSON.parse(data);
								
			var appNamespaces = data;
			
			var domainToDelete = req.body['domain'];
			
			if(req.body['domain-type'] == '*.dja.com'){
				
				domainToDelete = req.body['domain']+'.dja.com';	
				
			}

			if(typeof appNamespaces[domainToDelete] == 'object'){
				
				if(appNamespaces[domainToDelete].pid != req.body.pid || !appNamespaces[domainToDelete].pid){
				
					res.json(400);
					return;
					
				}else if(appNamespaces[domainToDelete].pid === req.body.pid && appNamespaces[domainToDelete].pid && req.body['domain-type'] == '*.dja.com'){
				
					var changesObj = [
						{
							"Action": "DELETE",
							"Name": domainToDelete,
							"Type": 'A',
							"Ttl": '1200',
							"ResourceRecords": [
								'162.242.141.27'
							]
						}
					  ];
						
					var amazonRoute53 = require('awssum-amazon-route53');
					var r53 = new amazonRoute53.Route53({
						'accessKeyId'     : 'AKIAIAZG7MS7VUVKQ7OQ',
						'secretAccessKey' : '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'
					});
					  
					  							
					r53.ChangeResourceRecordSets({HostedZoneId: 'Z32W2IA89T22L8', Changes: changesObj}, function(err, data) {
						
						if(err){
							console.log(err);
						}
									
						if(typeof data == 'object' && data != null && data.StatusCode != 200){
							
							console.log('Error deleting subdomain: Code '+data.StatusCode);
						}
						
					});	
					
				}
				
				delete appNamespaces[domainToDelete];
					
			}
		
			var writeData = JSON.stringify(appNamespaces);
			
			fs.writeFile(__dirname+fileToDeleteKey, writeData, {flag: 'w'}, function (err) {
				if (err){
					res.json(400);
					throw err;
				}
			  delete require.cache[require.resolve('.'+fileToDeleteKey)];
			  
			  if(req.body['protocol'] != 'https')deleteRecord();
			  	else{
					
					fs.readFile(__dirname+'/writable/config.protocol.https.json', function (err, data) {
						if (err){
							res.json(400);
							throw err;
						}
						var data = JSON.parse(data);
											
						var appProtocols = data;
						
						var domain = req.body['domain'];
						
						if(req.body['domain-type'] == 'apps.dja.com'){
				
							domain = 'apps.dja.com/'+req.body['domain'];	
							
						}
						
						if(req.body['domain-type'] == '*.dja.com'){
				
							domain = req.body['domain']+'.dja.com';	
							
						}
								
						if(typeof appProtocols[domain] == 'object'){
							
							if(appProtocols[domain].pid != req.body.pid || !appProtocols[domain].pid){
							
								res.json(400);
								return;
								
							}
							
							delete appProtocols[domain];
								
						}
					
						var writeData = JSON.stringify(appProtocols);
						
						fs.writeFile(__dirname+'/writable/config.protocol.https.json', writeData, function (err) {
						  if (err){
							  res.json(400);
							  throw err;
						  }
						  delete require.cache[require.resolve('./writable/config.protocol.https.json')];
						  deleteRecord();
						  
						})
					})
					
				}
			  
			  
			})
			
		});
				
	
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};




exports.updateDomainDetails = function(req, res) {
	
	var run = function(req, res){	 
	
		if(!req.body.domainItemId){
		
			var domainItemId = require('node-uuid').v4();
			
		}else{
			
			var domainItemId  = req.body.domainItemId;
			
		}	
		
		var fs = require('fs');				
		var createComplete = [];
		var error = [];
		var promoObj = [];
		
		
		 
		var saveUpdates = function(createdType, dataToSaveObj){
			
			if(req.body.create == 'true'){
				
				createComplete.push(createdType);
				promoObj.push(dataToSaveObj[0]);
				
				if(!req.headerSent && error.length > 0){
					
					res.json({error:error[0]});
					
				}
				
				if(createComplete.indexOf('landing-page') !== -1
				&& createComplete.indexOf('protocol') !== -1
				&& createComplete.indexOf('domain-type') !== -1
				&& createComplete.indexOf('domain') !== -1
				){
										
					if(error.length > 0){
						
						return;	
					}
					
					db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
													 
						if(!err){
												  
							res.json({error:'', pid: req.body.pid, domainItemId: domainItemId});
							return;
						
						}else{
							
							res.writeHead(500);
							res.end(); 
							return;
						}
					});	
					
				}
				
			}else{
				
				if(error.length > 0){
						
					res.json({error:error[0]});
					return;	
				}
	
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, dataToSaveObj, {}, function(err,data) {
												 
					if(!err){
											  
						res.json({error:'', pid: req.body.pid, domainItemId: domainItemId});
						return;
					
					}else{
						res.writeHead(500);
						res.end(); 
						return;
					}
				});	
			}
			
			
		}
		
		if(req.body.create == 'true'){
			
			if(!req.body['protocol'] || !req.body['protocol'].trim()){
		
				res.json(200, {error:'Please choose a protocol.', field: 'protocol'});
				return;
			
			
			}
				
			if(!req.body['domain-type'] || !req.body['domain-type'].trim()){
			
				res.json(200, {error:'Please choose a domain type.', field: 'hostname'});
				return;
				
			}		
			
			if(!req.body['domain'] || !req.body['domain'].trim()){
			
				res.json(200, {error:'Please enter a hostname.', field: ''});
				return;
				
			}	
						
			if(!req.body['landing-page'] || !req.body['landing-page'].trim()){
			
				res.json(200, {error:'Please choose a landing page.', field: 'landingPage'});
				return;
				
			}		
			
			saveUpdates('domain-type',[new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':domain-type', value: req.body['domain-type'] })]);

		}
		
		if(typeof req.body['domain'] != 'undefined')req.body['domain'] = req.body['domain'].toLowerCase().trim();	
		if(typeof req.body['domain-old-value'] != 'undefined')req.body['domain-old-value'] = req.body['domain-old-value'].toLowerCase().trim();
				 
		if(req.body.update == 'protocol' || req.body.create == 'true'){
			
			var updateProtocol = function(){
			
				fs.readFile(__dirname+'/writable/config.protocol.https.json', function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
					
					var domain = req.body['domain'];
					
					if(req.body['domain-type'] == 'apps.dja.com'){
					
						domain = 'apps.dja.com/'+req.body['domain'];	
						
					}
					if(req.body['domain-type'] == '*.dja.com'){
					
						domain = req.body['domain']+'.dja.com';	
						
					}
					
					if(typeof appNamespaces[domain] == 'object'){
						
						if(req.body.create == 'true'){
							error.push('Hostname is taken. Please choose another hostname.');
						}
						
						if(appNamespaces[domain].pid != req.body.pid || !appNamespaces[domain].pid){
						
							error.push('Hostname is taken. Please choose another hostname.');
							
						}
							
					}
					
					if(error.length == 0){
						if(req.body.protocol == 'https'){
						
							if(typeof appNamespaces[domain] === 'undefined')appNamespaces[domain] = {};
							appNamespaces[domain].pid = req.body.pid;
							
						}else if(req.body.protocol == 'http/https'){
							
							if(typeof appNamespaces[domain] === 'object'){
								
								delete appNamespaces[domain];
								
							}
							
						}
					}
	
					var writeData = JSON.stringify(appNamespaces);
									
					fs.writeFile(__dirname+'/writable/config.protocol.https.json', writeData, function (err) {
					  if (err) throw err;
					  delete require.cache[require.resolve('./writable/config.protocol.https.json')];
					  
					  saveUpdates('protocol',[new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':protocol', value: req.body['protocol'] })]);
					});
										
					
				});
			}
			
			if(req.body.create != 'true')updateProtocol();
				
		}
		if(req.body.update == 'domain' || req.body.create == 'true'){
						
			if(req.body['domain-type'] == 'apps.dja.com'){
				
				if(!/^[a-zA-Z0-9\.\-_]{3,17}$/.test(req.body['domain'])){
				
					error.push('Namespace must be between 3 and 17 characters and must not contain any special characters.');
					
				}
				
				if(!/^[a-zA-Z0-9]/.test(req.body['domain']) || !/[a-zA-Z0-9]$/.test(req.body['domain'])){
					
					error.push('Namespace must begin and end with a letter or a number');	
					
				}
								
				fs.readFile(__dirname+'/writable/config.hostname.apps.dja.com.json', function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
					
					
					
					if(typeof appNamespaces[req.body['domain']] == 'object'){
						
						if(req.body.create == 'true'){
							
							error.push('Namespace is taken. Please choose another namespace.');
						}
						
						if(appNamespaces[req.body['domain']].pid != req.body.pid || !appNamespaces[req.body['domain']].pid){
						
							error.push('Namespace is taken. Please choose another namespace.');

							
						}
							
					}
					
					if(error.length == 0){
						
						if(typeof appNamespaces[req.body['domain-old-value']] == 'object' && appNamespaces[req.body['domain-old-value']].pid === req.body.pid && appNamespaces[req.body['domain-old-value']].pid){
									
							delete appNamespaces[req.body['domain-old-value']];
							
						}
						
						if(typeof appNamespaces[req.body['domain']] == 'undefined')appNamespaces[req.body['domain']] = {};
						appNamespaces[req.body['domain']].pid = req.body.pid;
						appNamespaces[req.body['domain']]['landing-page'] = req.body['landing-page'];
						
						
					}
					
					var writeData = JSON.stringify(appNamespaces);
										
					fs.writeFile(__dirname+'/writable/config.hostname.apps.dja.com.json', writeData, {flag: 'w'}, function (err) {
					  if (err) throw err;
					  delete require.cache[require.resolve('./writable/config.hostname.apps.dja.com.json')];
					  if(typeof updateLandingPage =='function')updateLandingPage();
					  if(typeof updateProtocol =='function')updateProtocol();
					  saveUpdates('domain',[new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':domain', value: req.body['domain'] })]);
					  cacheHostnamePID(req, 'apps.dja.com/'+req.body['domain'], '', function(req){
						
						 if(req.body['domain-old-value'])cacheHostnamePID(req, 'apps.dja.com/'+req.body['domain-old-value'], 'delete');		  
						  
					  });	
					   
					  
					  
					});
										
					
				});
					
	
				
				
			}else if(req.body['domain-type'] == '*.dja.com'){
								
				if(!/^[a-zA-Z0-9\-_]{3,17}$/.test(req.body['domain'])){
				
					error.push('Subdomain must be between 3 and 17 characters and must not contain any special characters.');
					
				}
				
			
				if(!/^[a-zA-Z0-9]/.test(req.body['domain']) || !/[a-zA-Z0-9]$/.test(req.body['domain'])){
					
					error.push('Subdomain must begin and end with a letter or a number');	
					
				}
				
				req.body.HostedZoneId = 'Z32W2IA89T22L8';
				req.body.subdomain = req.body['domain']+'.dja.com';
				req.body['subdomain-old'] = req.body['domain-old-value']+'.dja.com';
				req.body.dns = '162.242.141.27';
				req.body.type = 'A';
				req.body.ttl = '1200';
				
				var changesObj = [
					{
						"Action": "CREATE",
						"Name": req.body.subdomain,
						"Type": req.body.type,
						"Ttl": req.body.ttl,
						"ResourceRecords": [
							req.body.dns 
						]
					}
				  ];
				  
								
				fs.readFile(__dirname+'/writable/config.hostname.wildcard.dja.com.json', function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
					
					if(typeof appNamespaces[req.body.subdomain] == 'object'){
						
						if(req.body.create == 'true'){
							error.push('Subdomain is taken. Please choose another subdomain.');
						}
						
						if(appNamespaces[req.body.subdomain].pid != req.body.pid || !appNamespaces[req.body.subdomain].pid){
						
							error.push('Subdomain is taken. Please choose another subdomain.');
							
						}
							
					}
					
					var amazonRoute53 = require('awssum-amazon-route53');
				
					var r53 = new amazonRoute53.Route53({
						'accessKeyId'     : 'AKIAIAZG7MS7VUVKQ7OQ',
						'secretAccessKey' : '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'
					});
					  
					  					  
					if(error.length>0){
						
						if(typeof updateLandingPage =='function')updateLandingPage();
						if(typeof updateProtocol =='function')updateProtocol();
						saveUpdates('domain',[]);
								  
					}else{
						
						r53.ChangeResourceRecordSets({HostedZoneId: req.body.HostedZoneId, Changes: changesObj}, function(err, data) {
						
							if(err || data.StatusCode != 200){
								
								error.push('Subdomain is taken. Please choose another subdomain.');
											
							}
							
							if(error.length == 0){
								
								if(typeof appNamespaces[req.body.subdomain] == 'undefined')appNamespaces[req.body.subdomain] = {};
								appNamespaces[req.body.subdomain].pid = req.body.pid;
								appNamespaces[req.body.subdomain]['landing-page'] = req.body['landing-page'];
								
								if(appNamespaces[req.body.subdomain].pid != req.body.pid || !appNamespaces[req.body.subdomain].pid){
						
									error.push('Subdomain is taken. Please choose another subdomain.');
									
								}
								
								if(typeof appNamespaces[req.body['subdomain-old']] == 'object' && appNamespaces[req.body['subdomain-old']].pid === req.body.pid && appNamespaces[req.body['subdomain-old']].pid && req.body['subdomain-old'] != req.body.subdomain){
									
									delete appNamespaces[req.body['subdomain-old']];
									
									var deleteObj = [
										{
											"Action": "DELETE",
											"Name": req.body['subdomain-old'],
											"Type": req.body.type,
											"Ttl": req.body.ttl,
											"ResourceRecords": [
												req.body.dns 
											]
										}
									  ];
														
									r53.ChangeResourceRecordSets({HostedZoneId: 'Z32W2IA89T22L8', Changes: deleteObj}, function(err, data) {
										
										if(err){
											console.log(err);
										}
													
										if(typeof data == 'object' && data != null && data.StatusCode != 200){
											
											console.log('Error deleting subdomain: Code '+data.StatusCode);
										}
										
									});	
													
								}
								
							}
							
							var writeData = JSON.stringify(appNamespaces);
							
							fs.writeFile(__dirname+'/writable/config.hostname.wildcard.dja.com.json', writeData, function (err) {
							  if (err) throw err;
							  delete require.cache[require.resolve('./writable/config.hostname.wildcard.dja.com.json')];
							  if(typeof updateLandingPage =='function')updateLandingPage();
							  if(typeof updateProtocol =='function')updateProtocol();
							  saveUpdates('domain',[new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':domain', value: req.body['domain'] })]);
							  cacheHostnamePID(req, req.body['subdomain'],'', function(req){
								  
								if(req.body['subdomain-old'])cacheHostnamePID(req, req.body['subdomain-old'], 'delete');	  
								  
							  });	
							  
							  
							});
						
						
						});
					}
							
							
				});
												
				
			}else if(req.body['domain-type'] == 'custom'){
				
				if(!/([0-9a-zA-Z-]+\.)?[0-9a-zA-Z-]+\.[a-zA-Z]{2,7}/.test(req.body['domain'])){
				
					error.push('Please enter a valid domain name.');
					
				}
				
				if(!/^[a-zA-Z0-9]/.test(req.body['domain']) || !/[a-zA-Z0-9]$/.test(req.body['domain'])){
					
					error.push('Domain name must begin and end with a letter or a number');	
					
				}
				
				
				if(/\.dja\.com$/.test(req.body['domain'])){
				
					error.push( 'Please enter a valid custom domain name.');	
				
				}
				
														
				fs.readFile(__dirname+'/writable/config.hostname.custom.json', function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
					
					if(typeof appNamespaces[req.body['domain']] == 'object'){
						
						if(req.body.create == 'true'){
							error.push('Domain is taken. Please choose another domain.');
						}
						
						if(appNamespaces[req.body['domain']].pid != req.body.pid || !appNamespaces[req.body['domain']].pid){
							error.push('Domain is taken. Please choose another domain.');
							
						}
							
					}
					
					if(error.length == 0){
						
						if(typeof appNamespaces[req.body['domain-old-value']] == 'object' && appNamespaces[req.body['domain-old-value']].pid === req.body.pid && appNamespaces[req.body['domain-old-value']].pid){
									
							delete appNamespaces[req.body['domain-old-value']];
									
						}
					
						if(typeof appNamespaces[req.body['domain']] == 'undefined')appNamespaces[req.body['domain']] = {};
						appNamespaces[req.body['domain']].pid = req.body.pid;
						appNamespaces[req.body['domain']]['landing-page'] = req.body['landing-page'];
						
						
						
					}
					
					var writeData = JSON.stringify(appNamespaces);
					
					fs.writeFile(__dirname+'/writable/config.hostname.custom.json', writeData, function (err) {
					  if (err) throw err;
					  delete require.cache[require.resolve('./writable/config.hostname.custom.json')];
					  
					  if(typeof updateLandingPage =='function')updateLandingPage();
					  if(typeof updateProtocol =='function')updateProtocol();
					  saveUpdates('domain', [new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':domain', value: req.body['domain'] })]);
					  cacheHostnamePID(req, req.body['domain'], '', function(req){
						  
						if(req.body['domain-old-value'])cacheHostnamePID(req, req.body['domain-old-value'], 'delete');	  
						  
					  });	
					  
					});
										
					
				});
						
	
				
				
			}
			
			if(req.body.create != 'true' && req.body['protocol'] == 'https' && error.length == 0){
				
				fs.readFile(__dirname+'/writable/config.protocol.https.json', function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
					
					var domainOld = req.body['domain-old-value'];
					
					if(req.body['domain-type'] == 'apps.dja.com'){
					
						domainOld = 'apps.dja.com/'+req.body['domain-old-value'];	
						
					}
					if(req.body['domain-type'] == '*.dja.com'){
					
						domainOld = req.body['domain-old-value']+'.dja.com';	
						
					}
					
					var domainNew = req.body['domain'];
					
					if(req.body['domain-type'] == 'apps.dja.com'){
					
						domainNew = 'apps.dja.com/'+req.body['domain'];	
						
					}
					if(req.body['domain-type'] == '*.dja.com'){
					
						domainNew = req.body['domain']+'.dja.com';	
						
					}
					
					
					if(error.length == 0){
						if(typeof appNamespaces[domainOld] == 'object'){
							
							if(appNamespaces[domainOld].pid === req.body.pid && appNamespaces[domainOld].pid){
							
								delete appNamespaces[domainOld];
								
							}
							
						}
						
						if(typeof appNamespaces[domainNew] !== 'object' || (typeof appNamespaces[domainNew] === 'object' && appNamespaces[domainNew].pid === req.body.pid)){
							if(typeof appNamespaces[domainNew] === 'undefined')appNamespaces[domainNew] = {};
							appNamespaces[domainNew].pid = req.body.pid;
						}
						
						var writeData = JSON.stringify(appNamespaces);
								
						fs.writeFile(__dirname+'/writable/config.protocol.https.json', writeData, function (err) {
						  if (err) throw err;
						  delete require.cache[require.resolve('./writable/config.protocol.https.json')];
						  
						});
					}
										
					
				});	
				
			}
			
			
		}
		if(req.body.update == 'landing-page' ||  req.body.create == 'true'){
			
			 var runUpdate = function(){
							
				 if(req.body['domain-type'] == 'apps.dja.com'){
					 var fileToUpdateKey = '/writable/config.hostname.apps.dja.com.json';
				 }else if(req.body['domain-type'] == '*.dja.com'){
					 var fileToUpdateKey = '/writable/config.hostname.wildcard.dja.com.json';
				 }else if(req.body['domain-type'] == 'custom'){
					 var fileToUpdateKey = '/writable/config.hostname.custom.json';
				 }
					
				fs.readFile(__dirname+fileToUpdateKey, function (err, data) {
					if (err) throw err;
					var data = JSON.parse(data);
										
					var appNamespaces = data;
										
					var domainToUpdate = req.body['domain'];
			
					if(req.body['domain-type'] == '*.dja.com'){
						
						domainToUpdate = req.body['domain']+'.dja.com';	
						
					}

					
					if(typeof appNamespaces[domainToUpdate] == 'object'){
						
						if(appNamespaces[domainToUpdate].pid != req.body.pid || !appNamespaces[domainToUpdate].pid){
						
							error.push('You cannot edit this item.');

						}
						
						if(error.length == 0)appNamespaces[domainToUpdate]['landing-page'] = req.body['landing-page'];
							
					}
					
					var writeData = JSON.stringify(appNamespaces);
					
					fs.writeFile(__dirname+fileToUpdateKey, writeData, function (err) {
					  if (err) throw err;
					  
					  fs.exists('views/caches/'+req.body.pid+'/'+req.body['landing-page']+'.html', function(exists) {
						  						  
						  if (exists) {
							  
							   var touch = require("touch");
							  
							  //Updates Last Modified Time so server doesn't return 304
							  
							  touch('views/caches/'+req.body.pid+'/'+req.body['landing-page']+'.html', {force: true});
							  
						  }
					  });
					 
					  //Deletes require cache
					  
					  delete require.cache[require.resolve('.'+fileToUpdateKey)];
					  
					  
					  fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
						if (err) throw err;
						var data = JSON.parse(data);
											
						var appNamespaces = data;
						
						if(typeof appNamespaces == 'undefined')appNamespaces = {};
						if(typeof appNamespaces['landing-page'] == 'undefined')appNamespaces['landing-page'] = {};
						
						appNamespaces['landing-page'][req.body['domain']] = req.body['landing-page'];
						
						var writeData = JSON.stringify(appNamespaces);
											
						fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
						  if (err) throw err;
						  
						  saveUpdates('landing-page',[new HBaseTypes.Mutation({ column: 'basic:url:'+domainItemId+':landing-page', value: req.body['landing-page'] })]);

						  						  
						});
						
					  });	
					  
					});
										
					
				});
				
			 }
			 
			 if(req.body.create == 'true')var updateLandingPage = runUpdate;
			 	else runUpdate();
		
		}
		
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.updateDefaultTemplate = function(req, res) {
	
	var run = function(req, res){	 
	
			  
		var fs = require('fs');
		
		
		if(!req.body.defaultTemplate || !/^.+$/.test(req.body.defaultTemplate.trim()) || !fs.existsSync(__dirname + '/../views/templates/'+req.userGroup+'/'+req.body.defaultTemplate)){
		
			res.json(200, {error:'Template is not valid.', field: 'defaultTemplate'});
			return;
			
		}
		
		var getPageIdsFromDB = function(){
						
			var pageIds = [];
			var promoObj = [];
			
			db.getRowWithColumns('promobuilder', 'promo:'+req.body.pid, ["pages:"], {}, function(err,data) {
				
				if (err){
					console.log(err);
					return;
				}	
				
				var pageIdsCannotUpdate = [];
				
				if(typeof data == 'object' && data.length > 0 && typeof data[0] == 'object'){
					
					for(key in data[0].columns){
																										
						var pageId = key.replace('pages:','').split(":")[0];
											
						if(pageId){
							
							if(pageIds.indexOf(pageId) === -1)pageIds.push(pageId);		
														
						}
						
						var typeKey = key.split(':')[key.split(':').length-1] ;
						
						if(typeKey == 'template-page'){
						
							if(data[0].columns[key].value != 'standard'){
							
								pageIdsCannotUpdate.push(key.split(':')[key.split(':').length-2]);
								
							}
							
						}
													
					}
					
				}
								
				for(var p in pageIds){
				
					var pageId = pageIds[p];
									
					if(key.trim() && pageIdsCannotUpdate.indexOf(pageId) === -1){		
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageId+':template', value: req.body.defaultTemplate }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageId+':last-updated', value: new Date().toString()  }));
						
						
					}
					
				}
				
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
						
					if(err){
						
						console.log(err);
						
					}
												 
					if(!err){

					}
				});	

								
			})
			
		}
					
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'basic:defaultTemplate', value: req.body.defaultTemplate })
		 ];
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid});
			  if(req.body.applyChangesToAllPages == 'true')getPageIdsFromDB();
				
			}else{
				res.writeHead(500);
				res.end(); 
			}
		});
		
		  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};

exports.generateAccessToken = function(req, res) {
	
	var run = function(req,res){
		
		var hat = require('hat');

		var id = hat();

		var promoObj = [
			new HBaseTypes.Mutation({ column: 'basic:accessToken', value: id })
		 ];
		 
		
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, accessToken: id});
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};




exports.getAllJSON = function(req, res) {
	
	//DASHBOARD API REQUEST
					
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, [], {}, function(err,data) {
								
			if (err || data.length == 0){
				res.json(403, {'error':'access_token is not valid for the requested pid.'});
				return;
					
				
			}					
			
			if( typeof data[0].columns['basic:accessToken'] !='undefined' && data[0].columns['basic:accessToken'].value && data[0].columns['basic:accessToken'].value == req.query.access_token){
				
				
					for(i in data[0].columns){
						
						if(i=='basic:accessToken'){
							delete data[0].columns[i];
							continue;
						}
						delete data[0].columns[i].timestamp;
						
					}
		
					//CORS enabled for API calls
					res.header("Access-Control-Allow-Origin", "*");
					res.header("Access-Control-Allow-Headers", "X-Requested-With");
					res.json(data[0]);
					return;
				
			}else{
				
				if(!req.query.access_token){
					
					res.json(403, {'error':'access_token required for this request.'});
					return;
					
				}else{
					res.json(403, {'error':'access_token is not valid for the requested pid.'});
					return;
				}
				
			}
				
		
		
					
		});				
						  	 	
};




exports.siteUpDown = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];

		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'basic:published', value: '0' }));

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'basic:published', value: '1' }));
		}
		
		var mkdirp = require('mkdirp');

		mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
			
			if (err){
				console.error(err);
				res.send(500);
				return;
				
			}else{
				
				var fs = require('fs');
				
				fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
					if (err){
						res.send(400);
						console.log(err);
						return;
					}
					try{
						var data = JSON.parse(data);
					}catch(Error){
						 var data = {};
					}

					data['published'] = req.body.status == 1 ? true : false;
				
					var writeData = JSON.stringify(data);
					
					fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
						if (err){
							res.send(400);
							console.log(err);
							return;
						}
									  
						delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
						  
						db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
											 
							if(!err){
														  
							  res.json({error:'', pid: req.body.pid});
								
							}else{
								
								res.writeHead(500);
								res.end(); 
							}
						});
									
					  
					})
				})
			}
		}) 
 
		
		
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.typeChanges = function(req, res) {
	
	var run = function(req,res){
		
		
		if(!req.body.type || req.body.type.length < 1 || typeof req.body.type != 'object'){
			
			res.json(500, {error: 'type obect is required for this request.'});
			return;
			
		}
		
		
		var promoObj = [];
		var cacheObj = [];
		var cnt = 0;
				
		for(i=0; i<req.body.type.length; i++){
			
			if(req.body.type[i].status == '1'){
				cnt++;
				cacheObj.push(req.body.type[i].id);
			}
			promoObj.push(new HBaseTypes.Mutation({ column: 'promotype:type:'+req.body.type[i].id, value: req.body.type[i].status.toString() }));
			
			
		}
		
		if(cnt < 1){
			
			res.json(500, {error: 'Please choose at least one component type.'});
			return;
			
		}
		
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  				
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
														
							data['components'] = cacheObj || [];
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							   res.json({error:'', pid: req.body.pid});

							})
						})
					}
				})
								
			}else{
				
				res.json(500, {error: err});

			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};




exports.lockChanges = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];

		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'basic:locked', value: '0' }));

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'basic:locked', value: '1' }));
		}
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid});
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.deletePromotion = function(req, res) {
	
	var run = function(req,res){
		

		var promoObj = [
			new HBaseTypes.Mutation({ column: 'basic:usergroup', value: 'trash' }),
			new HBaseTypes.Mutation({ column: 'basic:accessToken', isDelete: true })
		 ];
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid});
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.getTypes = function(req, res) {
	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['promotype:'], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				res.writeHead(500);
				res.end(); 
				return;
			}					
								
			var response = {};

			response.type = [];
			
			for(i in data[0].columns){
						
				if(/^promotype:type:/.test(i)){
				
					if(data[0].columns[i].value == 1){
						response.type.push(i.replace(/^promotype:type:/, ''));
					}
					
				}	
				
			}
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};

exports.getTemplates = function(req, res){
	
	var run = function(req,res){
		
		var fs = require('fs');
		fs.readdir(__dirname + '/../views/templates/'+req.userGroup, function (err, files) {
			
			if (err) throw err;
			
			var results = [];
			
			files.forEach( function (file) {
				
				var config = require(__dirname + '/../views/templates/'+req.userGroup+'/'+file+'/config.js');
								
				stats = fs.lstatSync(__dirname + '/../views/templates/'+req.userGroup+'/'+file);
										
				if (stats.isDirectory()) { 
					
					if(config.enabled === true){
				
					
						config.id = file;
						
						results.push(config);
											
					
					}
				
				}
					
		    });
				
			var response = {};		
			response.templates = results;
			response.path = '/templates';
						
			res.send(response);
			return;
		});
		
	}
	dashboard.checkRequiredRoles([1], run, req, res);
	
}

exports.getInfo = function(req, res) {
	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['basic:', 'promotype:','pages:'], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				res.writeHead(500);
				res.end(); 
				return;
			}					
								
			var response = {};
						 												  
			response.promoTitle = data[0].columns['basic:promoTitle'].value;
			if( typeof data[0].columns['basic:accessToken'] !='undefined')response.accessToken = data[0].columns['basic:accessToken'].value;
			if( typeof data[0].columns['basic:locked'] !='undefined')response.lockChanges = data[0].columns['basic:locked'].value;
			if( typeof data[0].columns['basic:published'] !='undefined')response.siteUpDown = data[0].columns['basic:published'].value;
			if( typeof data[0].columns['basic:defaultTemplate'] !='undefined')response.template = data[0].columns['basic:defaultTemplate'].value;


			response.type = [];
			response.defaultDomain = {};
			response.pages = {};
			
			for(i in data[0].columns){
						
				if(/^promotype:type:/.test(i)){
				
					if(data[0].columns[i].value == 1){
						response.type.push(i.replace(/^promotype:type:/, ''));
					}
					
				}
				
				if(/^basic:url:/.test(i)){
					
					var column = i.replace('basic:url:','').split(":");
																									
					if(typeof response.defaultDomain[column[0]] == 'undefined')response.defaultDomain[column[0]] = {};
				
					response.defaultDomain[column[0]][column[column.length-1]] = data[0].columns[i].value;
					
				}	
				
				if(/^pages:/.test(i)){
									
					var column = i.replace('pages:','').split(":");
																									
					if(typeof response.pages[column[0]] == 'undefined')response.pages[column[0]] = {};
				
					if(column[column.length-1] == 'name')response.pages[column[0]][column[column.length-1]] = data[0].columns[i].value;
					
				}
				
			}
			
			response.path = '/';
		
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};