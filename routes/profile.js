var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;



function countContain(strPassword, strCheck)
{ 
    // Declare variables
    var nCount = 0;

    for (i = 0; i < strPassword.length; i++) 
    {
        if (strCheck.indexOf(strPassword.charAt(i)) > -1) 
        { 
                nCount++;
        } 
    } 

    return nCount; 
} 

function checkPassword(strPassword)
{
	
	var m_strUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var m_strLowerCase = "abcdefghijklmnopqrstuvwxyz";
	var m_strNumber = "0123456789";
	var m_strCharacters = "!@#$%^&*?_~"

    // Reset combination count
    var nScore = 0;

    // Password length
    // -- Less than 6 characters
    if (strPassword.length < 6)
    {
        nScore += 5;
    }
    // -- 6 to 7 characters
    else if (strPassword.length >= 6 && strPassword.length < 8)
    {
        nScore += 30;
    }
    // -- 8 or more
    else if (strPassword.length > 7)
    {
        nScore += 35;
    }

    // Letters
    var nUpperCount = countContain(strPassword, m_strUpperCase);
    var nLowerCount = countContain(strPassword, m_strLowerCase);
    var nLowerUpperCount = nUpperCount + nLowerCount;
    // -- Letters are all lower case
    if (nUpperCount == 0 && nLowerCount != 0) 
    { 
        nScore += 10; 
    }
    // -- Letters are upper case and lower case
    else if (nUpperCount != 0 && nLowerCount != 0) 
    { 
        nScore += 20; 
    }

    // Numbers
    var nNumberCount = countContain(strPassword, m_strNumber);
    // -- 1 number
    if (nNumberCount == 1)
    {
        nScore += 10;
    }
    // -- 3 or more numbers
    if (nNumberCount >= 3)
    {
        nScore += 20;
    }

    // Characters
    var nCharacterCount = countContain(strPassword, m_strCharacters);
    // -- 1 character
    if (nCharacterCount == 1)
    {
        nScore += 10;
    }   
    // -- More than 1 character
    if (nCharacterCount > 1)
    {
        nScore += 25;
    }

    // Bonus
    // -- Letters and numbers
    if (nNumberCount != 0 && nLowerUpperCount != 0)
    {
        nScore += 2;
    }
    // -- Letters, numbers, and characters
    if (nNumberCount != 0 && nLowerUpperCount != 0 && nCharacterCount != 0)
    {
        nScore += 3;
    }
    // -- Mixed case letters, numbers, and characters
    if (nNumberCount != 0 && nUpperCount != 0 && nLowerCount != 0 && nCharacterCount != 0)
    {
        nScore += 5;
    }


    return nScore;
}

exports.updateProfile = function(req, res) {
	
	if(req.session.user){
		
		if(!req.body.firstName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.firstName.trim())){
		
			res.json({error:'Please enter a valid first name.', field: 'firstName'});
			return;
			
		}	
		
		if(!req.body.lastName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.lastName.trim())){
			
			res.json({error:'Please enter a valid last name.', field: 'lastName'});
			return;
			
		}	
		
	
		db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:email'], {}, function(err,data) {
						
			if(err || data.length < 1){
				
				res.writeHead(400);
				res.end();
				return; 
				
			}
			
			if(data[0].columns['user:email'].value.toLowerCase() != req.session.user.toLowerCase()){
				
				res.writeHead(400);
				res.end();
				return; 
				
			}							
						
								 
			db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), [
				new HBaseTypes.Mutation({ column: 'user:firstName', value: req.body.firstName }),
				new HBaseTypes.Mutation({ column: 'user:lastName', value: req.body.lastName })
			], {}, function(err,data) {
										 
				if(!err){
										  
					 res.json({error:'', username: req.session.user});
				
				}else{
					 res.writeHead(500);
					 res.end(); 
				}
			});
							  
						  
		});
							
	}else{
			  
	 	 res.writeHead(401);
		 res.end();
		 return; 
	  		
	}

};


exports.changePassword = function(req, res) {
	
	if(req.session.user){
		
		db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:salt','user:password'], {}, function(err,data) {
			 if (err || data.length < 1){
				 res.writeHead(400);
				 res.end();
				 return; 
			 }
			 
			 var hash = require('../pass').hash;
			 hash(req.query.currentPassword, data[0].columns['user:salt'].value, function(err, hash){
					if (err || !hash){
					
						res.writeHead(400);
						res.end();
						return; 	
					
					}
					
					if (hash != data[0].columns['user:password'].value){
						
						res.json({error:'Your current password is missing or incorrect.', field: 'currentPassword'});
						return;
						
					}
					
					if(req.query.newPassword !== req.query.confirmNewPassword){
									
						res.json({error:'Password does not match the confirm password.', field: 'newPassword'});
						return;
					}
										
					if(checkPassword(req.query.newPassword) < 50){
											
						res.json({error:'Password must be at least 6 characters long and must contain at least one number and one uppercase letter.', field: 'newPassword'});
						return;
										
					}
					
					var newPassword = req.query.newPassword;
					var hash = require('../pass').hash;
					var genSalt, genHash;
											
					hash(newPassword, function(err, salt, hash){
						if (err) console.log(err);
										  
						genSalt = salt;
						genHash = hash;
												
						 db.mutateRowDeprecated('promobuilder', 'user:'+req.session.user.toLowerCase(), [
						 new HBaseTypes.Mutation({ column: 'user:password', value: genHash }),
						 new HBaseTypes.Mutation({ column: 'user:salt', value: genSalt })], {}, function(err,data) {
														 
							 if(!err){
														  
								res.json({error:'', username: req.session.user});
								return;
									
							 }else{
								 
								res.writeHead(500);
								res.end();
								return; 	
															 
							 }
						});
												
					})				
							
			
			})
	  
  		})
	  
		
	}else{
			  
	 	 res.writeHead(401);
		 res.end();
		 return; 
	  		
	}

};


exports.deleteProfile = function(req, res) {
	
	if(req.session.user){
	  
	 	 db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
					
			var roles = data[0].columns['user:roles'].value.split(',');
			
			for(var i=0; i< roles.length; i++){
						
				if(parseInt(roles[i]) > 4){
								
					res.send(400);
					return;
							
				}
							
			}	
			  
			 db.deleteAllRow('promobuilder', 'user:'+req.session.user.toLowerCase(), {}, function(err,data) {
															 				
				req.session.destroy(function(){
					res.json({username: false});
				})	
				  
			 })
	     })
	  	
	 }else{	
	  
	 	 res.writeHead(401);
		 res.end();
		 return; 
	  
	  }	
	 	
};

exports.switchGroup = function(req, res) {
	  if(req.session.user){
		  
		  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['usergroup:'], {}, function(err,data) {
			 
			if(data[0]){
				
				var hasGroup = false;
				for(key in data[0].columns){
					
					if(key == req.query.group.trim()){
							
						hasGroup = true;
						
					}
				}
				
				if(!hasGroup){
					
					res.json({error: 'An error occurred.'});
					return; 
							
				}else{
								
					var groupValue = req.query.group.trim().split(':');
					groupValue.shift();
					groupValue = groupValue.join(':');
						
					db.mutateRowDeprecated('promobuilder', 'user:'+req.session.user.toLowerCase(), [
						 new HBaseTypes.Mutation({ column: 'user:currentgroup', value: groupValue })
						], {}, function(err,data) {
														 
						if(!err){
								
							req.session.group = groupValue;
							res.json({});
							return;
														  
						 }else{
									 
							res.send(500);
							return;
															 
						 }
					 });
						 									
				}
													  
			}else{
				
				res.json({error: 'An error occurred.'});
				return; 
				
			}
		 })
	}
};

exports.getProfile = function(req, res) {
	  if(req.session.user){
		  
		  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:firstName','user:lastName','user:email','user:roles','user:suspended','usergroup:','user:currentgroup'], {}, function(err,data) {
			  		  						 				 
			if(data[0]){
				
				var response = {};
				var groups = [];
					
				for(key in data[0].columns){
							
					if(/^usergroup:/.test(key)){
							
						if(data[0].columns[key].value == 1){
								
							groups.push(key);
							
						}
							
					}	
						
				}
						
				 db.scannerOpenWithPrefix('promobuilder', 'usergroup', ['user'], [], function(err,scanId) {
		  
					db.scannerGetList(scanId, 100, function(err, groupData){
						
						response.groups = [];
								 						 
						 for(var i=0; i<groupData.length; i++){
												  
							 if(groupData[i].row == 'usergroup:'+data[0].columns['user:currentgroup'].value){
								response.currentGroup = {
									title: groupData[i].columns['user:title'].value,
									desc: groupData[i].columns['user:desc'].value,
									id: groupData[i].row
								};
							 }
							 
							 if(groups.indexOf(groupData[i].row) !== -1){
								 response.groups.push({
									title: groupData[i].columns['user:title'].value,
									desc: groupData[i].columns['user:desc'].value,
									id: groupData[i].row
								});
							 }
							 
						}
						
						res.send(response);
						return;
					
					});
				  
				});
				
						
				response.firstName = data[0].columns['user:firstName'].value;
				response.lastName = data[0].columns['user:lastName'].value;
				response.email = data[0].columns['user:email'].value;
				response.roles = data[0].columns['user:roles'].value;				
								
			}else{
				res.writeHead(400);
				res.end();
				return; 
				
			}
								  
		  });
		  
	  }else{	
	  
	 	 res.writeHead(401);
		 res.end();
		 return; 
	  
	  }	
};
