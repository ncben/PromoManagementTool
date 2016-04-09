var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

exports.updateEssayItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.essayItemId || !req.body.essayItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var essayItemId  = req.body.essayItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(req.body.update == 'essay-height'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-height', value: req.body.value }));
			
		}else if(req.body.update == 'essay-height-adjustable'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-height-adjustable', value: req.body.value }));
			
		}else if(req.body.update == 'essay-required'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-required', value: req.body.value }));
			
		}else if(req.body.update == 'essay-description'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-description', value: req.body.value }));
			
		}else if(req.body.update == 'essay-counter'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-counter', value: req.body.value }));
			
		}else if(req.body.update == 'limit-number-min'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-number-min', value: req.body.value }));
			
		}else if(req.body.update == 'limit-number-max'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-number-max', value: req.body.value }));
			
		}else if(req.body.update == 'limit-type'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-type', value: req.body.value }));
			
		}else if(req.body.update == 'trim-text'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':trim-text', value: req.body.value }));
			
		}else{
			
			res.writeHead(400);
			res.end(); 
			return;
				
			
		}
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, essayItemId : essayItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.createEssayItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.essayItemId || !req.body.essayItemId.trim()){
		
			var uuid = require('node-uuid');
			var essayItemId  = uuid.v4();
			
		}else{
			
			var essayItemId  = req.body.essayItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.essayItemId || !req.body.essayItemId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-number-min', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-number-max', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':limit-type', value: 'character' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-counter', value: 'desc' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-description', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-required', value: '1' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-height', value: '150' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':essay-height-adjustable', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'essaycontest:'+essayItemId+':trim-text', value: '0' }));
			
		}
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, essayItemId : essayItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deleteEssayItem = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':limit-number', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':limit-number-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':limit-number-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':limit-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':essay-description', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':essay-required', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':essay-height', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':essay-height-adjustable', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':essay-counter', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'essaycontest:'+req.body.id.trim()+':trim-text', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, essayItemId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.getInfo = function(req, res) {	
	
	
	var qa =  req.id;	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['essaycontest:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}		
								
			var response = {};
								
			if(data.length > 0){
				
				var essayItem = {};
				for(key in data[0].columns){
								
															
					var column = key.replace('essaycontest:','').split(":");
																										
					if(typeof essayItem[column[0]] == 'undefined')essayItem[column[0]] = {};
					
					essayItem[column[0]][column[column.length-1]] = data[0].columns[key].value;
				
						
				}	
				
				
				response.essayItem = essayItem;						
																			  
			}
			
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};