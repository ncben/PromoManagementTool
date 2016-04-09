var db =  require('../db').db;

exports.checkRequiredRoles = function(roles, callback, req, res){
	
	var pid = (typeof req.query == 'object' && req.query.pid)? req.query.pid : '' || (typeof req.body == 'object'  && req.body.pid)? req.body.pid : '';
	
		
	if(!pid){
		
		res.json(400, {'error':'pid is required for this request.'}); 
		return;
		
	}
	
	db.getRowWithColumns('promobuilder', 'promo:'+pid, ['basic:usergroup','basic:accessToken', 'basic:locked'], {}, function(err,data) {
							 
		if (err || data.length == 0){
			console.log(err);
			res.json(400, {'error':'pid is not valid.'}); 
			return;
		}
		
		var userGroup = data[0].columns['basic:usergroup'].value;
		
		if(typeof data[0].columns['basic:locked'] != 'undefined' && data[0].columns['basic:locked'].value == 1){
			
			var alwaysAllowedRoutes = ['/dashboard/basic/lockChanges', '/dashboard/basic/siteUpDown','/dashboard/basic/accessToken'];
			
			if(req.method != 'GET' && alwaysAllowedRoutes.indexOf(req.url) === -1){
				res.json(503, {'error':'Changes locked.'}); 
				return;
				
			}
			
		}					
				
		var userGroup = data[0].columns['basic:usergroup'].value;
		
		req.userGroup = userGroup;	 
		
		if(req.query && req.query.access_token){
		
			if( typeof data[0].columns['basic:accessToken'] !='undefined' && data[0].columns['basic:accessToken'].value && data[0].columns['basic:accessToken'].value == req.query.access_token){
				
				callback(req, res);
				return;
				
			}
		
		}
				
		if(!req.session.user){
			
			console.log(401);
			res.writeHead(401);
			res.end(); 
			return;
	  
		}
						 
		db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles','usergroup:'], {}, function(err,data) {

		 	if (err || data.length == 0){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}	
			
			var groups = [];
					
			for(key in data[0].columns){
							
				if(/^usergroup:/.test(key)){
							
					if(data[0].columns[key].value == 1){
								
						groups.push(key);
									
					}
								
				}	
						
			}
			
			
			if(groups.indexOf('usergroup:'+userGroup) === -1){
				
				res.writeHead(403);
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
	})

}
