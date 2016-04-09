var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;
var fs = require('fs');
var json2csv = require('json2csv');		
var time = require('time');

exports.exportData = function(req, res) {
	
	var run = function(req,res){
		
	 	db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['pages'], {}, function(err,pagesData) {

		
			var flt = "(PrefixFilter('"+req.query['pid']+"') AND (FamilyFilter(=, 'binary:formdata') OR FamilyFilter(=, 'binary:formdatastats'))";	
												
			var scan = new HBaseTypes.TScan({"columns" : ['formdata:','formdatastats:'], "filterString" : flt, "caching": true});
										
			db.scannerOpenWithScan('consumer-data', scan, {}, function(err,data) {
				
				if(err){
					console.log(err);
					
				}
				
				var scanId = data;
								
				if(data){
					
					var requiredColumns = [];
					var requiredColumnKeys = [];
					
					requiredColumnKeys.push('timestamp');
					
					var scannerGetList = function(){
					
						db.scannerGetList(data, 500, function(err, data){
						
							if(err){
								console.log(err);
							
							}
							
								
							if(data && data.length >0 ){
																											
								var rows = {};
								var jsonData = [];
								
								var columns = {};	
															
								for(key in pagesData[0].columns){
									
									var itemKey = key.split(':')[4];

									if(itemKey == 'id'){
																		
										var newKey = key.split(':');
										
										newKey.pop();								
										
										if(typeof pagesData[0].columns[newKey.join(':')+':label'] == 'object'){
											
											columns[pagesData[0].columns[key].value] = pagesData[0].columns[newKey.join(':')+':label'].value;
										}
										
									} 
									
								}	
																																						
								for(key in data){
									
									
									if(req.query.groupEntries == 'true'){
										
										
										if(requiredColumns.indexOf('Last Record Timestamp') === -1){
											requiredColumns.push('Last Record Timestamp');	
										}
										if(requiredColumnKeys.indexOf('entries') === -1){
											requiredColumns.push('No. of Entries');
											requiredColumnKeys.push('entries');		
										}
										if(requiredColumnKeys.indexOf('bonusentries') === -1){
											requiredColumns.push('No. of Bonus Entries Earned');
											requiredColumnKeys.push('bonusentries');	
										}
											
										
										var row = {};
										
										
										for(k in data[key].columns){
											
											var kSplit = k.split(':');
											var newKey = kSplit[3];
											var keyType = kSplit[0];
											
																					
											if(keyType == 'formdata'){
												var timestamp = kSplit[4];
												if(requiredColumnKeys.indexOf(newKey) === -1){
													requiredColumnKeys.push(newKey);
													if(requiredColumns.indexOf(columns[newKey]) !== -1){
														requiredColumns.push(columns[newKey]+'_'+newKey);
													}else{
														requiredColumns.push(columns[newKey] || newKey);
													}
												}
												
												
												row[newKey] = data[key].columns[k].value;
												
												if(timestamp){
													
													if(!row['timestamp'] || (row['timestamp'] && timestamp > new Date(row['timestamp']).getTime())){
													
														row['timestamp'] = new time.Date(new Date(parseInt(timestamp))).setTimezone('America/New_York').toLocaleString();
														
													}
													
												}
												
											}
											
										
										}
										
										
										if(Object.keys(data[key].columns).length == 1 && data[key].columns['formdatastats:entrycount']){
											
									
										}else if(data[key].columns['formdatastats:entrycount']){
										
											row['entries'] = parseInt(convertCharStr2CP(convertNumbers2Char(data[key].columns['formdatastats:entrycount'].value, 'hex'), 'none', true, 'dec').replace(/ /g,''),10);
											
											if(data[key].columns['formdatastats:bonusentrycount']){
												
												
												row['bonusentries'] = parseInt(convertCharStr2CP(convertNumbers2Char(data[key].columns['formdatastats:bonusentrycount'].value, 'hex'), 'none', true, 'dec').replace(/ /g,''),10);
												
											}else{
											
												row['bonusentries'] = 0;
												
											}
											
										}else{
											
											if(req.query.exportIncompleteEntries == 'true'){
												row['entries'] = 0;
											}
											
										}
																				
										if(Object.keys(row).length > 0){
											
											if(row['entries'] > 0 || (row['entries'] == 0 && req.query.exportIncompleteEntries == 'true' && Object.keys(row).length > 1)){
												
												jsonData.push(row);	
											}
										}
										
									}else{
										
										if(requiredColumns.indexOf('Timestamp') === -1){
											requiredColumns.push('Timestamp');	
										}
										
										var rows = {};
										var entryTimestamps = [];
										
										for(k in data[key].columns){
											
											var kSplit = k.split(':');
											var newKey = kSplit[3];
											var keyType = kSplit[0];
											var subKey = kSplit[1];
																					
											if(keyType == 'formdata'){
												
												var timestamp = kSplit[4];
												if(typeof rows[timestamp] =='undefined')rows[timestamp]={};
											
												if(requiredColumnKeys.indexOf(newKey) === -1){
													requiredColumnKeys.push(newKey);
													if(requiredColumns.indexOf(columns[newKey]) !== -1){
														requiredColumns.push(columns[newKey]+'_'+newKey);
													}else{
														requiredColumns.push(columns[newKey] || newKey);
													}
												}
																								
												rows[timestamp][newKey] = data[key].columns[k].value;
												
											}
											
											if(keyType == 'formdatastats' && subKey == 'timestamps'){
											
												entryTimestamps.push(data[key].columns[k].value);
												
											}
											
										}
										
										entryTimestamps.sort();
																				
										for(var r in rows){
										
											if(entryTimestamps.indexOf(r) === -1){
																							
												for(var e in entryTimestamps){
																									
													if(parseInt(r) < parseInt(entryTimestamps[e])){
														
														rows[r]['isDelete'] = false;
														
														for(var rkey in rows[r]){
																	
															if(typeof rows[entryTimestamps[e]] == 'undefined'){
																console.log('notfound: '+entryTimestamps[e]);
																rows[entryTimestamps[e]] = {};
															}
															if(!rows[entryTimestamps[e]][rkey]){
																rows[entryTimestamps[e]][rkey] = rows[r][rkey];
															}
															
														};
																												
														rows[r]['isDelete'] = true;
																												
														break;
													}
													
													
												}
												
											}
											
										}		
																				
										if(req.query.exportIncompleteEntries == 'true'){								
																				
											for(var r in rows){
													
												if(rows[r]['isDelete'] !== true){
													rows[r]['timestamp'] =  new time.Date(new Date(parseInt(r))).setTimezone('America/New_York').toLocaleString();
													jsonData.push(rows[r]);	
												}
													
											}
											
										}else{
											
											if(Object.keys(rows).length > 0){
												
												
												
												for(var t in entryTimestamps){
													if(rows[entryTimestamps[t]]){
														
														rows[entryTimestamps[t]]['timestamp'] = new time.Date(new Date(parseInt(entryTimestamps[t]))).setTimezone('America/New_York').toLocaleString();
														
														jsonData.push(rows[entryTimestamps[t]]);	
													}
												}
											}
											
										}
										
											
										
									}
																									
									
									
								}
																							
														
								json2csv({data: jsonData, hasCSVColumnTitle: false, fields:  requiredColumnKeys, fieldNames:requiredColumns}, function(err, csv) {
								  if (err) console.log(err);
								  
								  
								  fs.appendFile(require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'.csv'), csv, function(err) {
									if(err)console.log(err);
									
								  });
								});
								
								scannerGetList();
							
							}else{
								
								if(requiredColumnKeys.length == 1 && requiredColumnKeys[0] == 'timestamp'){
									
									requiredColumnKeys = [];
									
								}
								
								var S = require('string');
								
								for(var rc in requiredColumns){
								
									requiredColumns[rc] = S(requiredColumns[rc]).stripTags().s;	
									
								}
								
																
								json2csv({
								data: [],
								hasCSVColumnTitle: true, 
								fields: requiredColumnKeys, 
								fieldNames: requiredColumns
								}, 
								function(err, csv) {
									
									if (err) console.log(err);
									
									fs.writeFile(require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'_header.csv'), csv, function(err) {
										if(err)console.log(err);
										
										var exec = require('child_process').exec;
																			
										exec('cat '+
										require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'_header.csv')+' '+require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'.csv')+' >> '+require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'_export.csv'), function (error, stdout, stderr) {
											
											if(err)console.log(err);
											if(stdout)console.log(stdout);
											if(stderr)console.log(stderr);
											
											 if(!req.xhr){
										
												res.sendfile('views/caches/'+req.query['pid']+'/'+scanId+'_export.csv', function(err){
												
													if(err)console.log(err);	
												
													fs.unlink(require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'_export.csv'), function(err){
													
														if(err)console.log(err);	
														
													});
													
													fs.unlink(require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'_header.csv'), function(err){
													
														if(err)console.log(err);	
														
													});
													
													fs.unlink(require('path').resolve('views/caches/'+req.query['pid']+'/'+scanId+'.csv'), function(err){
													
														if(err)console.log(err);	
														
													});
													
												})
												
											}
											
										});
										
									});
									
									
								});
							
								

								db.scannerClose(scanId);	
								
							}
							
						});	
						
					}
					
					scannerGetList();
					
					
				}
				
			});		
			
			
		})
				  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};





var  convertNumbers2Char = function ( str, type ) { 
	// converts a string containing HTML/XML character entities to a string of characters
	// str: string, the input
	// type: string enum [none, hex, dec, utf8, utf16], what to treat numbers as
	
	if (type == 'hex') {
		str = str.replace(/(\b[A-Fa-f0-9]{1,6}\b)/g, 
					function(matchstr, parens) {
						return hex2char(parens);
						}
						);
		}
	else if (type == 'dec') {
		str = str.replace(/(\b[0-9]+\b)/g, 
					function(matchstr, parens) {
						return dec2char(parens);
						}
						);
		}
	else if (type == 'utf8') {
		str = str.replace(/(( [A-Fa-f0-9]{2})+)/g, 
		//str = str.replace(/((\b[A-Fa-f0-9]{2}\b)+)/g, 
					function(matchstr, parens) {
						return convertUTF82Char(parens); 
						}
						);
		}
	else if (type == 'utf16') {
		str = str.replace(/(( [A-Fa-f0-9]{1,6})+)/g, 
					function(matchstr, parens) {
						return convertUTF162Char(parens);
						}
						);
		}
	return str;
	}






var  convertCharStr2CP  = function( textString, preserve, pad, type ) { 
	// converts a string of characters to code points, separated by space
	// textString: string, the string to convert
	// preserve: string enum [ascii, latin1], a set of characters to not convert
	// pad: boolean, if true, hex numbers lower than 1000 are padded with zeros
	// type: string enum[hex, dec, unicode, zerox], whether output should be in hex or dec or unicode U+ form
	var haut = 0;
	var n = 0;
	var CPstring = '';
	var afterEscape = false;
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			CPstring += 'Error in convertChar2CP: byte out of range ' + dec2hex(b) + '!';
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) { //alert('12345'.slice(-1).match(/[A-Fa-f0-9]/)+'<');
				//if (CPstring.slice(-1).match(/[A-Za-z0-9]/) != null) { CPstring += ' '; }
				if (afterEscape) { CPstring += ' '; }
				if (type == 'hex') { 
					CPstring += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else if (type == 'unicode') { 
					CPstring += 'U+'+dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else if (type == 'zerox') { 
					CPstring += '0x'+dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else { 
					CPstring += 0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00); 
					}
				haut = 0;
				continue;
				afterEscape = true;
				}
			else {
				CPstring += 'Error in convertChar2CP: surrogate out of range ' + dec2hex(haut) + '!';
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b;
			}
		else {
			if (b <= 127 && preserve == 'ascii') {
				CPstring += textString.charAt(i);
				afterEscape = false;
				}
			else if (b <= 255 && preserve == 'latin1') {
				CPstring += textString.charAt(i);
				afterEscape = false;
				}
			else { 
				//if (CPstring.slice(-1).match(/[A-Za-z0-9]/) != null) { CPstring += ' '; }
				if (afterEscape) { CPstring += ' '; }
				if (type == 'hex') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					}
				else if (type == 'unicode') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					CPstring += 'U+'; 
					}
				else if (type == 'zerox') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					CPstring += '0x'; 
					}
				else { 
					cp = b;
					}
				CPstring += cp; 
				afterEscape = true;
				}
			}
		}
	//return CPstring.substring(0, CPstring.length-1);
	return CPstring;
	}
	
	


exports.getInfo = function(req, res) {
	
	var run = function(req,res){
				
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['analytics:','pages:'], {}, function(err,data) {
								
			
			if (err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}			
			
			if(data.length == 0){
				
				res.send({});
				return;
				
			}		
											
			var response = {};
			response.metrics = {};
						 												  
			if( typeof data[0].columns['analytics:googleAnalyticsCode'] !='undefined')response.googleAnalyticsCode = data[0].columns['analytics:googleAnalyticsCode'].value;
			
			var columns = {};	
															
			for(var key in data[0].columns){
				
				if(/^analytics:metric:/.test(key)){
					
					var column = key.replace('analytics:metric:','').split(":");
																									
					if(typeof response.metrics[column[0]] == 'undefined')response.metrics[column[0]] = {};
				
					response.metrics[column[0]][column[column.length-1]] = data[0].columns[key].value;
					
				}
				
				if(/^pages:/.test(key)){
					
					var itemKey = key.split(':')[4];
		
					if(itemKey == 'id'){
														
						var newKey = key.split(':');
						
						var pageId = newKey[1];
						var panelId = newKey[2];
						var locatorId = newKey[0]+':'+newKey[1]+':'+newKey[2]+':'+newKey[3];
											
						newKey.pop();													
						
						if(typeof data[0].columns[newKey.join(':')+':isFormElement'] == 'object'){
							
							if(data[0].columns[newKey.join(':')+':isFormElement'].value == 'true'){
							
								if(typeof data[0].columns[newKey.join(':')+':label'] == 'object'){
									
									if(typeof columns[pageId] == 'undefined'){
										columns[pageId] = {};
										
										if(typeof data[0].columns['pages:'+pageId+':name'] == 'object'){
										
											columns[pageId]['name'] = data[0].columns['pages:'+pageId+':name'].value;
											
										}
																														
									}
							
									var S = require('string');
									
									if(typeof columns[pageId]['cols'] == 'undefined') columns[pageId]['cols'] = {};
							
									columns[pageId]['cols'][data[0].columns[key].value] = {name: S(data[0].columns[newKey.join(':')+':label'].value).stripTags().s};
									
									columns[pageId]['cols'][data[0].columns[key].value]['panelId'] = panelId;
									
									if(typeof data[0].columns[locatorId+':type'] == 'object'){
									
										columns[pageId]['cols'][data[0].columns[key].value].type = data[0].columns[locatorId+':type'].value;
										
										if(data[0].columns[locatorId+':type'].value.indexOf('drop-down') !== -1 || data[0].columns[locatorId+':type'].value == 'radio-button'){
										
											if(typeof data[0].columns[locatorId+':value'] == 'object'){
									
												columns[pageId]['cols'][data[0].columns[key].value].value = data[0].columns[locatorId+':value'].value;
											}
												
											
										}
										
									}
									
									 
								}
								
							}
							
						}
						
					} 
					
				}
					
			}
			
		
								
			response.columns = columns;

			res.cookie('user',req.session.user, {domain: '.dja.com', path: '/', maxAge: 60000, httpOnly: false, secure: false})
		
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};
	