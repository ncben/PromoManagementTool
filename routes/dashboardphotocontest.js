var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

exports.updatePhotoItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.photoItemId || !req.body.photoItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var photoItemId  = req.body.photoItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(req.body.update == 'photo-required'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-required', value: req.body.value }));
			
		}else if(req.body.update == 'photo-description'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-description', value: req.body.value }));
			
		}else if(req.body.update == 'photo-preview-image'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-preview-image', value: req.body.value }));
			
		}else if(req.body.update == 'photo-size'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-size-min', value: req.body['photo-size-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-size-max', value: req.body['photo-size-max'] }));
			
		}else if(req.body.update == 'photo-quantity'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-quantity-min', value: req.body['photo-quantity-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-quantity-max', value: req.body['photo-quantity-max'] }));
			
		}else if(req.body.update == 'photo-height'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-height-min', value: req.body['photo-height-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-height-max', value: req.body['photo-height-max'] }));
			
		}else if(req.body.update == 'photo-width'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-width-min', value: req.body['photo-width-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-width-max', value: req.body['photo-width-max'] }));
			
		}else if(req.body.update == 'photo-file-type'){
			
			if(typeof req.body.value == 'object')
				promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-file-type', value: req.body.value.join(',') }));
			
		}else if(req.body.update == 'photo-file-source'){
			
			if(typeof req.body.value == 'object')
				promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-file-source', value: req.body.value.join(',') }));
			
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
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, photoItemId : photoItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.createPhotoItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.photoItemId || !req.body.photoItemId.trim()){
		
			var uuid = require('node-uuid');
			var photoItemId  = uuid.v4();
			
		}else{
			
			var photoItemId  = req.body.photoItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.photoItemId || !req.body.photoItemId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-description', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-required', value: '1' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-height-min', value: '0' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-height-max', value: '4880' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-width-min', value: '0' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-width-max', value: '4880' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-quantity-min', value: '1' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-quantity-max', value: '1' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-size-min', value: '0' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-size-max', value: '10' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-file-type', value: '.jpg,.jpeg,.png,.gif,.bmp' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-file-source', value: 'local' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'photocontest:'+photoItemId+':photo-preview-image', value: '0' }));
		}
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, photoItemId : photoItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deletePhotoItem = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-description', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-required', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-height-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-height-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-width-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-width-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-size-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-size-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-quantity-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-quantity-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-file-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-preview-image', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'photocontest:'+req.body.id.trim()+':photo-file-source', isDelete: true })
			 
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, photoItemId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.getInfo = function(req, res) {	
	
	
	var qa =  req.id;	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['photocontest:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}		
								
			var response = {};
								
			if(data.length > 0){
				
				var photoItem = {};
				for(key in data[0].columns){
								
															
					var column = key.replace('photocontest:','').split(":");
																										
					if(typeof photoItem[column[0]] == 'undefined')photoItem[column[0]] = {};
					
					photoItem[column[0]][column[column.length-1]] = data[0].columns[key].value;
				
						
				}	
				
				
				response.photoItem = photoItem;						
																			  
			}
			
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};