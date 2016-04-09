var amazonRoute53 = require('awssum-amazon-route53');

var r53 = new amazonRoute53.Route53({
	'accessKeyId'     : '',
	'secretAccessKey' : ''
});
					
exports.DeleteHostedZone = function(req, res){
	
	var run = function(req,res){
		
		if(!req.body.HostedZoneId){
			
			res.json(400, {error:'You must include a HostedZoneId.'});
			return;
		}
		
		if(req.body.HostedZoneId.trim().toUpperCase() == 'Z32W2IA89T22L8'){
			
			res.json(400, {error:'You cannot delete this record.'});
			return;
		}
					
		r53.DeleteHostedZone({HostedZoneId: req.body.HostedZoneId}, function(err, data) {
			
			if(err){
				res.json(400, {error: err.StatusCode+' '+err.Body.ErrorResponse.Error.Code, details: err});
				return;
			}
			
			if(data.StatusCode == 200){
				res.json({HostedZoneId: req.body.HostedZoneId});
			}
			
		});
					
	}
	promo.checkRequiredRoles([7], run, req, res);
}


exports.CreateHostedZone = function(req, res){
	
	var run = function(req,res){
		
		if(!req.body.name){
			
			res.json({error:'You must enter a domain name.', field: 'name'});
			return;
		}
					
		var uuid = require('node-uuid');
			
		r53.CreateHostedZone({Name: req.body.name.trim(), Comment: req.body.comment, CallerReference: uuid.v4()}, function(err, data) {
			if(err){
				res.json({error: err.StatusCode+' '+err.Body.ErrorResponse.Error.Code, details: err});
				return;
			}
			
			if(data.StatusCode == 201){
				res.json({name: data.Body.CreateHostedZoneResponse.HostedZone.Name, NameServer: data.Body.CreateHostedZoneResponse.DelegationSet.NameServers.NameServer});
			}
			
		});
					
	}
	promo.checkRequiredRoles([7], run, req, res);
}


exports.GetHostedZone = function(req, res){
	
	var run = function(req,res){
		
		if(!req.query.HostedZoneId){
			
			res.send(400);
			return;
		}
								
		r53.GetHostedZone({HostedZoneId: req.query.HostedZoneId}, function(err, data) {
			if(err){
				res.json({error: err.StatusCode+' '+err.Body.ErrorResponse.Error.Code, details: err});
				return;
			}
			
			if(data.StatusCode == 200){
				res.json({HostedZone: data.Body.GetHostedZoneResponse.HostedZone, NameServer:  data.Body.GetHostedZoneResponse.DelegationSet.NameServers.NameServer});
			}
			
		});
					
	}
	promo.checkRequiredRoles([7], run, req, res);
}



exports.CreateResourceRecord = function(req, res){
	
	var run = function(req,res){
		
		if(!req.body.HostedZoneId){
			
			res.json({error:'Hosted zone does not exist.', field: ''});
			return;
		}
		
		if(!req.body.domainName){
			
			res.json({error:'Domain name does not exist.', field: ''});
			return;
		}
		
		if(!req.body.name){
			
			res.json({error:'Please enter a resource name.', field: 'name'});
			return;
		}
		
		if(!req.body.value){
			
			res.json({error:'Please enter a resource value.', field: 'value'});
			return;
		}
		
		if(!req.body.type){
			
			res.json({error:'Please enter a resource type.', field: 'type'});
			return;
		}
		
		if(!req.body.ttl){
			
			res.json({error:'Please enter a resource TTL.', field: 'ttl'});
			return;
		}
				
		var changesObj = [
			{
			    "Action": "CREATE",
				"Name": req.body.name,
				"Type": req.body.type.toUpperCase(),
				"Ttl": req.body.ttl,
				"ResourceRecords": [
					req.body.value
				]
			}
		  ];
		  								
		r53.ChangeResourceRecordSets({HostedZoneId: req.body.HostedZoneId.trim(), Changes: changesObj}, function(err, data) {
			
			if(err){
				res.json({error: err.StatusCode+' '+err.Body.ErrorResponse.Error.Code, details: err});
				return;
			}
						
			if(data.StatusCode == 200){
				
				res.json(200, {error: '', name: req.body.name});
			}
			
		});
					
	}
	promo.checkRequiredRoles([7], run, req, res);
}



exports.DeleteResourceRecord = function(req, res){
	
	var run = function(req,res){
		
		if(!req.body.HostedZoneId){
			
			res.json(400, {error:'Hosted zone does not exist.', field: ''});
			return;
		}
	
		
		if(!req.body.name){
			
			res.json(400, {error:'Please enter a resource name.', field: 'name'});
			return;
		}
		
		if(!req.body.value){
			
			res.json(400, {error:'Please enter a resource value.', field: 'value'});
			return;
		}
		
		if(!req.body.type){
			
			res.json(400, {error:'Please enter a resource type.', field: 'type'});
			return;
		}
		
		if(!req.body.ttl){
			
			res.json(400, {error:'Please enter a resource TTL.', field: 'ttl'});
			return;
		}
				
		var changesObj = [
			{
			    "Action": "DELETE",
				"Name": req.body.name,
				"Type": req.body.type.toUpperCase(),
				"Ttl": req.body.ttl,
				"ResourceRecords": [
					req.body.value
				]
			}
		  ];
		  								
		r53.ChangeResourceRecordSets({HostedZoneId: req.body.HostedZoneId.trim(), Changes: changesObj}, function(err, data) {
			
			if(err){
				res.json(400, {error: err.StatusCode+' '+err.Body.ErrorResponse.Error.Code, details: err});
				return;
			}
						
			if(data.StatusCode == 200){
				
				res.json(200, {error: '', name: req.body.name});
			}
			
		});
					
	}
	promo.checkRequiredRoles([7], run, req, res);
}


exports.ListHostedZones = function(req, res){
	
	var run = function(req,res){
		
		if(req.query.HostedZoneId){
			
			
			var response = [];
			
			var resourceObj = {HostedZoneId: req.query.HostedZoneId};
			
			if(req.query.NextRecordName && req.query.NextRecordType){
				
				resourceObj.Name = req.query.NextRecordName;
				resourceObj.Type = req.query.NextRecordType;
			}
						
			r53.ListResourceRecordSets(resourceObj, function(err, data) {
				if(err){
					res.json(400, err);
					return;
				}
												
				response = response.concat(data.Body.ListResourceRecordSetsResponse.ResourceRecordSets.ResourceRecordSet);
			
				reachedEnd = (data.Body.ListResourceRecordSetsResponse.IsTruncated == 'true')?false:true;
				
				var json = {data: response, reachedEnd: reachedEnd, hostedZoneId: req.query.HostedZoneId};
				
				if(!reachedEnd){
					json.NextRecordName = data.Body.ListResourceRecordSetsResponse.NextRecordName;
					json.NextRecordType = data.Body.ListResourceRecordSetsResponse.NextRecordType;
				}
				
				res.json(json);
			});
								

			
			
		}else{
			
			r53.ListHostedZones({}, function(err, data) {
				if(err){
					res.json(400, err);
					return;
				}
				
				res.json(data.Body.ListHostedZonesResponse.HostedZones);
			});
			
		}
				
	}
	promo.checkRequiredRoles([7], run, req, res);
}
