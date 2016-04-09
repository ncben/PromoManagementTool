var hash = require('../pass').hash;
var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;


exports.authenticate = function(username, pass, fn) {
  
  db.getRowWithColumns('promobuilder', 'user:'+username.toLowerCase(), ['user:salt','user:password','user:firstName','user:roles','user:suspended','user:currentgroup'], {}, function(err,data) {
	  
 	 if (err || data.length < 1){
		 return fn(new Error('Cannot find user.'));
	 }
 	 if (typeof data[0].columns['user:suspended'] !== 'undefined'){
		 if(data[0].columns['user:suspended'].value == '1')return fn(new Error('User suspended.'));
	 }
	 
	 hash(pass, data[0].columns['user:salt'].value, function(err, hash){
			if (err || !hash) return fn(new Error (err));
			if (hash == data[0].columns['user:password'].value) return fn(null, {username: username, name: data[0].columns['user:firstName'].value, roles: data[0].columns['user:roles'].value, group: data[0].columns['user:currentgroup'].value});
			fn(new Error('Invalid password.'));
	  })
	  
  })
  
}

exports.getCurrentUser = function(req, res){
	
	if(req.session.user){
 	  res.json({ username: req.session.user, name: req.session.firstname, isManager: req.session.isManager });
	}else{
		res.writeHead(400);
		res.end(); 
		return;	
	}

}


exports.Logout = function(req, res){
	
  req.session.destroy(function(){
    res.redirect('/');
  });
}

exports.authLogout = function(req, res){
	
  req.session.destroy(function(){
 	  res.json(200, { loggedOut: true });
  });
}

exports.authLogin = function(req, res){

  auth.authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
	
      req.session.regenerate(function(){
		  		  		  
		  db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), [
			new HBaseTypes.Mutation({ column: 'user:sessionId', value: req.sessionID })
			], {}, function(){
			
				req.session.user = user.username;
				req.session.cookie.expires = false;
				req.session.firstname = user.name;
				req.session.group = user.group;
				
				
				var roles = user.roles.split(',');
				var maxRole = 0;
				
				for(i=0; i<roles.length; i++){
				
					maxRole = Math.max(roles[i], maxRole);	
				
				}
				
				var isManager = false; 
				if(maxRole >= 5)isManager = true;
				
				if(isManager)req.session.isManager = true;
					else req.session.isManager = false;
					
				res.json({ name: user.name, isManager: isManager });	
				
			});
      
       
        
      });
    } else {
				  
 	  req.session.destroy(function(){
 	 	 res.json(400, { id: '', error: err });
	  })
	  
    }
  });
}