
window.PromoDashboardAnalyticsView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	events: {
		
		
	},
	
	bindViewMetricChart: function(obj){
		
		obj.on("click", $.proxy(function(e){
			
			e.preventDefault();
			
			this.initIndividualMetricChart($(e.target).parents('.textReport').data('id'),$(e.target).parents('.textReport').data('conditions'),$(e.target).parents('.textReport').data('name'),$(e.target).parents('.textReport').data('desc'));
			
		},this))
		
	},
	
	initIndividualMetricChart: function(id, conditions, name, desc){
		
		$(".metricDetailChartLoading").show();
		$("#metricDetailChart").empty();
		
		$.post('/dashboard/analytics/metricsAuth', function(){
			
			var results = {};
						
			var socket = io.connect('https://promometrics.dja.com:11747/');
			socket.removeAllListeners();
			socket.emit('getMetricDetail', {
				pid: window['pid'],
				m: id,
				conditions: conditions
			});
			
			socket.on('charterror', function(data){
				
				$(".metricDetailChartLoading").hide();
				$("#metricDetailChart").text('Unable to load chart.');	
				
			})
				
			
			socket.on('chartdata', function (data) {
			
				if(typeof results[data.m] == 'undefined')results[data.m] = {};
				if(typeof results[data.m+'_chartdata'] == 'undefined')results[data.m+'_chartdata'] = {};
				if(typeof results[data.m+'_chartdata'][data.t] == 'undefined')results[data.m+'_chartdata'][data.t] = {};
				
				if(!results[data.m+'_progress'] && data.l)results[data.m+'_progress'] = data.l;	
							
							
				if(data.id && data.m && data.filterIndex){	
							
					if(typeof results[data.m][data.filterIndex] == 'undefined')results[data.m][data.filterIndex] = {};
								
					results[data.m][data.filterIndex][data.id] = data.t;
					if(typeof results[data.m+'_chartdata'][data.t][data.id] == 'undefined'){
						results[data.m+'_chartdata'][data.t][data.id] = 0;
					}
					results[data.m+'_chartdata'][data.t][data.id]++;
					
				}
				
			});
			
			
			
			socket.on('chart', function (data) {
								
				if(data.multiFilter){
					
					data.complete = [];
					data.unique = [];
															
					var computedResult={};
					
					var firstKey;
											
					for(var i in results[id]){
						
						if(typeof firstKey == 'undefined'){
							firstKey=i;
							computedResult = results[id][firstKey];
						}
						
						if(typeof results[id][(parseInt(i)+1)] != 'undefined'){
							
							computedResult = _.pick( results[id][firstKey], Object.keys(results[id][(parseInt(i)+1)]))
						}
						
					}
					
					for(var i in results[id+'_chartdata']){
					
						results[id+'_chartdata'][i] = _.pick(results[id+'_chartdata'][i], Object.keys(computedResult));
						
					}
					
					for(var i in results[id+'_chartdata']){
					
						results[id+'_chartdata'][i] = _.values(results[id+'_chartdata'][i]);
						var total = 0;
						$.each(results[id+'_chartdata'][i],function() {
							total += this;
						});
						
						data.complete.push([parseInt(i), total]);
						
						data.unique.push([parseInt(i), Object.keys(results[id+'_chartdata'][i]).length]);
						
					}
					
					
				}
											
				$(".metricDetailChartLoading").hide();
					
				var sortFunc = function(a,b){
					if (a[0] < b[0])
					 return -1;
					if (a[0] > b[0])
						return 1;
					return 0;	
				};
				
				data.unique.sort(sortFunc);
				
				data.complete.sort(sortFunc);
				
				
				var fillDateGaps = function(data){
										
					for(var i in data){
											
						if(i>0 && (data[i][0] - data[i-1][0]) > 86400000){
							
							var days = (data[i][0] - data[i-1][0]) /86400000;
							
							for(var d=1;d<days; d++){
								data.splice(i+d-1,0,[data[i-1][0]+(86400000*d), 0])
							}
							
							
							
						}
						
						
					}
					
					return data;
					
				}
				
				data.unique = fillDateGaps(data.unique).sort(sortFunc);
				data.complete = fillDateGaps(data.complete).sort(sortFunc);
				
					
				$('#metricDetailChart').highcharts('StockChart', {
					chart: {
					},
		
					rangeSelector: {
						selected: 1
					},
		
					title: {
						text: name
					},
					
					 credits: {
						  enabled: false
					  },
					
					series: [{
						name: 'Unique Entries',
						data: data.unique,
						type: 'spline',
						tooltip: {
							valueDecimals: 0
						}
					},{
						name: 'All Entries',
						data: data.complete,
						type: 'spline',
						tooltip: {
							valueDecimals: 0
						}
					}]
				});		
					
				
			})
			
			
		})
		
			
	},
	
	initMetricsDateRangeMenu: function(){
				
		
		var dateRangePickerObj =  {
		  showDropdowns: true,
		  opens: 'right',
	      ranges: {
			 'All (Up to 12 Months)' : [moment().subtract('year', 1), moment()],
	         'Today': [moment(), moment()],
	         'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
	         'Last 7 Days': [moment().subtract('days', 6), moment()],
	         'Last 30 Days': [moment().subtract('days', 29), moment()],
	         'This Month': [moment().startOf('month'), moment().endOf('month')],
	         'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
	      }
	    }
	
		if(this.calendarRange && this.calendarRange.start && this.calendarRange.end){
			
			$('#reportrange span').html(moment(this.calendarRange.start).format('MMMM D, YYYY') + ' - ' + moment(this.calendarRange.end).format('MMMM D, YYYY'));
			dateRangePickerObj.startDate = new Date(this.calendarRange.start);
			dateRangePickerObj.endDate = new Date(this.calendarRange.end);
			
			
		}else{
		
			dateRangePickerObj.startDate = moment().subtract('year', 1);
			dateRangePickerObj.endDate = moment();
			
		}
	
		$('#reportrange').daterangepicker(dateRangePickerObj,
		   $.proxy(function(start, end) {
			
				if($(".textReportNumber .icon-spinner:visible").length > 0){
				
					Growl.warn({
						title: 'An error ocurred',
						text: 'Please wait until the current report finishes loading'
					});	
					
					return false;
					
				}
			
		        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
						
				this.calendarRange.start = new Date(start.format()).getTime();
				this.calendarRange.end = new Date(end.format()).getTime();
				$.post('/dashboard/analytics/metricsAuth', $.proxy(function(){

					this.populateReports();
					
				},this));
		    },this)
		   
		);
		
		
	},
	
	calendarRange: {
		
	},

	initGoogleAnalytics: function(){
		
		$('#googleAnalyticsCode').data('original-title', googleAnalyticsCode).editable({
			type: 'text',
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.googleAnalyticsCode = params.value;
				return params;
			},
			name: 'googleAnalyticsCode',
			title: 'Enter Google Analytics Code',
			url: '/dashboard/analytics/googleAnalyticsCode',
			success: function(response, newValue) {
       			if(response.error) return response.error;
				if(!response.id) return 'Bad Request';
  		  	}
		});
		
		
	},
	
	removeOrCondition: function(conditionItem){
		
		var itemsLeft = conditionItem.parents('.conditionItemsHolder').find('.conditionItem').length;
		var mainConditionContainer = conditionItem.parents('.well');
		conditionItem.remove();
		
		if(itemsLeft == 1)mainConditionContainer.remove();
		
		
	},
	
	basicMetrics: {
		
		'Platform' : {
			'microsite': 'Microsite',
			'facebook-page-tab' : 'Facebook Tab',
			'facebook-canvas' : 'Facebook Canvas',
			'mobile' : 'Mobile'
		
		}
	},
	
	addOrMetricCondition: function(addMetricTemplate, orConditionTemplate){
		
		var el = this.$el;	
		var columns = this.collection.pluck('columns')[0];
		
		if(typeof columns == 'object'){
		
			for(var pageId in columns){
							
				if(typeof columns[pageId]['cols'] == 'object'){
					
					var optgroup = $('<optgroup />').attr('label', columns[pageId].name || 'Untitled Page');
					
					for(var fieldId in columns[pageId]['cols']){
						
						var excludeColTypes = ['prefill-with-facebook','submit-button','recaptcha','phone-field'];
						
						if(excludeColTypes.indexOf(columns[pageId]['cols'][fieldId]['type']) === -1){
						
							var option = $("<option />").attr('name', fieldId).attr('value', pageId+':'+columns[pageId]['cols'][fieldId].panelId+':'+fieldId).text(columns[pageId]['cols'][fieldId].name || 'Unnamed Field');
							option.attr('data-type', columns[pageId]['cols'][fieldId]['type']);
							if(columns[pageId]['cols'][fieldId]['value'])option.data('value', columns[pageId]['cols'][fieldId]['value']);
							
							optgroup.append(option);
							
						}
											
					}
										
					orConditionTemplate.find(".columnsMetric").append(optgroup);
				}
					
				
			}
			
		}
		
		if(typeof this.basicMetrics == 'object'){
			
			var optgroup = $('<optgroup />').attr('label', 'Other Metrics');
		
			for(var metricGroupTitle in this.basicMetrics){
							
				var option = $("<option />").attr('value', metricGroupTitle).text(metricGroupTitle);
				
				option.data('type', 'custom-basic');
				option.data('value', this.basicMetrics[metricGroupTitle]);
				optgroup.append(option);
				
				orConditionTemplate.find(".columnsMetric").append(optgroup);
			}
			
			
		}
		
		
		orConditionTemplate.find(".removeCondition").on("click", false).on("click", $.proxy(function(){
			
			this.removeOrCondition($(event.target).parents('.conditionItem'));
			
		},this));
		
		orConditionTemplate.find(".columnsMetric").select2();
		orConditionTemplate.find(".typeCheckboxOnly").find("select").select2({minimumResultsForSearch: -1});	
		orConditionTemplate.find(".removeCondition, .addOrCondition, .addMainCondition").tooltip();
		orConditionTemplate.find(".typeDOBDatepicker", el).datetimepicker({
		  format: 'yyyy-mm-dd',
		  todayBtn: false,
		  startView: 4,
		  minView: 2,
		  autoclose: true,
		  endDate: new Date(),
		  startDate: new Date('1900-01-02')
		});
		
		orConditionTemplate.find(".columnsMetric").on("change", function(){
		
			var fieldType = $(this).find("option:selected").data('type');
			var fieldValue = $(this).find("option:selected").data('value');
			
			$(this).parents('.conditionItem').find(".columnsMetricComparator").off("change");
			
			
			if(fieldType == 'checkbox'){
			
				$(this).parents('.conditionItem').find(".typeValue").hide();
				$(this).parents('.conditionItem').find(".typeCheckboxOnly").show();
				$(this).parents('.conditionItem').find(".typeNormalComparator").prop('disabled', true);
				
				
			}else if(fieldType == 'date-of-birth'){
				
				$(this).parents('.conditionItem').find(".typeNormalComparator").prop('disabled', false);
				$(this).parents('.conditionItem').find(".typeDOBDisable").prop('disabled', true);
				$(this).parents('.conditionItem').find(".typeValue").hide();
				$(this).parents('.conditionItem').find(".typeDOBOnly").show();
				$(this).parents('.conditionItem').find(".typeRegexComparator").prop('disabled', true);
								
			}else if(fieldType.indexOf('drop-down') !== -1 || fieldType == 'radio-button'  || fieldType == 'custom-basic'){
				
				$(this).parents('.conditionItem').find(".typeNormalComparator").prop('disabled', true);
				$(this).parents('.conditionItem').find(".typeValue").hide();
				$(this).parents('.conditionItem').find(".typeSelectOnly").show();
				$(this).parents('.conditionItem').find(".typeSelectOnlyChoices").empty();
				$(this).parents('.conditionItem').find(".typeRegexComparator").prop('disabled', false);
				
				$(this).parents('.conditionItem').find(".columnsMetricComparator").on("change", function(){
					
					if($(this).parents('.conditionItem').find(".typeRegexComparator").is(":selected")){
					
						$(this).parents('.conditionItem').find(".typeValue").hide();
						$(this).parents('.conditionItem').find(".typeNormal").show();
						
					}else{
					
						$(this).parents('.conditionItem').find(".typeValue").hide();
						$(this).parents('.conditionItem').find(".typeSelectOnly").show();
						
					}
					
				}).trigger("change");
				
				if(fieldValue && fieldType == 'custom-basic'){
					
					$(this).parents('.conditionItem').find(".typeRegexComparator").prop('disabled', true);
					
					var data = []
										
					for(var i in fieldValue){
						
						data.push({id: i, text: fieldValue[i]})
						
					}
												
					$(this).parents('.conditionItem').find(".typeSelectOnlyChoices")
					.select2('data', null)
					.select2({
						multiple: true,
						data: data
					})
					
				}
				
				
				if(fieldValue && fieldType != 'custom-basic'){
					
					if(fieldType == 'state-drop-down'){
						fieldValue = fieldValue.split(',');
												
						var arr = [];
						for(var f in fieldValue){
						
							arr.push(fieldValue[f].split('-')[0]);
							
						}
						
						
						$(this).parents('.conditionItem').find(".typeSelectOnlyChoices").select2('data', null).select2({tags:arr});
						
						
					}
					if(fieldType == 'drop-down' || fieldType == 'radio-button'){
						fieldValue = fieldValue.replace(/\r\n/g, "\n").split("\n");
																	
						
						$(this).parents('.conditionItem').find(".typeSelectOnlyChoices").select2('data', null).select2({tags:fieldValue});
						
						
					}
					if(fieldType == 'country-drop-down'){
						fieldValue = fieldValue.split(',');
												
						var arr = [];
						for(var f in fieldValue){
						
							arr.push(fieldValue[f].split('|')[0]);
							
						}
						
						
						$(this).parents('.conditionItem').find(".typeSelectOnlyChoices").select2('data', null).select2({tags:arr});
						
						
					}
					
				}
				
								
				
			}else{
				
				$(this).parents('.conditionItem').find(".typeValue").hide();
				$(this).parents('.conditionItem').find(".typeNormal").show();
				$(this).parents('.conditionItem').find(".typeNormalComparator").prop('disabled', false);
			}	
			
			if($(this).parents('.conditionItem').find(".columnsMetricComparator").find("option:selected").is(":disabled")){
			
				$(this).parents('.conditionItem').find(".columnsMetricComparator").find("option:not(:disabled)").eq(0).prop("selected", true);
				
			}
			
		})
		
		addMetricTemplate.find('.conditionItemsHolder').append(orConditionTemplate);
		
		return addMetricTemplate;
		
		
	},
	
	bindAddOrConditionButton: function(addOrConditionButton){
		
		var el = this.$el;	
		var addMetricTemplate = $($(".addMetricTemplate", el).html());
		
		addOrConditionButton.off("click").on("click", $.proxy(function(event){
			
			var addOrMetricTemplate = this.addOrMetricCondition($(event.target).parents('.well'), $($('.addOrMetricConditionTemplate', el).html()));
						
			$(event.target).parents('.conditionItemsHolder').append(addOrMetricTemplate);
			
		}, this));
		
		
	},
	
	addMainMetricCondition: function(){
		
		var el = this.$el;	
						
		var addMetricTemplate = $($(".addMetricTemplate", el).html());
		
		this.addOrMetricCondition(addMetricTemplate, $($('.addOrMetricConditionTemplate', el).html()));
		
		this.bindAddOrConditionButton(addMetricTemplate.find('.addOrCondition'));
		
		$(".metricMainConditionHolder", el).append(addMetricTemplate)
		
	},
	
	bindAddNewMetricBttn: function(){
		
		var el = this.$el;	
		$(".addNewMetricBttn", el).on("click", $.proxy(function(e){
			
			e.preventDefault();
			
			var model = this.model;	
					
			model.set({'path': '/addMetric' });
			var callback = $.proxy(function(response){
				
				if(response.error){
					
					this.collection.set({path: ''});
					this.collection.fetch({ data: $.param({pid: window['pid']})});
					
				
					$("#gritter-notice-wrapper").remove();						
					return Growl.warn({
						title: 'Please correct the following:',
						text: response.error
					});
					return;	
					
				}
							
				var successCallback = $.proxy(function(){
					
					this.collection.set({path: ''});
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
					
						this.populateReports();
							
					}, this)});
					
					return Growl.success({
						title: 'Report added!',
						text: 'The requested report has been added and is now available for viewing.'
					});
			
	
				},this);
				
			
				successCallback();
				
				
			},this)
			
			var saveData = {};
			
			saveData.metricName = $(".metricName").val();
			saveData.metricDesc = $(".metricDesc").val();
			
			var data = [];
			
			$(".metricMainConditionHolder .conditionItemsHolder").each(function(){
			
				var conditions = [];
				
				$(this).find('.conditionItem').each(function(index, element) {
                    
					conditions.push({
						
						columnsMetric : $(this).find("select.columnsMetric").val(),
						columnsMetricComparator: $(this).find("select.columnsMetricComparator").val(),
						typeValue: ($(this).find(".typeValue:visible").hasClass('typeNormal') || $(this).find(".typeValue:visible").hasClass('typeDOBOnly')) ? $(this).find(".typeValue:visible").find('input').val() : $(this).find(".typeValue:visible").hasClass('typeCheckboxOnly') ? $(this).find(".typeValue:visible").find('select').val() : $(this).find(".typeValue:visible").find('input.select2-offscreen').select2('val') 
						
					})
					
                });
				
				data.push(conditions);
					
				
			})
			
			saveData.data = data;
			
			
			model.sync('update', model, { data: $.param({pid: window['pid'], value: saveData}), success: callback, fail: this.updateFail });
		
			
		}, this))
		
	},
	
	initMetricsColMenu: function(){
		
		var el = this.$el;	
		
		this.addMainMetricCondition();
		this.bindAddNewMetricBttn();
		
		$(".addMainCondition", el).on("click", false).on("click", $.proxy(function(){
			this.addMainMetricCondition()
		}, this));
		
				
	},
	
	updateFail: function(response){
		
		$("#gritter-notice-wrapper").remove();						
		return Growl.error({
			title: 'An error occurred!',
			text: 'Please refresh this page and try again.'
		});
								
	},
	
	bindDeleteTextReport: function(obj){
		
		obj.on("click", $.proxy(function(e){
			
			e.preventDefault();
			
			$.ajax({
				url: '/dashboard/analytics/deleteMetric',
				type: 'DELETE',
				dataType: 'json',
				data: {
					metricId: obj.parents('.textReport').data('id'), 
					pid: window['pid']
				},
				success: $.proxy(function(response) {
					
																		
					if(response.error){
						
						return Growl.warn({
							title: 'An error occurred',
							text: response.error
						});
						
					}
					
					this.collection.set({path: ''});
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
					
						this.populateReports();

							
					}, this)});
					return Growl.warn({
						title: 'Report deleted!',
						text: 'The report has been successfully deleted.'
					});
					
					
					
				}, this),
				 statusCode: {
					500: function(xhr) {
						return Growl.error({
							title: 'An error occurred!',
							text: xhr.responseJSON.error
						});
					},
					503: function(xhr) {
					
						return Growl.error({
							title: 'Service Unavailable',
							text: 'Changes Locked.'
						});
					}
				  }
			})
											
		}, this))
		
	},
	
	
	populateReports: function(){
		
		var el = this.$el;	
		var metrics = this.collection.pluck('metrics')[0];
		$(".textReportContainer", el).empty();
		
		var results = {};
		var intervalObj = {};
		var intervalFunc = {};
				
		var socket = io.connect('https://promometrics.dja.com:11747/');
		
		socket.removeAllListeners();
		
		socket.on('complete', function (data) {			
						
			if(typeof intervalFunc[data.id] == 'function'){
				intervalFunc[data.id](true);
			}else{
				
					$(".textReportContainer", el).find('.textReport').filter(function(index) {
				
					return $(this).data('id') == data.id
				
				}).find('.textReportNumber').find('.count').text('Error');
				
			}
			
			$(".textReportContainer", el).find('.textReport').filter(function(index) {
				
				return $(this).data('id') == data.id
			
			}).find('.textReportNumber').find('.count').addClass('headlineNumber').end().find('.icon-spinner').hide();
			
		})
			
		socket.on('count', function (data) {
													
			if(data.count && data.m)results[data.m] = data.count;
			intervalFunc[m]();
		
			
		})
		
		socket.on('data', function (data) {
			
			if(typeof results[data.m] == 'undefined')results[data.m] = {};
			
			if(!results[data.m+'_progress'] && data.l)results[data.m+'_progress'] = data.l;				
						
			if(data.id && data.m && data.filterIndex){	
						
				if(typeof results[data.m][data.filterIndex] == 'undefined')results[data.m][data.filterIndex] = {};
							
				results[data.m][data.filterIndex][data.id] = null;					
				
			}
			
		});
			
	
		var getMetric = $.proxy(function(m, conditions){
								
			results[m] = {};
																	
			var counter = $(".textReportContainer", el).find('.textReport').filter(function(index) {
				
					return $(this).data('id') == m
				
				}).find('.textReportNumber').find('.count')
				
				
			if(counter.length == 0){
			
				return;	
			}
			
			socket.emit('getMetric', {
				pid: window['pid'],
				m: m, 
				conditions: conditions, 
				start: this.calendarRange && this.calendarRange.start ? this.calendarRange.start : 0,
				end: this.calendarRange && this.calendarRange.end ? this.calendarRange.end : 0
			});
			
			socket.on('error', function (data) {
				
				$(".textReportContainer").find('.textReport').filter(function(index) {
				
					return $(this).data('id') == m
				
				}).find('.textReportNumber').text('Error');
				
				
			})
			
			intervalFunc[m] = function(end){
				
				if(counter.data('counter'))counter.data('counter').stop();
												
				if(typeof results[m] == 'object'){
										
					if(end){
																								
						var computedResult={};
						
						var firstKey;
												
						for(var i in results[m]){
							
							if(typeof firstKey == 'undefined'){
								firstKey=i;
								computedResult = results[m][firstKey];
							}
							
							if(typeof results[m][(parseInt(i)+1)] != 'undefined'){
								
								computedResult = _.pick( results[m][firstKey], Object.keys(results[m][(parseInt(i)+1)]))
							}
							
						}
									
						var resLen = Object.keys(computedResult).length;
						var hasPercentage = false;
											
					}else{						
					
						var resLen = Math.round((Object.keys(results[m]).length * 100) / results[m+'_progress']);
						var hasPercentage = true;
						
					}
					
					var animateDuration = end ? 0 : 3000;
					
				}else{
															
					var resLen = parseInt(results[m]);
					var animateDuration = end ? 0 : 1000;
					var hasPercentage = false;
					
				}
				
				if(isNaN(resLen)){

					resLen=0;
					
				}
					
				if(!counter.data('len') || resLen > counter.data('len') || end){
				
					var text = resLen > 100 && !end ? Math.max(resLen*0.8,counter.data('len')) : resLen;
				
					counter.text(text);
																														
					counter.animateNumbers(resLen, true, animateDuration, "linear", hasPercentage);
					
					counter.data('len',resLen)
					
				}
				
				if(end){
					clearInterval(intervalObj[m]);
					delete intervalObj[m];
					intervalFunc[m] = function(){};
					results[m]={};
				}
			
			}
			
			intervalObj[m] = setInterval(intervalFunc[m], 3000);
			
			
		},this);
		
		for(var m in metrics){
			
			var textReportTemplate = $($(".textReportTemplate").html());
			
			textReportTemplate.find(".textReportName").text(metrics[m].name);
			textReportTemplate.find(".textReportDesc").text(metrics[m].desc);
			this.bindViewMetricChart(textReportTemplate.find(".textReportName"));
						
		
			textReportTemplate.data('id', m);
			textReportTemplate.data('conditions', metrics[m].conditions);
			textReportTemplate.data('name', metrics[m].name);
			textReportTemplate.data('desc', metrics[m].desc);
			
			this.bindDeleteTextReport(textReportTemplate.find('.textReportDelete'));
			
			$(".textReportContainer", el).append(textReportTemplate);
			$.proxy(getMetric(m, metrics[m].conditions, textReportTemplate),this);
			
		}
		
		if($(".textReportContainer .textReport", el).length == 0){
			$(".textReportEmpty", el).show();
		}else $(".textReportEmpty", el).hide();
		
	},
	
	initAnimateNumbers: function(){
		
		$.fn.animateNumbers = function(stop, commas, duration, ease, hasPercentage) {
			return this.each(function() {
				var $this = $(this);
				var start = parseInt($this.text().replace(/,/g, ""));
				commas = (commas === undefined) ? true : commas;
				var obj = $({value: start}).animate({value: stop}, {
					duration: duration == undefined ? 1000 : duration,
					easing: ease == undefined ? "swing" : ease,
					step: function() {
						$this.text(Math.floor(this.value));
						if (commas) { $this.text($this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + (hasPercentage ? '%' : '')); }
					},
					complete: function() {
					   if (parseInt($this.text()) !== stop) {
						   $this.text(stop);
						   if (commas) { $this.text($this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); }
					   }
					}
				});
				
				$this.data('counter', obj)
			});
		};
		
	},
	
    render: function () {
				
		var googleAnalyticsCode = this.collection.pluck('googleAnalyticsCode')[0];
		
		
        $(this.el).html(this.template({googleAnalyticsCode: googleAnalyticsCode}));
	
        $('.main-content').html(this.el);
		window['genericInit']();	
		
		
		this.initAnimateNumbers();
		this.initGoogleAnalytics();
		this.initMetricsColMenu();
		this.initMetricsDateRangeMenu();
		this.populateReports();
				 				
		var el = this.$el;	
				 		
        return this;
    }
	
});


