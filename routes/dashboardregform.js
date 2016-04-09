var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;



exports.updateEligibilityState = function(req, res) {
	
	var run = function(req, res){	 
			  
		if(!req.body.value || typeof req.body.value != 'object' || req.body.value.length < 1){
		
			res.json(200, {error:'Please select at least one state/province.', field: 'state'});
			return;
			
		}	
		
		
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
		
			var uuid = require('node-uuid');
			var eligibilityId  = uuid.v4();
			var eligibleCountry = req.body.country || 'US';
			
		}else{
			
			var eligibilityId  = req.body.eligibilityId.trim();
			
			if(!/^((US)|(CA)|(US\+)|(INTL))$/.test(req.body.country)){
			
				res.json(200, {error:'Country '+req.body.value+' is not valid.', field: 'country'});
				return;
			
			}
			
			var eligibleCountry = req.body.country;
			
		}
		
		var country = {};
		country['US'] = [
							 "AK","Alaska",
							 "HI","Hawaii",
							 "CA","California",
							 "NV","Nevada",
							 "OR","Oregon",
							 "WA","Washington",
							 "DC","District of Columbia",
							 "AZ","Arizona",
							 "CO","Colorado",
							 "ID","Idaho",
							 "MT","Montana",
							 "NE","Nebraska",
							 "NM","New Mexico",
							 "ND","North Dakota",
							 "UT","Utah",
							 "WY","Wyoming",
							 "AL","Alabama",
							 "AR","Arkansas",
							 "IL","Illinois",
							 "IA","Iowa",
							 "KS","Kansas",
							 "KY","Kentucky",
							 "LA","Louisiana",
							 "MN","Minnesota",
							 "MS","Mississippi",
							 "MO","Missouri",
							 "OK","Oklahoma",
							 "SD","South Dakota",
							 "TX","Texas",
							 "TN","Tennessee",
							 "WI","Wisconsin",
							 "CT","Connecticut",
							 "DE","Delaware",
							 "FL","Florida",
							 "GA","Georgia",
							 "IN","Indiana",
							 "ME","Maine",
							 "MD","Maryland",
							 "MA","Massachusetts",
							 "MI","Michigan",
							 "NH","New Hampshire",
							 "NJ","New Jersey",
							 "NY","New York",
							 "NC","North Carolina",
							 "OH","Ohio",
							 "PA","Pennsylvania",
							 "RI","Rhode Island",
							 "SC","South Carolina",
							 "VT","Vermont",
							 "VA","Virginia",
							 "WV","West Virginia"
						];
		country['US+'] = [
							"AS","American Samoa",
							"GU","Guam",
							"MP","Northern Mariana Islands",
							"PR","Puerto Rico",
							"VI","U.S. Virgin Islands"
						];		
		country['CA'] = [
							"ON","Ontario",
							"QC","Quebec",
							"NS","Nova Scotia",
							"NB","New Brunswick",
							"MB","Manitoba",
							"BC","British Columbia",
							"PE","Prince Edward Island",
							"SK","Saskatchewan",
							"AB","Alberta",
							"NL","Newfoundland and Labrador",
							"NT","Northwest Territories",
							"YT","Yukon",
							"NU","Nunavut"
							
						];		
		country['INTL'] = ["AF","Afghanistan",
							"AX","Åland Islands",
							"AL","Albania",
							"DZ","Algeria",
							"AD","Andorra",
							"AO","Angola",
							"AI","Anguilla",
							"AQ","Antarctica",
							"AG","Antigua and Barbuda",
							"AR","Argentina",
							"AM","Armenia",
							"AW","Aruba",
							"AU","Australia",
							"AT","Austria",
							"AZ","Azerbaijan",
							"BS","Bahamas",
							"BH","Bahrain",
							"BD","Bangladesh",
							"BB","Barbados",
							"BY","Belarus",
							"BE","Belgium",
							"BZ","Belize",
							"BJ","Benin",
							"BM","Bermuda",
							"BT","Bhutan",
							"BO","Bolivia",
							"BA","Bosnia and Herzegovina",
							"BW","Botswana",
							"BV","Bouvet Island",
							"BR","Brazil",
							"IO","British Indian Ocean Territory",
							"BN","Brunei Darussalam",
							"BG","Bulgaria",
							"BF","Burkina Faso",
							"BI","Burundi",
							"KH","Cambodia",
							"CM","Cameroon",
							"CV","Cape Verde",
							"KY","Cayman Islands",
							"CF","Central African Republic",
							"TD","Chad",
							"CL","Chile",
							"CN","China",
							"CX","Christmas Island",
							"CC","Cocos (Keeling) Islands",
							"CO","Colombia",
							"KM","Comoros",
							"CG","Congo",
							"CD","Congo, The Democratic Republic of The",
							"CK","Cook Islands",
							"CR","Costa Rica",
							"CI","Cote D'ivoire",
							"HR","Croatia",
							"CU","Cuba",
							"CY","Cyprus",
							"CZ","Czech Republic",
							"DK","Denmark",
							"DJ","Djibouti",
							"DM","Dominica",
							"DO","Dominican Republic",
							"EC","Ecuador",
							"EG","Egypt",
							"SV","El Salvador",
							"GQ","Equatorial Guinea",
							"ER","Eritrea",
							"EE","Estonia",
							"ET","Ethiopia",
							"FK","Falkland Islands (Malvinas)",
							"FO","Faroe Islands",
							"FJ","Fiji",
							"FI","Finland",
							"FR","France",
							"GF","French Guiana",
							"PF","French Polynesia",
							"TF","French Southern Territories",
							"GA","Gabon",
							"GM","Gambia",
							"GE","Georgia",
							"DE","Germany",
							"GH","Ghana",
							"GI","Gibraltar",
							"GR","Greece",
							"GL","Greenland",
							"GD","Grenada",
							"GP","Guadeloupe",
							"GT","Guatemala",
							"GG","Guernsey",
							"GN","Guinea",
							"GW","Guinea-bissau",
							"GY","Guyana",
							"HT","Haiti",
							"HM","Heard Island and Mcdonald Islands",
							"VA","Holy See (Vatican City State)",
							"HN","Honduras",
							"HK","Hong Kong",
							"HU","Hungary",
							"IS","Iceland",
							"IN","India",
							"ID","Indonesia",
							"IR","Iran, Islamic Republic of",
							"IQ","Iraq",
							"IE","Ireland",
							"IM","Isle of Man",
							"IL","Israel",
							"IT","Italy",
							"JM","Jamaica",
							"JP","Japan",
							"JE","Jersey",
							"JO","Jordan",
							"KZ","Kazakhstan",
							"KE","Kenya",
							"KI","Kiribati",
							"KP","Korea, Democratic People's Republic of",
							"KR","Korea, Republic of",
							"KW","Kuwait",
							"KG","Kyrgyzstan",
							"LA","Lao People's Democratic Republic",
							"LV","Latvia",
							"LB","Lebanon",
							"LS","Lesotho",
							"LR","Liberia",
							"LY","Libyan Arab Jamahiriya",
							"LI","Liechtenstein",
							"LT","Lithuania",
							"LU","Luxembourg",
							"MO","Macao",
							"MK","Macedonia, The Former Yugoslav Republic of",
							"MG","Madagascar",
							"MW","Malawi",
							"MY","Malaysia",
							"MV","Maldives",
							"ML","Mali",
							"MT","Malta",
							"MH","Marshall Islands",
							"MQ","Martinique",
							"MR","Mauritania",
							"MU","Mauritius",
							"YT","Mayotte",
							"MX","Mexico",
							"FM","Micronesia, Federated States of",
							"MD","Moldova, Republic of",
							"MC","Monaco",
							"MN","Mongolia",
							"ME","Montenegro",
							"MS","Montserrat",
							"MA","Morocco",
							"MZ","Mozambique",
							"MM","Myanmar",
							"NA","Namibia",
							"NR","Nauru",
							"NP","Nepal",
							"NL","Netherlands",
							"AN","Netherlands Antilles",
							"NC","New Caledonia",
							"NZ","New Zealand",
							"NI","Nicaragua",
							"NE","Niger",
							"NG","Nigeria",
							"NU","Niue",
							"NF","Norfolk Island",
							"NO","Norway",
							"OM","Oman",
							"PK","Pakistan",
							"PW","Palau",
							"PS","Palestinian Territory, Occupied",
							"PA","Panama",
							"PG","Papua New Guinea",
							"PY","Paraguay",
							"PE","Peru",
							"PH","Philippines",
							"PN","Pitcairn",
							"PL","Poland",
							"PT","Portugal",
							"QA","Qatar",
							"RE","Reunion",
							"RO","Romania",
							"RU","Russian Federation",
							"RW","Rwanda",
							"SH","Saint Helena",
							"KN","Saint Kitts and Nevis",
							"LC","Saint Lucia",
							"PM","Saint Pierre and Miquelon",
							"VC","Saint Vincent and The Grenadines",
							"WS","Samoa",
							"SM","San Marino",
							"ST","Sao Tome and Principe",
							"SA","Saudi Arabia",
							"SN","Senegal",
							"RS","Serbia",
							"SC","Seychelles",
							"SL","Sierra Leone",
							"SG","Singapore",
							"SK","Slovakia",
							"SI","Slovenia",
							"SB","Solomon Islands",
							"SO","Somalia",
							"ZA","South Africa",
							"GS","South Georgia and The South Sandwich Islands",
							"ES","Spain",
							"LK","Sri Lanka",
							"SD","Sudan",
							"SR","Suriname",
							"SJ","Svalbard and Jan Mayen",
							"SZ","Swaziland",
							"SE","Sweden",
							"CH","Switzerland",
							"SY","Syrian Arab Republic",
							"TW","Taiwan, Province of China",
							"TJ","Tajikistan",
							"TZ","Tanzania, United Republic of",
							"TH","Thailand",
							"TL","Timor-leste",
							"TG","Togo",
							"TK","Tokelau",
							"TO","Tonga",
							"TT","Trinidad and Tobago",
							"TN","Tunisia",
							"TR","Turkey",
							"TM","Turkmenistan",
							"TC","Turks and Caicos Islands",
							"TV","Tuvalu",
							"UG","Uganda",
							"UA","Ukraine",
							"AE","United Arab Emirates",
							"GB","United Kingdom",
							"UY","Uruguay",
							"UZ","Uzbekistan",
							"VU","Vanuatu",
							"VE","Venezuela",
							"VN","Viet Nam",
							"VG","Virgin Islands, British",
							"WF","Wallis and Futuna",
							"EH","Western Sahara",
							"YE","Yemen",
							"ZM","Zambia",
							"ZW","Zimbabwe"
							];	
		
		
		for(var i=0; i < req.body.value.length ; i++){
			
			
			
			if(!/^[A-Z]{2}$/.test(req.body.value[i])){
			
				res.json(200, {error:''+req.body.value[i]+' is not valid.', field: 'state'});
				return;
			
			}
			
			if(country[eligibleCountry].indexOf(req.body.value[i]) === -1){
			
				res.json(200, {error:''+req.body.value[i]+' is not valid for selected country '+eligibleCountry+'.', field: 'state'});
				return;
			
			}
			
		}
		
		if(req.body.value.length === country[eligibleCountry].length/2)req.body.value = ['*'];
		
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':country', value: eligibleCountry }),
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':state', value: req.body.value.join(',') })
		 ];
		 
		 
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMin', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMax', value: '100' }));
			
		}

		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, eligibilityId : eligibilityId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};

exports.updateEligibilityCountry = function(req, res) {
	
	var run = function(req, res){	 
			  
		if(!req.body.country || !/^((US)|(CA)|(US\+)|(INTL))$/.test(req.body.country.trim())){
		
			res.json(200, {error:'Please select a country.', field: 'country'});
			return;
			
		}	
		
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
		
			var uuid = require('node-uuid');
			var eligibilityId  = uuid.v4();
			
		}else{
			
			var eligibilityId  = req.body.eligibilityId.trim();
			
		}	
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':country', value: req.body.country }),
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':state', isDelete: true })
		 ];
		 
		 
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMin', value: '0' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMax', value: '100' }));
			
		}

		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, country: req.body.country, eligibilityId : eligibilityId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};

exports.updateEligibilityAge = function(req, res) {
	
	var run = function(req, res){	 
			  
		if(!req.body.ageMin || !/^[0-9]{1,3}$/.test(req.body.ageMin.trim()) || parseInt(req.body.ageMin.trim()) > 100
		|| !req.body.ageMax || !/^[0-9]{1,3}$/.test(req.body.ageMax.trim()) || parseInt(req.body.ageMax.trim()) > 100){
		
			res.json(400);
			return;
			
		}	
		
		
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
		
			var uuid = require('node-uuid');
			var eligibilityId  = uuid.v4();
			
		}else{
			
			var eligibilityId  = req.body.eligibilityId.trim();
			
		}	
	
		
		var promoObj = [
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMin', value: parseInt(req.body.ageMin).toString() }),
			new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':ageMax', value: parseInt(req.body.ageMax).toString() })
		 ];
		 
		 
		if(!req.body.eligibilityId || !req.body.eligibilityId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:eligibility:'+eligibilityId+':country', value:'US' }));
			
		}

		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
											 
			if(!err){
										  
			  if(!res.headersSent)res.json({error:'', pid: req.body.pid, eligibilityId : eligibilityId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.deleteEligibility = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(500);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'regform:eligibility:'+req.body.id.trim()+':country', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:eligibility:'+req.body.id.trim()+':state', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:eligibility:'+req.body.id.trim()+':ageMin', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:eligibility:'+req.body.id.trim()+':ageMax', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, eligibilityId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};




exports.updateEntryPeriod = function(req, res) {
	
	var run = function(req, res){	 
			  
		
		if(!req.body.entryPeriodId || !req.body.entryPeriodId.trim()){
		
			var uuid = require('node-uuid');
			var entryPeriodId  = uuid.v4();
			
		}else{
			
			var entryPeriodId  = req.body.entryPeriodId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.entryPeriodId || !req.body.entryPeriodId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+entryPeriodId+':start', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+entryPeriodId+':end', value: '' }));
			
		}else if(req.body.update == 'start'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+entryPeriodId+':start', value: req.body.value }));
			
		}else if(req.body.update == 'end'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+entryPeriodId+':end', value: req.body.value }));
			
		}
	
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, entryPeriodId : entryPeriodId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.deleteEntryPeriod = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(500);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+req.body.id.trim()+':start', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:entryperiod:'+req.body.id.trim()+':end', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, entryPeriodId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.updateEntryLimit = function(req, res) {
	
	var run = function(req, res){	 
			  
		
		if(!req.body.entryLimitId || !req.body.entryLimitId.trim()){
		
			var uuid = require('node-uuid');
			var entryLimitId  = uuid.v4();
			
		}else{
			
			var entryLimitId  = req.body.entryLimitId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.entryLimitId || !req.body.entryLimitId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-number', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-type', value: '' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-period', value: '' }));
			
		}else if(req.body.update == 'limit-number'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-number', value: req.body.value }));
			
		}else if(req.body.update == 'limit-type'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-type', value: req.body.value }));
			
		}else if(req.body.update == 'limit-period'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-period', value: req.body.value }));
			
			if(req.body.timezone){
				
				promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-period-timezone', value: req.body.timezone }));
				
			}else{
				
				promoObj.push(new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+entryLimitId+':limit-period-timezone', value: '', isDelete: true }));
			
			}
			
		}
	
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, timezone: req.body.timezone, entryLimitId : entryLimitId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.deleteEntryLimit = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(500);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+req.body.id.trim()+':limit-number', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+req.body.id.trim()+':limit-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:entrylimit:'+req.body.id.trim()+':limit-period', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, entryLimitId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};




exports.updateReferralEntryLimit = function(req, res) {
	
	var run = function(req, res){	 
			  
		
		if(!req.body.referralEntryLimitId || !req.body.referralEntryLimitId.trim()){
		
			var uuid = require('node-uuid');
			var referralEntryLimitId  = uuid.v4();
			
		}else{
			
			var referralEntryLimitId  = req.body.referralEntryLimitId.trim();
			
		}	
		
		
		var promoObj = [
		 ];
		 
		 
		if(!req.body.referralEntryLimitId || !req.body.referralEntryLimitId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-number', value: '1' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-type', value: 'per-person' }));
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-period', value: '' }));
			
		}else if(req.body.update == 'limit-number'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-number', value: req.body.value }));
			
		}else if(req.body.update == 'limit-type'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-type', value: req.body.value }));
			
		}else if(req.body.update == 'limit-period'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-period', value: req.body.value }));
			
			if(req.body.timezone){
				
				promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-period-timezone', value: req.body.timezone }));
				
			}else{
				
				promoObj.push(new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+referralEntryLimitId+':limit-period-timezone', value: '', isDelete: true }));
			
			}
			
		}
	
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, timezone: req.body.timezone, referralEntryLimitId : referralEntryLimitId});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.deleteReferralEntryLimit = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(500);
			res.end(); 
			return;
			
		}
		 
		
		 var deleteObj = [
			 new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+req.body.id.trim()+':limit-number', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+req.body.id.trim()+':limit-type', isDelete: true }),
			 new HBaseTypes.Mutation({ column: 'regform:referralentrylimit:'+req.body.id.trim()+':limit-period', isDelete: true })
		 ];
		 
		 
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
			
			if(err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
													 
			if(!err){
										  
			  res.json({error:'', pid: req.body.pid, referralEntryLimitId: req.body.id.trim()});
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.getInfo = function(req, res) {	
	
	
	var qa =  req.id;	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['regform:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}		
								
			var response = {};
						 		
								
			if(data.length > 0){
				var eligibility = {};
				var entryPeriod = {};
				var entryLimit = {};
				var referralEntryLimit = {};
				for(key in data[0].columns){
								
					if(/^regform:eligibility:/.test(key)){
											
						var column = key.replace('regform:eligibility:','').split(":");
																											
						if(typeof eligibility[column[0]] == 'undefined')eligibility[column[0]] = {};
						
						eligibility[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
					if(/^regform:entryperiod:/.test(key)){
											
						var column = key.replace('regform:entryperiod:','').split(":");
																											
						if(typeof entryPeriod[column[0]] == 'undefined')entryPeriod[column[0]] = {};
						
						entryPeriod[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
					if(/^regform:entrylimit:/.test(key)){
											
						var column = key.replace('regform:entrylimit:','').split(":");
																											
						if(typeof entryLimit[column[0]] == 'undefined')entryLimit[column[0]] = {};
						
						entryLimit[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
					if(/^regform:referralentrylimit:/.test(key)){
											
						var column = key.replace('regform:referralentrylimit:','').split(":");
																											
						if(typeof referralEntryLimit[column[0]] == 'undefined')referralEntryLimit[column[0]] = {};
						
						referralEntryLimit[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
							
				}	
											
																			  
				response.eligibility = eligibility;
				response.entryPeriod = entryPeriod;
				response.entryLimit = entryLimit;
				response.referralEntryLimit = referralEntryLimit;
			}
			
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};