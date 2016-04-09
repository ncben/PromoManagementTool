var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

exports.updateGalleryItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.galleryItemId || !req.body.galleryItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var galleryItemId  = req.body.galleryItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(req.body.update == 'import-from'){
			if(typeof req.body.value == 'object'){
				promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':import-from', value: req.body.value.join(',') }));
			}
		}else if(req.body.update == 'gallery-style'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':gallery-style', value: req.body.value }));
			
		}else if(req.body.update == 'comment-plugin'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':comment-plugin', value: req.body.value }));
			
		}else if(req.body.update == 'item-per-page'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':item-per-page', value: req.body.value }));
			
		}else if(req.body.update == 'allow-user-sort'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':allow-user-sort', value: req.body.value }));
			
		}else if(req.body.update == 'sort-default'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':sort-default', value: req.body.value }));
			
		}else if(req.body.update == 'user-sort-type'){
			if(typeof req.body.value == 'object'){
				promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':user-sort-type', value: req.body.value.join(',') }));
			}
		}else if(req.body.update == 'allow-user-search'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':allow-user-search', value: req.body.value }));
			
		}else if(req.body.update == 'user-search-criteria'){
			if(typeof req.body.value == 'object'){
				promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':user-search-criteria', value: req.body.value.join(',') }));
			}
		}else if(req.body.update == 'screening-required'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':screening-required', value: req.body.value }));
			
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
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, galleryItemId : galleryItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.createGalleryItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.galleryItemId || !req.body.galleryItemId.trim()){
		
			var uuid = require('node-uuid');
			var galleryItemId  = uuid.v4();
			
		}else{
			
			var galleryItemId  = req.body.galleryItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.galleryItemId || !req.body.galleryItemId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':import-from', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':item-per-page', value: '18' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':allow-user-sort', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':sort-default', value: 'random' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':user-sort-type', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':allow-user-search', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':user-search-criteria', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':screening-required', value: '1' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':gallery-style', value: 'pinterest' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'gallery:'+galleryItemId+':comment-plugin', value: '' }));
		}
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, galleryItemId : galleryItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deleteGalleryItem = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':import-from', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':item-per-page', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':allow-user-sort', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':sort-default', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':user-sort-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':allow-user-search', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':user-search-criteria', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':screening-required', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':gallery-style', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'gallery:'+req.body.id.trim()+':comment-plugin', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, galleryItemId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.getInfo = function(req, res) {	
	
	
	var qa =  req.id;	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['gallery:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}		
								
			var response = {};
								
			if(data.length > 0){
				
				var galleryItem = {};
				for(key in data[0].columns){
								
															
					var column = key.replace('gallery:','').split(":");
																										
					if(typeof galleryItem[column[0]] == 'undefined')galleryItem[column[0]] = {};
					
					galleryItem[column[0]][column[column.length-1]] = data[0].columns[key].value;
				
						
				}	
				
				
				response.galleryItem = galleryItem;						
																			  
			}
			
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};