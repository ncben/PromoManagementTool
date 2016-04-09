(function($, undefined) {
	
	var EntryLimitPeriods;
	var availableStates;
	var resetAvailableStates;
	var states;

window.PromoDashboardComponentRegFormView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
    },
	
	events: {
		
		'click #deleteEligibilityModal .confirm' : 'deleteEligibility',
		'click #deleteEntryPeriodModal .confirm' : 'deleteEntryPeriod',
		'click #deleteEntryLimitModal .confirm' : 'deleteEntryLimit',
		'click #deleteReferralEntryLimitModal .confirm' : 'deleteReferralEntryLimit',
		'click .addEligibility' : 'addEligibility',
		'click .addEntryPeriod' : 'addEntryPeriod',
		'click .addEntryLimit' : 'addEntryLimit',
		'click .addReferralEntryLimit' : 'addReferralEntryLimit'
	},
	
	
	addReferralEntryLimit: function(event){
		
		event.preventDefault();
					
		$('.referralEntryLimits').append(new PromoDashboardComponentRegFormReferralEntryLimitItemView({model: this.model, collection: this.collection, referralentrylimit: {el: {'limit-number': '1', 'limit-type': 'per-person', 'limit-period': ''}, key: ''}}).el);
		
		
		setTimeout(function(){
			
			if($(".editable-container").length > 0){
			
				$(".editable-container").scrollintoview();
				
			}
			
		},0);
		
	},
	
	
	populateReferralEntryLimit: function(){
		
		var el = this.$el;	
				
		var referralEntryLimit = this.collection.pluck('referralEntryLimit')[0];
		
		referralEntryLimit = _(referralEntryLimit).sortBy(function(referralEntryLimitEl, key) {
			
			referralEntryLimit[key].key = key;
			return referralEntryLimitEl['limit-number'] || referralEntryLimitEl['limit-type'] || '0';
		});
		
		_.each(referralEntryLimit, $.proxy(function(referralEntryLimitEl, key){
						
			 $('.referralEntryLimits', el).append(new PromoDashboardComponentRegFormReferralEntryLimitItemView({model: this.model, collection: this.collection, referralentrylimit: {el: referralEntryLimitEl, key: referralEntryLimitEl.key}}).el);
			
		}), this);
		
		
		setTimeout(function(){
			if($('.referralEntryLimits .dataCache').length > 0){
				$(".referralEntryLimitsTableHeader").show();
			}else{
				$(".referralEntryLimitsTableHeader").hide();
			}
		},0);
	
		
	},
	
	
	
	
	deleteReferralEntryLimit: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.referralEntryLimitId){
			
				var deleteObj = $(".referralEntryLimits .dataCache").filter(function(){
					
					return $(this).data('id') == response.referralEntryLimitId;
					
				}).parents('tr');
				
				deleteObj.remove();
				
				$(".referralEntryLimits").empty();
								
				
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateReferralEntryLimit();
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'referralentrylimit'});
		
		if($("#deleteReferralEntryLimitModal").data('id')){
			this.collection.first().destroy({data: { id: $("#deleteReferralEntryLimitModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
		}else{
			
			 $(".referralEntryLimits .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('tr').remove();
		}
		
		$("#deleteReferralEntryLimitModal").modal('hide');
		
	
		
	},
	
	deleteEntryLimit: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.entryLimitId){
			
				var deleteObj = $(".entryLimits .dataCache").filter(function(){
					
					return $(this).data('id') == response.entryLimitId;
					
				}).parents('tr');
				
				deleteObj.remove();
				
				$(".entryLimits").empty();
								
				
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateEntryLimit();
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'entrylimit'});
		
		if($("#deleteEntryLimitModal").data('id')){
			this.collection.first().destroy({data: { id: $("#deleteEntryLimitModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
		}else{
			
			 $(".entryLimits .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('tr').remove();
		}
		
		$("#deleteEntryLimitModal").modal('hide');
		
	
		
	},
	
	deleteEntryPeriod: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.entryPeriodId){
			
				var deleteObj = $(".submissionPeriods .dataCache").filter(function(){
					
					return $(this).data('id') == response.entryPeriodId;
					
				}).parents('tr');
				
				deleteObj.remove();
				
				$(".submissionPeriods").empty();
								
				
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateEntryPeriods();
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'entryperiod'});
		
		if($("#deleteEntryPeriodModal").data('id')){
			this.collection.first().destroy({data: { id: $("#deleteEntryPeriodModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
		}else{
			
			 $(".submissionPeriods .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('tr').remove();
		}
		
		$("#deleteEntryPeriodModal").modal('hide');
		
	
		
	},

	deleteEligibility: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = function(model, response){
			
			if(response && response.eligibilityId){
			
				$(".eligibilityItem").filter(function(){
					
					return $(this).data('id') == response.eligibilityId;
					
				}).remove();
				
				
				var country;
				
				_.each(availableStates, function(value, key){
					
		
										
					if(value.key == response.eligibilityId){
					
						country = availableStates[key][0].shortText;
						delete availableStates[key];
						
					}
					
				})
				
				if(typeof country != 'undefined')resetAvailableStates(country);
				
				
			}else deleteFail();
			
			
		};
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'eligibility'});
		
		if($("#deleteEligibilityModal").data('id')){
			this.collection.first().destroy({data: { id: $("#deleteEligibilityModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
		}else{
			
			 $(".eligibilityItem").filter(function(){
					
					return !$(this).data('id');
					
				}).remove();
		}
		
		$("#deleteEligibilityModal").modal('hide');
		
	
		
	},
	
	setEntryLimitPeriods: function(){
		
		EntryLimitPeriods = [
				{value: '', text: 'Entry Periods', children: [
					{value: 'entire-promotion', text: 'Entire Promotion'}
					]
				},
				{value: '', text: 'Calendar Periods', children: [
					{value: 'calendar-day-1', text: 'Calendar Day'},
					{value: 'calendar-week-mon', text: 'Calendar Week (Mon-Sun)'},
					{value: 'calendar-week-tues', text: 'Calendar Week (Tues-Mon)'},
					{value: 'calendar-week-wed', text: 'Calendar Week (Wed-Tues)'},
					{value: 'calendar-week-thurs', text: 'Calendar Week (Thurs-Wed)'},
					{value: 'calendar-week-fri', text: 'Calendar Week (Fri-Thurs)'},
					{value: 'calendar-week-sat', text: 'Calendar Week (Sat-Fri)'},
					{value: 'calendar-week-sun', text: 'Calendar Week (Sun-Sat)'},
					{value: 'calendar-month-1', text: 'Calendar Month'},
					{value: 'calendar-month-12', text: 'Calendar Year'}
					]
				},
				{value: '', text: 'Time Periods', children: [
					{value: 'minutes-period-1', text: '1 minute period'},
					{value: 'minutes-period-2', text: '2 minute period'},
					{value: 'minutes-period-3', text: '3 minute period'},
					{value: 'minutes-period-4', text: '4 minute period'},
					{value: 'minutes-period-5', text: '5 minute period'},
					{value: 'minutes-period-10', text: '10 minute period'},
					{value: 'minutes-period-15', text: '15 minute period'},
					{value: 'minutes-period-20', text: '20 minute period'},
					{value: 'minutes-period-25', text: '25 minute period'},
					{value: 'minutes-period-30', text: '30 minute period'},
					{value: 'minutes-period-35', text: '35 minute period'},
					{value: 'minutes-period-40', text: '40 minute period'},
					{value: 'minutes-period-45', text: '45 minute period'},
					{value: 'minutes-period-50', text: '50 minute period'},
					{value: 'minutes-period-55', text: '55 minute period'},
					{value: 'hours-period-1', text: '1 hour period'},
					{value: 'hours-period-2', text: '2 hour period'},
					{value: 'hours-period-3', text: '3 hour period'},
					{value: 'hours-period-4', text: '4 hour period'},
					{value: 'hours-period-5', text: '5 hour period'},
					{value: 'hours-period-6', text: '6 hour period'},
					{value: 'hours-period-12', text: '12 hour period'},
					{value: 'hours-period-18', text: '18 hour period'},
					{value: 'hours-period-24', text: '24 hour period'},
					{value: 'hours-period-48', text: '2 day period'},
					{value: 'hours-period-72', text: '3 day period'},
					{value: 'hours-period-96', text: '4 day period'},
					{value: 'hours-period-120', text: '5 day period'},
					{value: 'hours-period-144', text: '6 day period'},
					{value: 'hours-period-168', text: '7 day period'},
					{value: 'hours-period-360', text: '15 day period'},
					{value: 'hours-period-720', text: '30 day period'},
					{value: 'hours-period-744', text: '31 day period'},
					{value: 'hours-period-1440', text: '60 day period'},
					{value: 'hours-period-2880', text: '120 day period'},
					{value: 'hours-period-4320', text: '180 day period'},
					{value: 'hours-period-6480', text: '270 day period'},
					{value: 'hours-period-8640', text: '360 day period'},
					{value: 'hours-period-8760', text: '365 day period'}
					]
				}
				
				];
		
	},
	
	setStates: function(){
				
		availableStates = {};
		resetAvailableStates = function(country){
						
				var exists = [];
		
				var filteredStatesReset = _.findWhere(states.results, {shortText: country});
				
			 	for(i in availableStates){
					
					if(availableStates.hasOwnProperty(i)){
					
						if(typeof availableStates[i] != 'undefined' && availableStates[i][0].shortText == country){
							for(x=0;x<availableStates[i].value.length;x++){
							
								if(_.findWhere(filteredStatesReset.children, {id: availableStates[i].value[x]})){
									
									exists.push(availableStates[i].value[x]);
								}
								
							}
						 }
					}
					
				}
								
				
				var statesToAdd = _.filter(filteredStatesReset.children, function(value, key){
										
					return exists.indexOf(value.id) === -1;
					
				})
				for(i in availableStates){
					
					if(availableStates.hasOwnProperty(i)){
					
						if(availableStates[i][0].shortText == country){
							
							for(x=0;x<statesToAdd.length;x++){
															
								if(!_.findWhere(availableStates[i][0].children, {id: statesToAdd[x].id})){
									availableStates[i][0].children.push(statesToAdd[x]);
								}
							}
							
						 }
					 
					}
					
				 }
			
		}

		
		states = {
					more: false,
					results: [
						{ text: "United States", shortText: 'US', children: [
							 {id: "AK", text: "Alaska"},
							 {id: "HI", text: "Hawaii"},
							 {id: "CA", text: "California"},
							 {id: "NV", text: "Nevada"},
							 {id: "OR", text: "Oregon"},
							 {id: "WA", text: "Washington"},
							 {id: "DC", text: "District of Columbia"},
							 {id: "AZ", text: "Arizona"},
							 {id: "CO", text: "Colorado"},
							 {id: "ID", text: "Idaho"},
							 {id: "MT", text: "Montana"},
							 {id: "NE", text: "Nebraska"},
							 {id: "NM", text: "New Mexico"},
							 {id: "ND", text: "North Dakota"},
							 {id: "UT", text: "Utah"},
							 {id: "WY", text: "Wyoming"},
							 {id: "AL", text: "Alabama"},
							 {id: "AR", text: "Arkansas"},
							 {id: "IL", text: "Illinois"},
							 {id: "IA", text: "Iowa"},
							 {id: "KS", text: "Kansas"},
							 {id: "KY", text: "Kentucky"},
							 {id: "LA", text: "Louisiana"},
							 {id: "MN", text: "Minnesota"},
							 {id: "MS", text: "Mississippi"},
							 {id: "MO", text: "Missouri"},
							 {id: "OK", text: "Oklahoma"},
							 {id: "SD", text: "South Dakota"},
							 {id: "TX", text: "Texas"},
							 {id: "TN", text: "Tennessee"},
							 {id: "WI", text: "Wisconsin"},
							 {id: "CT", text: "Connecticut"},
							 {id: "DE", text: "Delaware"},
							 {id: "FL", text: "Florida"},
							 {id: "GA", text: "Georgia"},
							 {id: "IN", text: "Indiana"},
							 {id: "ME", text: "Maine"},
							 {id: "MD", text: "Maryland"},
							 {id: "MA", text: "Massachusetts"},
							 {id: "MI", text: "Michigan"},
							 {id: "NH", text: "New Hampshire"},
							 {id: "NJ", text: "New Jersey"},
							 {id: "NY", text: "New York"},
							 {id: "NC", text: "North Carolina"},
							 {id: "OH", text: "Ohio"},
							 {id: "PA", text: "Pennsylvania"},
							 {id: "RI", text: "Rhode Island"},
							 {id: "SC", text: "South Carolina"},
							 {id: "VT", text: "Vermont"},
							 {id: "VA", text: "Virginia"},
							 {id: "WV", text: "West Virginia"}
						] },
						
						
						{ text: "Canada", shortText: 'CA', children: [
							{ id: "ON", text: "Ontario" },
							{ id: "QC", text: "Quebec" },
							{ id: "NS", text: "Nova Scotia" },
							{ id: "NB", text: "New Brunswick" },
							{ id: "MB", text: "Manitoba" },
							{ id: "BC", text: "British Columbia" },
							{ id: "PE", text: "Prince Edward Island" },
							{ id: "SK", text: "Saskatchewan" },
							{ id: "AB", text: "Alberta" },
							{ id: "NL", text: "Newfoundland and Labrador" },
							{ id: "NT", text: "Northwest Territories" },
							{ id: "YT", text: "Yukon" },
							{ id: "NU", text: "Nunavut" }
							
						] },
						
						{ text: "U.S. Territories", shortText: 'US+', children: [
							{ id: "AS", text: "American Samoa" },
							{ id: "GU", text: "Guam" },
							{ id: "MP", text: "Northern Mariana Islands" },
							{ id: "PR", text: "Puerto Rico" },
							{ id: "VI", text: "U.S. Virgin Islands" }
							
						] },
						
						{ text: "International", shortText: 'INTL', children: [
							{ id: "AF", text: "Afghanistan" },
							{ id: "AX", text: "Åland Islands" },
							{ id: "AL", text: "Albania" },
							{ id: "DZ", text: "Algeria" },
							{ id: "AD", text: "Andorra" },
							{ id: "AO", text: "Angola" },
							{ id: "AI", text: "Anguilla" },
							{ id: "AQ", text: "Antarctica" },
							{ id: "AG", text: "Antigua and Barbuda" },
							{ id: "AR", text: "Argentina" },
							{ id: "AM", text: "Armenia" },
							{ id: "AW", text: "Aruba" },
							{ id: "AU", text: "Australia" },
							{ id: "AT", text: "Austria" },
							{ id: "AZ", text: "Azerbaijan" },
							{ id: "BS", text: "Bahamas" },
							{ id: "BH", text: "Bahrain" },
							{ id: "BD", text: "Bangladesh" },
							{ id: "BB", text: "Barbados" },
							{ id: "BY", text: "Belarus" },
							{ id: "BE", text: "Belgium" },
							{ id: "BZ", text: "Belize" },
							{ id: "BJ", text: "Benin" },
							{ id: "BM", text: "Bermuda" },
							{ id: "BT", text: "Bhutan" },
							{ id: "BO", text: "Bolivia" },
							{ id: "BA", text: "Bosnia and Herzegovina" },
							{ id: "BW", text: "Botswana" },
							{ id: "BV", text: "Bouvet Island" },
							{ id: "BR", text: "Brazil" },
							{ id: "IO", text: "British Indian Ocean Territory" },
							{ id: "BN", text: "Brunei Darussalam" },
							{ id: "BG", text: "Bulgaria" },
							{ id: "BF", text: "Burkina Faso" },
							{ id: "BI", text: "Burundi" },
							{ id: "KH", text: "Cambodia" },
							{ id: "CM", text: "Cameroon" },
							{ id: "CV", text: "Cape Verde" },
							{ id: "KY", text: "Cayman Islands" },
							{ id: "CF", text: "Central African Republic" },
							{ id: "TD", text: "Chad" },
							{ id: "CL", text: "Chile" },
							{ id: "CN", text: "China" },
							{ id: "CX", text: "Christmas Island" },
							{ id: "CC", text: "Cocos (Keeling) Islands" },
							{ id: "CO", text: "Colombia" },
							{ id: "KM", text: "Comoros" },
							{ id: "CG", text: "Congo" },
							{ id: "CD", text: "Congo, The Democratic Republic of The" },
							{ id: "CK", text: "Cook Islands" },
							{ id: "CR", text: "Costa Rica" },
							{ id: "CI", text: "Cote D'ivoire" },
							{ id: "HR", text: "Croatia" },
							{ id: "CU", text: "Cuba" },
							{ id: "CY", text: "Cyprus" },
							{ id: "CZ", text: "Czech Republic" },
							{ id: "DK", text: "Denmark" },
							{ id: "DJ", text: "Djibouti" },
							{ id: "DM", text: "Dominica" },
							{ id: "DO", text: "Dominican Republic" },
							{ id: "EC", text: "Ecuador" },
							{ id: "EG", text: "Egypt" },
							{ id: "SV", text: "El Salvador" },
							{ id: "GQ", text: "Equatorial Guinea" },
							{ id: "ER", text: "Eritrea" },
							{ id: "EE", text: "Estonia" },
							{ id: "ET", text: "Ethiopia" },
							{ id: "FK", text: "Falkland Islands (Malvinas)" },
							{ id: "FO", text: "Faroe Islands" },
							{ id: "FJ", text: "Fiji" },
							{ id: "FI", text: "Finland" },
							{ id: "FR", text: "France" },
							{ id: "GF", text: "French Guiana" },
							{ id: "PF", text: "French Polynesia" },
							{ id: "TF", text: "French Southern Territories" },
							{ id: "GA", text: "Gabon" },
							{ id: "GM", text: "Gambia" },
							{ id: "GE", text: "Georgia" },
							{ id: "DE", text: "Germany" },
							{ id: "GH", text: "Ghana" },
							{ id: "GI", text: "Gibraltar" },
							{ id: "GR", text: "Greece" },
							{ id: "GL", text: "Greenland" },
							{ id: "GD", text: "Grenada" },
							{ id: "GP", text: "Guadeloupe" },
							{ id: "GT", text: "Guatemala" },
							{ id: "GG", text: "Guernsey" },
							{ id: "GN", text: "Guinea" },
							{ id: "GW", text: "Guinea-bissau" },
							{ id: "GY", text: "Guyana" },
							{ id: "HT", text: "Haiti" },
							{ id: "HM", text: "Heard Island and Mcdonald Islands" },
							{ id: "VA", text: "Holy See (Vatican City State)" },
							{ id: "HN", text: "Honduras" },
							{ id: "HK", text: "Hong Kong" },
							{ id: "HU", text: "Hungary" },
							{ id: "IS", text: "Iceland" },
							{ id: "IN", text: "India" },
							{ id: "ID", text: "Indonesia" },
							{ id: "IR", text: "Iran, Islamic Republic of" },
							{ id: "IQ", text: "Iraq" },
							{ id: "IE", text: "Ireland" },
							{ id: "IM", text: "Isle of Man" },
							{ id: "IL", text: "Israel" },
							{ id: "IT", text: "Italy" },
							{ id: "JM", text: "Jamaica" },
							{ id: "JP", text: "Japan" },
							{ id: "JE", text: "Jersey" },
							{ id: "JO", text: "Jordan" },
							{ id: "KZ", text: "Kazakhstan" },
							{ id: "KE", text: "Kenya" },
							{ id: "KI", text: "Kiribati" },
							{ id: "KP", text: "Korea, Democratic People's Republic of" },
							{ id: "KR", text: "Korea, Republic of" },
							{ id: "KW", text: "Kuwait" },
							{ id: "KG", text: "Kyrgyzstan" },
							{ id: "LA", text: "Lao People's Democratic Republic" },
							{ id: "LV", text: "Latvia" },
							{ id: "LB", text: "Lebanon" },
							{ id: "LS", text: "Lesotho" },
							{ id: "LR", text: "Liberia" },
							{ id: "LY", text: "Libyan Arab Jamahiriya" },
							{ id: "LI", text: "Liechtenstein" },
							{ id: "LT", text: "Lithuania" },
							{ id: "LU", text: "Luxembourg" },
							{ id: "MO", text: "Macao" },
							{ id: "MK", text: "Macedonia, The Former Yugoslav Republic of" },
							{ id: "MG", text: "Madagascar" },
							{ id: "MW", text: "Malawi" },
							{ id: "MY", text: "Malaysia" },
							{ id: "MV", text: "Maldives" },
							{ id: "ML", text: "Mali" },
							{ id: "MT", text: "Malta" },
							{ id: "MH", text: "Marshall Islands" },
							{ id: "MQ", text: "Martinique" },
							{ id: "MR", text: "Mauritania" },
							{ id: "MU", text: "Mauritius" },
							{ id: "YT", text: "Mayotte" },
							{ id: "MX", text: "Mexico" },
							{ id: "FM", text: "Micronesia, Federated States of" },
							{ id: "MD", text: "Moldova, Republic of" },
							{ id: "MC", text: "Monaco" },
							{ id: "MN", text: "Mongolia" },
							{ id: "ME", text: "Montenegro" },
							{ id: "MS", text: "Montserrat" },
							{ id: "MA", text: "Morocco" },
							{ id: "MZ", text: "Mozambique" },
							{ id: "MM", text: "Myanmar" },
							{ id: "NA", text: "Namibia" },
							{ id: "NR", text: "Nauru" },
							{ id: "NP", text: "Nepal" },
							{ id: "NL", text: "Netherlands" },
							{ id: "AN", text: "Netherlands Antilles" },
							{ id: "NC", text: "New Caledonia" },
							{ id: "NZ", text: "New Zealand" },
							{ id: "NI", text: "Nicaragua" },
							{ id: "NE", text: "Niger" },
							{ id: "NG", text: "Nigeria" },
							{ id: "NU", text: "Niue" },
							{ id: "NF", text: "Norfolk Island" },
							{ id: "NO", text: "Norway" },
							{ id: "OM", text: "Oman" },
							{ id: "PK", text: "Pakistan" },
							{ id: "PW", text: "Palau" },
							{ id: "PS", text: "Palestinian Territory, Occupied" },
							{ id: "PA", text: "Panama" },
							{ id: "PG", text: "Papua New Guinea" },
							{ id: "PY", text: "Paraguay" },
							{ id: "PE", text: "Peru" },
							{ id: "PH", text: "Philippines" },
							{ id: "PN", text: "Pitcairn" },
							{ id: "PL", text: "Poland" },
							{ id: "PT", text: "Portugal" },
							{ id: "QA", text: "Qatar" },
							{ id: "RE", text: "Reunion" },
							{ id: "RO", text: "Romania" },
							{ id: "RU", text: "Russian Federation" },
							{ id: "RW", text: "Rwanda" },
							{ id: "SH", text: "Saint Helena" },
							{ id: "KN", text: "Saint Kitts and Nevis" },
							{ id: "LC", text: "Saint Lucia" },
							{ id: "PM", text: "Saint Pierre and Miquelon" },
							{ id: "VC", text: "Saint Vincent and The Grenadines" },
							{ id: "WS", text: "Samoa" },
							{ id: "SM", text: "San Marino" },
							{ id: "ST", text: "Sao Tome and Principe" },
							{ id: "SA", text: "Saudi Arabia" },
							{ id: "SN", text: "Senegal" },
							{ id: "RS", text: "Serbia" },
							{ id: "SC", text: "Seychelles" },
							{ id: "SL", text: "Sierra Leone" },
							{ id: "SG", text: "Singapore" },
							{ id: "SK", text: "Slovakia" },
							{ id: "SI", text: "Slovenia" },
							{ id: "SB", text: "Solomon Islands" },
							{ id: "SO", text: "Somalia" },
							{ id: "ZA", text: "South Africa" },
							{ id: "GS", text: "South Georgia and The South Sandwich Islands" },
							{ id: "ES", text: "Spain" },
							{ id: "LK", text: "Sri Lanka" },
							{ id: "SD", text: "Sudan" },
							{ id: "SR", text: "Suriname" },
							{ id: "SJ", text: "Svalbard and Jan Mayen" },
							{ id: "SZ", text: "Swaziland" },
							{ id: "SE", text: "Sweden" },
							{ id: "CH", text: "Switzerland" },
							{ id: "SY", text: "Syrian Arab Republic" },
							{ id: "TW", text: "Taiwan, Province of China" },
							{ id: "TJ", text: "Tajikistan" },
							{ id: "TZ", text: "Tanzania, United Republic of" },
							{ id: "TH", text: "Thailand" },
							{ id: "TL", text: "Timor-leste" },
							{ id: "TG", text: "Togo" },
							{ id: "TK", text: "Tokelau" },
							{ id: "TO", text: "Tonga" },
							{ id: "TT", text: "Trinidad and Tobago" },
							{ id: "TN", text: "Tunisia" },
							{ id: "TR", text: "Turkey" },
							{ id: "TM", text: "Turkmenistan" },
							{ id: "TC", text: "Turks and Caicos Islands" },
							{ id: "TV", text: "Tuvalu" },
							{ id: "UG", text: "Uganda" },
							{ id: "UA", text: "Ukraine" },
							{ id: "AE", text: "United Arab Emirates" },
							{ id: "GB", text: "United Kingdom" },
							{ id: "UY", text: "Uruguay" },
							{ id: "UZ", text: "Uzbekistan" },
							{ id: "VU", text: "Vanuatu" },
							{ id: "VE", text: "Venezuela" },
							{ id: "VN", text: "Viet Nam" },
							{ id: "VG", text: "Virgin Islands, British" },
							{ id: "WF", text: "Wallis and Futuna" },
							{ id: "EH", text: "Western Sahara" },
							{ id: "YE", text: "Yemen" },
							{ id: "ZM", text: "Zambia" },
							{ id: "ZW", text: "Zimbabwe" }
							
						] }
					]
				};
		
		_.each(states.results, function(value, key){
			
			setTimeout($.proxy(function(){resetAvailableStates(value.shortText)},value), 10);
		
		})
	},
	
	addEntryPeriod: function(event){
		
		event.preventDefault();
					
		$('.submissionPeriods').append(new PromoDashboardComponentRegFormEntryPeriodItemView({model: this.model, collection: this.collection, entryperiod: {el: {'start': '', 'end': ''}, key: ''}}).el);
		
		this.updateEntryLimitPeriods();
		
		setTimeout(function(){
			
			if($(".editable-container").length > 0){
			
				$(".editable-container").scrollintoview();
				
			}
			
		},0);
		
		
	},
	
	addEntryLimit: function(event){
		
		event.preventDefault();
					
		$('.entryLimits').append(new PromoDashboardComponentRegFormEntryLimitItemView({model: this.model, collection: this.collection, entrylimit: {el: {'limit-number': '', 'limit-type': '', 'limit-period': ''}, key: ''}}).el);
		
		
		setTimeout(function(){
			
			if($(".editable-container").length > 0){
			
				$(".editable-container").scrollintoview();
				
			}
			
		},0);
		
	},
	
	addEligibility: function(event){
		
		event.preventDefault();
					
		$('.eligibilityBox').append(new PromoDashboardComponentRegFormEligibilityItemView({model: this.model, collection: this.collection, eligibility: {el: {'country': '', 'state': ''}, key: ''}}).el);
		
		setTimeout(function(){
			
			if($(".editable-container").length > 0){
			
				$(".editable-container").scrollintoview();
				
			}
			
		},0);
		
	},
	
	setEntryPeriodEndDates: function(){
		
		$(".end-date", this.el).each(function(){
			
			if($(this).parents('tr').next().length > 0){
				
				var endDateObj = $(this).parents('tr').nextAll().filter(function(){
					
					return $(this).find('.start-date').data('value') || $(this).find('.end-date').data('value');
					
				}).eq(0);
				
				var endDate = endDateObj.find('.start-date').data('value') || endDateObj.find('.end-date').data('value');
				
				if(endDate >= $(this).data('value') || !$(this).data('value')){
					$(this).editable('option', 'datetimepicker', {endDate:endDate});
				}
				
			}else{
				
				var siblingStartDate = $(this).parents('tr').find('.start-date').data('value');
				
				if(siblingStartDate){
					
					var startDate = siblingStartDate;
					
				}else{
								
					var startDateObj = $(this).parents('tr').prevAll().filter(function(){
						
						return $(this).find('.end-date').data('value') || $(this).find('.start-date').data('value');
						
					}).eq(0);
					
					var startDate = startDateObj.find('.end-date').data('value') || startDateObj.find('.start-date').data('value');
				
				}
				
				$(this).editable('option', 'datetimepicker', {startDate:startDate});
				
			}
			
		})
		
	},
	
	setEntryPeriodStartDates: function(){
		
		$(".start-date", this.el).each(function(){
					
			if($(this).parents('tr').prev().length > 0){
				
				var startDateObj = $(this).parents('tr').prevAll().filter(function(){
					
					return $(this).find('.end-date').data('value') || $(this).find('.start-date').data('value');
					
				}).eq(0);
				
				var startDate = startDateObj.find('.end-date').data('value') || startDateObj.find('.start-date').data('value');
				
				if(startDate <= $(this).data('value') || !$(this).data('value')){
					
					$(this).editable('option', 'datetimepicker', {startDate:startDate});
				}
				
			}	
			
			
		})
		
	},
	
	populateEligibility: function(){
		var el = this.$el;	
		var eligibility = this.collection.pluck('eligibility')[0];
		
		eligibility = _(eligibility).sortBy(function(eligibilityEl, key) {
			eligibility[key].key = key;
			
			return (function(){
				
				switch(eligibilityEl.country){
				
					case 'US':
						return 1;
					break;
					case 'US+':
						return 2;
					break;
					case 'CA':
						return 3;
					break;
					case 'INTL':
						return 4;
					break;
					default:
						return 5;
					break;
					
				}
				
			})(eligibilityEl);
			
		});
		
		_.each(eligibility, $.proxy(function(eligibilityEl, key){
											
			 $('.eligibilityBox', el).append(new PromoDashboardComponentRegFormEligibilityItemView({model: this.model, collection: this.collection, eligibility: {el: eligibilityEl, key: eligibilityEl.key}}).el);
			
		}),this);
		
	},
	
	populateEntryPeriods: function(){
		
		var el = this.$el;	
				
		var entryPeriod = this.collection.pluck('entryPeriod')[0];
		
		entryPeriod = _(entryPeriod).sortBy(function(entryPeriodEl, key) {
			
			entryPeriod[key].key = key;
			return entryPeriodEl.start || entryPeriodEl.end || '2099-12-31 23:59:59';
		});
		
				
		_.each(entryPeriod, $.proxy(function(entryPeriodEl, key){
						
			
			 $('.submissionPeriods', el).append(new PromoDashboardComponentRegFormEntryPeriodItemView({model: this.model, collection: this.collection, entryperiod: {el: entryPeriodEl, key: entryPeriodEl.key, index: key}}).el);
			
		}), this);
		
		
		this.setEntryPeriodEndDates();
		this.setEntryPeriodStartDates();
		setTimeout($.proxy(function(){this.updateEntryLimitPeriods();}, this), 0);
		
	},
	
	updateEntryLimitPeriods: function(){
		
		var el = this.$el;	
		
		_.each(EntryLimitPeriods[0].children, function(obj, key){ 
		
			if(obj.value.indexOf('entry-period') !== -1){
			
				delete EntryLimitPeriods[0].children[key];
			 
			}
			
		})
		
		EntryLimitPeriods[0].children = _(EntryLimitPeriods[0].children).filter(function(obj){
			
			return typeof obj != 'undefined';
			
		})
		
		for(i=$(".submissionPeriods .dataCache", el).length-1; i>=0; i--){
					
			EntryLimitPeriods[0].children.unshift({value: 'entry-period-'+(i+1), text: 'Entry Period #'+(i+1)});
				
			if(i == 0){
			
				EntryLimitPeriods[0].children.unshift({value: 'entry-period', text: 'Entry Period'});

			}
					
		 }
		 
		 $(".entryLimitPeriod").each(function(){
			 
			if($(this).data('value').indexOf('entry-period') !== -1){
			
				if(!_.findWhere(EntryLimitPeriods[0].children, {value: $(this).data('value')})){
				
					$(this).editable('option','value', '').data('value','').text('Empty').addClass('editable-empty');;	
					
				}
				 
			}
			 
			 
		})
		 
		 
		
	},
	
	populateEntryLimit: function(){
		
		var el = this.$el;	
				
		var entryLimit = this.collection.pluck('entryLimit')[0];
		
		entryLimit = _(entryLimit).sortBy(function(entryLimitEl, key) {
			
			entryLimit[key].key = key;
			return entryLimitEl['limit-number'] || entryLimitEl['limit-type'] || '0';
		});
		
		_.each(entryLimit, $.proxy(function(entryLimitEl, key){
						
			 $('.entryLimits', el).append(new PromoDashboardComponentRegFormEntryLimitItemView({model: this.model, collection: this.collection, entrylimit: {el: entryLimitEl, key: entryLimitEl.key}}).el);
			
		}), this);
		
		
		setTimeout(function(){
			if($('.entryLimits .dataCache').length > 0){
				$(".entryLimitsTableHeader").show();
			}else{
				$(".entryLimitsTableHeader").hide();
			}
		},0);
	
		
	},
	
	
	
	initHelpers: function(){
		var el = this.$el;	
		
	
		
		$('.eligibilityHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.eligibilityBox .box-header'
			
			
		});
		
		$('.referralEntryLimitHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.referralEntryLimitBox'
			
			
		});
		
		$('.entryLimitEntityHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.entryLimitEntityTd'
			
			
		});
		
		$('.entryLimitPeriodHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.entryLimitPeriodTd'
			
			
		});
		
		$('.referralEntryLimitEntityHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.referralEntryLimitEntityTd'
			
			
		});
		
		$('.referralEntryLimitPeriodHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.referralEntryLimitPeriodTd'
			
			
		});
		
		
		
		
		
	},
	
	
	
	
    render: function () {
						
        $(this.el).html(this.template());
		var el = this.$el;	
		
		this.setStates();
		this.populateEligibility();
		this.populateEntryPeriods();
		
				
		this.initHelpers();
		this.setEntryLimitPeriods();
		this.populateEntryLimit();
		this.populateReferralEntryLimit();
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		 					 		
        return this;
    }
	
});


window.PromoDashboardComponentRegFormEntryLimitItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
	
	tagName : 'tr',
	
	events: {
		
		'click .removeEntryLimit' : function(event){
			
			event.preventDefault();
			
			$("#deleteEntryLimitModal")
			.data('id', $(event.target).parents('tr').find('.dataCache').data('id'))
			.modal('show');
			
		}
		
	},
	
	 render: function () {
		 
		 
		var model = this.model;
		var collection = this.collection;
		var addNewFlag = false;
		
		if(!this.options.entrylimit.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/reg-form/entrylimit', {pid: window['pid']}, function(response){
				newKey = response.entryLimitId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.entrylimit.key = newKey;
		}
		
		$(this.el).html(this.template({el: this.options.entrylimit.el, key: this.options.entrylimit.key}));
		
		$('.entryLimitNumber', this.el).editable({
			showbuttons: true,
			url: '/dashboard/reg-form/entrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-number';
				params.entryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			validate: function(newValue) {
								
				if(!/^[0-9]+$/.test(newValue) && newValue != 'custom'){
					
					return 'Please only enter numbers';	
					
				}else if(newValue == 'custom' && $(this).siblings('.popover').find('input.input-sm').length == 0){
					
					$(this).siblings('.popover').find('.popover-content').find('select').hide().after('<input type="text" class="form-control input-sm" style="width: 70px;" maxlength="10" />');
								
					$(this).siblings('.popover').find('.input-sm').on("keyup", function(){
						
						if(/^[0-9]+$/.test($(this).val())){
							$(this).siblings('select').find('option:last').prop('value', $(this).val());
						}else{
							return 'Please only enter numbers';	
						}
						
					}).focus();
					
					setTimeout($.proxy(function(){$(this).siblings('.popover').find('form').find(".has-error").removeClass('has-error');}, this),0);

									
					return 'Please enter a number';
					
				} else if(newValue == 'custom'){
							return 'Please only enter numbers';	
					
				}

			},
			display: function(value){
				
				if(value){
					var valueObj = _.findWhere($(this).data('source'), {value: parseInt(value)});
					if(valueObj){
					
						$(this).text(valueObj.text);
						
					}else{
						$(this).text(value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
					}
				}	
				
			},
			source: function(){
			
				var choices = [
				];	
				
				for(i=1;i<=10;i++){
					
					choices.push({value: i, text: i});
				}
				
				choices.push({value: 'custom', text: 'Custom'});
				
				$(this).data('source', choices);
				
				setTimeout($.proxy(function(){
					$(this).siblings('.popover').find('select').on("change", function(){
					
						if($(this).val() == 'custom'){
						
							$(this).parents('form').submit();	
						
						}
						
					});
				},this),0);
				
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
					
			}
		});
		
		$('.entryLimitType', this.el).editable({
			showbuttons: false,
			url: '/dashboard/reg-form/entrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-type';
				params.entryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			display: function(value){
				
				if(value){
					var valueObj = _.findWhere($(this).data('source'), {value: value});
					if(valueObj){
					
						$(this).text(valueObj.text);
						
					}
				}
				
			},
			validate: function(newValue) {
				
				var entryPeriodCombinations = [];
				$(".entryLimits tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.entryLimitType = $(this).find('.entryLimitType').data('value');
					obj.entryLimitPeriod = $(this).find('.entryLimitPeriod').data('value');
					if(obj.entryLimitType != '' && obj.entryLimitPeriod != '')entryPeriodCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.entryLimitType = newValue;
				thisObj.entryLimitPeriod = $(this).parents('tr').find('.entryLimitPeriod').data('value');
								
				if(_.findWhere(entryPeriodCombinations, thisObj)){
					return 'This combination has already been defined.';
				}
			},
			source: function(){
			
				var choices = [
					{value: 'per-person', text: 'Per Person'},
					{value: 'per-household', text: 'Per Household'},
					{value: 'total-entries', text: 'Total Entries'}
				];	
				
				$(this).data('source', choices);
			
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
				
				if(!$(this).parents('tr').find('.entryLimitPeriod').data('value')){
				
					$(this).parents('tr').find('.entryLimitPeriod').editable('toggle');
					
				}
					
			}
		});
		
		$('.entryLimitPeriod', this.el).editable({
			showbuttons: false,
			url: '/dashboard/reg-form/entrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-period';
				params.timezone = $(this).siblings('.popover').find('.popover-content').find(".editable-timezone").val();
				params.entryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			validate: function(newValue) {
				
				var entryPeriodCombinations = [];
				$(".entryLimits tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.entryLimitType = $(this).find('.entryLimitType').data('value');
					obj.entryLimitPeriod = $(this).find('.entryLimitPeriod').data('value');
					if(obj.entryLimitType != null && obj.entryLimitPeriod != null)entryPeriodCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.entryLimitType = $(this).parents('tr').find('.entryLimitType').data('value');
				thisObj.entryLimitPeriod = newValue;
					
				if(newValue.indexOf('calendar') === -1){
					$(this).siblings('.popover').find('.popover-content').find('select.editable-timezone').parent().remove();
				}
								
				if(_.findWhere(entryPeriodCombinations, thisObj)){
					return 'This combination has already been defined.';
				}
				
				if(newValue.indexOf('calendar') !== -1){
					
					var selectEl = $(this).siblings('.popover').find('.popover-content').find('select.editable-timezone');
					
					if(selectEl.length == 0){
						$(this).siblings('.popover').find('.popover-content').find('select').after('<div style="margin-top:5px;">Time Zone: <select class="editable-timezone form-control" style="width:auto; height: auto;"><option value=""></option><option value="ET">Eastern Time</option><option value="CT">Central Time</option><option value="MT">Mountain Time</option><option value="PT">Pacific Time</option></select></div>');
									
						$(this).siblings('.popover').find('.editable-timezone').on("change", function(){
						
							$(this).parents('form').submit();	
							
						});
					}
					

					
					if(!$(".editable-timezone").val()){
						
						setTimeout($.proxy(function(){
							$(this).siblings('.popover').find('form').find('select.editable-timezone').focus();
							$(this).siblings('.popover').find('form').find(".has-error").removeClass('has-error');}, this),0);

						return ' ';
					}
				}
				
			},
			display: function(value){
				
				if(value){
					setTimeout($.proxy(function(){
						var valueObj;
						var valueToFind = value;
						
						_.each(_.pluck(EntryLimitPeriods, 'children'), function(array, key){
														
							var foundValue = _.findWhere(array, {value: valueToFind});
							
							if(!valueObj && foundValue)valueObj = foundValue;
							
						});
														
						if(valueObj){
						
							if($(this).data('timezone')){
								$(this).text(valueObj.text + ' ('+$(this).data('timezone')+')');
							}else{
								$(this).text(valueObj.text);
								
								}
							
						}else{
							
							$(this).text('Empty').addClass('editable-empty');
							
							}
					}, this, value), 0);
				}else{
				
					return;	
					
				}
			},
			source: function(){
				
				var choices = EntryLimitPeriods;
				
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
				
				if(response.timezone){
					$(this).data('timezone', response.timezone);
				}else{
					$(this).data('timezone', '');
					}
				
				if(!$(this).parents('tr').find('.entryLimitType').data('value')){
				
					$(this).parents('tr').find('.entryLimitType').editable('toggle');
					
				}
					
					
			},
			
		});
		 
		$(".entryLimitsTableHeader").show();	
		
		if(addNewFlag){
			
			setTimeout(function(){
			
				$('.entryLimitType:last').editable('toggle');
				
			},0); 
			
		}
				 					 		
        return this;
    }
});


window.PromoDashboardComponentRegFormEntryPeriodItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
	
	tagName : 'tr',
	
	events: {
		
		'click .removeEntryPeriod' : function(event){
			
			event.preventDefault();
			
			$("#deleteEntryPeriodModal")
			.data('id', $(event.target).parents('tr').find('.dataCache').data('id'))
			.modal('show');
			
		}
		
	},
	
	 render: function () {
		 
		 
		var model = this.model;
		var collection = this.collection;
		var addNewFlag = false;
		
		if(!this.options.entryperiod.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/reg-form/entryperiod', {pid: window['pid']}, function(response){
				newKey = response.entryPeriodId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.entryperiod.key = newKey;
		}
		
		$(this.el).html(this.template({el: this.options.entryperiod.el, key: this.options.entryperiod.key, index: this.options.entryperiod.index}));
		 			 
		var datetimeOptions = {
			
			url: '/dashboard/reg-form/entryperiod',
			params: function(params) {
				params.pid = window['pid'];
				params.update = ($(this).hasClass('start-date')) ? 'start' : ($(this).hasClass('end-date')) ? 'end' : '';
				params.entryPeriodId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
		
			format: 'yyyy-mm-dd hh:ii:ss',  
			viewformat: 'MM dd, yyyy H:iiP ET', 
								clearBtn: false,
   
			datetimepicker: {
					startDate: -Infinity,
					endDate: Infinity,
					clearBtn: false,
					forceParse: false,
					weekStart: 1,
					todayBtn: false,
					todayHighlight: false
			},
			success: function(response, newValue){
									
					$(this).data('value', response.newValue);	
					
					$(this).parents('tr').nextAll().find(".start-date, .end-date").filter(function(){
						
						$(this).editable('getOption', 'datetimepicker');
						var startDate = window['getOption'].startDate;
						
						return (startDate == null || startDate == -Infinity  || startDate == Infinity || startDate < response.newValue);
						
					}).editable('option', 'datetimepicker', {startDate:$(this).data('value')});
					
					$(this).parents('tr').prevAll().find(".start-date, .end-date").filter(function(){
						
						$(this).editable('getOption', 'datetimepicker');
						var endDate = window['getOption'].endDate;
						
						return (endDate == null || endDate == Infinity  ||  endDate == -Infinity || endDate > response.newValue) && !(($(this).hasClass('start-date')) ? $(this).parents('tr').find('.end-date').data('value') : '');
						
					}).editable('option', 'datetimepicker', {endDate:$(this).data('value')});
					
					if(response.update == 'start'){
					
						$(this).parents('tr').find('.end-date').editable('option', 'datetimepicker', {startDate:$(this).data('value')});
											
											
						if(!$(this).parents('tr').find('.end-date').data('value')){
													
							$(this).parents('tr').find('.end-date').editable('toggle');
							
						}
					}else{
						
						$(this).parents('tr').find('.start-date').editable('option', 'datetimepicker', {endDate:$(this).data('value')});
					}
				}
		};

		if(addNewFlag || !this.options.entryperiod.el.start){
						
			var allStartEndDates = [];		
			
			$(".end-date, .start-date").each(function(){
			
				if($(this).data('value'))allStartEndDates.push($(this).data('value'));
				
			});
					
			var minStart = _.max(allStartEndDates, function(allStartEndDatesEl){ 
			
				return $.fn.datetimepicker.DPGlobal.parseDate(allStartEndDatesEl, 'yyyy-mm-dd hh:ii:ss', 'en', 'standard');
			
			 });
			 
			datetimeOptions.datetimepicker.startDate = minStart;
			
		}
		
		datetimeOptions.datetimepicker.endDate = this.options.entryperiod.el.end || datetimeOptions.datetimepicker.endDate;
		$('.start-date', this.el).editable(datetimeOptions);
		
		datetimeOptions.datetimepicker.endDate = Infinity;
		
		if(addNewFlag){
			
			if(typeof minStart !='undefined' && minStart != -Infinity){
		
				datetimeOptions.datetimepicker.startDate = minStart;
				
			}
			
		}
		
				
		datetimeOptions.datetimepicker.startDate = this.options.entryperiod.el.start || datetimeOptions.datetimepicker.startDate;
				
		if(!this.options.entryperiod.el.start){
									
			setTimeout($.proxy(function(){ 
			
				var newValue = $('.end-date', this.el).parents('tr').prevAll().find('.end-date, .start-date').filter(function(){
				
					return !!$(this).data('value');
					
				}).last().data('value');
				
				if(newValue)$('.end-date', this.el).editable('option', 'datetimepicker', {startDate: newValue});
					
			}, this), 0);
			
		}
		
		
		
		
		
		
		$('.end-date', this.el).editable(datetimeOptions);	
			
		if(addNewFlag){
			setTimeout(function(){
			
				$('.start-date:last').editable('toggle');
				
			},0); 
			
		}
					 					 		
        return this;
    }
});

window.PromoDashboardComponentRegFormEligibilityItemView =  Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
	
	events: {
		
		'click .removeEligibility' : function(event){
			$("#deleteEligibilityModal")
			.data('id', $(event.target).parents('.eligibilityItem').data('id'))
			.modal('show');
		}
		
	},
	
	
	
	
	 render: function () {
		
		var model = this.model;
		
		var collection = this.collection;
		
		var countries = [];
		
		$.each({"US": "United States", "CA": "Canada", "US+": "U.S. Territories", "INTL": "International"}, function(k, v) {
			countries.push({id: k, text: v});
		});
					
						
		if(!this.options.eligibility.el.country || !this.options.eligibility.el.state){
		
			for(x=0;x<states.results.length;x++){
				
				var value = states.results[x];
				var totalItemsInState = value.children.length;
				var usedLength = 0;
				
				for(i in availableStates){
					
					if(availableStates.hasOwnProperty(i)){
			
						if(typeof availableStates[i] != 'undefined' && availableStates[i][0].shortText == value.shortText && typeof availableStates[i].value != 'undefined'){
							
							usedLength += availableStates[i].value.length;
							
						 }
					}
					
				}	
				
				if(usedLength < totalItemsInState && !this.options.eligibility.el.country){
					this.options.eligibility.el.country = value.shortText;
					
				}
				
			}
			
		}
				
        $(this.el).html(this.template({el: this.options.eligibility.el, key: this.options.eligibility.key, countries: countries}));
				
		$('.country', this.el).editable({
			source: countries,
			type: 'select2',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.country = params.value;
				params.eligibilityId = $(this).parents('.eligibilityItem').data('id');
				return params;
			},
			name: 'country',
			pk: 1,
			url: '/dashboard/reg-form/eligibility/country',
			success: function(response, newValue) {
				
				if(response.error) return response.error;
				if(!response.pid) return 'Bad Request';
				if(!response.eligibilityId) return 'Bad Request';
									
				$(this).parents('.eligibilityItem').data('id', response.eligibilityId);
				
				var originalCountry = $(this).data('value');
				$(this).data('value', response.country);
				
				
				var allStatesInCountry = _.pluck(_.findWhere(states.results, {shortText: response.country}).children, 'id');
				var allStatesInCountryOriginalLength = allStatesInCountry.length;
				
				var usedStates = availableStates;
				
				for(i in usedStates){
					
					if(availableStates.hasOwnProperty(i)){
					
						_.each(usedStates[i].value, function(value, key){
						
							if(allStatesInCountry.indexOf(value) !== -1){
								
								allStatesInCountry.splice(allStatesInCountry.indexOf(value), 1);
								
							}
							
						})
						
					}
					
				}
				
				var unitTerm = function(country){
				
					switch(response.country){
					
						case 'US':
							return 'States';
						break;
						
						case 'US+':
							return 'Territories';
						break;
						case 'CA':
							return 'Provinces';
						break;
						case 'INTL':
							return 'Countries';
						break;
					
					}
						
					
				}
				
				var stateTerm = unitTerm(response.country);
				
				var innerText = (allStatesInCountry.length == allStatesInCountryOriginalLength) ? 'Everywhere' : allStatesInCountry.length+ ' '+stateTerm ;
				innerText = (allStatesInCountry.length == 1) ? allStatesInCountry[0] : innerText;
				
				
				if(response.country != 'INTL'){
					$(this).parents('.eligibilityItem').find('.state').editable('setValue', allStatesInCountry.join(',')).text(innerText);
				}else{
					$(this).parents('.eligibilityItem').find('.state').editable('setValue', '');
				}
				
				availableStates[index][0].text = _.findWhere(states.results, {shortText: response.country}).text;
				availableStates[index][0].shortText = response.country;
				availableStates[index].value = allStatesInCountry;
				availableStates[index].key = response.eligibilityId;
				availableStates[index][0].children = _.filter(_.findWhere(states.results, {shortText: response.country}).children, function(value, key){
					
					return allStatesInCountry.indexOf(value.id) !== -1;
					
				})
					
				var newValue = allStatesInCountry;
																				
				for(x in availableStates){
					
					if(availableStates.hasOwnProperty(x)){

						if(availableStates[x]['key'] != response.eligibilityId){
															
							for(i=0; i< availableStates[x][0].children.length; i++){
								
								if(newValue.indexOf(availableStates[x][0].children[i].id) !== -1){
									
									availableStates[x][0].children.splice(i,1);
									
								}
								
							}
														
						 }
						 
					}
					
				  }
				  
				if(originalCountry)resetAvailableStates(originalCountry);
				
				$(this).parents('.eligibilityItem').find('.state').editable('toggle');
				if(response.country != 'INTL')$(".editableform").submit();
				
  		  	}
			
		});
		

				
		var filteredStates = _.findWhere(states.results, {shortText: this.options.eligibility.el.country});
		
		var index = 0;
		for (key in availableStates) {
			index = Math.max(key, index)+1;
		}
	
		if(!filteredStates){
			$("#gritter-notice-wrapper").remove();	
			setTimeout(function(){$('.eligibilityItem:last').remove();	},0);									
			return Growl.error({
				title: 'No country left to add!',
				text: 'Please remove some states and try again.'
			});	
		} 
		
		availableStates[index] = [];
		availableStates[index]['key'] = this.options.eligibility.key;
		availableStates[index][0] = {};
		availableStates[index][0].children = [];
		
		availableStates[index][0].shortText = filteredStates.shortText;
		availableStates[index][0].text = filteredStates.text;	
		
		var exists = [];
		
		var filteredStatesReset = _.findWhere(states.results, {shortText: filteredStates.shortText});
		
		for(i in availableStates){
			
			if(availableStates.hasOwnProperty(i)){
			
				if(typeof availableStates[i] != 'undefined' && availableStates[i][0].shortText == filteredStates.shortText && typeof availableStates[i].value != 'undefined'){
					for(x=0;x<availableStates[i].value.length;x++){
					
						if(_.findWhere(filteredStatesReset.children, {id: availableStates[i].value[x]})){
							
							exists.push(availableStates[i].value[x]);
						}
						
					}
				 }
			}
				
		}	
		
		if(typeof this.options.eligibility.el.state != 'undefined'){
			
			if(this.options.eligibility.el.state == '*'){
												
				var stateVal = _.pluck(filteredStates.children, 'id').join(',');
				var selected = selected = availableStates[index].value = _.pluck(filteredStates.children, 'id');
				
				
			}else if (this.options.eligibility.el.state == ''){
				
				var selected = [];
				var stateVal = [];
				var countryVal = this.options.eligibility.el.country;
								
				
				_.each(filteredStates.children, function(value, key){
						
					if(exists.indexOf(value.id) === -1){
						selected.push(value.id);
						stateVal.push(value.id);
					}
					
				})
								
				stateVal = stateVal.join(',');
				
				availableStates[index].value = selected;
				
				if(countryVal == 'INTL') stateVal = [];
								
				
			}else{
								
				var stateVal = this.options.eligibility.el.state;
				var selected = availableStates[index].value = this.options.eligibility.el.state.split(',');
				
			}
			
		}
		
		if(typeof this.options.eligibility.el.state == 'undefined'){
			var stateVal = [];
			var selected = [];
			availableStates[index].value = [];
		}
				
		_.each(filteredStates.children, function(value, key){
						
			if(selected.indexOf(value.id) !== -1 && exists.indexOf(value.id) === -1)
				availableStates[index][0].children.push(value);
			
		})
					
						
		$('.state', this.el).editable({
			pk: 1,
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.country = params.value;
				params.eligibilityId = $(this).parents('.eligibilityItem').data('id');
				params.country = $(this).parents('.eligibilityItem').find('.country').data('value');
				return params;
			},
			value: stateVal,
			savenochange: true,
			display: function(value) {
			  			  
			  if(typeof value == 'undefined')value = [];	
			  if(typeof availableStates[index][0] == 'undefined')return;		
			  $(this).siblings('.popover').css("opacity","1");
			  if(typeof value != 'object')value = value.split(',');
			  if(value == null)value = [];
			  
			  if(value.length == 0){
				
				var item = $(this);
				setTimeout(function(){item.addClass('editable-empty')},0);  
			  }
			  
						  
			  if(value.length == _.findWhere(states.results, {shortText: availableStates[index][0].shortText}).children.length){
				  $(this).text('Everywhere');
			  }else if(value.length == 1){
				  
				  $(this).text(value[0]);
				  
			  }else{
					if($(this).parents('.eligibilityItem').find('.country').data('value') == 'CA'){
						$(this).text(value.length+' Provinces');
					}else if($(this).parents('.eligibilityItem').find('.country').data('value') == 'US+'){
						$(this).text(value.length+' Territories');
					}else if($(this).parents('.eligibilityItem').find('.country').data('value') == 'US'){
						if(value.indexOf('DC') !== -1){
							$(this).text(value.length-1+' States and D.C.');
						}else{
							$(this).text(value.length+' States');
						}
					}else if($(this).parents('.eligibilityItem').find('.country').data('value') == 'INTL'){
						$(this).text(value.length+' Countries');
					}
				}
			} ,
			defaultvalue: stateVal,
			url: '/dashboard/reg-form/eligibility/state',
			type: 'select2',
			select2: {
				placeholder: "State/Province",
				//width: 'copy',
				containerCss: {'min-width':'800px'},
				multiple: true,
				dropdownAutoWidth: true,
				data: function() {  
				
					
					setTimeout(function(){
										
						if($(".select2-choices")[0].scrollHeight > parseInt($(".select2-choices").css("max-height"))){
							$(".select2-choices").css("overflow-y","auto");
							
						}  
						  
				 	},0);

					return {results: availableStates[index]};
				}
			},
			success: function(response, newValue) {
				if(response.error) return response.error;
				var elem = $(this);
				
				$(this).data('value', newValue);
				$(this).parents('.eligibilityItem').data('id', response.eligibilityId);
				
				availableStates[index].value = newValue;
				availableStates[index].key = response.eligibilityId;
				
				for(x in availableStates){
					
					if(availableStates.hasOwnProperty(x)){
	
						if(availableStates[x]['key'] != response.eligibilityId){
															
							for(i=0; i< availableStates[x][0].children.length; i++){
								
								if(newValue.indexOf(availableStates[x][0].children[i].id) !== -1){
									
									availableStates[x][0].children.splice(i,1);
									
								}
								
							}
														
						 }
					}
					
				  }
				  
				  				
				  resetAvailableStates($(this).parents('.eligibilityItem').find('.country').data('value'));
				  
				  setTimeout(function(){elem.trigger('click');},160);
			}
		
		});
		
		if(this.options.eligibility.el.state == ''){
						
			setTimeout(function(){
				
				$('.state:last').editable('toggle');
				$(".editableform").submit();

			},0);
		}
		
	
		$(".ageSlider.ranged-slider-ui.normal", this.el).slider({
			
			  range: true,
			  min: 0,
			  max: 100,
			  values: [0, 100],
			  slide: function( event, ui ) {
				  
				
				var slider = $(this);  
				
				var updateEligibilityAgeSuccess = function(response){
					
					if(response && response.eligibilityId){		
					
						slider.parents('.eligibilityItem').data('id',response.eligibilityId);
						
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new age range has been saved.'
						});
						
					}else updateEligibilityAgeFail();
					
				}
				
				var updateEligibilityAgeFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var ageMin = ui.values[0], ageMax = ui.values[1];
				
				if(ui.values[1] == 100)  ui.values[1] = 'Any';
				if(ui.values[0] == 100)  ui.values[0] = 'Any';
				if(ui.values[1] == 0)  ui.values[1] = 'Any';
				if(ui.values[0] == 0)  ui.values[0] = 'Any';
					
				$(this).parents('.slider-container').find('.slider-value').html(  ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				if(model.updateElibilityDelay)clearTimeout(model.updateElibilityDelay);
				var obj = this;
				model.updateElibilityDelay = setTimeout(function(){
					model.set({'path': '/eligibility/age' });
					model.sync('update', model, { data: $.param({pid: window['pid'], eligibilityId: $(obj).parents('.eligibilityItem').data('id'), ageMin: ageMin, ageMax: ageMax}), success: updateEligibilityAgeSuccess, fail: updateEligibilityAgeFail });
	
					
				},200);
				
				
			  }
		});
		
		if(this.options.eligibility.el.ageMin){
			
			$( ".ranged-slider-ui.normal", this.el ).slider( "values", 0, parseInt(this.options.eligibility.el.ageMin));
	
		}
		
		if(this.options.eligibility.el.ageMax){
			
			$( ".ranged-slider-ui.normal", this.el ).slider( "values", 1, parseInt(this.options.eligibility.el.ageMax));
			
		}
		
		
		
		
				 					 		
        return this;
    }
});




window.PromoDashboardComponentRegFormReferralEntryLimitItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
	
	tagName : 'tr',
	
	events: {
		
		'click .removeReferralEntryLimit' : function(event){
			
			event.preventDefault();
			
			$("#deleteReferralEntryLimitModal")
			.data('id', $(event.target).parents('tr').find('.dataCache').data('id'))
			.modal('show');
			
		}
		
	},
	
	 render: function () {
		 
		 
		var model = this.model;
		var collection = this.collection;
		var addNewFlag = false;
		
		if(!this.options.referralentrylimit.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/reg-form/referralentrylimit', {pid: window['pid']}, function(response){
				newKey = response.referralEntryLimitId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.referralentrylimit.key = newKey;
		}
		
		$(this.el).html(this.template({el: this.options.referralentrylimit.el, key: this.options.referralentrylimit.key}));
		
		$('.referralEntryLimitNumber', this.el).editable({
			showbuttons: true,
			url: '/dashboard/reg-form/referralentrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-number';
				params.referralEntryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			validate: function(newValue) {
								
				if(!/^[0-9]+$/.test(newValue) && newValue != 'custom'){
					
					return 'Please only enter numbers';	
					
				}else if(newValue == 'custom' && $(this).siblings('.popover').find('input.input-sm').length == 0){
					
					$(this).siblings('.popover').find('.popover-content').find('select').hide().after('<input type="text" class="form-control input-sm" style="width: 70px;" maxlength="10" />');
								
					$(this).siblings('.popover').find('.input-sm').on("keyup", function(){
						
						if(/^[0-9]+$/.test($(this).val())){
							$(this).siblings('select').find('option:last').prop('value', $(this).val());
						}else{
							return 'Please only enter numbers';	
						}
						
					}).focus();
					
					setTimeout($.proxy(function(){$(this).siblings('.popover').find('form').find(".has-error").removeClass('has-error');}, this),0);

									
					return 'Please enter a number';
					
				} else if(newValue == 'custom'){
							return 'Please only enter numbers';	
					
				}

			},
			display: function(value){
				
				if(value){
					var valueObj = _.findWhere($(this).data('source'), {value: parseInt(value)});
					if(valueObj){
					
						$(this).text(valueObj.text);
						
					}else{
						$(this).text(value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
					}
				}	
				
			},
			source: function(){
			
				var choices = [
				];	
				
				for(i=1;i<=10;i++){
					
					choices.push({value: i, text: i});
				}
				
				choices.push({value: 'custom', text: 'Custom'});
				
				$(this).data('source', choices);
				
				setTimeout($.proxy(function(){
					$(this).siblings('.popover').find('select').on("change", function(){
					
						if($(this).val() == 'custom'){
						
							$(this).parents('form').submit();	
						
						}
						
					});
				},this),0);
				
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
					
			}
		});
		
		$('.referralEntryLimitType', this.el).editable({
			showbuttons: false,
			url: '/dashboard/reg-form/referralentrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-type';
				params.referralEntryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			display: function(value){
				
				if(value){
					var valueObj = _.findWhere($(this).data('source'), {value: value});
					if(valueObj){
					
						$(this).text(valueObj.text);
						
					}
				}
				
			},
			validate: function(newValue) {
				
				var entryPeriodCombinations = [];
				$(".referralEntryLimits tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.referralEntryLimitType = $(this).find('.referralEntryLimitType').data('value');
					obj.referralEntryLimitPeriod = $(this).find('.referralEntryLimitPeriod').data('value');
					if(obj.referralEntryLimitType != '' && obj.referralEntryLimitPeriod != '')entryPeriodCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.referralEntryLimitType = newValue;
				thisObj.referralEntryLimitPeriod = $(this).parents('tr').find('.referralEntryLimitPeriod').data('value');
								
				if(_.findWhere(entryPeriodCombinations, thisObj)){
					return 'This combination has already been defined.';
				}
			},
			source: function(){
			
				var choices = [
					{value: 'per-person', text: 'Total Entries Earned Per Person'}
				];	
				
				$(this).data('source', choices);
			
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
				
				if(!$(this).parents('tr').find('.referralEntryLimitPeriod').data('value')){
				
					$(this).parents('tr').find('.referralEntryLimitPeriod').editable('toggle');
					
				}
					
			}
		});
		
		$('.referralEntryLimitPeriod', this.el).editable({
			showbuttons: false,
			url: '/dashboard/reg-form/referralentrylimit',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-period';
				params.timezone = $(this).siblings('.popover').find('.popover-content').find(".editable-timezone").val();
				params.referralEntryLimitId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			type: 'select',
			validate: function(newValue) {
				
				var entryPeriodCombinations = [];
				$(".referralEntryLimits tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.referralEntryLimitType = $(this).find('.referralEntryLimitType').data('value');
					obj.referralEntryLimitPeriod = $(this).find('.referralEntryLimitPeriod').data('value');
					if(obj.referralEntryLimitType != null && obj.referralEntryLimitPeriod != null)entryPeriodCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.referralEntryLimitType = $(this).parents('tr').find('.referralEntryLimitType').data('value');
				thisObj.referralEntryLimitPeriod = newValue;
					
				if(newValue.indexOf('calendar') === -1){
					$(this).siblings('.popover').find('.popover-content').find('select.editable-timezone').parent().remove();
				}
								
				if(_.findWhere(entryPeriodCombinations, thisObj)){
					return 'This combination has already been defined.';
				}
				
				if(newValue.indexOf('calendar') !== -1){
					
					var selectEl = $(this).siblings('.popover').find('.popover-content').find('select.editable-timezone');
					
					if(selectEl.length == 0){
						$(this).siblings('.popover').find('.popover-content').find('select').after('<div style="margin-top:5px;">Time Zone: <select class="editable-timezone form-control" style="width:auto; height: auto;"><option value=""></option><option value="ET">Eastern Time</option><option value="CT">Central Time</option><option value="MT">Mountain Time</option><option value="PT">Pacific Time</option></select></div>');
									
						$(this).siblings('.popover').find('.editable-timezone').on("change", function(){
						
							$(this).parents('form').submit();	
							
						});
					}
					

					
					if(!$(".editable-timezone").val()){
						
						setTimeout($.proxy(function(){
							$(this).siblings('.popover').find('form').find('select.editable-timezone').focus();
							$(this).siblings('.popover').find('form').find(".has-error").removeClass('has-error');}, this),0);

						return ' ';
					}
				}
				
			},
			display: function(value){
				
				if(value){
					setTimeout($.proxy(function(){
						var valueObj;
						var valueToFind = value;
						
						_.each(_.pluck(EntryLimitPeriods, 'children'), function(array, key){
														
							var foundValue = _.findWhere(array, {value: valueToFind});
							
							if(!valueObj && foundValue)valueObj = foundValue;
							
						});
														
						if(valueObj){
						
							if($(this).data('timezone')){
								$(this).text(valueObj.text + ' ('+$(this).data('timezone')+')');
							}else{
								$(this).text(valueObj.text);
								
								}
							
						}else{
							
							$(this).text('Empty').addClass('editable-empty');
							
							}
					}, this, value), 0);
				}else{
				
					return;	
					
				}
			},
			source: function(){
				
				var choices = EntryLimitPeriods;
				
				return choices;
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
				
				if(response.timezone){
					$(this).data('timezone', response.timezone);
				}else{
					$(this).data('timezone', '');
					}
				
				if(!$(this).parents('tr').find('.referralEntryLimitType').data('value')){
				
					$(this).parents('tr').find('.referralEntryLimitType').editable('toggle');
					
				}
					
					
			},
			
		});
		 
		$(".referralEntryLimitsTableHeader").show();	
		
		if(addNewFlag){
			
			setTimeout(function(){
			
				$('.referralEntryLimitPeriod:last').editable('toggle');
				
			},0); 
			
		}
				 					 		
        return this;
    }
});



})(jQuery);





