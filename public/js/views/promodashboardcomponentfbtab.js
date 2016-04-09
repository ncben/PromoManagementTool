(function($, undefined) {
	
var CountryRestrictionValues;
var CountryRestrictionValues;

window.PromoDashboardComponentFacebookTabView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	events: {
		
		'click .fbConnect': 'fbConnectModal',
		'click #connectFacebookModal .confirm' : 'fbConnect',
		'change .fanGateSwitch' : 'fanGateSwitch',
		'change .allowAccessSwitch' : 'allowAccessSwitch',
		'change .containsAlcoholSwitch' : 'containsAlcoholSwitch',
		'change .enableCanvasPageSwitch' : 'enableCanvasPageSwitch',
		'click .ageRestrictionsDropDown a': 'updateAgeRestrictions',
		'click .addCanvasURL' : 'addCanvasURL',
		'click #removeCanvasURLModal .confirm' : 'removeCanvasURL'
		
	},
	
	updateAgeRestrictions: function(event){
		
		event.preventDefault();
		
		var value = $(event.target).data("value");
		
		$.ajax({
			url: '/dashboard/fb-tab/ageRestrictions',
			type: 'PUT',
			dataType: 'json',
			data: {value: value, pid: window['pid']},
			success: $.proxy(function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.id){
					
					$(".ageRestrictions .text").text($(event.target).text());
					
					$(".ageRestrictionsDropDown a").show();
					$(event.target).hide();
					
					return Growl.success({title: 'Successfully updated!', text: 'Age restrictions setting has been updated.'});
					
				}
				
				
				
			}, event),
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	populateDemographicDataValues: function(){
		
		DemographicDataValues = [
							{ text: "Basic permission", children: [
							{ id: "id", text: "Facebook User ID" },
							{ id: "profile_picture", text: "Profile Picture" },
							{ id: "cover", text: "Cover Photo" },
							{ id: "locale", text: "Locale" },
							{ id: "name", text: "Name" },
							{ id: "username", text: "Username" },
							{ id: "gender", text: "Gender" },
							{ id: "age_range", text: "Age Range" },
							{ id: "link", text: "Link to Profile" },
							{ id: "friends", text: "Friends" },
							{ id: "third_party_id", text: "Third-party ID" }
							]},
							
							{ text: "Extended profile permission", children: [
							{ id: "email", text: "Email" },
							{ id: "political", text: "Political Views" },
							{ id: "religion", text: "Religion" },
							{ id: "birthday", text: "Birthday" },
							{ id: "quotes", text: "Favorite Quotes" },
							{ id: "education", text: "Education History" },
							{ id: "work", text: "Employment History" },
							{ id: "relationship_status", text: "Relationship Status" },
							{ id: "bio", text: "About me Section" },
							{ id: "favorite_athletes", text: "Favorite Athletes" },
							{ id: "favorite_teams", text: "Favorite Teams" },
							{ id: "hometown", text: "Hometown" },
							{ id: "inspirational_people", text: "Inspirational People" },
							{ id: "website", text: "Website" }
							]
		}]
		
		
	},
	
	populateCountryRestrictionValues: function(){
		
		CountryRestrictionValues = [{ text: "Countries", children: [
							{ id: "US", text: "United States" },
							{ id: "CN", text: "Canada" },
							{ id: "AS", text: "American Samoa" },
							{ id: "GU", text: "Guam" },
							{ id: "MH", text: "Marshall Islands" },
							{ id: "FM", text: "Micronesia, Federated States" },
							{ id: "MP", text: "Northern Mariana Islands" },
							{ id: "PW", text: "Palau" },
							{ id: "PR", text: "Puerto Rico" },
							{ id: "VI", text: "U.S. Virgin Islands" },
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
		
	},
	
	populateCanvasRedirectURLs: function(openUuid){
		
		var el = this.$el;	
		
		$(".canvasURLs", el).empty();
		
		var canvasURLs = this.collection.pluck('customCanvasRedirectURL')[0];
		
		console.log(canvasURLs);
		
		for(var uuid in canvasURLs){
			
			if(canvasURLs.hasOwnProperty(uuid)){
				
				var addCanvasURLTemplate = $($(".addCanvasURLTemplate", el).html());
		
				addCanvasURLTemplate.find('td.dataCache').data('id', uuid)
				
				addCanvasURLTemplate.find('.canvasNamespace')
				.data('value', canvasURLs[uuid]['namespace'])
				.editable({
					showbuttons: true,
					url: '/dashboard/fb-tab/updateCanvasRedirectURLNamespace',
					params: function(params) {
						params.pid = window['pid'];
						params.uuid = $(this).parents('tr').find('td.dataCache').data('id');
						return params;
					},
					ajaxOptions: {
					  type: 'PUT'
					},
					type: 'text',
					validate: function(newValue) {
						
						if(!/^[a-zA-Z0-9_\-\.]+$/.test(newValue)){
							
							return 'Please enter a valid namespace. Your namespace can only be consisted of letters, numbers, underscores, dashes and periods.';	
							
						}
						
						if(!/^[a-zA-Z0-9]/.test(newValue) || !/[a-zA-Z0-9]$/.test(newValue)){
							
							return 'Namespace must begin and end with a letter or a number';	
							
						}
						
						if(newValue.length > 20){
							
							return 'Namespace must be between 1 and 20 characters.';	
							
						}
						
						
						var canvasNamespaces = [];
						$(".canvasURLs tr").not($(this).parents('tr')).each(function(){
							
							var obj = {};
							obj.namespace = $(this).find('.canvasNamespace').data('value');
							if(obj.namespace != null)canvasNamespaces.push(obj);
							
						})
						
						var thisObj = {};
						thisObj.namespace = newValue;
							
						if(_.findWhere(canvasNamespaces, thisObj)){
							return 'This namespace has already been defined.';
						}
						
						
					},
					display: function(value){
						
						if(value){
							
								$(this).text(value);		
													
						}else{
						
							setTimeout($.proxy(function(){
								$(this).addClass('editable-empty').text('Enter Namespace');	
							}, this),0);
							
						}	
						
					},
					success: function(response, newValue){
						
						if(response.error){
							
							return response.error;	
							
						}
										
						
						$(this).data('value', newValue);
						
						if(!$(this).parents('tr').find('.canvasDestination').data('value')){
							
							$(this).parents('tr').find('.canvasDestination').trigger('click')
							
						}
									
							
					}
				})
				.addClass('initialized');
				
				addCanvasURLTemplate.find('.canvasDestination')
				.data('value', canvasURLs[uuid]['destination'])
				.editable({
					showbuttons: true,
					url: '/dashboard/fb-tab/updateCanvasRedirectURLDestination',
					params: function(params) {
						params.pid = window['pid'];
						params.uuid = $(this).parents('tr').find('td.dataCache').data('id');
						return params;
					},
					ajaxOptions: {
					  type: 'PUT'
					},
					type: 'text',
					validate: function(newValue) {
							
						var testObj = newValue.replace(/^http(s)?:\/\//, '').split('/');
							
						if(!/^(http(s)?:\/\/)?(www\.)?facebook\.com$/.test(testObj[0]) || typeof testObj[1] == 'undefined' || $.trim(testObj[1]) == ''){
						
							return 'Please enter a valid Facebook fan page URL.';	
						
						}
						
						
					},
					display: function(value){
										
						var fbPageNamespaceObj = value.replace(/^http(s)?:\/\//, '').split('/');
						
						var fbPageNamespace = fbPageNamespaceObj[1];
						
						if(fbPageNamespace == 'pages'){
						
							fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
							
							var searchPageAccessToken = function(retry){
								
								var returnValue = '';
							
								$(".fanPageThumb").each(function(){
								
									if($(this).data('id') && $(this).data('id') == fbPageNamespace){
																
										if($(this).data('access_token') && fbPageNamespace.indexOf('?access_token') === -1){
										
											 returnValue = $(this).data('access_token');
											 fbPageNamespace = fbPageNamespace+'?access_token='+$(this).data('access_token');
											
										}
									}
									
								})	
								
								if(retry)return returnValue;
								
									
							}
							
							searchPageAccessToken();
							
							
						}
						
						var displayObj = $(this);
						
						if(fbPageNamespace){
												
							$.ajax({
								url: "https://graph.facebook.com/"+fbPageNamespace,
								type: 'GET',
								dataType: 'json',
								tryCount : 0,
								retryLimit: 5,
								success: $.proxy(function(data) {
													
									if(data && data.name){
										$(this).text('Redirect: '+data.name).removeClass('editable-empty');
									}else{
										$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');
									}
														
									
								}, this),
								statusCode: {
									400: function(xhr) {
										
										 this.tryCount++;
										 
										 if(this.tryCount < this.retryLimit){
											 
											displayObj.html('Getting Page Info..').removeClass('editable-empty');
											 
											 if(typeof searchPageAccessToken == 'function'){
												 var accessToken = searchPageAccessToken(true);
											
												 if(accessToken){
													 if(typeof this.data == 'undefined')this.data = {};
													 this.data['access_token'] = accessToken;
												 }
												 setTimeout($.proxy(function(){$.ajax(this)}, this), 300);
											 }else{
											
												displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
												 
											 }
										 }else{
											 
											displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
											 
										 }
		
									},
									404: $.proxy(function(xhr) {
										$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');
		
									}, this)
								  }
							})
																
						}else{
							setTimeout($.proxy(function(){
								$(this).addClass('editable-empty').text('Enter Fan Page URL');	
							},this),0);
							
						}
						
					},
					success: function(response, newValue){
						
						if(response.error){
							
							return response.error;	
							
						}
										
						$(this).data('value', newValue);
						
						
					}
				})
				.addClass('initialized');
				
				addCanvasURLTemplate.find('.removeCanvasURL').on("click", function(e){
					
					e.preventDefault();
					$("#removeCanvasURLModal").data('id', $(this).parents('tr').find('td.dataCache').data('id')).modal('show');
					
					
				})
								
				$(".canvasURLs", el).append(addCanvasURLTemplate.find('tr'));
				
			}
		}
		
		if(openUuid){
		
			var obj = $(".canvasURLs .dataCache", el).filter(function(index) {
				
				return $(this).data('id') == openUuid
                
            }).parents('tr').find('.canvasNamespace');
			
			setTimeout(function(){obj.trigger('click')},0);
			
		}
		
	},
	
	removeCanvasURL: function(event){
		
		event.preventDefault();
		
		$.ajax({
			url: "/dashboard/fb-tab/removeCanvasURL",
			type: 'DELETE',
			dataType: 'json',
			data: {uuid: $("#removeCanvasURLModal").data('id'), pid: window['pid']},
			success: $.proxy(function(response) {
												
						
				$("#removeCanvasURLModal").modal('hide');
				
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.uuid){
					
						
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
						this.populateCanvasRedirectURLs();
					}, this)});
					
					return Growl.warn({title: 'Canvas Redirect URL Deleted', text: 'The canvas url has been deleted.'});
				}
								
				
			}, this)
			
		})
										

		
	},
	
	addCanvasURL: function(event){
		
		event.preventDefault();
										
		$.post('/dashboard/fb-tab/addCanvasRedirectURL', {pid: window['pid']}, $.proxy(function(response){
								
			if(response && response.id && response.uuid){
				
				var uuid = response.uuid;
				
			}
				
			this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				this.populateCanvasRedirectURLs(uuid);
			}, this)});
				
								
		}, this),'json');
													
		
	},
	
	
	enableCanvasPageSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/fb-tab/enableCanvasPage',
			type: 'PUT',
			dataType: 'json',
			data: {status: status, pid: window['pid']},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.id){
					
					if(status == 1)$(".canvas-page-disabled-only").hide();
					if(status == 0)$(".canvas-page-disabled-only").show();
					return Growl.success({title: 'Successfully updated!', text: 'Canvas page setting has been updated.'});
					
				}
				
				
				
			},
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	containsAlcoholSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/fb-tab/containsAlcohol',
			type: 'PUT',
			dataType: 'json',
			data: {status: status, pid: window['pid']},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.id){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Contains alcohol setting has been updated.'});
					
				}
				
				
				
			},
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	allowAccessSwitch: function(event, bypass, cb){
				
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		var type = $(event.target).data("type");
		
		var allowAccessRequiredTypes = ['microsite', 'mobile', 'facebook-canvas'];
		
		var fanGateElem = $(".fanGateSwitch").filter(function(){ return $(this).data('type') == type });
		
		if(!bypass){
			if(status == 0 && allowAccessRequiredTypes.indexOf(type) !== -1){
				
				if(fanGateElem.is(":checked")){
				
					$("#switchAllowAccessRoadblockModal").modal('show');
							
					$('#switchAllowAccessRoadblockModal').off('hidden.bs.modal').on('hidden.bs.modal', $.proxy(function () {
						$(event.target).prop("checked", true).trigger('change');
					},event));
					
					$("#switchAllowAccessRoadblockModal .confirm").off("click").on("click", $.proxy(function(e){
					
						e.preventDefault();
						
						this.allowAccessSwitch(event, true, function(){
							$(".fanGateSwitch[data-type='"+type+"']").prop("checked",false).trigger("change");	
							
						});
						
						
					}, this, event, type));
															
					return;
				}
				
			}
		}
		
		
		$.ajax({
			url: '/dashboard/fb-tab/allowAccess',
			type: 'PUT',
			dataType: 'json',
			data: {type: type, status: status, pid: window['pid']},
			success: $.proxy(function(response) {
				
					
				$('#switchAllowAccessRoadblockModal').off('hidden.bs.modal');
				$("#switchAllowAccessRoadblockModal").modal('hide');
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.id){
					
					if(typeof cb == 'function')cb();
					
					var obj = $(".collectDemographicData[data-platform-type='"+type+"']").editable('getValue');
					if(status == 0){
												
					
						for (key in obj) {
							if (obj.hasOwnProperty(key)){
								
								if(obj[key].length > 0){
																	
									if((typeof obj[key] == 'string' && obj[key] == 'id') || (typeof obj[key] == 'object' && obj[key][0] == 'id' && obj[key].length == 1 )){
									
										$(".collectDemographicData[data-platform-type='"+type+"']").editable('setValue','').trigger('click').siblings('.editable-container').find('form').submit();

									}else{
								
										$(".collectDemographicData[data-platform-type='"+type+"']").parents('li').find('.warningAllowAccessOff').show();
									}
								}
								
								
							}
						}
						
							
							
					}else{
						
						var objectSize = 0;
						
						for (key in obj) {
							if (obj.hasOwnProperty(key)){
								
								if(obj[key].length > 0){
								
									objectSize++;
								
								}
								
								
							}
						}
						
						
						if(objectSize < 1){
						
							$(".collectDemographicData[data-platform-type='"+type+"']").editable('setValue','id').trigger('click').siblings('.editable-container').find('form').submit();
							
						}
						
						$(".collectDemographicData[data-platform-type='"+type+"']").parents('li').find('.warningAllowAccessOff').hide();						
					}
					return Growl.success({title: 'Successfully updated!', text: 'Allow access setting has been updated.'});
					
				}
								
				
				
				
			}, cb),
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	fanGateSwitch: function(event, bypass, cb){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		var type = $(event.target).data("type");
		
		var allowAccessRequiredTypes = ['microsite', 'mobile', 'facebook-canvas'];
		
		if(!bypass){
			if(status == 1 && allowAccessRequiredTypes.indexOf(type) !== -1){
			
				if(!$(".allowAccessSwitch").filter(function(){ return $(this).data('type') == type }).is(":checked")){
					
					$('#switchAllowAccessFromFanGateModal').off('hidden.bs.modal').on('hidden.bs.modal', $.proxy(function () {
						$(event.target).prop("checked", false).trigger('change');
					},event));
					
					$("#switchAllowAccessFromFanGateModal").modal('show');
					
					$("#switchAllowAccessFromFanGateModal .confirm").off("click").on("click", $.proxy(function(e){
					
						e.preventDefault();
						
						this.fanGateSwitch(event, true, function(){
						
							$(".allowAccessSwitch[data-type='"+type+"']").prop("checked",true).trigger("change");
	
							
						});
						
						
					}, this, event, type));
					
					return;
				}
				
				
			}
		}
		
		var fanGateURL = $(event.target).parents('li').find('.fanGateURL, .fanGateURL-disabled');
			
		$.ajax({
			url: '/dashboard/fb-tab/fanGate',
			type: 'PUT',
			dataType: 'json',
			data: {type: type, status: status, pid: window['pid']},
			success: $.proxy(function(response) {
				
				$('#switchAllowAccessFromFanGateModal').off('hidden.bs.modal');
				$("#switchAllowAccessFromFanGateModal").modal('hide');
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.id){
					
									
					if(typeof cb == 'function')cb();
					
					if(status == 1 && fanGateURL)fanGateURL.show();
					if(status == 0 && fanGateURL)fanGateURL.hide();
					
					if(status == 1){
						if(!fanGateURL.data('value') || fanGateURL.data('value') == ''){
						
							setTimeout(function(){ fanGateURL.trigger('click')}, 500);
							
						}
					}
										
					return Growl.success({title: 'Successfully updated!', text: 'Fangate setting has been updated.'});
					
					
				}
				
				
				
			}, cb),
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	fbConnectModal: function(event){
		
		event.preventDefault();
		
		$("#connectFacebookModal").modal('show');
		
	},
	
	fbConnect: function(){
		
		FB.login(function(response) {
			if(response.authResponse) {
				var userId = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;
				
				$.post('/dashboard/fb-tab/exchangeAccessToken', {pid: window['pid'], fb_exchange_token: accessToken, redirect_uri: window.location.href}, function(response){
					
					if(response.error || !response.accessToken){
					
						return Growl.error({
							title: 'An error occurred!',
							text: 'Please refresh this page and try again.'
						});	
						
					}
					
					$("#connectFacebookModal").modal('hide');
					$("#choosePagesModal").modal('show');
					
					$("#choosePagesModal .pages-icons .icon-spin").show();
					
					$.getJSON('https://graph.facebook.com/me/accounts', {access_token : response.accessToken}, function(response) {
						
						$("#choosePagesModal .pages-icons .page-icon").remove();
						$("#choosePagesModal .pages-icons .icon-spin").hide();
					
						for(var i = 0; i < response.data.length; i++){
							
							var pageId = response.data[i].id;
							
							if(response.data[i].perms.indexOf('CREATE_CONTENT') !== -1 && response.data[i].perms.indexOf('EDIT_PROFILE') !== -1 && $(".fanPageThumb").filter(function(){return $(this).data('id') == pageId}).length < 1){
					
								var iconTemplate = $(".pages-icons-template .page-icon").clone();
								
								iconTemplate.css('background-image','url(https://graph.facebook.com/'+response.data[i].id+'/picture?access_token='+response.data[i].access_token+')');
								iconTemplate.prop('title', response.data[i].name);
								iconTemplate.data('page-id', response.data[i].id);
								iconTemplate.data('access_token', response.data[i].access_token);
								
								iconTemplate.on("click", function(e){
									
									e.preventDefault();
									
									if(!$(this).data('checked')){
										$(this).data('checked', true);
										$(this).addClass('checked');
										$(this).children('.pageChecked').show();
									}else{
										
										$(this).data('checked', false);
										$(this).removeClass('checked');
										$(this).children('.pageChecked').hide();
									}
									
								})
					
								$("#choosePagesModal .pages-icons").append(iconTemplate);
							}
							
						}
						
						if($("#choosePagesModal .pages-icons .page-icon").length < 1){
							
							$("#choosePagesModal .pages-icons").append('<div class="page-icon" style="padding-top:50px; font-style: italic;"><i class="icon-warning-sign"></i> Oops.. we couldn\'t find any pages on your Facebook account to link.</div>');
							
						}
						
						$("#choosePagesModal .confirm").off("click").on("click", function(){
							
							if($(".page-icon.checked").length < 1){
							
								return Growl.info({
									title: 'No page selected',
									text: 'Click on an icon to select a page.'
								});
						
							}
							
							var value = [];
							
							$(".page-icon.checked").each(function(){
							
								value.push({id: $(this).data('page-id'), access_token: $(this).data('access_token')});
								
							})
							
							
							$.ajax({
								url: '/dashboard/fb-tab/linkFanPage',
								type: 'PUT',
								dataType: 'json',
								data: {value: value, pid: window['pid']},
								success: $.proxy(function(response) {
																						
									if(response.error){
										
										return Growl.error({
											title: 'An error occurred!',
											text: 'Please refresh this page and try again.'
										});
										
									}
									
									
									if(response.id){
																				
										$("#choosePagesModal").modal('hide');
										$(".modal-backdrop").hide();
										
										app.fbTab();
										
										
										return Growl.success({
											title: 'Successfully linked!',
											text: 'Facebook page has been successfully linked to promotion.'
										});
										
									}
									
									
									
								}, this),
								 statusCode: {
									500: function(xhr) {
										return Growl.error({
											title: 'An error occurred!',
											text: xhr.responseJSON.error
										});
									}
								  }
							})
							
							
						})
								
						
					})
					
					
				},'json')
								
			}
		}, {scope: 'manage_pages'});
	 
		
	},
	
	initHelpers: function(){
		var el = this.$el;	
		
		$('.fbHelpers', el).popover({
			html: true,
			trigger: 'click'
			
			
		});
		
	},
	
	initEnableCanvasPage: function(){
		
		var el = this.$el;	
		
		var enableCanvasPage = this.collection.pluck('enableCanvasPage')[0];
		var canvasRedirectURL = this.collection.pluck('canvasRedirectURL')[0] || '';
		
		if(enableCanvasPage == 1){
		
			$(".enableCanvasPageSwitch", el).prop('checked', true);
			$(".canvas-page-disabled-only",el).hide();
				
			
		}else $(".canvas-page-disabled-only",el).show();
		
		
		$('.redirectFanGateURL', el)
		.data('value', canvasRedirectURL)
		.editable({
			showbuttons: true,
			url: '/dashboard/fb-tab/canvasRedirectURL',
			params: function(params) {
				params.pid = window['pid'];
				return params;
			},
			ajaxOptions: {
			  type: 'PUT'
			},
			type: 'text',
			validate: function(newValue) {
					
				var testObj = newValue.replace(/^http(s)?:\/\//, '').split('/');
					
				if(!/^(http(s)?:\/\/)?(www\.)?facebook\.com$/.test(testObj[0]) || typeof testObj[1] == 'undefined' || $.trim(testObj[1]) == ''){
				
					return 'Please enter a valid Facebook fan page URL.';	
				
				}
				
				
			},
			display: function(value){
								
				var fbPageNamespaceObj = value.replace(/^http(s)?:\/\//, '').split('/');
				
				var fbPageNamespace = fbPageNamespaceObj[1];
				
				if(fbPageNamespace == 'pages'){
				
					fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
					
					var searchPageAccessToken = function(retry){
						
						var returnValue = '';
					
						$(".fanPageThumb").each(function(){
						
							if($(this).data('id') && $(this).data('id') == fbPageNamespace){
														
								if($(this).data('access_token') && fbPageNamespace.indexOf('?access_token') === -1){
								
									 returnValue = $(this).data('access_token');
									 fbPageNamespace = fbPageNamespace+'?access_token='+$(this).data('access_token');
									
								}
							}
							
						})	
						
						if(retry)return returnValue;
						
							
					}
					
					searchPageAccessToken();
					
					
				}
				
				var displayObj = $(this);
				
				if(fbPageNamespace){
										
					$.ajax({
						url: "https://graph.facebook.com/"+fbPageNamespace,
						type: 'GET',
						dataType: 'json',
						tryCount : 0,
						retryLimit: 5,
						success: $.proxy(function(data) {
											
							if(data && data.name){
								$(this).text('Redirect: '+data.name).removeClass('editable-empty');
							}else{
								$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');
							}
												
							
						}, this),
						statusCode: {
							400: function(xhr) {
								
								 this.tryCount++;
								 
								 if(this.tryCount < this.retryLimit){
									 
									displayObj.html('Getting Page Info..').removeClass('editable-empty');
									 
									 if(typeof searchPageAccessToken == 'function'){
										 var accessToken = searchPageAccessToken(true);
									
										 if(accessToken){
											 if(typeof this.data == 'undefined')this.data = {};
											 this.data['access_token'] = accessToken;
										 }
										 setTimeout($.proxy(function(){$.ajax(this)}, this), 300);
									 }else{
									
										displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
										 
									 }
								 }else{
									 
									displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
									 
								 }

							},
							404: $.proxy(function(xhr) {
								$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');

							}, this)
						  }
					})
														
				}else{
				
					$(this).text('Redirect Canvas Page');	
					
				}
				
			},
			success: function(response, newValue){
				
				if(response.error){
					
					return response.error;	
					
				}
								
				$(this).data('value', newValue);
				
				
			}
		})
		.addClass('initialized');
		
	},
	
	initTargetAudience: function(){
		
		var el = this.$el;	
		
		
		var targetAudience = this.collection.pluck('targetAudience')[0];
		
		if(targetAudience.containsAlcohol == 1){
		
			$(".containsAlcoholSwitch", el).prop('checked', true);
				
			
		}
		
		if(targetAudience.ageRestrictions){
					
			var aElem = $(".ageRestrictionsDropDown a[data-value='"+targetAudience.ageRestrictions+"']", el);
				
			$(".ageRestrictions .text", el).text(aElem.text());
			
			$(".ageRestrictionsDropDown a", el).show();
			aElem.hide();
					
				
			
		}
		
		this.populateCountryRestrictionValues();
		
		var countryRestrictions = this.collection.pluck('targetAudience')[0].countryRestrictions;
						
		$('.countryRestrictions', el).editable({
			type: 'select2',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				return params;
			},
			savenochange: true,
			display: function(value) {
					  			  
				if(typeof value == 'undefined')value = [];	
				$(this).siblings('.popover').css("opacity","1");
				if(typeof value != 'object')value = value.split(',');
				if(value == null)value = [];
				
				if(value.length == 0){
				
					$(this).text('Any');
				
				}else{
				  
				  
				  	 var dataTextArray = _.pluck(CountryRestrictionValues, 'children');
					var dataTextMerged = dataTextArray[0];
					var dataTextDisplay = [];
					
					for(i=1;i<dataTextArray.length;i++){
					
						dataTextMerged = dataTextMerged.concat(dataTextArray[i]);
						
					}
										
					for(i=0;i<value.length;i++){
						
				 		var dataText = _.findWhere(dataTextMerged, {id: value[i]});
						
						if(dataText && dataText.text){
						
							dataTextDisplay.push(dataText.text);
							
						}
						
					}
										
					
					if(dataTextDisplay.length > 2){
						$(this).text(dataTextDisplay.slice(0, 2).join(', ') + ' and '+(dataTextDisplay.length-2)+' more');
					}else{
						$(this).text(dataTextDisplay.join(', '));
						}
				  
				  
				}
			} ,
			mode: 'inline',
			value: countryRestrictions,
			select2: {
				placeholder: "Allowed Country",
				multiple: true,
				dropdownAutoWidth: true,
				data: function() {  
					
					setTimeout(function(){
										
						if($(".select2-choices")[0].scrollHeight > parseInt($(".select2-choices").css("max-height"))){
							$(".select2-choices").css("overflow-y","auto");
							
						}  
						  
				 	},0);

					return {results: CountryRestrictionValues};
				}
			},
			defaultvalue: countryRestrictions,
			pk: 10,
			url: '/dashboard/fb-tab/countryRestrictions',
			success: function(){
				
				return 'keepOpen';
				
			}
			
		});
		
	},
	
	initLikeGate: function(){
		
		var el = this.$el;	
		
		var likeGate = this.collection.pluck('likeGate')[0];
		
		if(typeof likeGate == 'object' && likeGate.length > 0){
		
			$(".fanGateSwitch", el).filter(function(){
										
				return likeGate.indexOf($(this).data('type')) !== -1
				
			}).prop('checked', true);
				
			
		}
		
		
	},
	
	initAllowAccess: function(){
		
		var el = this.$el;	
		var allowAccess = this.collection.pluck('allowAccess')[0];
		
		if(typeof allowAccess == 'object' && allowAccess.length > 0){
		
			$(".allowAccessSwitch", el).filter(function(){
										
				return allowAccess.indexOf($(this).data('type')) !== -1
				
			}).prop('checked', true);
				
			
		}
		
	},
	
	initCollectionDemographicData: function(){
		
		var el = this.$el;	
				
		this.populateDemographicDataValues();
		
		var collectDemographicData = this.collection.pluck('targetAudience')[0].collectDemographicData;	
					
		$('.collectDemographicData', el).editable({
			type: 'select2',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.type = $(this).data('platform-type');
				return params;
			},
			savenochange: true,
			display: function(value) {
					  			  
				if(typeof value == 'undefined')value = [];	
				$(this).siblings('.popover').css("opacity","1");
				if(typeof value != 'object')value = value.split(',');
				if(value == null)value = [];
				
				if(value.length == 0){
				
					$(this).text('None');
				
				}else{
				  
				    var dataTextArray = _.pluck(DemographicDataValues, 'children');
					var dataTextMerged = dataTextArray[0];
					var dataTextDisplay = [];
					
					for(i=1;i<dataTextArray.length;i++){
					
						dataTextMerged = dataTextMerged.concat(dataTextArray[i]);
						
					}
										
					for(i=0;i<value.length;i++){
						
				 		var dataText = _.findWhere(dataTextMerged, {id: value[i]});
						
						if(dataText && dataText.text){
						
							dataTextDisplay.push(dataText.text);
							
						}
						
					}
										
					
					if(dataTextDisplay.length > 2){
						$(this).text(dataTextDisplay.slice(0, 2).join(', ') + ' and '+(dataTextDisplay.length-2)+' more');
					}else{
						$(this).text(dataTextDisplay.join(', '));
						}
				  

				  
				}
			} ,
			mode: 'inline',
			value: '',
			select2: {
				placeholder: "Profile Properties",
				multiple: true,
				dropdownAutoWidth: true,
				data: function() {  
					
					setTimeout(function(){
										
						if($(".select2-choices")[0].scrollHeight > parseInt($(".select2-choices").css("max-height"))){
							$(".select2-choices").css("overflow-y","auto");
							
						}  
						  
				 	},0);

					return {results: DemographicDataValues};
				}
			},
			defaultvalue: collectDemographicData,
			pk: 10,
			url: '/dashboard/fb-tab/collectDemographicData',
			success: function(response, newValue) {
        		if(response.status == 'error') return response.msg;
				
				if(newValue == ''){
					
					$(this).parents('li').find('.warningAllowAccessOff').hide();

				}else{
				
					if(!$(".allowAccessSwitch[data-type='"+$(this).data('platform-type')+"']").is(":checked")){
						$(this).parents('li').find('.warningAllowAccessOff').show();
						
					}
					
				}
				
				
   			 }
			
		}).each(function(){
			
			if(collectDemographicData[$(this).data('platform-type')]){
				$(this).editable('setValue',collectDemographicData[$(this).data('platform-type')]);
				
				if(!$(".allowAccessSwitch[data-type='"+$(this).data('platform-type')+"']", el).is(":checked")){
					$(this).parents('li').find('.warningAllowAccessOff').show();
				}
				
			}
			
			
		})
		
	},
	
	initFB: function(){
		
		window.fbAsyncInit = function() {
				FB.init({
				  appId      : '381112031899990', // App ID
				  status     : true, // check login status
				  cookie     : true, // enable cookies to allow the server to access the session
				  xfbml      : true  // parse XFBML
				});
			
				FB.getLoginStatus(function(response) {
				  if (response.status === 'connected') {
					var uid = response.authResponse.userID;
					var accessToken = response.authResponse.accessToken;
	
				  } else {
	
				  }
				 });
				
				
			};
		
		  // Load the SDK Asynchronously
		  (function(d){
			 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			 if (d.getElementById(id)) {return;}
			 js = d.createElement('script'); js.id = id; js.async = true;
			 js.src = "//connect.facebook.net/en_US/all.js";
			 ref.parentNode.insertBefore(js, ref);
		   }(document));
		
	},
	
	removeNonselectedComponents: function(){
		
		var el = this.$el;	
		var type = this.collection.pluck('type')[0];
		
		if(type.indexOf('1') === -1)$("a[data-platform-type='microsite'],input[data-type='microsite']",el).parents('li').remove();
		if(type.indexOf('3') === -1)$("a[data-platform-type='mobile'],input[data-type='mobile']",el).parents('li').remove();

		
	},
	
	initPopoverManageTab: function(targetIcon, isEdit){
							
		var isEdit = isEdit;
		
		var removeTab = function(obj){
			$(".popover .form-in-progress").show();
			$(".popover .form-actions").hide();
			$.ajax({
				url: '/dashboard/fb-tab/removeTab',
				type: 'DELETE',
				dataType: 'json',
				data: {
				id: obj.parents('.fanPageThumb').data('id'), 
				pid: window['pid'], 
				accessToken: obj.parents('.fanPageThumb').data('access_token'),
				tab_id: obj.parents('.tabIcons').data('tab-id').split('/tabs/app_')[1],
				},
				success: $.proxy(function(response) {
					
					$(".popover .form-in-progress").hide();
					$(".popover .form-actions").show();
																		
					if(response.error){
						
						$(".popover .addTabErrorMsg").text(response.error);
						return;
						
					}
					
					
					if(response.id){
																
						obj.popover('hide');
						
						app.fbTab();
						
						return Growl.warn({
							title: 'Successfully removed!',
							text: 'Page tab has been successfully removed from Facebook page.'
						});
						
					}
					
					
					
				}, this),
				 statusCode: {
					500: function(xhr) {
						$(".popover .form-in-progress").hide();
						$(".popover .form-actions").show();
						return Growl.error({
							title: 'An error occurred!',
							text: xhr.responseJSON.error
						});
					},
					503: function(xhr) {
						$(".popover .form-in-progress").hide();
						$(".popover .form-actions").show();
						return Growl.error({
							title: 'Service Unavailable',
							text: 'Changes Locked.'
						});
					}
				  }
			})
		}
											
		targetIcon
		.on('click' ,function(e){ e.preventDefault(); })
		.popover({
		
				html: true,
				placement: 'right',
				title: isEdit ? 'Edit Tab' : targetIcon.parents('.fanPageTabsContainer').find('.external-event-template').data('title') || $('.fanPageTabsContainer').find('.external-event-template').data('title'),
				content: targetIcon.parents('.fanPageTabsContainer').find('.external-event-template').html() || $('.fanPageTabsContainer').find('.external-event-template').html(),
				container: '.main-content'
				
		})
		.on('shown.bs.popover', function () {
			
			$.get("/dashboard/fb-tab/checkAddTab", {pageId: $(this).parents('.fanPageThumb').data('id'), pid: window['pid']}, $.proxy(function(response){
			
				if(response.uuid){
				
					$(this).data('bs.popover')['$tip'].find(".tabInProgress").show();
					$(this).data('bs.popover')['$tip'].find(".addNewTabOptions").hide();
					$(this).data('bs.popover')['$tip'].find(".tabInProgressSchedule").text(new Date(parseInt(response.schedule)));
					$(this).data('bs.popover')['$tip'].find(".addCancelTask").data({uuid: response.uuid});
					
				}	
				
			},this))
			
			$(".popover .addConfirm").text(isEdit ? 'Edit' : 'Add');
			
			isEdit ? $(".popover .deleteTab").show().on("click", $.proxy(function(){
				
				removeTab($(this));
				
			},this)) : '';		
			
			$(".editTab, .tabAddIcon").not($(this)).popover('hide');

			if(isEdit){
			
				$(".popover .addForm").find('.fieldTabIcon').val($(this).parents('.tabIcons').data('image_url') || '');
				$(".popover .addForm").find('.fieldTabName').val($(this).parents('.tabIcons').data('name') || '');
				setTimeout($.proxy(function(){$(".popover .addForm").find('.fieldTabPosition').val($(this).parents('.tabIcons').data('position') && $(".popover .addForm").find('.fieldTabPosition option[value="'+(parseInt($(this).parents('.tabIcons').data('position'))+1)+'"]').length > 0 ? (parseInt($(this).parents('.tabIcons').data('position'))+1) : $(".popover .addForm").find('.fieldTabPosition option[value="'+$(this).parents('.tabIcons').data('position')+'"]').length > 0 ? (parseInt($(this).parents('.tabIcons').data('position'))) : '')},this),0);
				if(!!($(this).parents('.tabIcons').data('is_non_connection_landing_tab') || ''))$(".popover .addForm").find('.fieldMakeLandingTab').prop("checked", true).prop("disabled", true);
				$(".popover .add-tab-only").hide();
				
			}
			
			$(".popover .addTabSchedule").editable({
				
				combodate: {
					minYear: new Date().getFullYear(),
					yearDescending: false,
					smartDays: true,
					minuteStep: 1
				},
				
				validate: function(newValue) {
					
					if(!new Date(newValue).getTime()){
					
						return "Please complete all fields and confirm the date is valid."
						
					}
					
				},
				display: function(value){
					
					if(new Date(value).getTime() < new Date().getTime()){
					
						$(this).find('.addTabScheduleText').text("Now");
						$(this).data('datevalue','');
						
					}else{
					
						$(this).find('.addTabScheduleText').text(value);
						$(this).data('datevalue',new Date(value).getTime());
					}	
				
				}
				
			}).on('shown.bs.popover', function () {
				
				$(this).data('bs.popover')['$arrow'][0].remove();
				$(this).data('bs.popover')['$tip'].find("*").css("white-space","nowrap");
				
			})
					
			$(".popover .learnMore").tooltip();
			$(".popover .fieldTabPosition option:gt(0)").remove();
			
			if(isEdit)var editAppIp =  $(this).parents('.tabIcons').data('app-id');
			
			$(this).parents(".fanPageTabs").find('.tabIcons').each(function(){
				if(!isEdit || (isEdit && editAppIp && $(this).data('app-id') && editAppIp != $(this).data('app-id'))){
					$(".popover .fieldTabPosition").append($('<option />').attr('value', $(this).data('position')).text('Before: '+ $(this).data('name')));
				}
				
			})		
			
			
			
			$(".popover .fieldTabPosition").prepend($('<option />').attr('value', $(this).parents(".fanPageTabs").data('last-position') || '').text('Bottom Position'));		
			
			
			$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
		
				event.preventDefault();
				
				$('.popover .addForm')[0].reset();
				$(this).popover('hide');
				
			}, this));
			
			$('.popover .addCancelTask').off("click").on("click", $.proxy(function(event){
		
				event.preventDefault();
				
				$(".popover .form-in-progress").show();
				$(".popover .form-actions").hide();
				
				$.ajax({
					url: '/dashboard/fb-tab/cancelAddPageTab',
					type: 'DELETE',
					dataType: 'json',
					data: {
						uuid: $('.popover .addCancelTask').data('uuid'), 
						pid: window['pid']
					},
					success: $.proxy(function(response) {
						
						$(".popover .form-in-progress").hide();
						$(".popover .form-actions").show();
																			
						if(response.error){
							
							$(".popover .cancelTabErrorMsg").text(response.error);
							return;
							
						}
						
						
						if(response.id){
																	
							$(this).popover('hide');
							
							app.fbTab();
							
							return Growl.warn({
								title: 'Task canceled!',
								text: 'Schedule to add page tab has been canceled.'
							});
						}
						
						
						
					}, this),
					 statusCode: {
						500: function(xhr) {
							$(".popover .form-in-progress").hide();
							$(".popover .form-actions").show();
							return Growl.error({
								title: 'An error occurred!',
								text: xhr.responseJSON.error
							});
						},
						503: function(xhr) {
							$(".popover .form-in-progress").hide();
							$(".popover .form-actions").show();
							return Growl.error({
								title: 'Service Unavailable',
								text: 'Changes Locked.'
							});
						}
					  }
				})
								
			}, this));
			
			
			$(".popover .addForm").on("submit",  $.proxy(function(event){
				
				event.preventDefault();
				
				$(".popover .form-in-progress").show();
				$(".popover .form-actions").hide();
				$.ajax({
					url: '/dashboard/fb-tab/addTab',
					type: 'POST',
					dataType: 'json',
					data: {id: $(this).parents('.fanPageThumb').data('id'), 
					pid: window['pid'], 
					accessToken: $(this).parents('.fanPageThumb').data('access_token'),
					fieldTabIcon: $(".popover .addForm").find('.fieldTabIcon').val(),
					fieldTabName: $(".popover .addForm").find('.fieldTabName').val(),
					fieldTabPosition: $(".popover .addForm").find('.fieldTabPosition').val(),
					fieldMakeLandingTab: $(".popover .addForm").find('.fieldMakeLandingTab').is(":checked"),
					scheduleAddTime: $(".popover .addForm").find('.addTabSchedule').data('datevalue'),
					scheduleTimezone: new Date().getTimezoneOffset()/60
					},
					success: $.proxy(function(response) {
						
						$(".popover .form-in-progress").hide();
						$(".popover .form-actions").show();
																			
						if(response.error){
							
							$(".popover .addTabErrorMsg").text(response.error);
							return;
							
						}
						
						
						if(response.id){
																	
							$(this).popover('hide');
							
							app.fbTab();
							
							if(response.scheduled){
								
								return Growl.success({
									title: 'Successfully scheduled!',
									text: 'Page tab will be added to the Facebook page at the scheduled time.'
								});
								
							}else{
								
								return Growl.success({
									title: 'Successfully added!',
									text: 'Page tab has been successfully added to Facebook page.'
								});
								
							}
							
						}
						
						
						
					}, this),
					 statusCode: {
						500: function(xhr) {
							$(".popover .form-in-progress").hide();
							$(".popover .form-actions").show();
							return Growl.error({
								title: 'An error occurred!',
								text: xhr.responseJSON.error
							});
						},
						503: function(xhr) {
							$(".popover .form-in-progress").hide();
							$(".popover .form-actions").show();
							return Growl.error({
								title: 'Service Unavailable',
								text: 'Changes Locked.'
							});
						}
					  }
				})
				
				
			}, this));

		
			$(".popover .browseComputer").fileUpload({
				url: "/dashboard/pages/uploadImage?pid="+window['pid'], 
				progressbar: {
				  url: "/dashboard/pages/uploadImage",
				  barColor: "#62c462",
				  stripSpeed: 2, 
				  moveSpeed: 1.6,
				  width: 106,
				  height: 10
				},
				allowedFileTypes: '.jpg, .jpeg, .gif, .png',
				hiddencallback: $(".popover .fieldTabIcon"),
				maxFileSize: 1, 
				onBeforeUpload: function(){
					$(".popover .uploadErrorMsg").empty();	
					$(".popover .browseComputer").hide();
				  },
				onSuccess: function(){
							
				  }, 
				callback: function(data){	
				
					$(".popover .browseComputer").val('').show();
				
				   },
				error: function(error){
					$(".popover .browseComputer").val('').show();
					$(".popover .uploadErrorMsg").text(error);
				 },
				mobileDetect: false
				
			});
			
		})
	
	},
	
	initLinkedPages: function(){
		var el = this.$el;	
		var linkedPages = this.collection.pluck('linkedPage')[0];
		var ownAppIds = this.collection.pluck('ownAppIds')[0];
		
		var view = this;
		
		$(".linkedFanPages .fanPageThumb",el).remove();
				
		for(var i=0;i<linkedPages.length;i++){
			
			var thumbTemplate = $($(".thumbTemplate", el).html());
			
			thumbTemplate.data('id',linkedPages[i].id);
			thumbTemplate.data('access_token',linkedPages[i].access_token);
			
			thumbTemplate.find('.fanPagePicture').css("background-image","url(https://graph.facebook.com/"+linkedPages[i].id+"/picture?return_ssl_resources=1&width=160&height=160&access_token="+linkedPages[i].access_token+")");
			
			var thumbTemplates = [];
			
			thumbTemplates[linkedPages[i].id] = thumbTemplate;			
			
			$.getJSON("https://graph.facebook.com/"+linkedPages[i].id, {access_token: linkedPages[i].access_token}, $.proxy(function(response){
				
				var pageId = response.id;
				var accessToken = _.findWhere(linkedPages, {id: pageId}).access_token;
				
				$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
					return $(this).data('id') == pageId;
				
				}).find('.fanPageTitle').text(response.name);
				
				$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
					return $(this).data('id') == pageId;
								
				}).find('.fanPageTabs').data('last-position', '');
				
				
				$.getJSON("https://graph.facebook.com/"+pageId+"/tabs", {access_token: accessToken}, function(response){
										
					var tabTemplate = $(".thumbTemplate .fanPageThumb", el).find('.fanPageTabs .tabIcons').eq(0);
					
					response.data = _.sortBy(response.data, function(responseDataEl, key){
					
						return responseDataEl.position;
						
					})
					
					$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
						return $(this).data('id') == pageId;
								
					}).find('.fanPageTabs .tabIcons').remove();
										
					for(r in response.data){
						
						if(response.data.hasOwnProperty(r)){
							
							$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
								return $(this).data('id') == pageId;
								
							}).find('.fanPageTabs').data('last-position', Math.max((parseInt(response.data[r].position)+1), $(".linkedFanPages .fanPageThumb", el).filter(function(){
				
								return $(this).data('id') == pageId;
								
							}).find('.fanPageTabs').data('last-position') || 0));
													
							if(response.data[r].application && response.data[r].application.id && response.data[r].id.indexOf('app_') !== -1){
								
								var tabTemplate = $(tabTemplate.clone());
								
								tabTemplate.find('.tabIconLink').css("background-image","url("+response.data[r].image_url+")");
								tabTemplate.data('tab-id', response.data[r].id);
								tabTemplate.data('app-id', response.data[r].application.id);
								tabTemplate.data('app-namespace', response.data[r].application.namespace);
								tabTemplate.data('app-name', response.data[r].application.name);
								tabTemplate.data('name', response.data[r].name);
								tabTemplate.data('tab-link', response.data[r].link);
								tabTemplate.data('page-custom-name', response.data[r].application.custom_name);
								tabTemplate.data('position', response.data[r].position);
								tabTemplate.data('image_url', response.data[r]['image_url']);
								tabTemplate.data('is_non_connection_landing_tab', response.data[r]['is_non_connection_landing_tab']);
								
																
								tabTemplate.find('.tabIconLink').on("click", function(e){
								
									e.preventDefault();
									window.open($(this).parents('.tabIcons').data('tab-link'))
									
								
								});
								
								
								tabTemplate.attr('data-toggle', "tooltip").attr('data-original-title', response.data[r].name).tooltip();
								
								if(ownAppIds && ownAppIds.indexOf(response.data[r].application.id) !== -1){
									
									$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
										return $(this).data('id') == pageId;
								
									}).find('.fanPageTabs .tabAddIcon').hide();
									
									view.initPopoverManageTab(tabTemplate.find('.editTab'), true);
									
									tabTemplate.on("mouseenter", function(){
									
										$(this).find('.editTab').show();
										
									}).on("mouseleave", function(){
									
										$(this).find('.editTab').hide();
										
									})
									
								}else tabTemplate.find('.editTab').hide();

																
								
								$(".linkedFanPages .fanPageThumb", el).filter(function(){
				
									return $(this).data('id') == pageId;
								
								}).find('.fanPageTabs .tabAddIcon').before(tabTemplate);
								
							}
							
						}
						
					}
								
								
				});

				
			},linkedPages));
			
			
			var addTabIcon = thumbTemplates[linkedPages[i].id].find('.tabAddIcon');
			
			
			this.initPopoverManageTab(addTabIcon);
				
				
			
			thumbTemplates[linkedPages[i].id].find('.unlinkFanPage').on("click", function(event){
				
				event.preventDefault();
				
				$.ajax({
					url: '/dashboard/fb-tab/unlinkFanPage',
					type: 'DELETE',
					dataType: 'json',
					data: {value: $(this).parents('.fanPageThumb').data('id'), pid: window['pid']},
					success: $.proxy(function(response) {
										
						if(response.error){
							
							return Growl.error({
								title: 'An error occurred!',
								text: 'Please refresh this page and try again.'
							});
							
						}
						
						if(response.id){
							
							$(this).parents('.fanPageThumb').remove();
							
							return Growl.warn({title: 'Page unlinked', text: 'Fan page has been unlinked from this promotion'});
							
						}
						
						
						
					}, this),
					 statusCode: {
						500: function(xhr) {
							return Growl.error({
								title: 'An error occurred!',
								text: xhr.responseJSON.error
							});
						}
					  }
				})
				
			});
			
			$(".linkedFanPages", el).append(thumbTemplates[linkedPages[i].id]);
			
			
			
		}
	},
	
	initFanGateURLs: function(){
		
		var el = this.$el;
		var likeGateURL = this.collection.pluck('likeGateURL')[0];
		var likeGate = this.collection.pluck('likeGate')[0];
		
		
		$(".fanGateURL-disabled", el).tooltip({container:'.main-content'});

	 
	 	$('.fanGateURL, .fanGateURL-disabled', el).each(function(){
		
			if($(this).data('for') && likeGateURL[$(this).data('for')]){
				
				$(this).data('value', likeGateURL[$(this).data('for')]);
				
			}
			
			if($(this).data('for') && likeGate && likeGate.indexOf($(this).data('for')) === -1){
				
				$(this).hide();
				
			}
			
		});
		
		$('.fanGateURL', el)
		.editable({
			showbuttons: true,
			url: '/dashboard/fb-tab/fanGateURL',
			params: function(params) {
				params.pid = window['pid'];
				params['type'] = $(this).data('for');
				return params;
			},
			ajaxOptions: {
			  type: 'PUT'
			},
			type: 'text',
			validate: function(newValue) {
					
				var testObj = newValue.replace(/^http(s)?:\/\//, '').split('/');
					
				if(!/^(http(s)?:\/\/)?(www\.)?facebook\.com$/.test(testObj[0]) || typeof testObj[1] == 'undefined' || $.trim(testObj[1]) == ''){
				
					return 'Please enter a valid Facebook fan page URL.';	
				
				}
				
				
			},
			display: function(value){
								
				var fbPageNamespaceObj = value.replace(/^http(s)?:\/\//, '').split('/');
				
				var fbPageNamespace = fbPageNamespaceObj[1];
				
				if(fbPageNamespace == 'pages'){
				
					fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
					
					var searchPageAccessToken = function(retry){
						
						var returnValue = '';
					
						$(".fanPageThumb").each(function(){
						
							if($(this).data('id') && $(this).data('id') == fbPageNamespace){
														
								if($(this).data('access_token') && fbPageNamespace.indexOf('?access_token') === -1){
								
									 returnValue = $(this).data('access_token');
									 fbPageNamespace = fbPageNamespace+'?access_token='+$(this).data('access_token');
									
								}
							}
							
						})	
						
						if(retry)return returnValue;
						
							
					}
					
					searchPageAccessToken();
					
					
				}
				
				var displayObj = $(this);
				
				if(fbPageNamespace){
										
					$.ajax({
						url: "https://graph.facebook.com/"+fbPageNamespace,
						type: 'GET',
						dataType: 'json',
						tryCount : 0,
						retryLimit: 5,
						success: $.proxy(function(data) {
											
							if(data && data.name){
								$(this).text(data.name).removeClass('editable-empty');
							}else{
								$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');
							}
												
							
						}, this),
						statusCode: {
							400: function(xhr) {
								
								 this.tryCount++;
								 
								 if(this.tryCount < this.retryLimit){
									 
									displayObj.html('Getting Page Info..').removeClass('editable-empty');
									 
									 if(typeof searchPageAccessToken == 'function'){
										 var accessToken = searchPageAccessToken(true);
									
										 if(accessToken){
											 if(typeof this.data == 'undefined')this.data = {};
											 this.data['access_token'] = accessToken;
										 }
										 setTimeout($.proxy(function(){$.ajax(this)}, this), 300);
									 }else{
									
										displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
										 
									 }
								 }else{
									 
									displayObj.html('<i class="icon-warning-sign"></i> Page Not Published').addClass('editable-empty');
									 
								 }

							},
							404: $.proxy(function(xhr) {
								$(this).html('<i class="icon-warning-sign"></i> Page Not Found').addClass('editable-empty');

							}, this)
						  }
					})
														
				}else{
				
					$(this).text('Enter a fan page URL');	
					
				}
				
			},
			success: function(response, newValue){
				
				if(response.error){
					
					return response.error;	
					
				}
								
				$(this).data('value', newValue);
				
				
			}
		})
		.addClass('initialized');

		
		
	},
	
	initWarnings: function(){
		
		var el = this.$el;
		
		var customDomainWarning = this.collection.pluck('customDomainWarning')[0];
		
		if(customDomainWarning == true){
		
			$(".customDomainWarning", el).show();
			
		}
		
	},
	
	initLearnMorePopover: function(){
		var el = this.$el;	
		$('.learnMorePopover', el).popover().on('shown.bs.popover', function(){
		
			$(this).data('bs.popover')['$tip'][0].scrollIntoView();
			
		})
	},
	
    render: function () {
		
        $(this.el).html(this.template());
		var el = this.$el;	
		
		this.removeNonselectedComponents();
		this.initLikeGate();
		this.initFanGateURLs();
		this.initAllowAccess();
		this.initCollectionDemographicData();
		this.initTargetAudience();
		this.initEnableCanvasPage();
		this.initLinkedPages();
		this.initHelpers();
		this.initWarnings();
		this.populateCanvasRedirectURLs();
		this.initLearnMorePopover();

		$('.main-content').html(this.el);

		window['genericInit']();	
		
		if(!window.fbAsyncInit)this.initFB();
		
		 	
		var el = this.$el;	
	 		
        return this;
    }
	
});


})(jQuery);