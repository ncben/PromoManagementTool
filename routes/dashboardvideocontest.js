var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

exports.updateVideoItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.videoItemId || !req.body.videoItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var videoItemId  = req.body.videoItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(req.body.update == 'video-required'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-required', value: req.body.value }));
			
		}else if(req.body.update == 'video-description'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-description', value: req.body.value }));
			
		}else if(req.body.update == 'video-preview-image'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-preview-image', value: req.body.value }));
			
		}else if(req.body.update == 'video-size'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-size-min', value: req.body['video-size-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-size-max', value: req.body['video-size-max'] }));
			
		}else if(req.body.update == 'video-quantity'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-quantity-min', value: req.body['video-quantity-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-quantity-max', value: req.body['video-quantity-max'] }));
			
		}else if(req.body.update == 'video-aspect-ratio'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-aspect-ratio-min', value: req.body['video-aspect-ratio-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-aspect-ratio-max', value: req.body['video-aspect-ratio-max'] }));
			
		}else if(req.body.update == 'video-length'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-length-min', value: req.body['video-length-min'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-length-max', value: req.body['video-length-max'] }));
			
		}else if(req.body.update == 'video-file-type'){
			
			if(typeof req.body.value == 'object')
				promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-file-type', value: req.body.value.join(',') }));
			
		}else if(req.body.update == 'video-file-source'){
			
			if(typeof req.body.value == 'object')
				promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-file-source', value: req.body.value.join(',') }));
			
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
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, videoItemId : videoItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.createVideoItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.videoItemId || !req.body.videoItemId.trim()){
		
			var uuid = require('node-uuid');
			var videoItemId  = uuid.v4();
			
		}else{
			
			var videoItemId  = req.body.videoItemId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.videoItemId || !req.body.videoItemId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-description', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-required', value: '1' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-aspect-ratio-min', value: '1:999' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-aspect-ratio-max', value: '999:1' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-length-min', value: '0' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-length-max', value: '3605' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-quantity-min', value: '1' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-quantity-max', value: '1' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-size-min', value: '0' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-size-max', value: '250' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-file-type', value: '.mpg,.mpeg,.wmv,.mpeg4,.mpe,.ogv,.ogm,.3gpp,.3g2,.3gp,.flv,.f4v,.mp4,.mov,.m4v' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-file-source', value: 'local' }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'videocontest:'+videoItemId+':video-preview-image', value: '0' }));
		}
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, videoItemId : videoItemId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deleteVideoItem = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-description', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-required', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-aspect-ratio-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-aspect-ratio-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-length-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-length-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-size-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-size-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-quantity-min', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-quantity-max', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-file-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-preview-image', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'videocontest:'+req.body.id.trim()+':video-file-source', isDelete: true })
			 
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, videoItemId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.getInfo = function(req, res) {	
	
	
	var qa =  req.id;	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['videocontest:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}		
								
			var response = {};
								
			if(data.length > 0){
				
				var videoItem = {};
				for(key in data[0].columns){
								
															
					var column = key.replace('videocontest:','').split(":");
																										
					if(typeof videoItem[column[0]] == 'undefined')videoItem[column[0]] = {};
					
					videoItem[column[0]][column[column.length-1]] = data[0].columns[key].value;
				
						
				}	
				
				
				response.videoItem = videoItem;						
																			  
			}
			
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};