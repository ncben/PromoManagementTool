var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

var fs= require('fs');

var timeoutObj = {};

var timeoutFn = require('foreverest');

exports.queueJobs = function(){
	
	for(var uuid in timeoutObj){
	
		timeoutObj[uuid].clear();	
		delete timeoutObj[uuid];
		
	}
	
	fs.readFile(__dirname+'/writable/cron.json', {flag: 'a+'}, function (err, data) {
		if (err){
			res.send(400);
			console.log(err);
			return;
		}
		try{
			var data = require('jsonfn').JSONfn.parse(data);
		}catch(Error){
			 var data = {};
		}
					
			
		for(var id in data){
												
			if(Object.prototype.toString.call(data[id]['job']) == '[object Function]'){
							
				if(data[id]['schedule'] >= new Date().getTime()){
			
					var timeout = (data[id]['schedule'] - new Date().getTime());
	
					timeoutObj[id] = timeoutFn(function(){
						
						data[id]['job']();
						fs.readFile(__dirname+'/writable/cron.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = require('jsonfn').JSONfn.parse(data);
							}catch(Error){
								 var data = {};
							}
							
							delete(data[id]);
							
							var writeData = require('jsonfn').JSONfn.stringify(data); 
							
							fs.writeFile(__dirname+'/writable/cron.json', writeData, function (err) {
								
								if (err){
								  res.send(400);
								  console.log(err);
								  return;
								}
										  
								delete require.cache[require.resolve('./writable/cron.json')];
																
							})
				
						})
						
					}, timeout);
				}
				
			}
			
		}
		
		exports.timeoutObj = timeoutObj;
		
	})

}

