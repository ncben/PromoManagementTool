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

exports.checkManageRoles = function(callback, req, res){
	
	if(!req.session.user){
		
		res.writeHead(401);
		res.end(); 
		return;
  
	 }
	 
	 db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
				
		var adminRoles = data[0].columns['user:roles'].value.split(',');
		
		for(i=0;i<adminRoles.length;i++){
			
			if(adminRoles[i] == 5 || adminRoles[i] == 6){
				callback(req, res);
				return;
			}
			
		}
		
		res.writeHead(403);
		res.end(); 
		return;
						
	})
	 
	

}

exports.addUser = function(req, res) {
	
	var run = function(req, res){
	
		if(!req.body.firstName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.firstName.trim())){
		
			res.json({error:'Please enter a valid first name.', field: 'firstName'});
			return;
			
		}	
		
		if(!req.body.lastName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.lastName.trim())){
			
			res.json({error:'Please enter a valid last name.', field: 'lastName'});
			return;
			
		}	
				
		if(!req.body.email || !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(req.body.email.trim())){
			
			res.json({error:'Please enter a valid email address.', field: 'email'});
			return;
			
		}	
		
		if(!req.body.confirmEmail || req.body.email.trim().toUpperCase() != req.body.confirmEmail.trim().toUpperCase()){
			
			res.json({error:'Your confirm email doesn\'t match.', field: 'email,confirmEmail'});
			return;
			
		}
		
		
		db.scannerOpenWithPrefix('promobuilder', 'role', ['user'], {}, function(err,data) {
			  
				db.scannerGetList(data, 10, function(err, data){
							
					var response = [];
													 
					for(var i=0; i<data.length; i++){
						  response[data[i].columns['user:rolevalue'].value] = 1; 
					}
					
					db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
					
						var roles = req.body.roles.split(',');
						var adminRoles = data[0].columns['user:roles'].value.split(',');
						var group = '';
						
						if(adminRoles.indexOf('7') !== -1){
							
							if(!req.body.groups || !/^[a-zA-Z0-9:,]+$/.test(req.body.groups.trim())){
			
								res.json({error:'Please assign at least one group.', field: 'groups'});
								return;
								
							}
							
							group = req.body.groups.trim().split(',');
						
						}else{
							
							if(!req.session.group){
								
								res.json({error:'Oops.. looks like we don\'t know which brand you\'re using your account as. You can choose the brand under your profile.', field: 'groups'});
								return;
							
							}
							
							group = req.session.group;
						
						}
			
						for(var i=0; i< roles.length; i++){
						
							if(!response[roles[i]]){
								
								res.json({error:'Please enter a valid role.', field: 'roles'});
								return;
								
							}
							
							if(parseInt(roles[i]) > 4 && adminRoles.indexOf(roles[i]) < 0  && adminRoles.indexOf('6') < 0){
								
								res.json({error:'You do not have the required rights to grant user administrative roles.', field: 'roles'});
								return;
							
							}
							
						}	
						
						var generatePassword = require('password-generator');
						var tempPassword = generatePassword(7, false);
						var hash = require('../pass').hash;
						var genSalt, genHash;
						
						
						hash(tempPassword, function(err, salt, hash){
							if (err) console.log(err);
						  
							genSalt = salt;
							genHash = hash;
							
							
							 db.getRowWithColumns('promobuilder', 'user:'+req.body.email.toLowerCase(), [], {}, function(err,data) {
			  
								 if (err || (data.length > 0 && data[0].columnValues.length>0)){
									 res.json({error:'You cannot add an user that already exists.', field: 'email'});
									 return;
								 }
								 
								 var insertObj = [
									 new HBaseTypes.Mutation({ column: 'user:firstName', value: req.body.firstName }),
									 new HBaseTypes.Mutation({ column: 'user:lastName', value: req.body.lastName }),
									 new HBaseTypes.Mutation({ column: 'user:email', value: req.body.email }),
									 new HBaseTypes.Mutation({ column: 'user:roles', value: req.body.roles }),
									 new HBaseTypes.Mutation({ column: 'user:password', value: genHash }),
									 new HBaseTypes.Mutation({ column: 'user:salt', value: genSalt })
								  ];
								  
								  
								if(typeof group == 'object'){
									 
									for(var i=0;i<group.length; i++){
										 
										if(i==0){
											
											var groupValue = group[0].split(':');
											groupValue.shift();
											groupValue = groupValue.join(':');
										
											insertObj.push(new HBaseTypes.Mutation({ column: 'user:currentgroup', value: groupValue }));											 
										}
										
										insertObj.push(new HBaseTypes.Mutation({ column: group[i], value: '1' }));
										 
									}
									  
									  
								}else if(typeof group == 'string'){
									
										insertObj.push(new HBaseTypes.Mutation({ column: 'usergroup:'+group, value: '1' }));
										insertObj.push(new HBaseTypes.Mutation({ column: 'user:currentgroup', value: group }));											 
								}
								 
								db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), insertObj, {}, function(err,data) {
										 
										 if(!err){
										  
										 	res.json({error:'', password: tempPassword, username: req.body.email});
				
										 }else{
											 res.writeHead(500);
											 res.end(); 
										}
								});
							  
							 })
							
						  
						});
							
									
					});
					
				});
				  
		});	
			
	}
	
	manage.checkManageRoles(run, req, res);
	

};


exports.updateUser = function(req, res) {
	
	var run = function(req, res){
	
		if(!req.body.firstName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.firstName.trim())){
		
			res.json({error:'Please enter a valid first name.', field: 'firstName'});
			return;
			
		}	
		
		if(!req.body.lastName || !/^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/.test(req.body.lastName.trim())){
			
			res.json({error:'Please enter a valid last name.', field: 'lastName'});
			return;
			
		}	
		
		db.scannerOpenWithPrefix('promobuilder', 'role', ['user'], {}, function(err,data) {
						  
				db.scannerGetList(data, 10, function(err, data){
												
					var response = [];
													 
					for(var i=0; i<data.length; i++){
						  response[data[i].columns['user:rolevalue'].value] = 1; 
					}
					
					
					db.getRowWithColumns('promobuilder', 'user:'+req.body.email.toLowerCase(), ['user:roles','user:currentgroup','user:sessionId','usergroup:'], {}, function(err,data) {
									  
						if (err || data.length == 0){
							res.writeHead(500);
							res.end(); 
						}
						
						var currentRoles = data[0].columns['user:roles'].value.split(',');
						var currentGroup = data[0].columns['user:currentgroup'].value;
						var currentSessionId = '';
						if(typeof data[0].columns['user:sessionId'] !== 'undefined'){
							currentSessionId = data[0].columns['user:sessionId'].value;
						}
						
						var groups = [];
					
						for(key in data[0].columns){
							
							if(/^usergroup:/.test(key)){
							
								if(data[0].columns[key].value == 1){
								
									groups.push(key);
									
								}
								
							}	
						
						}
						
						if(currentGroup != req.session.group){
							
							res.json({error:'You do not have the required rights to edit this user.', field: ''});
							return;
						
						}

					
						db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
							
					
							var roles = req.body.roles.split(',');
							var adminRoles = data[0].columns['user:roles'].value.split(',');
							
							if(adminRoles.indexOf('7') !== -1){
									
								if(!req.body.groups || !/^[a-zA-Z0-9:,]+$/.test(req.body.groups.trim())){
			
									res.json({error:'Please assign at least one group.', field: 'groups'});
									return;
									
								}	
								
							}
							
							for(var i=0; i< currentRoles.length; i++){
								
								if(parseInt(currentRoles[i]) > 5 && adminRoles.indexOf(currentRoles[i]) < 0){
									
									res.json({error:'You do not have the required rights to edit this user.', field: '', role: currentRoles[i]});
									return;
								
								}
								
								if(parseInt(currentRoles[i]) >= 7){
									
									req.body.roles += ','+currentRoles[i];
									
								}
								
							}
				
							for(var i=0; i< roles.length; i++){
							
								if(!response[roles[i]]){
									
									res.json({error:'Please enter a valid role.', field: 'roles'});
									return;
									
								}
								
								if(parseInt(roles[i]) > 4 && adminRoles.indexOf(roles[i]) < 0  && adminRoles.indexOf('6') < 0){
									
									res.json({error:'You do not have the required rights to grant user administrative roles.', field: 'roles'});
									return;
								
								}
								
								
							}
							
							if(roles.indexOf('5') < 0 && adminRoles.indexOf('5') >= 0 && req.body.email.toLowerCase() == req.session.user.toLowerCase()){
									
									res.json({error:'You cannot remove your own administrative roles.', field: 'roles'});
									return;
								
							}
							
							if(roles.indexOf('6') < 0 && adminRoles.indexOf('6') >= 0 && req.body.email.toLowerCase() == req.session.user.toLowerCase()){
									
									res.json({error:'You cannot remove your own administrative roles.', field: 'roles'});
									return;
								
							}
							
							
							if(req.body.newPassword && req.body.confirmNewPassword){
								
								if(req.body.newPassword !== req.body.confirmNewPassword){
									
									res.json({error:'Password does not match the confirm password.', field: 'newPassword'});
									return;
								}
								
								if(checkPassword(req.body.newPassword) < 50){
									
									res.json({error:'Password must be at least 6 characters long and must contain at least one number and one uppercase letter.', field: 'newPassword'});
									return;
								
								}
								
								var newPassword = req.body.newPassword;
								var hash = require('../pass').hash;
								var genSalt, genHash;
								
								hash(newPassword, function(err, salt, hash){
									if (err) console.log(err);
							  
									genSalt = salt;
									genHash = hash;
									
									 db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), [
										 new HBaseTypes.Mutation({ column: 'user:password', value: genHash }),
										 new HBaseTypes.Mutation({ column: 'user:salt', value: genSalt })
									  ], {}, function(err,data) {
											 
											 if(!err){
											  
					
											 }else{
												 
											 }
									});
									
								})
								
								
								
							}
						
							if(adminRoles.indexOf('7') !== -1){
								
								var insertObj = [];
								var newGroups = req.body.groups.split(',');
								
								var currentGroupKey = 'usergroup:'+currentGroup;
								var updateCurrentGroup = !!(newGroups.indexOf(currentGroupKey) === -1);
																
								for(var i=0;i<newGroups.length; i++){
										 			
									if(i==0 && updateCurrentGroup === true){
																					
										var groupValue = newGroups[0].split(':');
										groupValue.shift();
										groupValue = groupValue.join(':');
											
											
										insertObj.push(new HBaseTypes.Mutation({ column: 'user:currentgroup', value: groupValue }));
										
										
										if(req.body.email.toLowerCase() == req.session.user){
											
											req.session.group = groupValue;
											
										}
										
										if(currentSessionId){
											sessionObj.destroy(currentSessionId, function (err, data) {});
										}											 
									}
										
									insertObj.push(new HBaseTypes.Mutation({ column: newGroups[i], value: '1' }));
										 
								}
								
								for(var i=0; i<groups.length;i++){
									
									if(newGroups.indexOf(groups[i]) === -1){
										insertObj.push(new HBaseTypes.Mutation({ column: groups[i], isDelete: true }));
									}
									
								}
								
								 db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), insertObj, {}, function(err,data) {
									
								});
								
								
							}

						
							 db.mutateRowDeprecated('promobuilder', 'user:'+req.body.email.toLowerCase(), [
								 new HBaseTypes.Mutation({ column: 'user:firstName', value: req.body.firstName }),
								 new HBaseTypes.Mutation({ column: 'user:lastName', value: req.body.lastName }),
								 new HBaseTypes.Mutation({ column: 'user:roles', value: req.body.roles })
								  ], {}, function(err,data) {
									  
										 
									if(!err){
										  
									  res.json({error:'', username: req.body.email});
				
									}else{
										 res.writeHead(500);
										 res.end(); 
									}
							});
							  
						  
						});
							
									
					});
					
				});
				  
		});	
			
	}
	
	manage.checkManageRoles(run, req, res);
	

};

exports.getUser = function(req, res) {
	
	var run = function(req,res){
	  
	  if(req.query.user){
		  
		  db.getRowWithColumns('promobuilder', 'user:'+req.query.user.toLowerCase(), ['user:firstName','user:lastName','user:email','user:roles','user:suspended','user:currentgroup','usergroup:'], {}, function(err,data) {
			  		  						 				 
			var response = {};
			
			 db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,userData) {
						
				var adminRoles = userData[0].columns['user:roles'].value.split(',');
							
					if(adminRoles.indexOf('7') !== -1){
					
						var groups = [];
					
						for(key in data[0].columns){
							
							if(/^usergroup:/.test(key)){
							
								if(data[0].columns[key].value == 1){
								
									groups.push(key);
									
								}
								
							}	
						
						}
												
						response.groups = groups;
						
					}
					
					
					if(data[0]){
						
						if(data[0].columns['user:currentgroup'].value != req.session.group){
							
							res.writeHead(400);
							res.end();
							return; 
							
						}
						
						response.firstName = data[0].columns['user:firstName'].value;
						response.lastName = data[0].columns['user:lastName'].value;
						response.email = data[0].columns['user:email'].value;
						response.roles = data[0].columns['user:roles'].value;
						response.suspended = (typeof data[0].columns['user:suspended'] !== 'undefined'
											  && data[0].columns['user:suspended'].value == '1') ?
											 !!data[0].columns['user:suspended'].value : 
											 false;
								 
									
					}else{
						
						res.writeHead(400);
						res.end();
						return; 
						
					}
					
					res.send(response);
					
			});
			  
		  });
		  
	  }else if(req.query.keyword){
		  
		  var keyword = req.query.keyword.replace(/(['])/g,'\\$1');
		  		  
		  var flt = "(PrefixFilter('user:') AND SingleColumnValueFilter('user', 'currentgroup', =, 'binary:"+req.session.group+"') AND ((SingleColumnValueFilter('user', 'email', =, 'substring:"+keyword+"') OR (SingleColumnValueFilter('user', 'firstName', =, 'substring:"+keyword+"') OR (SingleColumnValueFilter('user', 'lastName', =, 'substring:"+keyword+"'))";
		  var scan = new HBaseTypes.TScan({"columns" : ['user:firstName', 'user:lastName', 'user:email', 'user:roles', 'user:suspended'], "filterString" : flt, "batchSize": 10, "caching": true});
		  		  
		  db.scannerOpenWithScan('promobuilder', scan, {}, function(err,data) {
			  			  
				db.scannerGetList(data, 10, function(err, data){
					
					var response = [];
					 
					 for(var i=0; i<data.length; i++){
						  response[i] = {};
											  
						  response[i].firstName = data[i].columns['user:firstName'].value;
						  response[i].lastName = data[i].columns['user:lastName'].value;
						  response[i].email = data[i].columns['user:email'].value;
						  response[i].roles = data[i].columns['user:roles'].value;
						  response[i].suspended = (typeof data[i].columns['user:suspended'] !== 'undefined'
												  && data[i].columns['user:suspended'].value == '1') ?
												  !!data[i].columns['user:suspended'].value : 
												  false;
					}
					
					res.send(response);
					
				})
				
		  })
		  
		  
	  }else{	
	  
	    
		  db.scannerOpenWithPrefix('promobuilder', 'user', ['user:firstName', 'user:lastName', 'user:email', 'user:roles', 'user:suspended','user:currentgroup'], [], function(err,data) {
			  
				db.scannerGetList(data, 100, function(err, data){
							 
					 var response = [];
					 
					 for(var i=0; i<data.length; i++){
						 
						  if(data[i].columns['user:currentgroup'].value == req.session.group){

							  var resObj = {};
												  
							  resObj.firstName = data[i].columns['user:firstName'].value;
							  resObj.lastName = data[i].columns['user:lastName'].value;
							  resObj.email = data[i].columns['user:email'].value;
							  resObj.roles = data[i].columns['user:roles'].value;
							  resObj.suspended = (typeof data[i].columns['user:suspended'] !== 'undefined'
													 && data[i].columns['user:suspended'].value == '1') ?
													 !!data[i].columns['user:suspended'].value : 
													 false;
							  response.push(resObj);
												 
						  }
					}
										
					res.send(response);
				
				});
			  
		  });
	  }
	}
	
	manage.checkManageRoles(run, req, res);

};


exports.getAllUserGroups = function(req, res) {
	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
				
		var adminRoles = data[0].columns['user:roles'].value.split(',');
					
			if(adminRoles.indexOf('7') !== -1){
				
				 db.scannerOpenWithPrefix('promobuilder', 'usergroup', ['user'], [], function(err,data) {
		  
					db.scannerGetList(data, 100, function(err, data){
								 
						 var response = [];
						 
						 for(var i=0; i<data.length; i++){
							  response[i] = {};
												  
							  response[i].id = data[i].row;
							  response[i].desc = data[i].columns['user:desc'].value;
							  response[i].title = data[i].columns['user:title'].value;
						}
						
						res.send(response);
						return;
					
					});
				  
			  });
				
			}else{
			
				res.writeHead(400);
				res.end(); 
				return;	
				
			}
		
		
	  })
			  
	}
	 	
	manage.checkManageRoles(run, req, res);
		
};

exports.getAllUserRoles = function(req, res) {
	
	var run = function(req,res){
			  
	  db.scannerOpenWithPrefix('promobuilder', 'role', ['user'], [], function(err,data) {
		  
			db.scannerGetList(data, 10, function(err, data){
						 
				 var response = [];
				 
				 for(var i=0; i<data.length; i++){
					  response[i] = {};
					  					  
					  response[i].value = data[i].columns['user:rolevalue'].value;
					  response[i].text = data[i].columns['user:roletext'].value;
				}
				
				res.send(response);
			
			});
		  
	  });
	}
	 	
	manage.checkManageRoles(run, req, res);
		
};


exports.suspendUser = function(req, res) {
	
	var run = function(req,res){
		
	  if(req.query.user.toLowerCase() == req.session.user){
		  
		res.send(400);
		return;
		  
	  }
	  
	  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
					
			var adminRoles = data[0].columns['user:roles'].value.split(',');
			
			db.getRowWithColumns('promobuilder', 'user:'+req.query.user.toLowerCase(), ['user:roles','user:sessionId'], {}, function(err,data) {
				
				var roles = data[0].columns['user:roles'].value.split(',');
				
				var sessionId = (typeof data[0].columns['user:sessionId'] !== 'undefined') ?
								data[0].columns['user:sessionId'].value :
								'';

				for(var i=0; i< roles.length; i++){
						
					if(adminRoles.indexOf(roles[i]) < 0 && parseInt(roles[i]) > 4){
								
						res.send(400);
						return;
							
					}
							
				}	
				
				 
				if(sessionId){
				  	sessionObj.destroy(sessionId, function (err, data) {
											
					});
				}
				

				db.mutateRowDeprecated('promobuilder', 'user:'+req.query.user.toLowerCase(), [
					 new HBaseTypes.Mutation({ column: 'user:suspended', value: '1' })
					], {}, function(err,data) {
											 
					if(!err){
						
						res.json({error:'', suspened: true});
						return;
											  
					 }else{
						 
						res.send(400);
						return;
												 
					 }
				});
				  
			})
	  })
	  
	}
	
	manage.checkManageRoles(run, req, res);
	 	
};


exports.reactivateUser = function(req, res) {
	
	var run = function(req,res){
		
	  if(req.query.user.toLowerCase() == req.session.user){
		  
		res.send(400);
		return;
		  
	  }
	  
	  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
					
			var adminRoles = data[0].columns['user:roles'].value.split(',');
			
			db.getRowWithColumns('promobuilder', 'user:'+req.query.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
				
				var roles = data[0].columns['user:roles'].value.split(',');

				for(var i=0; i< roles.length; i++){
						
					if(adminRoles.indexOf(roles[i]) < 0 && parseInt(roles[i]) > 4){
								
						res.send(400);
						return;
							
					}
							
				}	
				

				db.mutateRowDeprecated('promobuilder', 'user:'+req.query.user.toLowerCase(), [
					 new HBaseTypes.Mutation({ column: 'user:suspended', value: '0' })
					], {}, function(err,data) {
											 
					if(!err){
						
						res.json({error:''});
						return;
											  
					 }else{
						 
						res.send(400);
						return;
												 
					 }
				});
				  
			})
	  })
	  
	}
	
	manage.checkManageRoles(run, req, res);
	 	
};

exports.deleteUser = function(req, res) {
	
	var run = function(req,res){
		
	  if(req.body.user.toLowerCase() == req.session.user){
		  
		res.send(400);
		return;
		  
	  }
	  
	  db.getRowWithColumns('promobuilder', 'user:'+req.session.user.toLowerCase(), ['user:roles'], {}, function(err,data) {
					
			var adminRoles = data[0].columns['user:roles'].value.split(',');
			
			db.getRowWithColumns('promobuilder', 'user:'+req.body.user.toLowerCase(), ['user:roles','user:sessionId'], {}, function(err,data) {
				
				var roles = data[0].columns['user:roles'].value.split(',');
				
				var sessionId = (typeof data[0].columns['user:sessionId'] !== 'undefined') ?
								data[0].columns['user:sessionId'].value :
								'';

				for(var i=0; i< roles.length; i++){
						
					if(adminRoles.indexOf(roles[i]) < 0 && parseInt(roles[i]) > 4){
								
						res.send(400);
						return;
							
					}
							
				}	
				
				if(sessionId){
				  	sessionObj.destroy(sessionId, function (err, data) {
											
					});
				}
	 
				  db.deleteAllRow('promobuilder', 'user:'+req.body.user.toLowerCase(), {}, function(err,data) {
															 
					res.json({username: req.body.user});
					  
				  });
				  
			})
	  })
	  
	}
	
	manage.checkManageRoles(run, req, res);
	 	
};