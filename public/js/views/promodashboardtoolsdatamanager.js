
window.PromoDashboardToolsDataManagerView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	events: {
		
		'click .exportDataBttn' : 'exportData'
		
	},
	
	exportData: function(event, el){
		
		event.preventDefault();
		
		var a         = document.createElement('a');
		if (typeof a.download == "undefined") {
			return Growl.error({
				title: 'Please correct the following:',
				text: 'Your browser does not support HTML5 download attribute. Please upgrade to a HTML5 browser.'
			});
		}

		
		$(".exportDataBttn").addClass('disabled');
		$(".exportConfirm .exportProcessing").show();
		
		$.post('/dashboard/analytics/metricsAuth', $.proxy(function(){
									
			var socket = io.connect('https://promometrics.dja.com:11747/');
			
			socket.removeAllListeners();
			
			var conditionsData = [];
			
			$(".metricMainConditionHolder .conditionItemsHolder").each(function(){
			
				var conditions = [];
				
				$(this).find('.conditionItem').each(function(index, element) {
                    
					conditions.push({
						
						columnsMetric : $(this).find("select.columnsMetric").val(),
						columnsMetricComparator: $(this).find("select.columnsMetricComparator").val(),
						typeValue: ($(this).find(".typeValue:visible").hasClass('typeNormal') || $(this).find(".typeValue:visible").hasClass('typeDOBOnly')) ? $(this).find(".typeValue:visible").find('input').val() : $(this).find(".typeValue:visible").hasClass('typeCheckboxOnly') ? $(this).find(".typeValue:visible").find('select').val() : $(this).find(".typeValue:visible").find('input.select2-offscreen').select2('val') 
						
					})
					
                });
				
				conditionsData.push(conditions);
					
				
			})
				
			socket.emit('exportData', {
				pid: window['pid'],
				groupEntries: ($("#groupUserIntoSameRow").is(":checked")),
				exportIncompleteEntries: ($("#exportIncompleteEntries").is(":checked")),
				conditions: conditionsData, 
				start: this.calendarRange && this.calendarRange.start ? this.calendarRange.start : 0,
				end: this.calendarRange && this.calendarRange.end ? this.calendarRange.end : 0
			});
			
			socket.on('error', function(data){
				$(".exportDataBttn").removeClass('disabled');
				
				return Growl.error({
					title: 'Your current session has expired.',
					text: 'Refresh this page and try the request again.'
				});
				
			})
				
			var results = {};
			var exportData = [];
			
			var totalFilters = 0;
			var dataReceivedCount = 0;
			
			
			socket.on('data', function (data) {
											
				for(var i=0, l=data.length; i<l; i++){							
															
					totalFilters = data[i].l || 0;
					++dataReceivedCount;
					
					$(".exportConfirm .exportProgress").text(dataReceivedCount + ' rows processed');
					
					if(data[i].id && typeof data[i].v == 'object' && typeof data[i].i != 'undefined'){	
																				
						if(typeof results[data[i].i] == 'undefined')results[data[i].i] = {};
									
						results[data[i].i][data[i].id] = data[i].v;			
						
					}
				}
				
			});
			
			socket.on('complete', function(data){
								
				var columns = data.columns;
				console.log('here0');
				columns = _.sortBy(columns, function(obj, key){
					var q = obj.qualifier.split(':');
					obj.key = key;
					return q[0];
				})
				
				columns = _.sortBy(columns, function(obj){
					var q = obj.qualifier.split(':');
					return +q[1];
				})
				
				columns = _.sortBy(columns, function(obj){
					var q = obj.qualifier.split(':');
					return +q[2];
				})
								
				$(".exportConfirm .exportProgress").text('Processing received data...');
		
				var computedResult={};
						
				var firstKey;
				console.log('here1');
				for(var i in results){
					
					if(typeof firstKey == 'undefined' || firstKey == ''){
						firstKey=i;
						computedResult = results[firstKey];
					}
					
					if(typeof results[(parseInt(i)+1)] != 'undefined'){
						
						computedResult = _.pick( results[firstKey], Object.keys(results[(parseInt(i)+1)]))
					}
					
				}
				
				console.log('here2');
				
				if(conditionsData.length > 0){
					
					conditionsData = [];
					results = {};
					exportData = [];
			
					totalFilters = 0;
					dataReceivedCount = 0;
					
					firstKey = '';
															
					socket.emit('exportDataByKeys', {
						pid: window['pid'],
						groupEntries: ($("#groupUserIntoSameRow").is(":checked")),
						exportIncompleteEntries: ($("#exportIncompleteEntries").is(":checked")),
						keys: Object.keys(computedResult), 
						start: this.calendarRange && this.calendarRange.start ? this.calendarRange.start : 0,
						end: this.calendarRange && this.calendarRange.end ? this.calendarRange.end : 0
					});
					
					return;
				
				}
				console.log('here3');
				exportData = _.values(computedResult);
				console.log('here4');
				var columnKeys = {};
				
				var groupEntries = $("#groupUserIntoSameRow").is(":checked");
				var exportIncompleteEntries = $("#exportIncompleteEntries").is(":checked");

												
				if(groupEntries){
															
					columns.push({key: 'last_record_ts', value :'Last Record Timestamp'});
					columnKeys['last_record_ts'] = null;
					columns.push({key: 'entries', value :'No. of Entries'});
					columnKeys['entries'] = null;
					columns.push({key: 'bonusentries', value :'No. of Bonus Entries Earned'});
					columnKeys['bonusentries'] = null;
				}else{
					
					columns.push({key: 'timestamp', value :'Timestamp'});
					columnKeys['timestamp'] = null;
					
				}
				console.log('here5');
				var indexesToRemove = [];
											
				
				for(var i=0, l=exportData.length; i<l; i++){
					
					var exportRowObj = {};

					for(var j=0, jl = exportData[i].length; j< jl; j++){

						var obj = exportData[i][j];
					
						var qualifierObj = obj['qualifier'].split(':');
					
						if(obj.family == 'formdata'){
							columnKeys[qualifierObj[2]] = null;
							exportRowObj[qualifierObj[2]] = obj['value'];
							
						}else if(obj.family == 'formdatastats'){
								
							if(groupEntries){
								
								if(obj['qualifier'] == 'entrycount'){
									exportRowObj['entries'] = (obj['value']) ? obj['value'] : 0;
								}
								if(obj['qualifier'] == 'bonusentrycount'){
									exportRowObj['bonusentries'] = (obj['value']) ? obj['value'] : 0;
								}
								if(qualifierObj[0] == 'timestamps'){
									exportRowObj['last_record_ts'] = Math.max(parseInt(obj['value']), exportRowObj['last_record_ts'] || 0);
								}
								
							}else{
								
								if(typeof exportRowObj['multi'] == 'undefined')exportRowObj['multi']=0;
								if(typeof exportRowObj['multi_ts'] == 'undefined')exportRowObj['multi_ts']=[];
								if(typeof exportRowObj['bonusmulti'] == 'undefined')exportRowObj['bonusmulti']=0;
								
								if(obj['qualifier'] == 'entrycount'){
																		
									exportRowObj['multi'] +=  (!isNaN(parseInt(obj['value']))) ? parseInt($.trim(obj['value'])) : 0;
									
								}
								
								if(obj['qualifier'] == 'bonusentrycount'){
									exportRowObj['bonusmulti'] +=  (!isNaN(parseInt(obj['value']))) ? parseInt(obj['value']) : 0;
								}
								
								if(qualifierObj[0] == 'timestamps'){
									exportRowObj['multi_ts'].push(new Date(parseInt(obj['value'])).toString());
								}
															
							}
							
						}
						
						
					}
					
					if(groupEntries){
						if(!exportRowObj['entries']){
							exportRowObj['entries'] = 0;
						}
						
						if(!exportRowObj['bonusentries']){
							exportRowObj['bonusentries'] = 0;
						}
					}
					
					if(!exportIncompleteEntries && groupEntries){
											
						if(exportRowObj['entries'] ==0 && exportRowObj['bonusentries'] ==0){
												
							indexesToRemove.push(i);
						
							exportData.splice(i,1);
							--i;
							--l;
	
							continue;
						
							
						}
						
					}
					
					if(!exportIncompleteEntries && !groupEntries){
					
						if((typeof exportRowObj['multi_ts'] == 'object' && exportRowObj['multi_ts'].length == 0) || !exportRowObj['multi_ts']){
						
							indexesToRemove.push(i);
						
							exportData.splice(i,1);
							--i;
							--l;
	
							continue;
							
						}
						
					}
					
					var objKeys = Object.keys(exportRowObj);
					
					objKeys = _.without(objKeys, 'multi', 'multi_ts','bonusmulti', 'bonusentries', 'entries');
					
					
										
					if(objKeys.length > 0){
						
						if(!groupEntries){
							
							exportRowObj['timestamp'] = typeof exportRowObj['multi_ts'] == 'object' && exportRowObj['multi_ts'].length>0 ? exportRowObj['multi_ts'][0] : '';
							
						}
						
						exportData[i] = exportRowObj;
						
					}else{
						
						indexesToRemove.push(i);
						
						exportData.splice(i,1);
						--i;
						--l;

						continue;
						
					}
					
					
					
						
					if(exportRowObj['last_record_ts']){
					
						exportRowObj['last_record_ts'] = new Date(exportRowObj['last_record_ts']).toString();	
						
					}
					
					if(exportRowObj['multi']){

						for(var x=1;x<exportRowObj['multi'];x++){
														
							var newExportRowObj = _.clone(exportRowObj);
							
							newExportRowObj['timestamp'] = exportRowObj['multi_ts'][x];
						
							exportData.splice((i+1), 0, newExportRowObj);
							
							++i;
							++l;
							
						}
						
					}
					
				}

			
				
				var objKeys = Object.keys(columnKeys);
				
				for(var i=0;i<columns.length;i++){
				
					if(columns[i]['key'] && objKeys.indexOf(columns[i]['key']) === -1){
					
						columns.splice(i, 1);
						
						--i;
						
					}	
					
				}
				
			
				
				var keySeq = _.pluck(columns, 'key');
				
				var keySeqLen = keySeq.length;
				var csvRows = [];
				
				var colHeader = [];
				for(var key in columns){
					colHeader.push(columns[key].value || columns[key].qualifier || columns[key].key || 'Unnamed Column');
				}
				
				csvRows.push('"'+colHeader.join('","')+'"');
				
				
				for(var i=0, l=exportData.length; i<l; ++i){
					
					var dataArr = [];
					
					for(var x=0; x<keySeqLen; x++){
													
						var colText = typeof exportData[i][keySeq[x]] != 'undefined' && typeof exportData[i][keySeq[x]] != 'undefined' ? exportData[i][keySeq[x]].toString().replace(/"/g, '""') : '';			
						dataArr.push(colText);
						
					}
										
					csvRows.push('"'+dataArr.join('","')+'"');
				}
				
				console.log('here8');
				
				
				exportData = [];
				var csvString = csvRows.join("\r\n");
				
				if(csvString.length > 1000000){
					
					$(".exportConfirm .exportProgress").text('Preparing file...');
					
					$.post('https://promometrics.dja.com:11747/saveExportData', csvString, function(response){
						
						$(".exportConfirm .exportProgress").text('File is being downloaded..');
						
						setTimeout(function(){
							
							$(".exportDataBttn").removeClass('disabled');
							$(".exportConfirm .exportProcessing").hide()
							$(".exportConfirm .exportProgress").empty();
							
						}, 2000);
						
						window.location = 'https://promometrics.dja.com:11747/getFile?file='+response.file;
						
				
						
					},'json')
					
					
				}else{
								
					var a         = document.createElement('a');
					if (typeof a.download == "undefined") {
						return Growl.error({
							title: 'Please correct the following:',
							text: 'Your browser does not support HTML5 download attribute. Please upgrade to a HTML5 browser.'
						});
					}
					a.href        = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
					a.target      = '_blank';
					a.download    = 'export.csv';
					
					document.body.appendChild(a);
					a.click();
					
					$(".exportDataBttn").removeClass('disabled');
					$(".exportConfirm .exportProcessing").hide()
					$(".exportConfirm .exportProgress").empty();
					
				}
			})
			
		}, this))
		
	},
	
	initMetricsColMenu: function(){
		
		var el = this.$el;	
		
		this.bindAddNewMetricBttn();
		
		$(".addMainCondition", el).on("click", false).on("click", $.proxy(function(){
			this.addMainMetricCondition()
		}, this));
		
				
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
		
		$(".addConditionTextAND").show();
		$(".addConditionFootnote").show();
		
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
	
	
	removeOrCondition: function(conditionItem){
		
		var itemsLeft = conditionItem.parents('.conditionItemsHolder').find('.conditionItem').length;
		var mainConditionContainer = conditionItem.parents('.well');
		conditionItem.remove();
		
		if(itemsLeft == 1)mainConditionContainer.remove();
		if($(".metricMainConditionHolder .well").length < 1){
			$(".addConditionTextAND").hide();
			$(".addConditionFootnote").hide();
		}

		
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
	
		$('#exportDateRange').daterangepicker(dateRangePickerObj,
		   $.proxy(function(start, end) {
			
				if($(".textReportNumber .icon-spinner:visible").length > 0){
				
					Growl.warn({
						title: 'An error ocurred',
						text: 'Please wait until the current report finishes loading'
					});	
					
					return false;
					
				}
			
		        $('#exportDateRange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
						
				this.calendarRange.start = new Date(start.format()).getTime();
				this.calendarRange.end = new Date(end.format()).getTime();
				
		    },this)
		   
		);
		
		
	},
	
	calendarRange: {
		
	},
	
    render: function () {
						
        $(this.el).html(this.template());
	
        $('.main-content').html(this.el);
		window['genericInit']();		
		this.initMetricsColMenu();
		this.initMetricsDateRangeMenu();
				 				
		var el = this.$el;	
				 		
        return this;
    }
	
});


