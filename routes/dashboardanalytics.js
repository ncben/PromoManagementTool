var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

var orSeparator = '|^|OR|$|';
var andSeparator = '|^|AND|$|';
var comparatorRegex = /[!]|[=]|[<]|[>]/;
var comparatorRegexExec = /(!=)|(=)|(<=)|(>=)|(<)|(>)/;

exports.googleAnalyticsCode = function(req, res) {
	
	var run = function(req, res){	 
			  
			  
		if(!req.body.googleAnalyticsCode || !/^.+$/.test(req.body.googleAnalyticsCode.trim())){
		
			res.json(200, {error:'Please enter a GA Code.', field: 'promoTitle'});
			return;
			
		}	
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'analytics:googleAnalyticsCode', value: req.body.googleAnalyticsCode })
		 ];
		 
		var fs = require('fs');
		fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
			if (err) throw err;
			var data = JSON.parse(data);
								
			var appNamespaces = data;
			
			if(typeof appNamespaces == 'undefined')appNamespaces = {};
			
			appNamespaces['googleAnalytics'] = "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', '"+req.body['googleAnalyticsCode']+"', 'dja.com');ga('send', 'pageview');</script>";
			
			var writeData = JSON.stringify(appNamespaces);
								
			fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
			  if (err) throw err;
			  
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
					if(!err){
												  
					  res.json({error:'', id: req.body.pid});
						
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

exports.addMetric = function(req, res) {
	
	var run = function(req, res){	 
			  
		if(!req.body.value || !req.body.value.metricName || !/^.+$/.test(req.body.value.metricName.trim())){
		
			res.json(200, {error:'Please enter a title for the metric.', field: 'metricName'});
			return;
			
		}	
		
		if(typeof req.body.value.data != 'object' || req.body.value.data.length < 1){
		
			res.json(200, {error:'Please add at least one metric.'});
			return;
			
		}	
		
		
		var uuid = require('node-uuid');
		var metricId  = uuid.v4();
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':name', value: req.body.value.metricName }),
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':desc', value: req.body.value.metricDesc || '' })
		 ];
		 
		 
		 var columnsMetricComparatorSymbol = function(text){
		
			var conversion = {
			 'is': '=;binary;',
			 'is not': '!=;binary;',
			 'contains' : '=;substring;',
			 'not contain' : '!=;substring;',
			 'greater than' : '>;binary;',
			 'greater/equal' : '>=;binary;',
			 'less than' : '<;binary;',
			 'less/equal' : '<=;binary;',
			 'starts with' : '=;binaryprefix;',
			 'not start with' : '!=;binaryprefix;',
			 'regex match' : '=;regexstring;',
			 'regex not match' : '!=;regexstring;'
			
			};
			
			return conversion[text] || '';
			 
		 }
		 
		 var andConditions = [];
		 
		 for(var c in req.body.value.data){			 
			
			if(typeof req.body.value.data[c] == 'object'){
				
				var orConditions = [];
		
				for(var d in req.body.value.data[c]){
				
					if(!req.body.value.data[c][d].columnsMetric || !req.body.value.data[c][d].columnsMetricComparator || !columnsMetricComparatorSymbol(req.body.value.data[c][d].columnsMetricComparator)){
					
						res.json(200, {error:'One or more of your metric conditions is missing or is invalid.'});
						return;	
						
					}
					
					if(typeof req.body.value.data[c][d].typeValue == 'undefined') req.body.value.data[c][d].typeValue='';
					
					if(req.body.value.data[c][d].typeValue.indexOf(orSeparator) !== -1 || req.body.value.data[c][d].typeValue.indexOf(andSeparator) !== -1){
					
						res.json(200, {error:'One or more metric value is invalid.'});
						return;	
						
					}
					
					if(typeof req.body.value.data[c][d].typeValue == 'object'){
						
						if(req.body.value.data[c][d].columnsMetricComparator == 'is'){
						
							for(var i in req.body.value.data[c][d].typeValue){
							
								orConditions.push(req.body.value.data[c][d].columnsMetric+columnsMetricComparatorSymbol(req.body.value.data[c][d].columnsMetricComparator)+req.body.value.data[c][d].typeValue[i].trim());
								
							}
						
						}else{
							
							for(var i in req.body.value.data[c][d].typeValue){
							
								andConditions.push([req.body.value.data[c][d].columnsMetric+columnsMetricComparatorSymbol(req.body.value.data[c][d].columnsMetricComparator)+req.body.value.data[c][d].typeValue[i].trim()]);
								
							}
							
						}
						
					}else{
					
						orConditions.push(req.body.value.data[c][d].columnsMetric+columnsMetricComparatorSymbol(req.body.value.data[c][d].columnsMetricComparator)+req.body.value.data[c][d].typeValue.trim());
						
					}
					
					
				}
				
				orConditions = orConditions.join(orSeparator)
				andConditions.push(orConditions);
			}
			
			
		}
		
		andConditions = andConditions.join(andSeparator);
		
		promoObj.push(
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':conditions', value: andConditions })
			);
		 

		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
								 
			if(!err){
										  
			  res.json({error:'', id: req.body.pid});
				
			}else{
				res.writeHead(500);
				res.end(); 
			}
		});



		 
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deleteMetric = function(req, res){
	
	var run = function(req, res){	 
			  
		if(!req.body.metricId || !/^.+$/.test(req.body.metricId.trim())){
		
			res.json(400, {error:'metricId not found', field: 'metricId'});
			return;
			
		}	
		
		var metricId = req.body.metricId.toLowerCase().trim();
		
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':name', isDelete: true }),
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':desc', isDelete: true }),
			new HBaseTypes.Mutation({ column: 'analytics:metric:'+metricId+':conditions', isDelete: true })
		 ];
		 
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
								 
			if(!err){
										  
			  res.json({error:'', id: req.body.pid});
				
			}else{
				res.writeHead(500);
				res.end(); 
			}
		});
		 
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	
}

exports.getBasicMetric = function(req, res) {
	
	

}

exports.metricsAuth = function(req, res){
	
	if(req.session.user){
		res.cookie('user',req.session.user, {domain: '.dja.com', path: '/', maxAge: 10000, httpOnly: false, secure: false});
		res.send(200);
	}else{
	
		res.send(401);	
	}
	
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
