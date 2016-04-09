var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

exports.checkRequiredRoles = function(roles, callback, req, res){
	
	if(!req.session.user){
		
		res.writeHead(401);
		res.end(); 
		return;
  
	 }
	 
	 db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
		
		
		if(err || !data){
			
			console.log(err);	
			res.writeHead(500);
			res.end(); 
			return;

			
		}
		
		
		var userRoles = data[0].columns['user:roles'].value.split(',');
		
		for(i=0;i<roles.length;i++){
			
			if(userRoles.indexOf(roles[i].toString()) === -1){
				res.writeHead(403);
				res.end(); 
				return;
			}
			
		}
		
		callback(req, res);
	})
	

}

exports.getAllPromos = function(req, res) {
	
	var run = function(req, res){
				
		/*  Valid column names: analytics:*, basic:*, dashboard:*, essaycontest:*, facebookwallapi:*, fb-tab:*, filemanager:*, gallery:*, instagramapi:*, instantwin:*, judgingtool:*, pages:*, photocontest:*, pinterestapi:*, promotype:*, regform:*, restapi:*, screeningtool:*, twitterapi:*, user:*, usergroup:*, videocontest:*, voting:* */
					
		var flt = "(PrefixFilter('promo:') AND SingleColumnValueFilter('basic', 'usergroup', =, 'binary:"+req.session.group+"', true, true))";
				
		var scan = new HBaseTypes.TScan({"columns" : ['basic:promoTitle', 'basic:usergroup', 'promotype:'], "filterString" : flt,  "batchSize": 50, "caching": true});
	
		db.scannerOpenWithScan('promobuilder', scan, {}, function(err,data) {
			
			if(err || !data){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
					
			}
			
			
			  
			db.scannerGetList(data, 50, function(err, data){
				
				if(err || !data){
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
  	
					
				}
							
			   var response = [];
				 
				 for(var i=0; i<data.length; i++){
					  					
					  if(typeof data[i].columns['basic:promoTitle'] != 'undefined'){
						  
						response[i] = {};
						response[i].title = data[i].columns['basic:promoTitle'].value;
					 	response[i].id =  data[i].row;
						  						
					  }
				}
				
				
				response = response.filter(function(n){return n});
			    res.send(response);
				
			});
			  
	  });	
	  
	}
	  
	promo.checkRequiredRoles([1], run, req, res);

};


exports.addNewPromo = function(req, res) {
	
	var run = function(req, res){	 
			  
			  
		if(!req.body.promoTitle || !/^.+$/.test(req.body.promoTitle.trim())  || !/[a-zA-Z0-9]/.test(req.body.promoTitle.trim())){
		
			res.json(400, {error:'Please enter a promotion title.', field: 'promoTitle'});
			return;
			
		}	
		
		if(!req.body.promoTitle || req.body.promoTitle.trim().length < 5){
		
			res.json(400, {error:'Please provide a more specific promotion title.', field: 'promoTitle'});
			return;
			
		}	
		
		if(!req.body.promoType || typeof req.body.promoType != 'object' || req.body.promoType.length < 1){
		
			res.json(400, {error:'Oops.. it appears that you didn\'t choose any components for the promotion.', field: 'promoTitle'});
			return;
			
		}
		
		if(!req.session.group){
		
			res.json(400, {error:'Oops.. looks like we can\'t tell which account you\'re using the application as. Please update the setting under your profile page.', field: 'promoTitle'});
			return;
			
		}
		
		var uuid = require('node-uuid');
		var promoId  = uuid.v4();
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'basic:promoTitle', value: req.body.promoTitle }),
			new HBaseTypes.Mutation({ column: 'basic:defaultTemplate', value: 'default' }),
			new HBaseTypes.Mutation({ column: 'basic:usergroup', value: req.session.group })
		 ];
		 
		 var cacheObj = [];
		 
		 for(var i=0; i<req.body.promoType.length; i++){
		
			if(req.body.promoType[i].trim()){
				promoObj.push(new HBaseTypes.Mutation({ column: 'promotype:'+req.body.promoType[i].trim(), value: '1'}));
				cacheObj.push(req.body.promoType[i].replace('type:',''));
			}
			
		
		 }
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+promoId, promoObj, {}, function(err,data) {
			 
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
					
			}
										 
			if(!err){
			
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+promoId), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+promoId+'/config.page.json', {flag: 'a+'}, function (err, data) {
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
							data['pageName'] = req.body.promoTitle || '';
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+promoId+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							  	delete require.cache[require.resolve('../views/caches/'+promoId+'/config.page.json')];
							  
							 	res.json({error:'', id: promoId});

							})
						})
					}
				})			  
				
			}
		});
					  
	  
	}
  
	promo.checkRequiredRoles([3], run, req, res);
	 	
};

exports.getPromoTypes = function(req, res) {
	
	var run = function(req, res){

	  db.scannerOpenWithPrefix('promobuilder', 'type', ['promotype'], [], function(err,data) {
		  
			db.scannerGetList(data, 25, function(err, data){
				
				if(err || !data){
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
  	
					
				}
						 
				 var response = [];
				 
				 for(var i=0; i<data.length; i++){
					 
					  response[i] = {};
					  					  
					  if(typeof data[i].columns['promotype:title'] != 'undefined')response[i].title = data[i].columns['promotype:title'].value;
					  if(typeof data[i].columns['promotype:desc'] != 'undefined')response[i].desc = data[i].columns['promotype:desc'].value;
					  if(typeof data[i].columns['promotype:type'] != 'undefined')response[i].type = data[i].columns['promotype:type'].value;
					  if(typeof data[i].columns['promotype:category'] != 'undefined')response[i].category = data[i].columns['promotype:category'].value;
					  if(typeof data[i].columns['promotype:seq'] != 'undefined')response[i].seq = parseInt(data[i].columns['promotype:seq'].value);
					  response[i].id =  data[i].row;
				}
				
				res.send(response);
			
			});
		  
	  });
	  
	}
	  
	promo.checkRequiredRoles([3], run, req, res);
	 	
};