
window.PromoDashboardPagesView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	events: {
		
	
		
		'click #pagesBox .pageName' : function(event){
		
			this.initPageDesignModal(event, $(event.target).parents('.dataCache'));
			
		},
		'click #deletePageModal .confirm' : 'deletePageItem',
		'click #previewTemplateModal .updateIframeWidthButtons .previewToggleBttns': 'previewToggle',
		'click .addNewPage' : 'addNewPage',
		'click #pageDesignModal .close' : function(){
		
			if($(".exitFullScreen").is(":visible")){
				
				$(".exitFullScreen").parents('a').trigger('click');
			}				
			
		},
		'click #deletePageModal .cancel' : function(event){
			
			event.preventDefault();
			
			$("#deletePageModal").modal('hide')
			$("#pageDesignModal")
			.modal('show');			
			
		},
		'click #unpublishPageModal .confirm' : 'unpublishPageItem',
		'click #unpublishPageModal .cancel' : function(event){
			
			event.preventDefault();
			
			$("#unpublishPageModal").modal('hide')
			$("#pageDesignModal")
			.modal('show');			
			
		}
		
	},
	
	initAddNewPagePopover: function(){
		
		var el = this.$el;	
		$('.addNewPage', el).popover({
			
			html: true,
			placement: 'left',
			title: 'Add a new page',
			content: $(".addNewPageTemplate", el).html(),
			container: '#pagesBox'
			
		})
		.on('shown.bs.popover', $.proxy(function () {
					
			$('.popover .addNewPageForm .addNewPageTitle').focus();
						
			$('.popover .addNewPageForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
								
				$.post('/dashboard/pages/pageItem', {pid: window['pid'], type: 'custom', name: $('.popover .addNewPageForm').find('.addNewPageTitle').val(), desc: $('.popover .addNewPageForm').find('.addNewPageDesc').val(), template: this.collection.pluck('defaultTemplate')[0], 'template-page' : ''}, $.proxy(function(response){
					
					if(response && response.pageItemId){
						
						$('.popover .addNewPageForm')[0].reset();
						$('.addNewPage').popover('hide');
					}
												
					this.collection.set({path: ''});
					
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
						this.initPagesList();
					}, this)});
						
										
				}, this),'json');
				
												
			}, this));
			
			$('.popover .addPageCancel').off("click").on("click", function(event){
				
				event.preventDefault();
				
				$('.popover .addNewPageForm')[0].reset();
				$('.addNewPage').popover('hide');
				
			})
			
		
		
		}, this))
		
	},
	
	addNewPage: function(event){
		
		event.preventDefault();
				
	},
	
	previewToggle: function(event){
		
		
		event.preventDefault();
		
		$('#previewTemplateModal .updateIframeWidthButtons .previewToggleBttns').removeClass('active');
		$(this).addClass('active');
		$("#previewTemplateModal .previewIframe").css("width", (parseInt($(this).data('width')) > 0 ? $(this).data('width') : '100%'));

		
	},
	
	
	bindFullscreenDetect : function(){
		
		var changeHandler = function(){  
						                                      
		  setTimeout(function(){
			  var fs = (window.fullScreenApi) ? window.fullScreenApi.isFullScreen() : (screen.width == window.innerWidth && screen.height == window.innerHeight) ;
			
			  if (fs) {    
								
				$(".goFullScreen").hide();
				$(".exitFullScreen").show();
								 
			  }else {        
			  
				$(".goFullScreen").show();
				$(".exitFullScreen").hide();        
			  }                                                                      
			},1000);
		
		}
																		
	   document.addEventListener("fullscreenchange", changeHandler, false);      
	   document.addEventListener("webkitfullscreenchange", changeHandler, false);
	   document.addEventListener("mozfullscreenchange", changeHandler, false);
		
	},
	
	unpublishPageItem: function(event){
		
		event.preventDefault();
		
		var unpublishSuccess = $.proxy(function(model, response){
			
			if(response && response.pageItemId){
							
				$("#pagesBox .pageItems").empty();
				
				this.collection.set({path: ''});
				
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.initPagesList();
					
				}, this)}), this);
								
			}else unpublishFail();
			
		}, this);
		
		var unpublishFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'publishPage'});
		
		if($("#unpublishPageModal").data('id')){
			
			this.collection.first().destroy({data: { pageItemId: $("#unpublishPageModal").data('id'), pid: window['pid'] }, processData: true, success: unpublishSuccess, error: unpublishFail, wait: true});
			
		}
		
		$("#unpublishPageModal").modal('hide');
		
	},
	
	deletePageItem: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.pageItemId){
							
				$("#pagesBox .pageItems").empty();
				
				this.collection.set({path: ''});
				
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.initPagesList();
					
				}, this)}), this);
								
			}else deleteFail();
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'pageItem'});
		
		if($("#deletePageModal").data('id')){
			
			this.collection.first().destroy({data: { id: $("#deletePageModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
			
		}
		
		$("#deletePageModal").modal('hide');
		
	},
		
	createRequiredPage: function(dataCache, requiredPages){
		
		var type = dataCache.data('type');
							
		$.post('/dashboard/pages/pageItem', {pid: window['pid'], type: type, name: dataCache.data('name'), desc: dataCache.data('desc'), template: this.collection.pluck('defaultTemplate')[0], 'template-page' : dataCache.data('template-page')}, $.proxy(function(response){
		
			this.pageCreatedCallBack(type, requiredPages);
		
		}, this, requiredPages),'json');
					
	},
	
	pageCreatedCache: [],
	
	pageCreatedCallBack: function(type, requiredPages){
		
		this.pageCreatedCache.push(type);
		
		for(var i=0; i<requiredPages.length;i++){
		
			if(this.pageCreatedCache.indexOf(requiredPages[i]) === -1){
			
				return;
				
			}
			
		}
		
		$("#pagesBox .pageItems").empty();
			
		this.collection.set({path: ''});
		this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
		
			this.initPagesList();
				
		}, this)});
		
	},
		
	initPageDesignModal: function(event, dataCache){
		
		if(event){
			
			event.preventDefault();

		
			$('#pageDesignModal').off('shown.bs.modal').on('shown.bs.modal', $.proxy(function(){
				
				
			},this))
			.modal({ backdrop: 'static', keyboard: false}).modal('show');
			
			app.once("route", function(){
				
				$('#pageDesignModal').modal('hide');
				$("body").removeClass('modal-open');
				$(".modal-backdrop").remove();
				
			})
			
		}
		
		
		var htmlContent = new PromoDashboardPagesDesignView({view: this, model: this.model, collection: this.collection, pageItem: {defaultTemplate: this.collection.pluck('defaultTemplate')[0], el: {'last-published': dataCache.data('last-published'),'configurable-url': dataCache.data('configurable-url'), 'required': dataCache.data('required'), 'type': dataCache.data('type'),'template': dataCache.data('template'),'name': dataCache.data('name'),'desc': dataCache.data('desc'), 'template-page': dataCache.data('template-page'), 'info': dataCache.data('info')},  key:  dataCache.data('id')}}).el;
		
		if(event)$('#pageDesignModal .modal-body').html(htmlContent);
		
		
	},

	
	initPagesList: function(){
		var el = this.$el;	
				
		var existingPages = this.collection.pluck('pages')[0];
		
		var requiredPages = this.collection.pluck('requiredPages')[0];
		
		$('#pagesBox .pageItems',el).empty();
		
		for(key in existingPages){
			
			if(existingPages.hasOwnProperty(key)){
			
				
				var pageItemTemplate = $($("#pagesBox .pageItemTemplate",el).html());
		
				pageItemTemplate.find(".pageIncompleteIcon").show();
				pageItemTemplate.find(".pageName").text(existingPages[key].name || 'Untitled Page');
				pageItemTemplate.find(".pageText").text(existingPages[key].desc || '');
				pageItemTemplate.data('id',key);
				pageItemTemplate.data('type',existingPages[key].type);
				pageItemTemplate.data('name',existingPages[key].name);
				pageItemTemplate.data('desc',existingPages[key].desc);
				pageItemTemplate.data('template',existingPages[key].template || this.collection.pluck('defaultTemplate')[0]);
				pageItemTemplate.data('template-page',existingPages[key]['template-page']);
				pageItemTemplate.data('configurable-url',existingPages[key]['configurable-url']);
				pageItemTemplate.data('last-published',existingPages[key]['last-published']);

				if(requiredPages.indexOf(existingPages[key].type) !== -1){
					pageItemTemplate.data('required',true);
					pageItemTemplate.find('.labelRequired').show();
										
					requiredPages.splice(requiredPages.indexOf(existingPages[key].type),1);
				}
				
				
				if(typeof existingPages[key]['last-published'] != 'undefined'){
					pageItemTemplate.find('.lastPublishedTime').attr('title', new Date(existingPages[key]['last-published']).toISOString()).timeago();
					
				}else{
				
					pageItemTemplate.find('.lastPublishedTime').text('never');
					
				}
				
				var lastUpdated, lastPublished;
				
				if(typeof existingPages[key]['last-updated'] != 'undefined'){
				
					var lastUpdated = new Date(existingPages[key]['last-updated']);
					var lastPublished = new Date(existingPages[key]['last-published']);
					
				
				}
				
				if((typeof existingPages[key]['last-updated'] != 'undefined' && typeof lastUpdated != 'undefined' && typeof lastPublished != 'undefined' && lastUpdated < lastPublished) || (typeof existingPages[key]['last-published'] != 'undefined' && typeof existingPages[key]['last-updated'] == 'undefined')){
					pageItemTemplate.find('.publishPageBttnWrapper').hide();
					pageItemTemplate.find('.pagePublished').css("display","block");
						
				}
				
				
				
				var view = this;
				
				pageItemTemplate.find(".publishPageBttn").popover({
		
					html: true,
					placement: 'left',
					title: 'Publish Page',
					content: $(".publishPageTemplate", el).html(),
					container: '#pagesBox'
					
				})
				.on('show.bs.popover', function () {
					
					var popover = $(this).data('bs.popover').$tip;
					
					popover
					.find('.popover-title').hide();
					
					$(".publishPageBttn").not($(this)).popover('hide');
					
					
				})
				 
				.on('shown.bs.popover', function () {
					
					var bttnEl = $(this);
					var popover = $(this).data('bs.popover').$tip;
					
					popover
					.find('.publishPageSchedule').on("click", function(e){
					
						e.preventDefault();
						
						setTimeout($.proxy(function(){
							
							$(this).siblings('.publishPageScheduleTime').editable('toggle');
							
						}, this), 0);
												
					})
										
					popover
					.find('.publishPageScheduleTime').editable({
				
						combodate: {
							minYear: new Date().getFullYear(),
							yearDescending: false,
							smartDays: true,
							minuteStep: 1
						},
						
						validate: function(newValue) {
							
							if(!new Date(newValue).getTime()){
							
								return "Please complete all fields and confirm the date is valid."
								
							}else{
															
								$.post('/dashboard/pages/publishPage', {pid: window['pid'], pageItemId: bttnEl.parents('.dataCache').data('id'), scheduleAddTime: new Date(newValue._d).getTime()}, function(response){
							
									if(response && response.scheduled){
										
										Growl.success({
											title: 'Successfully scheduled!',
											text: 'The new page will be published at '+new Date(newValue).toString()+'.'
										});
										
										$(".publishPageBttn").popover('hide');
										$(this).editable('toggle');
												
									}else{
									
										$("#gritter-notice-wrapper").remove();
										
										if(response.error){
											return Growl.error({
												title: 'An error occurred!',
												text: response.error
											});	
										
										}else{
											return Growl.error({
												title: 'An error occurred!',
												text: 'Please refresh this page and try again.'
											});	
										}
										
									}
																
									view.collection.set({path: ''});
									
									view.collection.fetch({ data: $.param({pid: window['pid']}), success: function(){
										bttnEl.popover('hide');
										view.initPagesList();
										}
									});
										
														
								},'json');
								
								return '';
								
							}
							
						},
						display: function(value){
							
						
						}
						
					}).on('shown.bs.popover', function () {
					
						$(this).data('bs.popover')['$arrow'][0].remove();
						$(this).data('bs.popover')['$tip'].find("*").css("white-space","nowrap");
						
					})

					
					popover
					.find('.popover-title').hide()
					.end()
					.find('.publishPageCancel').on("click", function (e) {
						e.preventDefault();
						bttnEl.popover('hide');
						
					})
					.end()
					.find(".publishPageConfirm:visible").on('click', false).on("click", function () {
		
						$.post('/dashboard/pages/publishPage', {pid: window['pid'], pageItemId: bttnEl.parents('.dataCache').data('id')}, $.proxy(function(response){
							
							if(response && response.pageItemId){
								
								Growl.success({
									title: 'Successfully published!',
									text: 'The new page has been published.'
								});
								
							}else{
							
								$("#gritter-notice-wrapper").remove();						
								return Growl.error({
									title: 'An error occurred!',
									text: 'Please refresh this page and try again.'
								});	
								
							}
														
							view.collection.set({path: ''});
							
							view.collection.fetch({ data: $.param({pid: window['pid']}), success: function(){
								bttnEl.popover('hide');
								view.initPagesList();
								}
							});
								
												
						}),'json');
						
					})
					
				});

				$('#pagesBox .pageItems',el).append(pageItemTemplate);
			
			
				
			}
			
		}
		
		var requiredPagesInfo = this.collection.pluck('requiredPagesInfo')[0];
		
		for(i=0;i<requiredPages.length;i++){
									
			var pageItemTemplate = $($("#pagesBox .pageItemTemplate",el).html());
			
			pageItemTemplate.find(".pageIncompleteIcon").show();
			pageItemTemplate.find(".pageName").text(requiredPagesInfo[requiredPages[i]].name || 'Untitled Page');
			pageItemTemplate.find(".pageText").text(requiredPagesInfo[requiredPages[i]].desc);
			pageItemTemplate.data('id','');
			pageItemTemplate.data('type',requiredPages[i]);
			pageItemTemplate.data('name',requiredPagesInfo[requiredPages[i]].name);
			pageItemTemplate.data('desc',requiredPagesInfo[requiredPages[i]].desc);
			pageItemTemplate.data('template',this.collection.pluck('defaultTemplate')[0]);
			pageItemTemplate.data('template-page','');
			pageItemTemplate.data('required',true);
			pageItemTemplate.find('.labelRequired').show();
			$('#pagesBox .pageItems',el).append(pageItemTemplate);
			
			if(!_.findWhere(existingPages, {type: requiredPages[i]})){
			
				this.createRequiredPage(pageItemTemplate, requiredPages);

			}
			
		}
		

		
	},
	
	initTotalNumberOfPages: function(){
		var el = this.$el;	
		
		$(".totalNumberOfPages", el).text($(".pageItems .dataCache", el).length + ' total pages');
		
	},
	
	
	initHelpers: function(){
		var el = this.$el;	
		
		$('.fieldsHelp', el).popover({
			html: true,
			trigger: 'click',
			container: '.fieldsBox .box-header'
		});
		
	},
	
    render: function () {
		
				
        $(this.el).html(this.template());
								
		this.initPagesList();
		
		this.bindFullscreenDetect();
				
		this.initTotalNumberOfPages();		
		
		this.initAddNewPagePopover();
		
		this.initHelpers();
		
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
				
		var el = this.$el;	
				 		
        return this;
    }
	
});




window.PromoDashboardPagesDesignView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.formFieldElements = [];
				
		this.render();
		
    },	
		
	events: {
		
		'click .viewTemplate' : function(event){
			event.preventDefault();
			window.open('#basic');
		},
		'click .changeTemplate' : function(event){
			event.preventDefault();
			window.open('#basic');
		},
		'click .viewURL' : function(event){
			event.preventDefault();
						
		},
		
		'click .configurePage' : function(event){
			event.preventDefault();
						
		},
		
		'click .switchToInteractiveView' : function(event){
			event.preventDefault();
			$(".designPanel, .interactiveViewMenuItem").hide();
			$(".interactivePanel, .designViewMenuItem").show();
			$(".interactivePanel iframe").prop('src','/dashboard/templates/preview?pid='+window['pid']+'&pageItemId='+$("#pageDesignModal").data('id'));
			
			this.initInteractivePanel();
			
		},
		'click .switchToDesignView' : function(event){
			event.preventDefault();
			$(".designPanel, .designViewMenuItem").hide();
			$(".interactivePanel, .interactiveViewMenuItem").show();
		},
		
		'click .editPageTitleDesc' : function(event){
			event.preventDefault();
		},
		
		'click .previewPage' : function(event){
			
			event.preventDefault();
			
			window.open('/dashboard/templates/preview?pid='+window['pid']+'&pageItemId='+$("#pageDesignModal").data('id'));
						
			
		},
		
		
		
		'click .deletePage' : function(event){
			
			event.preventDefault();
			
			$("#pageDesignModal").modal('hide')
			$("#deletePageModal")
			.data('id', this.options.pageItem.key)
			.modal('show');
			
			if($(event.target).parents('.resetPageContentMenuItem').length > 0){
				
				$("#deletePageModal .deleteConfirmText").hide();
				$("#deletePageModal .resetConfirmText").show();
				
			}else{
				
				$("#deletePageModal .deleteConfirmText").show();
				$("#deletePageModal .resetConfirmText").hide();
				
			}
						
			
		},
		
		'click .unpublishPage' : function(event){
			
			event.preventDefault();
			
			$("#pageDesignModal").modal('hide')
			$("#unpublishPageModal")
			.data('id', this.options.pageItem.key)
			.modal('show');	
			
		},
		
		'click .editPageTitleDesc' : function(event){
			
			event.preventDefault();
			
		},		
		
		'click .openFullScreen' : function(event){
		
			event.preventDefault();
						
			var element = $('#pageDesignModal')[0];
			
			var fs = (window.fullScreenApi) ? window.fullScreenApi.isFullScreen() : (screen.width == window.innerWidth && screen.height == window.innerHeight) ;
			
			if(!fs){
				var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
			
				if (requestMethod) {
					requestMethod.call(element);
				} else if (typeof window.ActiveXObject !== "undefined") {
					var wscript = new ActiveXObject("WScript.Shell");
					if (wscript !== null) {
						wscript.SendKeys("{F11}");
					}
				}
				
				
				$(".goFullScreen").show();
				$(".exitFullScreen").hide();  
				
				
				
			}else{
			    if (document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
				
				 $(".goFullScreen").hide();
				$(".exitFullScreen").show();
				
			} 
			
		   
		}
		
	},
	
	initInteractivePanel: function(){
		
		var target = $(".interactivePanel iframe");
		
	},
	
	initApplyPages: function(){
		
		var pages = this.options.view.collection.pluck('pages')[0];
		
		$(".pagePanelsApplyTo").data('pages', pages);
				
		$(".pagePanelsApplyTo").empty();
		
		for(p in pages){
			if(pages.hasOwnProperty(p)){
				
				if(p != $("#pageDesignModal").data('id')){
				
					var pagePanelsApplyToItemTemplate = $($(".pagePanelsApplyToItemTemplate").html());
					pagePanelsApplyToItemTemplate.find('a').text(pages[p].name || 'Untitled Page').on("click", false).on("click", function(){
					
						if($(this).parents('.dataCache').hasClass('active')){
							
							$(this).parents('.dataCache').removeClass('active')
						}else $(this).parents('.dataCache').addClass('active')
						
					});
					pagePanelsApplyToItemTemplate.data('id', p);
					$(".pagePanelsApplyTo").append(pagePanelsApplyToItemTemplate);
				}
			}	
			
		}
				
		if($(".pagePanelsApplyTo .dataCache").length > 0){
			$(".additionalOptions").show();
		}else{
			$(".additionalOptions").hide();
		}
		
		
	},
	
	initPageElements: function(data){
		
		
		
		$(".noPageSelected").hide();
		$(".gridsterContainer").show();
		$(".additionalOptionsForm").hide();
		$(".disableSelection").hide();
		
		$(window).unbind('resize');
		$(".gridster ul").replaceWith($("<ul />"));
				
		var panelData = typeof data =='object' ? data.data : [];
		var checkEntryLimitWith = {'person': data['check-entry-limit-with-person'] || '', 'household': data['check-entry-limit-with-household'] || ''};
		var checkEligibilityWith = {'dob': data['check-eligibility-with-dob'] || '', 'state': data['check-eligibility-with-state'] || '', 'country': data['check-eligibility-with-country'] || '' };
		var whenSubmitIsClicked = {'submit-action': data['submit-action'] || '', 'submit-next-page': data['submit-next-page'] || ''};
		var bypassThisPageIf = {'bypass-user-completed-form': data['bypass-user-completed-form'] || '', 'bypass-user-ineligible': data['bypass-user-ineligible'] || '', 'bypass-user-ineligible-identifier': data['bypass-user-ineligible-identifier'] || '', 'bypass-user-entry-limit': data['bypass-user-entry-limit'] || '', 'bypass-user-entry-limit-identifier': data['bypass-user-entry-limit-identifier'] || ''};
		var saveDataFromPanel = data['save-data-from']  || '';
			
		if(typeof panelData == 'object' && panelData.length > 0){
			
			for(var i=0; i< panelData.length; i++){
				
				if(typeof panelData[i] == 'object'){
				
					var objTemplate = $($(".gridsterItemTemplate").html());
				
					for(key in panelData[i]){
					
						if(panelData[i].hasOwnProperty(key)){
											
							if(key == 'id' && panelData[i][key] != ''){
								objTemplate.data('id', panelData[i][key]);
								objTemplate.prop('id', panelData[i][key]);
							}
							
							objTemplate.data(key, panelData[i][key]);
							if(key == 'type' && this.formFieldElements.indexOf(panelData[i][key]) !== -1)$(".additionalOptionsForm").show();
							if(key == 'req' && panelData[i][key] != '')objTemplate.data('req', (panelData[i][key] === "true"));
							if(key == 'abbreviated' && panelData[i][key] != '')objTemplate.data('abbreviated', (panelData[i][key] === "true"));
							if(key == 'prechecked' && panelData[i][key] != '')objTemplate.data('prechecked', (panelData[i][key] === "true"));
							
							if(key == 'sizex')objTemplate.attr('data-sizex', panelData[i][key]);
							if(key == 'sizey')objTemplate.attr('data-sizey', panelData[i][key]);
							if(key == 'row')objTemplate.attr('data-row', panelData[i][key]);
							if(key == 'col')objTemplate.attr('data-col', panelData[i][key]);
							if(key == 'title')objTemplate.find('.pageElementTitle').text(panelData[i][key]);
							if(key == 'desc')objTemplate.find('.pageElementDesc').text(panelData[i][key]);
						}
						
						
					}
					
					
					if(!objTemplate.data('id')){

						var uuid = this.generateUUID();
						objTemplate.data('id', uuid);	
						objTemplate.prop('id', uuid);	
						
					}
					
					if(panelData[i].type == 'state-drop-down'){
						
						objTemplate.data('value', panelData[i].value.split(','));
						
					}
														
					
					objTemplate.find('.editPageElement').on("click", $.proxy(function(e){
					
						e.preventDefault();
						
						var objPageEditBttn = $(e.target).hasClass('editPageElement') ? $(e.target) :  $(e.target).parents('.editPageElement');
						
						this.editPageElementPopover(objPageEditBttn);
									
					}, this));
					
					
					this.bindRemovePageElementButton(objTemplate);
					
					$(".gridster ul").append(objTemplate);
					
				}
				
			}
			
		}
		
		var width = $(".gridsterContainer").width() / 12;
		var height = width;
		$(".gridster ul").gridster({
			widget_margins: [0, 0],
			widget_base_dimensions: [width, height],
			min_cols: 12,
			max_cols: 12,
			extra_rows: 10,
			extra_cols: 10,
			max_size_x: 12,
			widget_selector: 'li',
			autogenerate_stylesheet: true,
			avoid_overlapped_widgets: true,
			resize: {
				enabled: true,
				axes: ['x','y'],
				max_size: [12,Infinity],
				handle_class: 'gs-resize-handle'
			}
			

		});
				
		var gridster = $(".gridster ul").gridster().data('gridster');
		
		
		this.initWhenSubmitIsClicked(whenSubmitIsClicked);
		this.initBypassThisPageIf(bypassThisPageIf);
		this.initSaveDataFromPanel(saveDataFromPanel);
		this.initCheckEntryLimitWith(checkEntryLimitWith);
		this.initCheckEligibilityWith(checkEligibilityWith);
		this.initSaveButton();
		this.initDesignModalHelpers();
		
		$(window).resize(function() {
			$('head [generated-from="gridster"]:not(:last)').remove();
			var widgetLength = $('.gridsterContainer').width() / 12;
						
			gridster.resize_widget_dimensions({widget_base_dimensions: [widgetLength, widgetLength]});
		});
	
		
	},
	
	initSaveButton: function(){
		
		$(".savePageDesignBttn").show().off('click').on('click', $.proxy(function(e){
			
			e.preventDefault();
			
			var data = [];
			
			var formFieldElements = this.formFieldElements;
			
			$(".gridster ul .dataCache").each(function(){
				
				$(this).data('title', $(this).find('.pageElementTitle').text());
				$(this).data('desc', $(this).find('.pageElementDesc').text());
				$(this).data('sizex', $(this).attr('data-sizex'));
				$(this).data('sizey', $(this).attr('data-sizey'));
				$(this).data('row',  $(this).attr('data-row'));
				$(this).data('col',  $(this).attr('data-col'));
				$(this).data('is-form-element', formFieldElements.indexOf($(this).data('type')) !== -1);
				
				var pushData = $.extend(true,{},$(this).data());

				data.push(pushData);
				
				delete data[data.length-1].coords;
				
				if($(this).data('type') == 'country-drop-down' && typeof $(this).data('value') != 'string'){
					
					var countryValues=[];
				
					for(var i=0;i<data[data.length-1].value.length;i++){
					
						countryValues.push(data[data.length-1].value[i]['id']+'|'+data[data.length-1].value[i]['text']);
						
					}
					
					data[data.length-1].value = countryValues.join(',');
					
				}
								
			})
			
			var saveData = {};
			
			saveData.id = $("#pageDesignModal").data('id');
			saveData.template = $("#pageDesignModal .templateName").data('template');
			saveData.page = $("#pageDesignModal .templatePage").data('page');
			saveData.applyTo = [];
			$(".pagePanelsApplyTo .dataCache").each(function(index, element) {
                
				if($(this).hasClass('active')){
					
					saveData.applyTo.push($(this).data('id'))
					
				}
				
            });
			
			
			if($(".additionalOptionsForm").is(":visible")){
			
				saveData.checkEntryLimitWith = {'person': [], 'household': []};
				
				$("input.checkEntryLimitWithPerson").each(function(){
				
						saveData.checkEntryLimitWith.person.push($(this).select2("data"));
					
				})
				
				$("input.checkEntryLimitWithHousehold").each(function(){
				
						saveData.checkEntryLimitWith.household.push($(this).select2("data"));
					
				})
				
				saveData.checkEligibilityWith = {'dob': $("input.checkEligibilityWithDOB").select2("data"), 'state': $("input.checkEligibilityWithState").select2("data"), 'country': $("input.checkEligibilityWithCountry").select2("data") };
				
				var submitAction = $(".submitActionRadio").filter(function(){return $(this).parent().hasClass('checked')}).val();
				
				saveData.whenSubmitIsClicked = {'submit-action': submitAction, 'submit-next-page': submitAction =='save-and-continue' ? $(".chooseNextFormPage").eq(0).data('value') : submitAction =='do-not-save-and-continue' ? $(".chooseNextFormPage").eq(1).data('value') : ''};
				
				saveData.bypassThisPageIf = {'bypass-user-completed-form': $("#bypassPageCheckbox1").filter(function(){return $(this).parent().hasClass('checked')}).length>0 ? 1 : '', 'bypass-user-ineligible': $("#bypassPageCheckbox2").filter(function(){return $(this).parent().hasClass('checked')}).length>0 ? 1 : '', 'bypass-user-ineligible-identifier': $(".bypassPageIneligibleIdentifier").data('value'), 'bypass-user-entry-limit':  $("#bypassPageCheckbox3").filter(function(){return $(this).parent().hasClass('checked')}).length>0 ? 1 : '', 'bypass-user-entry-limit-identifier':  $(".bypassPageEntryLimitIdentifier").data('value')};
				
				saveData.saveDataFromPanel = $(".saveDataFromPanel").data('value');	
			}
			
			saveData.panel = $(".item.dataCache.active").find('.panelBttn.active').data('panel-id');
			saveData.data = data;
			var model = this.model;	
					
			model.set({'path': '/updatePageItem' });
			var callback = $.proxy(function(response){
							
				var successCallback = $.proxy(function(){
					
					this.collection.set({path: ''});
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
					
						this.options.view.initPagesList();
							
					}, this)});
			
	
				},this);
				
				this.updateSuccess(response, successCallback);
				
			},this)
									
			
			model.sync('update', model, { data: $.param({pid: window['pid'], pageItemId: saveData.id , update: 'page-data', value: saveData}), success: callback, fail: this.updateFail });
			
		}, this));
		
	},
	
	initSaveDataFromPanel: function(data){
						
		$(".saveDataFromPanel").data('value', data || 'this-panel').editable({
			showbuttons: false,
			type: 'select',
			value: data || 'this-panel',
			display: function(value, sourceData){
				
				var displayObj = _.findWhere(sourceData, {value: value});
				
				if(typeof displayObj != 'undefined'){
					$(this).text(displayObj.text).data('value',displayObj.value);
			
				}else if(sourceData[0]){
					$(this).text(sourceData[0].text).data('value',sourceData[0].value);
				}
			},
			source: $.proxy(function(){

				var choices = [
				{value: 'this-panel',text: 'this panel only'},
				{value: 'entire-page',text: 'entire page'}
				];
				
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).data('value',newValue);
		    }
			
		});
		
	},
	
	initBypassThisPageIf: function(data){
				
		if(data['bypass-user-completed-form'] == 1){
			$("#bypassPageCheckbox1").prop('checked', true);
		}else $("#bypassPageCheckbox1").prop('checked', false);
		if(data['bypass-user-ineligible'] == 1){
			$("#bypassPageCheckbox2").prop('checked', true);
		}else $("#bypassPageCheckbox2").prop('checked', false);
		if(data['bypass-user-entry-limit'] == 1){
			$("#bypassPageCheckbox3").prop('checked', true);
		}else $("#bypassPageCheckbox3").prop('checked', false);
				
		$(".bypassPageIneligibleIdentifier").data('value',data['bypass-user-ineligible-identifier'] || 'session').editable({
			showbuttons: false,
			type: 'select',
			value: data['bypass-user-ineligible-identifier'] || 'session',
			display: function(value, sourceData){
				
				var displayObj = _.findWhere(sourceData, {value: value});
				
				if(typeof displayObj != 'undefined'){
					$(this).text(displayObj.text).data('value',displayObj.value);
			
				}else if(sourceData[0]){
					$(this).text(sourceData[0].text).data('value',sourceData[0].value);
				}
			},
			source: $.proxy(function(){
				$(".bypassPageEntryLimitIdentifier.editable-open").popover('hide');
				var choices = [
				{value: 'session',text: 'session cookies'},
				{value: 'uid',text: 'unique user identifier'},
				{value: 'session-and-uid',text: 'session cookies and unique user identifier'}
				];
				
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).data('value',newValue);
		    }
						
		});
		
		$(".bypassPageEntryLimitIdentifier").data('value',data['bypass-user-entry-limit-identifier'] || 'session-and-uid').editable({
			showbuttons: false,
			type: 'select',
			value: data['bypass-user-entry-limit-identifier'] || 'session-and-uid',
			display: function(value, sourceData){
				
				var displayObj = _.findWhere(sourceData, {value: value});
				
				if(typeof displayObj != 'undefined'){
					$(this).text(displayObj.text).data('value',displayObj.value);
				
				}else if(sourceData[0]){
					$(this).text(sourceData[0].text).data('value',sourceData[0].value);
				}
			},
			source: $.proxy(function(){
			
				$(".bypassPageIneligibleIdentifier.editable-open").popover('hide');
				
				var choices = [
				{value: 'session',text: 'session cookies'},
				{value: 'uid',text: 'unique user identifier'},
				{value: 'session-and-uid',text: 'session cookies and unique user identifier'}
				];
				
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).data('value',newValue);
		    }
			
		});
		
		$('.additionalOptionsForm .bypassPageCheckbox.icheck').iCheck({
			checkboxClass: 'icheckbox_flat-aero'
		});
		
		
	},
	
	initWhenSubmitIsClicked: function(data){
		
		var optionSelected = data['submit-action'] || '';
		var submitNextPage = data['submit-next-page'] || '';
		
		var selectedOption = $(".submitActionRadio").filter(function(index) {
            return $(this).val() == optionSelected
			
        }).prop("checked", true);
		
		if(selectedOption.length == 0){
		
			$(".submitActionRadio").eq(0).prop("checked", true);
			
		}
		
		$('.chooseNextFormPage.initialized').editable('setValue', submitNextPage).data('value',submitNextPage);
		
		$(".saveAndContinueOption .chooseNextFormPage:not(.initialized)").editable({
			showbuttons: false,
			type: 'select',
			defaultValue: '',
			value: submitNextPage || '',
			display: function(value, sourceData){
								
				if(!value){
					$(this).text('choose next form page');
					return;
				}
				
				var displayObj = _.findWhere(sourceData, {value: value});
				
				if(typeof displayObj != 'undefined'){
					
					$(this).text(displayObj.text);
					$(this).data('value',displayObj.value);
				
				}else if(sourceData[0]){
					
					$(this).text(sourceData[0].text).data('value',sourceData[0].value);
					
				}
			},
			source: $.proxy(function(){
								
				var pages = this.options.view.collection.pluck('pages')[0];
				var choices = [
					
				];
				_.each(pages, function(value, key){
					
					choices.push({value: key, text: value.name || 'Untitled Page'});
					
				})
					
				
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).data('value',newValue);
		    }
			
		}).addClass('initialized');
		
		$(".doNotSaveOption .chooseNextFormPage:not(.initialized)").editable({
			showbuttons: false,
			type: 'select',
			defaultValue: '',
			value: submitNextPage || '',
			display: function(value, sourceData){
				
				if(!value){
					$(this).text('choose next form page');
					return;
				}
				
				var displayObj = _.findWhere(sourceData, {value: value});
					
				if(typeof displayObj != 'undefined'){
					$(this).text(displayObj.text);
					$(this).data('value',displayObj.value);
			
				}else if(sourceData[0]){
										
					$(this).text(sourceData[0].text).data('value',sourceData[0].value);
					$(this).editable('setValue',sourceData[0].value)
				}
			},
			source: $.proxy(function(){
				
			
				var pages = this.options.view.collection.pluck('pages')[0];
				var choices = [
					
				];
				_.each(pages, function(value, key){
					
					choices.push({value: key, text: value.name || 'Untitled Page'});
					
				})
					
				
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).data('value',newValue);
		    }
			
		}).addClass('initialized');
		
		$('.additionalOptionsForm .submitActionRadio.icheck').iCheck({
			radioClass: 'iradio_flat-aero'
		});
		
		
					

		
	},
	
	initDesignModalHelpers: function(){
		
		$('.learnMorePopover').popover().on('shown.bs.popover', function(){
		
			$(this).data('bs.popover')['$tip'][0].scrollIntoView();
			
		})
		
	},
	
	initCheckEntryLimitWith: function(data){
		
		$(".checkEntryLimitWithPerson").remove();
		$(".checkEntryLimitWithHousehold").remove();
		
		var setPersonSelect2 = function(obj, setData){
		
			obj.insertBefore($(".checkEntryLimitPerson")).select2({
				multiple: true,
				query: function (query) {
					var data = {results: []};
					
					$(".gridster ul .dataCache").each(function(){
					
						if($(this).data('id')){
							
							if($(this).data('type') == 'phone-field' || $(this).data('type') == 'country-drop-down' || $(this).data('type') == 'state-drop-down' || $(this).data('type') == 'text-field' || $(this).data('type') == 'drop-down' || $(this).data('type') == 'radio-button'){
								
								data.results.push({id: $(this).data('id'), text: $(this).data('label')  || $(this).data('validation') || $(this).data('type')});
							}
							
						}
						
					})
					
					query.callback(data);
				}	
				
			}).select2("data", setData);	
			
			
		}
		
		var setHouseholdSelect2 = function(obj, setData){
		
			obj.insertBefore($(".checkEntryLimitHousehold")).select2({
				multiple: true,
				query: function (query) {
					var data = {results: []};
					
					$(".gridster ul .dataCache").each(function(){
					
						if($(this).data('id')){
							
							if($(this).data('type') == 'phone-field' || $(this).data('type') == 'country-drop-down' || $(this).data('type') == 'state-drop-down' || $(this).data('type') == 'text-field' || $(this).data('type') == 'drop-down' || $(this).data('type') == 'radio-button'){
								data.results.push({id: $(this).data('id'), text: $(this).data('label') || $(this).data('validation') || $(this).data('type')});
							}
							
						}
						
					})
					
					query.callback(data);
				}	
				
			}).select2("data", setData);	
			
			
		}
		
	
		var checkEntryLimitWithAddPerson = function(data){
		
			
				
				setPersonSelect2($("<input />").attr('type','hidden').addClass('checkEntryLimitWithPerson'), data);
				
				
		}
	
		
		var checkEntryLimitWithAddHousehold = function(data){
		
		
				setHouseholdSelect2($("<input />").attr('type','hidden').addClass('checkEntryLimitWithHousehold'), data);
				
				
		}
		
						
		if(data && data['person']){
		
			var entitiesPerson = data['person'].split('|');
			
			for(key in entitiesPerson){
				
				if(entitiesPerson.hasOwnProperty(key)){
					
					var setDataPerson = [];
					var entitiesPersonItem = entitiesPerson[key].split(',');
					
					for(var i=0;i<entitiesPersonItem.length;i++){
					
						if(entitiesPersonItem[i].length == 36 && $("#"+entitiesPersonItem[i]).data('id')){
							setDataPerson.push({id: entitiesPersonItem[i], text: $("#"+entitiesPersonItem[i]).data('label') || $("#"+entitiesPersonItem[i]).data('validation')  || $("#"+entitiesPersonItem[i]).data('type')});
						}
						
					}
					
					checkEntryLimitWithAddPerson(setDataPerson);
				}
			
			}
		}
		if($(".checkEntryLimitWithPerson").length == 0)checkEntryLimitWithAddPerson('');
		
		
		
		if(data && data['household']){
		
			var entitiesHousehold = data['household'].split('|');
			
			for(key in entitiesHousehold){
				
				if(entitiesHousehold.hasOwnProperty(key)){
					
					var setDataHousehold = [];
					var entitiesHouseholdItem = entitiesHousehold[key].split(',');
					
					for(var i=0;i<entitiesHouseholdItem.length;i++){
						
						if(entitiesHouseholdItem[i].length == 36 && $("#"+entitiesHouseholdItem[i]).data('id')){
							setDataHousehold.push({id: entitiesHouseholdItem[i], text: $("#"+entitiesHouseholdItem[i]).data('label') || $("#"+entitiesHouseholdItem[i]).data('validation')  || $("#"+entitiesHouseholdItem[i]).data('type')});
						}
						
					}
					
					checkEntryLimitWithAddHousehold(setDataHousehold);
				}
			
			}
		}
		
		if($(".checkEntryLimitWithHousehold").length == 0)checkEntryLimitWithAddHousehold('');
		
			
		$(".checkEntryLimitWithAddPerson").tooltip({container: $("#pageDesignModal .modal-body")}).off("click").on("click", function(e){
				
			e.preventDefault();
			checkEntryLimitWithAddPerson('');
				
		})
		
		
		$(".checkEntryLimitWithAddHousehold").tooltip({container: $("#pageDesignModal .modal-body")}).off("click").on("click", function(e){
		
			e.preventDefault();
			checkEntryLimitWithAddHousehold('');
			
		})

		
	},
	
	initCheckEligibilityWith: function(data){
		
		var setDataDOB = [];
		
		if(data && data['dob']){
		
			var fields = data['dob'].split(',');	
			
			for(var i=0;i<fields.length;i++){
				
				if(fields[i].length == 36 && $("#"+fields[i]).data('id')){						
			
					setDataDOB.push({id: fields[i]	, text: $("#"+fields[i]).data('label') || $("#"+fields[i]).data('validation')  || $("#"+fields[i]).data('type')});
					
				}
				
			}
			
		}
						
				
		$(".checkEligibilityWithDOB").select2({
   			multiple: true,
			query: function (query) {
				var data = {results: []};
				
				$(".gridster ul .dataCache").each(function(){
				
					if($(this).data('id')){
						
						if($(this).data('type') == 'date-of-birth')
							data.results.push({id: $(this).data('id'), text: $(this).data('label')  || $(this).data('validation') || $(this).data('type')});
						
					}
					
				})
				
				query.callback(data);
			}	
			
		}).select2("data", setDataDOB);
		
		var setDataState = [];
		
		if(data && data['state']){
		
			var fields = data['state'].split(',');	
			
			for(var i=0;i<fields.length;i++){
			
				if(fields[i].length == 36 && $("#"+fields[i]).data('id')){						
			
					setDataState.push({id: fields[i], text: $("#"+fields[i]).data('label') || $("#"+fields[i]).data('validation')  || $("#"+fields[i]).data('type')});
					
				}
				
			}
			
		}
						
				
		$(".checkEligibilityWithState").select2({
   			multiple: true,
			query: function (query) {
				var data = {results: []};
				
				$(".gridster ul .dataCache").each(function(){
				
					if($(this).data('id')){
						
						if($(this).data('type') == 'state-drop-down' || $(this).data('type') == 'text-field' || $(this).data('type') == 'drop-down' || $(this).data('type') == 'radio-button'){
							data.results.push({id: $(this).data('id'), text: $(this).data('label')  || $(this).data('validation') || $(this).data('type')});
						}
						
					}
					
				})
				
				query.callback(data);
			}	
			
		}).select2("data", setDataState);
		
		var setDataCountry = [];
		
		if(data && data['country']){
		
			var fields = data['country'].split(',');	
			
			for(var i=0;i<fields.length;i++){
			
				if(fields[i].length == 36 && $("#"+fields[i]).data('id')){						
			
					setDataCountry.push({id: fields[i], text: $("#"+fields[i]).data('label') || $("#"+fields[i]).data('validation')  || $("#"+fields[i]).data('type')});
					
				}
				
			}
			
		}
						
				
		$(".checkEligibilityWithCountry").select2({
   			multiple: true,
			query: function (query) {
				var data = {results: []};
				
				$(".gridster ul .dataCache").each(function(){
				
					if($(this).data('id')){
						
						if($(this).data('type') == 'country-drop-down' || $(this).data('type') == 'text-field' || $(this).data('type') == 'drop-down' || $(this).data('type') == 'radio-button'){
							data.results.push({id: $(this).data('id'), text: $(this).data('label')  || $(this).data('validation') || $(this).data('type')});
						}
						
					}
					
				})
				
				query.callback(data);
			}	
			
		}).select2("data", setDataCountry);
		
		
	},
	
	
	generateUUID: function(){
		
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
		
	},
	
	addPageElement: function(objGridster, objTemplate, objExternalElement, isEdit){
		
		
		var el = this.$el;	
		objTemplate.find('.pageElementTitle').text(objExternalElement.parents('.dataCache').data('title'));
		objTemplate.find('.pageElementDesc').text(objExternalElement.parents('.dataCache').data('desc'));
			
		
		objTemplate.data('type', objExternalElement.parents('.dataCache').data('type'));
		objTemplate.data('value', objExternalElement.parents('.dataCache').data('value'));
		objTemplate.data('maxlength', objExternalElement.parents('.dataCache').data('maxlength'));
		objTemplate.data('req', objExternalElement.parents('.dataCache').data('req'));
		objTemplate.data('validation', objExternalElement.parents('.dataCache').data('validation'));
		objTemplate.data('label', objExternalElement.parents('.dataCache').data('label'));
		objTemplate.data('style', objExternalElement.parents('.dataCache').data('style'));
		objTemplate.data('prechecked', objExternalElement.parents('.dataCache').data('prechecked'));
		objTemplate.data('abbreviated', objExternalElement.parents('.dataCache').data('abbreviated'));
		objTemplate.data('custom', objExternalElement.parents('.dataCache').data('custom'));
		objTemplate.data('action', objExternalElement.parents('.dataCache').data('action'));
		objTemplate.data('image-url', objExternalElement.parents('.dataCache').data('image-url'));
		objTemplate.data('match', objExternalElement.parents('.dataCache').data('match'));
		objTemplate.data('editable', objExternalElement.parents('.dataCache').data('editable'));
		
		
		if(objExternalElement.parents('.dataCache').data('editable') == false){
			
			objTemplate.find('.editPageElement').hide();
			
		}else{
			
			objTemplate.find('.editPageElement').on("click", $.proxy(function(e){
			
				e.preventDefault();
				
				var objPageEditBttn = $(e.target).hasClass('editPageElement') ? $(e.target) :  $(e.target).parents('.editPageElement');
				
				this.editPageElementPopover(objPageEditBttn);
							
			}, this));
			
		}
		
		
		this.bindRemovePageElementButton(objTemplate);
		
		
		if(!objTemplate.data('id')){
		
			var uuid = this.generateUUID();
			objTemplate.data('id', uuid);	
			objTemplate.prop('id', uuid);	
			
		}
		
		if(!isEdit){

			
			
			objGridster.add_widget(objTemplate, 12, 1);
			
		}
			
		if(this.formFieldElements.indexOf(objTemplate.data('type')) !== -1){
			$(".additionalOptionsForm").show();
			
		}
		
		
		
		this.updateEntryLimitEligibilityFields(objTemplate);
			
					
		objTemplate.scrollintoview();
		
		objExternalElement.popover('hide');
			
			
		
	},
	
	bindRemovePageElementButton: function(objTemplate){
		
		var formFieldElements = this.formFieldElements;
		
		objTemplate.find('.removePageElement').on("click", function(e){
			
			e.preventDefault();
			
			if($(this).siblings('.editPageElement').is(":visible"))$(this).siblings('.editPageElement').popover('hide');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			objGridster.remove_widget($(this).parents('li.gridsterItem'));
						
			var objRemoved = $(this).parents('li.gridsterItem');

			if($(".gridsterItem").filter(function(){
				
				return !$(this).is(objRemoved) && formFieldElements.indexOf($(this).data('type')) !== -1
				
			}).length == 0){
				$(".additionalOptionsForm").hide();
			}
			
			objGridster.remove_widget($(".gridsterItem").filter(function(){
				
				return $(this).data('validation') == 'match' && $(this).data('match') == objRemoved.data('id')
				
			}));
			
			$(".checkEntryLimitWithPerson, .checkEntryLimitWithHousehold, .checkEligibilityWithDOB, .checkEligibilityWithState, checkEligibilityWithCountry").each(function(){
				
				$(this).select2('data', _.without($(this).select2('data'), _.findWhere($(this).select2('data'), {id: objRemoved.data('id')})));
				
			})
			
		})
		
	},
	
	updateEntryLimitEligibilityFields: function(objTemplate){
				
		if(objTemplate.data('type') == 'text-field' && objTemplate.data('validation') == 'email' && objTemplate.data('id')){
			
			var data = $(".checkEntryLimitWithPerson").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(data.length==0)data.push({id: objTemplate.data('id'), text: objTemplate.data('label')  || objTemplate.data('validation') || objTemplate.data('type')});
			
			$(".checkEntryLimitWithPerson").select2("data", data);

		} 
		
		if(objTemplate.data('type') == 'text-field' && objTemplate.data('validation') == 'address' && objTemplate.data('id')){
			
			var data = $(".checkEntryLimitWithHousehold").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(!_.findWhere(data, {type: 'address'})){
				
				data.push({id: objTemplate.data('id'), text: objTemplate.data('label') || objTemplate.data('validation') || objTemplate.data('type'), type: 'address'});
			}
			
			
			$(".checkEntryLimitWithHousehold").select2("data", data);

		} 
		
		if(objTemplate.data('type') == 'text-field' && (objTemplate.data('validation') == 'zip' || objTemplate.data('validation') == 'zip_with_ca' || objTemplate.data('validation') == 'zip_ca_only') && objTemplate.data('id')){
			
			var data = $(".checkEntryLimitWithHousehold").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(!_.findWhere(data, {type: 'zip'})){
				data.push({id: objTemplate.data('id'), text: objTemplate.data('label') || objTemplate.data('validation') || objTemplate.data('type'), type: 'zip'});
			}
			$(".checkEntryLimitWithHousehold").select2("data", data);

		} 
		
		if(objTemplate.data('type') == 'country-drop-down' &&  objTemplate.data('id')){
			
			var data = $(".checkEligibilityWithCountry").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(data.length==0)data.push({id: objTemplate.data('id'), text: objTemplate.data('label') || objTemplate.data('validation') || objTemplate.data('type')});
			
			$(".checkEligibilityWithCountry").select2("data", data);

		} 

		
		if(objTemplate.data('type') == 'state-drop-down' &&  objTemplate.data('id')){
			
			var data = $(".checkEligibilityWithState").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(data.length==0)data.push({id: objTemplate.data('id'), text: objTemplate.data('label') || objTemplate.data('validation') || objTemplate.data('type')});
			
			$(".checkEligibilityWithState").select2("data", data);

		} 
		
		if(objTemplate.data('type') == 'date-of-birth' &&  objTemplate.data('id')){
			
			var data = $(".checkEligibilityWithDOB").select2("data");
			
			data = typeof data == 'object' && data.length > 0 ? data : [];
			
			if(data.length==0)data.push({id: objTemplate.data('id'), text: objTemplate.data('label') || objTemplate.data('validation') || objTemplate.data('type')});
			
			$(".checkEligibilityWithDOB").select2("data", data);

		} 
		
	},
	
	initTextareaWYSIWYG: function(obj){
				
		var customTemplate = {
				
		  html : function(locale) {
			return "<li>" +
				   "<div class='btn-group'>" +
				   "<a class='btn btn-xs btn-default' data-wysihtml5-action='change_view' title='" + locale.html.edit + "'>HTML</a>" +
				   "</div>" +
				   "</li>";
		  }
		}

		var value = '';
		
		if(typeof obj == 'object' && obj.length > 0){	
		
			var value = typeof obj.parents('.dataCache').data('value') != 'undefined' ? obj.parents('.dataCache').data('value') : obj.parents('.dataCache').data('label');
			
		}
				
		$('.popover textarea[data-wysihtml5="true"]').val(value).wysihtml5({
			"font-styles": true,
			"emphasis": true,
			"lists": true,
			"html": true,
			"link": true,
			"image": true,
			"color": true,
			"size": 'xs',
			"stylesheets": ['/css/wysiwyg-color.css'],
			"customTemplates": customTemplate,
			parser: function(html){return html}
			

		});
	
	},
	
	editPageElementPopover: function(objPageEditBttn){
		
 	    $('.initialized').not(objPageEditBttn).popover('hide');
		setTimeout(function(){$(".popover").scrollintoview();}, 100);
		if(objPageEditBttn.hasClass('initialized'))return;
		
		var type = objPageEditBttn.parents('.dataCache').data('type');
				
		objPageEditBttn.popover({
			
			html: true,
			placement: 'bottom',
			title: $("#leftMenu .dataCache").filter(function(){return $(this).data('type') == type }).find('.external-event-template').data('title'),
			content: $("#leftMenu .dataCache").filter(function(){return $(this).data('type') == type }).find('.external-event-template').html(),
			container: $(".gridsterContainer")
			
		})
		.on('shown.bs.popover', $.proxy(function () {
			
			this.initTextareaWYSIWYG(objPageEditBttn);
			
			$('.popover .hideWhenLaunched').hide();
			
				
			this.initPopover(type, objPageEditBttn,  objPageEditBttn.parents('.dataCache').data('value'), true);
				
			
			objPageEditBttn.addClass('initialized');		
						
		}, this, objPageEditBttn))
		
		.popover('show');
				
	},
	
	
	initPageElementPopover: function(objExternalElement){
		
		$('.initialized').not(objExternalElement).popover('hide');
		setTimeout(function(){$(".popover").scrollintoview();}, 100);
		if(objExternalElement.hasClass('initialized'))return;
		objExternalElement.popover({
			
			html: true,
			placement: 'right',
			title: objExternalElement.siblings('.external-event-template').data('title'),
			content: objExternalElement.siblings('.external-event-template').html()

			
		})
		.on('shown.bs.popover', $.proxy(function () {
			
			this.initTextareaWYSIWYG();
			
			$('.popover .hideWhenLaunched').hide();
							
			this.initPopover(objExternalElement.parents('.dataCache').data('type'), objExternalElement);	
			
			objExternalElement.addClass('initialized');	
			
		}, this, objExternalElement))
		
		.popover('show');
				
	},
	initPopover: function(type, objExternalElement, value, isEdit){
		
		switch(type){
			case 'text':
				this.initPopoverText(objExternalElement, value, isEdit);	
			break;
			case 'image':
				this.initPopoverImage(objExternalElement, value, isEdit);	
			break;
			case 'slider':
				this.initPopoverSlider(objExternalElement, value, isEdit);	
			break;
			case 'link':
				this.initPopoverLink(objExternalElement, value, isEdit);	
			break;
			case 'image-link':
				this.initPopoverImageLink(objExternalElement, value, isEdit);	
			break;
			case 'button-link':
				this.initPopoverButtonLink(objExternalElement, value, isEdit);	
			break;
			case 'text-field':
				this.initPopoverTextField(objExternalElement, value, isEdit);	
			break;
			case 'phone-field':
				this.initPopoverPhoneField(objExternalElement, value, isEdit);	
			break;
			case 'checkbox':
				this.initPopoverCheckbox(objExternalElement, value, isEdit);	
			break;
			case 'state-drop-down':
				this.initPopoverStateDropdown(objExternalElement, value, isEdit);	
			break;
			case 'drop-down':
				this.initPopoverDropdown(objExternalElement, value, isEdit);	
			break;
			case 'prefill-with-facebook':
				this.initPopoverPrefillWithFacebook(objExternalElement, value, isEdit);	
			break;
			case 'country-drop-down':
				this.initPopoverCountryDropdown(objExternalElement, value, isEdit);	
			break;
			case 'recaptcha':
				this.initPopoverRecaptcha(objExternalElement, value, isEdit);	
			break;
			case 'radio-button':
				this.initPopoverRadioButton(objExternalElement, value, isEdit);	
			break;
			case 'hidden-input':
				this.initPopoverHiddenInput(objExternalElement, value, isEdit);	
			break;
			case 'submit-button':
				this.initPopoverSubmitButton(objExternalElement, value, isEdit);	
			break;
			case 'textarea':
				this.initPopoverTextarea(objExternalElement, value, isEdit);	
			break;
			case 'date-of-birth':
				this.initPopoverDateOfBirth(objExternalElement, value, isEdit);	
			break;
			case 'like-button':
				this.initPopoverLikeButton(objExternalElement, value, isEdit);	
			break;
			case 'like-box':
				this.initPopoverLikeBox(objExternalElement, value, isEdit);	
			break;
			case 'send-button':
				this.initPopoverSendButton(objExternalElement, value, isEdit);	
			break;
			case 'share-button':
				this.initPopoverShareButton(objExternalElement, value, isEdit);	
			break;
			case 'embedded-post':
				this.initPopoverEmbeddedPost(objExternalElement, value, isEdit);	
			break;
			case 'follow-button':
				this.initPopoverFollowButton(objExternalElement, value, isEdit);	
			break;
			case 'comment-box':
				this.initPopoverCommentBox(objExternalElement, value, isEdit);	
			break;
			case 'disqus':
				this.initPopoverDisqus(objExternalElement, value, isEdit);	
			break;
			case 'app-request':
				this.initPopoverAppRequest(objExternalElement, value, isEdit);	
			break;
			case 'fb-send':
				this.initPopoverSendDialog(objExternalElement, value, isEdit);	
			break;
			case 'fb-share':
				this.initPopoverFBShareDialog(objExternalElement, value, isEdit);	
			break;
			case 'twitter-share':
				this.initPopoverTwitterShare(objExternalElement, value, isEdit);	
			break;
			case 'google-plus-share':
				this.initPopoverGooglePlusShare(objExternalElement, value, isEdit);	
			break;
			case 'pinterest-share':
				this.initPopoverPinterestShare(objExternalElement, value, isEdit);	
			break;
			case 'linkedin-share':
				this.initPopoverLinkedInShare(objExternalElement, value, isEdit);	
			break;
			case 'email-share':
				this.initPopoverEmailShare(objExternalElement, value, isEdit);	
			break;
			
		}
		
	},
	
	initPopoverEmailShare: function(objExternalElement, value, isEdit){
	
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
			hiddencallback: $(".popover .fieldShareImage"),
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
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldShareCopy").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldShareImage").val(objExternalElement.parents('.dataCache').data('image-url'));
		
		}	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Email Share Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldShareCopy').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldShareImage').val());

		
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverLinkedInShare: function(objExternalElement, value, isEdit){
	
		$(".popover .addLinkLayoutOption").on("change" ,function(){
		
			if($(this).val() == 'custom')$(".popover .custom-button-only").show();
			else $(".popover .custom-button-only").hide();
			
		})		
		
		$(".popover .uploadSliderImage").tooltip();
			
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.custom-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.custom-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.custom-button-only').find('.fieldCustomButtonImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
				
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkLayoutOption").val(objExternalElement.parents('.dataCache').data('style')).trigger("change");
			$(".popover .fieldCustomButtonImageUrl").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .fieldTitle").val(objExternalElement.parents('.dataCache').data('action'));
			$(".popover .fieldSource").val(objExternalElement.parents('.dataCache').data('custom'));
			$(".popover .fieldSummary").val(objExternalElement.parents('.dataCache').data('value'));

		}	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','LinkedIn Share Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkLayoutOption').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldCustomButtonImageUrl').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldTitle').val());
			objExternalElement.parents('.dataCache').data('custom', $('.popover .addForm').find('.fieldSource').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldSummary').val());

		
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverPinterestShare: function(objExternalElement, value, isEdit){
		
		$(".popover .fieldStyle").on("change" ,function(){
		
			if($(this).val() == 'custom')$(".popover .custom-button-only").show();
			else $(".popover .custom-button-only").hide();
			
		})
		
		
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
			hiddencallback: $(".popover .fieldShareImage"),
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
		
		$(".popover .uploadSliderImage").tooltip();
			
		$(".popover .browseComputer2").fileUpload({
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.custom-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.custom-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.custom-button-only').find('.fieldCustomButtonImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
		
			
		if(isEdit){
						
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldShareImage").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .fieldShareCopy").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldStyle").val(objExternalElement.parents('.dataCache').data('style')).trigger("change");
			$(".popover .fieldCustomButtonImageUrl").val(objExternalElement.parents('.dataCache').data('custom'));
			$(".popover .fieldPinCount").val(objExternalElement.parents('.dataCache').data('action'));
			
		}
		
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Pin It Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldURL').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldShareImage').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldPinCount').val());
			objExternalElement.parents('.dataCache').data('custom', $('.popover .addForm').find('.fieldCustomButtonImageUrl').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldShareCopy').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldStyle').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverGooglePlusShare: function(objExternalElement, value, isEdit){
	
	
		$(".popover .addLinkLayoutOption").on("change" ,function(){
		
			if($(this).val() == 'custom')$(".popover .custom-button-only").show();
			else $(".popover .custom-button-only").hide();
			
		})		
		
		$(".popover .uploadSliderImage").tooltip();
			
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.custom-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.custom-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.custom-button-only').find('.fieldCustomButtonImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
					
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkLayoutOption").val(objExternalElement.parents('.dataCache').data('style')).trigger("change");
			$(".popover .fieldCustomButtonImageUrl").val(objExternalElement.parents('.dataCache').data('image-url'));
		}	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Google Plus Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkLayoutOption').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldCustomButtonImageUrl').val());

			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverTwitterShare: function(objExternalElement, value, isEdit){
		
		$(".popover .fieldStyle").on("change" ,function(){
		
			if($(this).val() == 'custom')$(".popover .custom-button-only").show();
			else $(".popover .custom-button-only").hide();
			
			if($(this).val() && $(this).val().indexOf('follow') !== -1){
				
				$(".popover .hide-follow-only").hide();
				
			}else $(".popover .hide-follow-only").show();
			
			if($(this).val() && $(this).val().indexOf('hashtag') !== -1){
				
				$(".popover .hashtag-only").show();
				
			}else $(".popover .hashtag-only").hide();
			
			if($(this).val() && ($(this).val().indexOf('mention') !== -1 || $(this).val().indexOf('follow') !== -1)){
				
				$(".popover .follow-or-mention-only").show();
				
			}else $(".popover .follow-or-mention-only").hide();
			
		})		
		
		$(".popover .uploadSliderImage").tooltip();
			
		$(".popover .browseComputer2").fileUpload({
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.custom-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.custom-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.custom-button-only').find('.fieldCustomButtonImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
					
		if(isEdit){
			
			$(".popover .fieldShareCopy").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldStyle").val(objExternalElement.parents('.dataCache').data('style')).trigger("change");
			$(".popover .fieldCustomButtonImageUrl").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .fieldShareHashtag").val(objExternalElement.parents('.dataCache').data('action'));
			$(".popover .fieldShareMention").val(objExternalElement.parents('.dataCache').data('custom'));
		}
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Twitter Share Popup');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldStyle option:selected').text()).text());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldShareCopy').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldCustomButtonImageUrl').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldStyle').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldShareHashtag').val());
			objExternalElement.parents('.dataCache').data('custom', $('.popover .addForm').find('.fieldShareMention').val());

			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverFBShareDialog: function(objExternalElement, value, isEdit){
		
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
			hiddencallback: $(".popover .fieldShareButtonImage"),
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
		
		$(".popover .uploadSliderImage").tooltip();
			
		$(".popover .browseComputer2").fileUpload({
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.image-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.image-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.image-button-only').find('.fieldImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
		
			
		if(isEdit){
						
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('action'));
			$(".popover .fieldShareButtonImage").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .fieldImageUrl").val(objExternalElement.parents('.dataCache').data('style'));
			$(".popover .fieldShareTitle").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldShareCopy").val(objExternalElement.parents('.dataCache').data('value'));
		}
		
		
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Feed Dialog');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldShareTitle').val()).text());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldShareButtonImage').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldImageUrl').val());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldShareTitle').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldShareCopy').val());
			
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverSendDialog: function(objExternalElement, value, isEdit){
		
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
			hiddencallback: $(".popover .fieldImage"),
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
			
		if(isEdit){
						
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldImage").val(objExternalElement.parents('.dataCache').data('image-url'));
						
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Send Dialog');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldURL').val()).text());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldImage').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverAppRequest: function(objExternalElement, value, isEdit){
		
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
			hiddencallback: $(".popover .fieldImage"),
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
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldImage").val(objExternalElement.parents('.dataCache').data('image-url'));
						
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Request Dialog');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldImage').val());

			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	
	
	initPopoverDisqus: function(objExternalElement, value, isEdit){
		
			
		$(".popover .addURLOption").on("change" ,function(){
		
			if($(this).val() == 'custom')$(".popover .custom-only").show();
			else $(".popover .custom-only").hide();
			
		})
		
	
		if(isEdit){
						
			$(".popover .addURLOption").val(objExternalElement.parents('.dataCache').data('label')).trigger("change");
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('value'));
						
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Disqus Comment Box');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.addURLOption').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.addURLOption').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldURL').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverCommentBox: function(objExternalElement, value, isEdit){
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkColorOption").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldNumPosts").val(objExternalElement.parents('.dataCache').data('action'));
						
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Comment Box');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.addLinkColorOption').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldNumPosts').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverFollowButton: function(objExternalElement, value, isEdit){
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkLayoutOption").val(objExternalElement.parents('.dataCache').data('value'));
			
		
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Follow Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.addLinkLayoutOption').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverEmbeddedPost: function(objExternalElement, value, isEdit){
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
		
		}
	
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Embedded Post');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
		
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverShareButton: function(objExternalElement, value, isEdit){
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkLayoutOption").val(objExternalElement.parents('.dataCache').data('style'));
		
		}	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Share Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkLayoutOption').val());
		
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverSendButton: function(objExternalElement, value, isEdit){
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
		
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Facebook Send Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
		
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverLikeBox: function(objExternalElement, value, isEdit){
		
		if(this.options.pageItem.el['type'] == 'like-gate'){
			 $('.popover .addForm').find('.fieldLabel').prop('placeholder',  $('.popover .addForm').find('.fieldLabel').prop('placeholder')+ $('.popover .addForm').find('.fieldLabel').data('placeholder-likegate-only'));
		}
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkColorOption").val(objExternalElement.parents('.dataCache').data('value'));
			if(objExternalElement.parents('.dataCache').data('action') == 'show-posts'){
			
				$(".popover .fieldShowPosts").prop("checked",true);
		
			}else{
		
				$(".popover .fieldShowPosts").prop("checked",false);
	
			}
			
		
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Like Box');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.addLinkColorOption').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldShowPosts').is(":checked") ? 'show-posts' : '');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverLikeButton: function(objExternalElement, value, isEdit){
	
		if(this.options.pageItem.el['type'] == 'like-gate'){
			 $('.popover .addForm').find('.fieldLabel').prop('placeholder',  $('.popover .addForm').find('.fieldLabel').prop('placeholder')+ $('.popover .addForm').find('.fieldLabel').data('placeholder-likegate-only'));
		}
	
		if(isEdit){
						
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .addLinkLayoutOption").val(objExternalElement.parents('.dataCache').data('value'));
			
			if(objExternalElement.parents('.dataCache').data('style') == 'include-share-button'){
			
				$(".popover .fieldIncludeShareButton").prop("checked",true);
		
			}else{
		
				$(".popover .fieldIncludeShareButton").prop("checked",false);
	
			}
		}
		
	
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Like Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.addLinkLayoutOption').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldIncludeShareButton').is(":checked") ? 'include-share-button' : '');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverImageLink: function(objExternalElement, value, isEdit){
		
		
		$(".popover .addLinkOpenOption").on("change" ,function(){
		
			if($(this).val() == 'popup')$(".popover .link-popup-only").show();
			else $(".popover .link-popup-only").hide();
			
		})
		
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
			hiddencallback: $(".popover .fieldLabel"),
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
		
		
		if(isEdit){
						
		
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .addLinkOpenOption").val(objExternalElement.parents('.dataCache').data('action')).trigger('change');
	
			var popupStyle = (objExternalElement.parents('.dataCache').data('style') || '').split('x');
	
			$(".popover .popupWidth").val(popupStyle[0]);
			$(".popover .popupHeight").val(popupStyle[1]);
	
		}
		$(".popover .findPage").tooltip();
		
		
		$(".popover .findPage").editable({
			showbuttons: false,
			type: 'select',
			display: function(value, sourceData){
			
				
			},
			source: $.proxy(function(){
				
				$(".popover").filter(function(){
			
					return $(this).find('.popover-title').text() == 'Use an existing page'
					
				})
				.find('.arrow').hide();

				var choices = [
			
				];
				
				var pages = this.options.view.collection.pluck('pages')[0];
				
				if(typeof pages == 'object'){
				
					for(key in pages){
					
						if(pages.hasOwnProperty(key)){
						
							choices.push({value: key, text: pages[key].name});
							
						}
						
					}	
					
					
				}
								
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).parents('.overlay-field').find('.fieldURL').val(newValue);
		    }
			
		});
		
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Image Link');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldURL').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.addLinkOpenOption').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkOpenOption').val() == 'popup' ? $('.popover .addForm').find('.popupWidth').val()+'x'+$('.popover .addForm').find('.popupHeight').val() : '');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverButtonLink: function(objExternalElement, value, isEdit){
		
		$(".popover .addLinkOpenOption").on("change" ,function(){
		
			if($(this).val() == 'popup')$(".popover .link-popup-only").show();
			else $(".popover .link-popup-only").hide();
			
		})
		
		
		if(isEdit){
						
		
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .fieldAction").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .addLinkOpenOption").val(objExternalElement.parents('.dataCache').data('action')).trigger('change');
	
			var popupStyle = (objExternalElement.parents('.dataCache').data('style') || '').split('x');
	
			$(".popover .popupWidth").val(popupStyle[0]);
			$(".popover .popupHeight").val(popupStyle[1]);
	
		}
		$(".popover .findPage").tooltip();
		
		
		$(".popover .findPage").editable({
			showbuttons: false,
			type: 'select',
			display: function(value, sourceData){
			
				
			},
			source: $.proxy(function(){
				
				$(".popover").filter(function(){
			
					return $(this).find('.popover-title').text() == 'Use an existing page'
					
				})
				.find('.arrow').hide();

				var choices = [
			
				];
				
				var pages = this.options.view.collection.pluck('pages')[0];
				
				if(typeof pages == 'object'){
				
					for(key in pages){
					
						if(pages.hasOwnProperty(key)){
						
							choices.push({value: key, text: pages[key].name});
							
						}
						
					}	
					
					
				}
								
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).parents('.overlay-field').find('.fieldURL').val(newValue);
		    }
			
		});
		
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Button Link');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldURL').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.fieldAction').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.addLinkOpenOption').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkOpenOption').val() == 'popup' ? $('.popover .addForm').find('.popupWidth').val()+'x'+$('.popover .addForm').find('.popupHeight').val() : '');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverLink: function(objExternalElement, value, isEdit){
		
		
		$(".popover .addLinkOpenOption").on("change" ,function(){
		
			if($(this).val() == 'popup')$(".popover .link-popup-only").show();
			else $(".popover .link-popup-only").hide();
			
		})
		
		
		if(isEdit){
						
		
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			$(".popover .fieldURL").val(objExternalElement.parents('.dataCache').data('value'));
			$(".popover .addLinkOpenOption").val(objExternalElement.parents('.dataCache').data('action')).trigger('change');
	
			var popupStyle = (objExternalElement.parents('.dataCache').data('style') || '').split('x');
	
			$(".popover .popupWidth").val(popupStyle[0]);
			$(".popover .popupHeight").val(popupStyle[1]);
	
		}
		$(".popover .findPage").tooltip();
		
		
		$(".popover .findPage").editable({
			showbuttons: false,
			type: 'select',
			display: function(value, sourceData){
			
				
			},
			source: $.proxy(function(){
				
				$(".popover").filter(function(){
			
					return $(this).find('.popover-title').text() == 'Use an existing page'
					
				})
				.find('.arrow').hide();

				var choices = [
			
				];
				
				var pages = this.options.view.collection.pluck('pages')[0];
				
				if(typeof pages == 'object'){
				
					for(key in pages){
					
						if(pages.hasOwnProperty(key)){
						
							choices.push({value: key, text: pages[key].name});
							
						}
						
					}	
					
					
				}
								
				return choices;
				
			},this),
			success: function(response, newValue) {
				$(this).parents('.overlay-field').find('.fieldURL').val(newValue);
		    }
			
		});
		
			
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Link');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldURL').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addForm').find('.fieldURL').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.addLinkOpenOption').val());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.addLinkOpenOption').val() == 'popup' ? $('.popover .addForm').find('.popupWidth').val()+'x'+$('.popover .addForm').find('.popupHeight').val() : '');
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverDateOfBirth: function(objExternalElement, value, isEdit){
		
		if(isEdit){
						
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
			if(typeof objExternalElement.parents('.dataCache').data('style') == 'object'){
				
				$(".fieldDOB").prop("checked",false);
				$(".fieldDOB").filter(function(){
					
					return objExternalElement.parents('.dataCache').data('style').indexOf($(this).prop('value')) !== -1
				
				}).prop("checked",true);
		
	
			}			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Date of Birth');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req', $('.popover .addForm').find('.fieldRequired').is(":checked"));
			
			
			var dobArray = [];
			
			$('.popover .addForm').find('.fieldDOB:visible:checked').each(function(){
			
				dobArray.push($(this).val());	
				
			})
			
			objExternalElement.parents('.dataCache').data('style', dobArray);
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverTextarea: function(objExternalElement, value, isEdit){
		
		if(isEdit){
						
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Textarea');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.addTextContent').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.addTextContent').val());
			objExternalElement.parents('.dataCache').data('req', $('.popover .addForm').find('.fieldRequired').is(":checked"));
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));
		

	},
	
	
	
	initPopoverText: function(objExternalElement, value, isEdit){
		
		
		$(".popover .addNewTextForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Text');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addNewTextForm').find('.addTextContent').val()).text());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addNewTextForm').find('.addTextContent').val());
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addTextCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addNewTextForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverPrefillWithFacebook: function(objExternalElement, value, isEdit){
		
		$(".popover .fieldMatch, .popover .mapFields").empty();
		
		$(".gridster ul .dataCache").each(function(){
		
			if($(this).data('id') && ($(this).data('type') == 'text-field' || $(this).data('type') == 'phone-field'  || $(this).data('type') == 'date-of-birth' || $(this).data('type') == 'radio-button' || $(this).data('type') == 'state-drop-down'  || $(this).data('type') == 'country-drop-down' || $(this).data('type') == 'drop-down' || $(this).data('type') == 'hidden-input')){
								
				$(".popover .fieldMatch").append($("<option />").attr('value', $(this).data('id')).text($(this).data('label')  || $(this).data('validation') || $(this).data('type')));
				
			}
			
		})
		
		var isEdit = isEdit;
				
		var addNewMap = function(permissionField, formField){
		
			var mapFieldsTemplate = $($('.popover .mapFieldsTemplate').html());
									
			mapFieldsTemplate.find(".mapFieldPermission, .fieldMatch").select2();
			mapFieldsTemplate.find(".removeMap, .addMap").tooltip();
			mapFieldsTemplate.find(".addMap").on('click', function(e){
		
				e.preventDefault();
				addNewMap();	
				
			
			});
			
			mapFieldsTemplate.find(".removeMap").on('click', function(e){
		
				e.preventDefault();
								
				if(!isEdit){
					$(this).parents('.popover').css("top", parseFloat($(this).parents('.popover').css("top")) + ($(".popover .mapItem").eq(0).outerHeight(true)/2));
				}
				
				$(this).parents('.mapItem').remove();
				
				$(".popover .addMap, .popover.removeMap").hide();
			
				$(".popover .mapFields").find('.addMap').last().show();
								
				if($(".popover .mapFields .addMap").length > 1){
				
					$(".popover .mapFields").find('.removeMap').show();
				}else $(".popover .mapFields").find('.removeMap').hide();
				
				
			});
		
			if(permissionField)mapFieldsTemplate.find('select.mapFieldPermission').select2("val", permissionField);
			if(formField)mapFieldsTemplate.find('select.fieldMatch').select2("val", formField);
			
			$(".popover .mapFields").append(mapFieldsTemplate);
			
			$(".popover .addMap, .popover.removeMap").hide();
			
			$(".popover .mapFields").find('.addMap').last().show();
			
			if($(".popover .mapFields .addMap").length > 1){
				
				$(".popover .mapFields").find('.removeMap').show();
			}
			if(!isEdit){
				$(".popover .mapFields").eq(0).parents('.popover').css("top", parseFloat($(".popover .mapFields").eq(0).parents('.popover').css("top")) - ($(".popover .mapItem").eq(0).outerHeight(true)/2));
			}

			
		}
		
		if(isEdit){
												
			$(".popover .addImageContent").val(objExternalElement.parents('.dataCache').data('image-url'));
			if(objExternalElement.parents('.dataCache').data('value')){
				
				var fieldValues = objExternalElement.parents('.dataCache').data('value').split(',');
				
				if(fieldValues.length>0){
					
					for(var i=0;i<fieldValues.length;i++){
						
						fieldMatch = fieldValues[i].split('|');
						addNewMap(fieldMatch[0], fieldMatch[1]);
						
					}
				}else addNewMap();
				
			}
			
			
		}else addNewMap();
		
			
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
			hiddencallback: $(".popover .addImageContent"),
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
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Autofill with Facebook');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.addImageContent').val()).text());
			objExternalElement.parents('.dataCache').data('image-url', $('.popover .addForm').find('.addImageContent').val());
			
			var fieldValue=[];
			
			$(".popover .mapItem").each(function(index, element) {
                
				if(typeof $(this).find(".mapFieldPermission").select2('data') == 'object' && $(this).find(".mapFieldPermission").select2('data')  != null && $(this).find(".mapFieldPermission").select2('data').id && typeof $(this).find(".fieldMatch").select2('data') == 'object' && $(this).find(".fieldMatch").select2('data')  != null && $(this).find(".fieldMatch").select2('data').id){
					fieldValue.push($(this).find(".mapFieldPermission").select2('data').id+"|"+$(this).find(".fieldMatch").select2('data').id);
				}
				
            });
			
			fieldValue=fieldValue.join(',');
			objExternalElement.parents('.dataCache').data('value', fieldValue);
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverImage: function(objExternalElement, value, isEdit){
		
		var el = this.$el;	
		
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
			hiddencallback: $(".popover .addImageContent"),
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
		
		$('.popover .addNewImageForm').find('.addImageContent').val(value);
		$(".popover .addNewImageForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Image');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addNewImageForm').find('.addImageContent').val()).text());
			objExternalElement.parents('.dataCache').data('value', $('.popover .addNewImageForm').find('.addImageContent').val());
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addImageCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addNewImageForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverSlider: function(objExternalElement, value, isEdit){
		
		var el = this.$el;	
		
		var isEdit = isEdit;
				
		$('.popover .addMoreSliderImage').on("click", function(e){
		
			e.preventDefault();
			
			var addSliderItemTemplate = $($('.addSliderItemTemplate').html());
			$(".popover .addSliderContainer").append(addSliderItemTemplate);
			
			
			$(".popover .uploadSliderImage, .popover .deleteSliderItem").tooltip();
			
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
				maxFileSize: 1, 
				onBeforeUpload: function($el){
					$el.hide();
					$el.parents('.sliderItem').find('.cloudUploadIcon').hide();
				  },
				onSuccess: function($el){
					$el.parents('.sliderItem').find('.cloudUploadIcon').show();
				  }, 
				callback: function(data, $el){	
					$el.show();
					$el.parents('.sliderItem').find('.addSliderContent').val(data.filename);
					
				   },
				error: function(error){
				 },
				mobileDetect: false
				
			});
			
			var offsetTop = (parseInt($('.addSliderContainer').parents('.popover').css('top')) - (parseInt($(".popover .addSliderContainer input:last").height())/2));
			
			$('.addSliderContainer .deleteSliderItem').eq(0).hide();

						
			if(!isEdit)$('.addSliderContainer').parents('.popover').css('top', offsetTop);
			
			$('.popover .deleteSliderItem').on("click", function(e){
		
				e.preventDefault();
				
				var offsetTop = (parseInt($('.addSliderContainer').parents('.popover').css('top')) + (parseInt($(this).parents('.sliderItem').height())/2));
								
				if(!isEdit)$('.addSliderContainer').parents('.popover').css('top', offsetTop);

				$(this).parents('.sliderItem').remove();
				
			})
		
			
		})
		
		if(value !='' && typeof value != 'object' && typeof value != 'undefined'){
			
			value = value.split(',');
			
		}
		
		if(typeof value == 'object'){
		
			for(i=0;i<value.length;i++){
				
				 $('.popover .addMoreSliderImage').trigger('click');
				 
				 $('.popover .addNewSliderForm .addSliderContent:visible:last').val(value[i]);
				 	
				
			}	
			
		}else $('.popover .addMoreSliderImage').trigger('click');
		
		$(".popover .addNewSliderForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			var slidesArray = [];
			
			$('.popover .addNewSliderForm .addSliderContent:visible').filter(function(){ return $.trim($(this).val()) != '' }).each(function(){
			
				slidesArray.push($(this).val());	
				
			})
			
			
			objExternalElement.parents('.dataCache').data('title','Slider');
			objExternalElement.parents('.dataCache').data('desc', slidesArray.length + ' slides');
			objExternalElement.parents('.dataCache').data('value', slidesArray);
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addSliderCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addNewSliderForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverTextField: function(objExternalElement, value, isEdit){
		
		$(".popover .fieldValidation").on("change", function(){
		
			if($(this).val() == 'match'){
				
				$(".popover .fieldMatch").show();
				
			}else $(".popover .fieldMatch").hide();
			
		})
		
		$(".popover .fieldMatch").empty();
		
		$(".gridster ul .dataCache").each(function(){
		
			if($(this).data('id') && $(this).data('type') == 'text-field'){
				$(".popover .fieldMatch").append($("<option />").attr('value', $(this).data('id')).text($(this).data('label')  || $(this).data('validation') || $(this).data('type')));
				
			}
				
			
		})
		
		var updateOverlayLabel = function(obj){
	
			if(!$(obj).val())return;
		
			if($(obj).find("option:selected").data('req') == true){
		
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);

			}
		
			$(".popover .fieldMaxLength").val($(obj).find("option:selected").data('maxchar'));
	
			$(".popover .fieldValidation").val($(obj).find("option:selected").data('validation-type')).trigger('change');
						
			$(".popover .fieldLabel").val($(obj).val());
			
			
			if($(obj).find("option:selected").data('validation-type') == 'match'){
				$(".popover .fieldMatch option").each(function(){
					
					if($.trim($(obj).val().toLowerCase()).indexOf($.trim($(this).text().toLowerCase())) !== -1){
					
						$(".popover .fieldMatch").val($(this).prop('value'));
						
					}
					
				})
			}
			
	
		}
	
		$(".popover .prefill").on("change", function(){
			
			updateOverlayLabel(this);
			
		})
		
		if(isEdit){
					
			$(".popover .fieldMaxLength").val(objExternalElement.parents('.dataCache').data('maxlength'));
		
			$(".popover .fieldValidation").val(objExternalElement.parents('.dataCache').data('validation')).trigger('change');
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
			$(".popover .fieldMatch").val(objExternalElement.parents('.dataCache').data('match'));
						
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
		}
		
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Text Field');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req', $('.popover .addForm').find('.fieldRequired').is(":checked"));
			objExternalElement.parents('.dataCache').data('maxlength', $('.popover .addForm').find('.fieldMaxLength').val());
			objExternalElement.parents('.dataCache').data('validation', $('.popover .addForm').find('.fieldValidation').val());
			objExternalElement.parents('.dataCache').data('match', $('.popover .addForm').find('.fieldMatch').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverPhoneField: function(objExternalElement, value, isEdit){
		
		if(isEdit){
		
			$(".popover .fieldStyle").val(objExternalElement.parents('.dataCache').data('style'));
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Phone Field');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldStyle option:selected').text()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req', $('.popover .addForm').find('.fieldRequired').is(":checked"));
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldStyle').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverHiddenInput: function(objExternalElement, value, isEdit){
		
		if(isEdit){
		
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Hidden Field');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldStyle option:selected').text()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverRecaptcha: function(objExternalElement, value, isEdit){
		
		if(isEdit){
		
			$(".popover .fieldStyle").val(objExternalElement.parents('.dataCache').data('style'));
			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Recaptcha');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldStyle option:selected').text()).text());
			objExternalElement.parents('.dataCache').data('style', $('.popover .addForm').find('.fieldStyle').val());
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	
	initPopoverCheckbox: function(objExternalElement, value, isEdit){
		
		if(isEdit){
		
			if(objExternalElement.parents('.dataCache').data('prechecked') == true){
			
				$(".popover .fieldPreChecked").prop("checked",true);
		
			}else{
		
				$(".popover .fieldPreChecked").prop("checked",false);
	
			}
						
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Checkbox');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.addTextContent').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.addTextContent').val());
			objExternalElement.parents('.dataCache').data('prechecked', $('.popover .addForm').find('.fieldPreChecked').is(":checked"));			objExternalElement.parents('.dataCache').data('req',$('.popover .addForm').find('.fieldRequired').is(":checked"));

													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverRadioButton: function(objExternalElement, value, isEdit){
		
		if(isEdit){
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
								
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
						
			$(".popover .addRadioButtonOptions").val(objExternalElement.parents('.dataCache').data('value'));
			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Radio Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req',$('.popover .addForm').find('.fieldRequired').is(":checked"));
			objExternalElement.parents('.dataCache').data('value',$('.popover .addForm').find('.addRadioButtonOptions').val());
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverCountryDropdown: function(objExternalElement, value, isEdit){
		
		
		if(isEdit){
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
								
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
			
			
			if(typeof objExternalElement.parents('.dataCache').data('value') == 'string' && objExternalElement.parents('.dataCache').data('value')){
			
				var dataObj = objExternalElement.parents('.dataCache').data('value').split(',');
				var setValue = [];
				for(var i=0;i<dataObj.length;i++){
				
					var dataObjSplit = dataObj[i].split('|');	
					
					var setObj = {};
					setObj.id = dataObjSplit[0];
					setObj.text = dataObjSplit[1];
					setObj.locked =  false;
					setObj.disabled = false;
					setObj.css = '';
					setValue.push(setObj);
					
				}
				
				
			}		
			
						
			$(".popover .addCountryDropdownOptions").select2().select2('data', setValue && setValue.length>0 ? setValue : objExternalElement.parents('.dataCache').data('value'));
			
			
		}else $(".popover .addCountryDropdownOptions").select2();
		
		
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Country Drop-down');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req',$('.popover .addForm').find('.fieldRequired').is(":checked"));
			objExternalElement.parents('.dataCache').data('value',$('.popover .addForm').find('.addCountryDropdownOptions').select2('data'));
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverDropdown: function(objExternalElement, value, isEdit){
		
		if(isEdit){
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
								
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
			
			if(objExternalElement.parents('.dataCache').data('action') == 'firstOptionNoValue'){
			
				$(".popover .firstOptionNoValue").prop("checked",true);
		
			}else{
		
				$(".popover .firstOptionNoValue").prop("checked",false);
	
			}
						
						
			$(".popover .addDropDownOptions").val(objExternalElement.parents('.dataCache').data('value'));
			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Drop-down');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('req',$('.popover .addForm').find('.fieldRequired').is(":checked"));
			objExternalElement.parents('.dataCache').data('action',$('.popover .addForm').find('.firstOptionNoValue').is(":checked") ? 'firstOptionNoValue' : '');
			objExternalElement.parents('.dataCache').data('value',$('.popover .addForm').find('.addDropDownOptions').val());
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverStateDropdown: function(objExternalElement, value, isEdit){
		
		if(isEdit){
			
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
		
			if(objExternalElement.parents('.dataCache').data('abbreviated') == true){
			
				$(".popover .fieldAbbreviated").prop("checked",true);
		
			}else{
		
				$(".popover .fieldAbbreviated").prop("checked",false);
	
			}
						
			if(objExternalElement.parents('.dataCache').data('req') == true){
			
				$(".popover .fieldRequired").prop("checked",true);
		
			}else{
		
				$(".popover .fieldRequired").prop("checked",false);
	
			}
			
			if(typeof objExternalElement.parents('.dataCache').data('value') == 'object'){
				
				$(".state-checkbox").prop("checked",false);
				$(".state-checkbox").filter(function(){
					
					return objExternalElement.parents('.dataCache').data('value').indexOf($(this).prop('value')) !== -1
				
				}).prop("checked",true);
		
	
			}			
			
			
		}
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','State Drop-down');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldLabel').val()).text());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('abbreviated', $('.popover .addForm').find('.fieldAbbreviated').is(":checked"));			
			objExternalElement.parents('.dataCache').data('req',$('.popover .addForm').find('.fieldRequired').is(":checked"));
			
			var statesArray = [];
			
			$('.popover .addForm').find('.state-checkbox:visible:checked').each(function(){
			
				statesArray.push($(this).val());	
				
			})
			objExternalElement.parents('.dataCache').data('value',statesArray);
													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	initPopoverSubmitButton: function(objExternalElement, value, isEdit){
		
		$(".popover .fieldStyle").on("change", function(){
		
			if($(this).val() == 'image-button'){
				$(".popover .image-button-only").show();
				$(".popover .regular-button-only").hide();
			}else if($(this).val() == 'regular-button'){
				$(".popover .image-button-only").hide();
				$(".popover .regular-button-only").show();
			}	
			
		})
		
		$(".popover .fieldAction").on("change", function(){
		
			if($(this).val() == 'save-and-submit'){
				$(".popover .save-and-go-to-page-only").hide();
			}else if($(this).val() == 'save-and-go-to-page'){
				$(".popover .save-and-go-to-page-only").show();
			}	
			
		})
		
		
		if(isEdit){
			
			$(".popover .fieldStyle").val(objExternalElement.parents('.dataCache').data('style')).trigger('change');
			$(".popover .fieldAction").val(objExternalElement.parents('.dataCache').data('action')).trigger('change');
			$(".popover .fieldImageUrl").val(objExternalElement.parents('.dataCache').data('image-url'));
			$(".popover .fieldLabel").val(objExternalElement.parents('.dataCache').data('label'));
				
		}
		
		$(".popover .uploadSliderImage").tooltip();
			
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
			maxFileSize: 1, 
			onBeforeUpload: function($el){
				$el.hide();
				$el.parents('.image-button-only').find('.cloudUploadIcon').hide();
			  },
			onSuccess: function($el){
				$el.parents('.image-button-only').find('.cloudUploadIcon').show();
			  }, 
			callback: function(data, $el){	
				$el.show();
				$el.parents('.image-button-only').find('.fieldImageUrl').val(data.filename);
				
			   },
			error: function(error){
			 },
			mobileDetect: false
			
		});
		
		$(".popover .addForm").on("submit",  $.proxy(function(a, event){
					
			event.preventDefault();
			
			objExternalElement.parents('.dataCache').data('title','Submit Button');
			objExternalElement.parents('.dataCache').data('desc', $('<div />').append($('.popover .addForm').find('.fieldAction').val()).text());
			objExternalElement.parents('.dataCache').data('style',$('.popover .addForm').find('.fieldStyle').val());
			objExternalElement.parents('.dataCache').data('label', $('.popover .addForm').find('.fieldLabel').val());
			objExternalElement.parents('.dataCache').data('action', $('.popover .addForm').find('.fieldAction').val());		
			objExternalElement.parents('.dataCache').data('image-url',$('.popover .addForm').find('.fieldImageUrl').val());

													
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate").html());
		
			if(!isEdit)
				this.addPageElement(objGridster,objTemplate,objExternalElement, isEdit);
			else
				this.addPageElement(objGridster,objExternalElement.parents('.dataCache'),objExternalElement, isEdit);
											
		}, this, objExternalElement)); 
		
		$('.popover .addCancel').off("click").on("click", $.proxy(function(event){
			
			event.preventDefault();
			
			$('.popover .addForm')[0].reset();
			objExternalElement.popover('hide');
			
		}, objExternalElement));

	},
	
	bindComponents: function(){
		
		var el = this.$el;	
		$(".external-event", el).on("click.addPageElement", $.proxy(function(e){
			
			e.preventDefault();
			
			var objExternalElement = $(e.target).hasClass('external-event') ? $(e.target) : $(e.target).parents('.external-event');
		
			if(objExternalElement.parents('.dataCache').data('popover') == true){
				
				if(!objExternalElement.hasClass('initialized')){
				
					this.initPageElementPopover(objExternalElement);
					return;	
					
				}
								
				$('.initialized').not(objExternalElement).popover('hide');
				return;
					
			}
			
			var objGridster = $(".gridster ul").gridster().data('gridster');
			var objTemplate = $($(".gridsterItemTemplate", el).html());
			
			this.addPageElement(objGridster,objTemplate,objExternalElement);
				
			
		}, this));
		
	},

	initComponents: function(){
		
		var el = this.$el;	
				
		var components = this.options.view.collection.pluck('components')[0]; 
		
		for(i in components){
		
			if(components.hasOwnProperty(i)){
										
				if(i == 'essaycontest' && typeof components[i] == 'object'){
					
					var fieldTypeTemplate = $("#collapseComponents .fieldTypeTemplate",el).html();
					
					_.each(components[i], function(value, key){
												
						var fieldTypeTemplateClone = fieldTypeTemplate;
						fieldTypeTemplateClone = $(fieldTypeTemplateClone);
						fieldTypeTemplateClone.find('.title').text('Essay');
						fieldTypeTemplateClone.data('id', key);
						fieldTypeTemplateClone.data('type', 'essaycontest');
						fieldTypeTemplateClone.data('desc', value['essay-description'] ||  'ID: '+ key.substring(0,2));
						fieldTypeTemplateClone.data('title', 'Essay');
						fieldTypeTemplateClone.data('editable', false);
						fieldTypeTemplateClone.tooltip({
							
							title: value['essay-description'] ||  'ID: '+ key.substring(0,2)

						})

						
						$("#collapseComponents .nav",el).append(fieldTypeTemplateClone);
					})
			
				}
				
				if(i == 'photocontest' && typeof components[i] == 'object'){
					
					var fieldTypeTemplate = $("#collapseComponents .fieldTypeTemplate",el).html();
					
					_.each(components[i], function(value, key){
												
						var fieldTypeTemplateClone = fieldTypeTemplate;
						fieldTypeTemplateClone = $(fieldTypeTemplateClone);
						fieldTypeTemplateClone.find('.title').text('Photo U/L');
						fieldTypeTemplateClone.data('id', key);
						fieldTypeTemplateClone.data('type', 'photocontest');
						fieldTypeTemplateClone.data('desc', value['photo-description'] ||  'ID: '+ key.substring(0,2));
						fieldTypeTemplateClone.data('title', 'Photo Upload');
						fieldTypeTemplateClone.data('editable', false);
						fieldTypeTemplateClone.tooltip({
							
							title: value['photo-description'] ||  'ID: '+ key.substring(0,2)

						})

						
						$("#collapseComponents .nav",el).append(fieldTypeTemplateClone);
					})
			
				}
				
				if(i == 'videocontest' && typeof components[i] == 'object'){
					
					var fieldTypeTemplate = $("#collapseComponents .fieldTypeTemplate",el).html();
					
					_.each(components[i], function(value, key){
												
						var fieldTypeTemplateClone = fieldTypeTemplate;
						fieldTypeTemplateClone = $(fieldTypeTemplateClone);
						fieldTypeTemplateClone.find('.title').text('Video U/L');
						fieldTypeTemplateClone.data('id', key);
						fieldTypeTemplateClone.data('type', 'videocontest');
						fieldTypeTemplateClone.data('desc', value['video-description'] ||  'ID: '+ key.substring(0,2));
						fieldTypeTemplateClone.data('title', 'Video Upload');
						fieldTypeTemplateClone.data('editable', false);
						fieldTypeTemplateClone.tooltip({
							
							title: value['video-description'] ||  'ID: '+ key.substring(0,2)

						})

						
						$("#collapseComponents .nav",el).append(fieldTypeTemplateClone);
					})
			
				}
				
				if(i == 'gallery' && typeof components[i] == 'object'){
					
					var fieldTypeTemplate = $("#collapseComponents .fieldTypeTemplate",el).html();
					
					_.each(components[i], function(value, key){
												
						var fieldTypeTemplateClone = fieldTypeTemplate;
						fieldTypeTemplateClone = $(fieldTypeTemplateClone);
						fieldTypeTemplateClone.find('.title').text('Gallery');
						fieldTypeTemplateClone.data('id', key);
						fieldTypeTemplateClone.data('type', 'gallery');
						fieldTypeTemplateClone.data('desc', 'ID: '+ key.substring(0,2));
						fieldTypeTemplateClone.data('title', 'Gallery');
						fieldTypeTemplateClone.data('editable', false);
						fieldTypeTemplateClone.tooltip({
							
							title: 'ID: ' + key.substring(0,2)

						})

						
						$("#collapseComponents .nav",el).append(fieldTypeTemplateClone);
					})
			
				}
				
			}	
			
		}
		
		
		
	},
	
	initCarousel: function(data, selectedPage){
		
		var el = this.$el;
		
		var templatePanels = data;	
		
		var pageInfo = templatePanels.pagesInfo[selectedPage]['panels-detail'];		
		
		$('#carouselPages .carousel-inner').empty();
				
		for(k in pageInfo){
			
						
			var carouselItemTemplate = $($("#carouselPages .carouselItemTemplate").html());
			
			carouselItemTemplate.find('.panelBttn').data('panel-id',k);
			carouselItemTemplate.find('.panelBttn').data('panel-name',pageInfo[k]);
			carouselItemTemplate.find(".panelIncompleteIcon").css('display','');
			carouselItemTemplate.find(".pageName").text(pageInfo[k]);
			carouselItemTemplate.find(".panelNumber").text(k);
			
						
			
			$('#carouselPages .carousel-inner').append(carouselItemTemplate);
			
		}
			
		$('#carouselPages .carousel-inner .item').eq(0).addClass('active');
		
		
		
		
		$('#carouselPages').carousel({
		
			interval: 0,
			wrap: false
			
		});
		
		
		
		
		$('#carouselPages .carousel-inner .item').each(function(){
			
		
			
		  var next = $(this).nextAll(':lt(3)');
				  
		  next.find('.item-content:first-child').clone(true).appendTo($(this));
		  
		  if (next.length < 3 && $('#carouselPages .carousel-inner .item').length > 4) {
						
			$(this).siblings(':lt(3)').slice(0,3 - next.length).find('.item-content:first-child').clone().appendTo($(this));
		  }
		  
		  if($('#carouselPages .carousel-inner .item').length <= 4){
			  
			  return false;
			  
		  }

		});
		
		$('#carouselPages').on('slid', function (event) {
			
			var numberOfPanels = $('#carouselPages .carousel-inner .item').length;
			
			var numberOfPages = Math.ceil(numberOfPanels/4);
			
			if(!$('#carouselPages .item.active').next().length || ($('#carouselPages .item.active').index()+1) >= numberOfPages){
			
				$(".right.carousel-control").addClass('disabled').removeAttr('data-slide').on("click", function(e){
				
					e.preventDefault();	
					
				}).find("span").hide().on("click", function(){
				
					e.preventDefault();	
					
				})
				
			}else{
				
				$(".right.carousel-control").removeClass('disabled').attr('data-slide','next').find("span").show();
			}
			
			if(!$('#carouselPages .item.active').prev().length){
							
				$(".left.carousel-control").addClass('disabled').removeAttr('data-slide').on("click", function(e){
				
					e.preventDefault();	
					
				}).find("span").hide();
				
			}else{
				
				$(".left.carousel-control").removeClass('disabled').attr('data-slide','prev').find("span").show();
				
			}

		}).trigger('slid');
		
		$("#carouselPages .carousel-inner .item-content .panelBttn").off("click").on("click", $.proxy(function(e){
		
			e.preventDefault();
			
			$(".initialized").popover('hide');
			
			$("#carouselPages .item-content .panelBttn").removeClass('active');
			
			var thisPanelBttn = $(e.target).hasClass('panelBttn') ? $(e.target) : $(e.target).parents('.panelBttn');
			
			var thisId = thisPanelBttn.data('panel-id');
												
			$("#carouselPages .item-content .panelBttn").filter(function(){
														
				return $(this).data('panel-id') === thisId;
				
			}).addClass('active');
			
			$(".pagePanelSelected").text(thisPanelBttn.data('panel-name'));
			
			this.initApplyPages();
			
			$.getJSON('/dashboard/pages/getPanelInfo', { pid: window['pid'], panelId: thisId, pageItemId: $("#pageDesignModal").data('id') }, $.proxy(function(data){
			
				this.initPageElements(data);
				
			}, this));
			
		}, this));
		
		
	},
	
	initTemplateDropdown: function(data){
		
		var el = this.$el;
		
		if(typeof data == 'object'){
			
			for(key in data){
			
				if(data.hasOwnProperty(key)){
				
					
					
				}	
				
			}	
			
		}		
			
		
	},
	
	
	initTemplatePageDropdown: function(data, selectedPage){
		
		if(typeof data == 'object' && typeof data.pagesInfo == 'object'){
			$("#pageDesignModal .templatePage").text(data.pagesInfo[selectedPage].name);
			
			$("#pageDesignModal .templatePage").data('page',selectedPage);
			for(k in data.pagesInfo){
		
				if(data.pagesInfo.hasOwnProperty(k)){
				
					var templatePageItemTemplate = $($(".templatePageItemTemplate").html());
					templatePageItemTemplate = $("<li />").append(templatePageItemTemplate);
											
					templatePageItemTemplate.find('.templatePageItemPageName').text(data.pagesInfo[k].name || 'Untitled Page');
					templatePageItemTemplate.find('.dataCache').data('name', data.pagesInfo[k].name);
					templatePageItemTemplate.find('.dataCache').data('id', k);
					
					templatePageItemTemplate.find('a').on("click", $.proxy(function(e){
						e.preventDefault();
						
						var id = $(e.target).hasClass('dataCache') ? $(e.target).data('id') : $(e.target).parents('.dataCache').data('id')
						var name = $(e.target).hasClass('dataCache') ? $(e.target).data('name') : $(e.target).parents('.dataCache').data('name');
						this.updateTemplatePage(id, $('#pageDesignModal').data('id'), name);
						
													
					
					},this))
					
					if(k == selectedPage)templatePageItemTemplate.hide();
					
					$(".templatePageDropdown").append(templatePageItemTemplate);
					
				}
		
			}
		}
		
	},
	
	updateSuccess:  function(response, callback){
			
			if(response && response.pageItemId){		
									
				$("#gritter-notice-wrapper").remove();						
				
				Growl.success({
					title: 'Successfully updated!',
					text: 'The new setting has been saved.'
				});
								
				if(typeof callback == 'function')callback();
				
			}else this.updateFail();
			
	},
	
	updateFail: function(response){
			
			$("#gritter-notice-wrapper").remove();						
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
									
	},
	
	updateTemplatePage: function(newTemplatePage, pageItemId , pageName){
		
		var model = this.model;	
					
		model.set({'path': '/updatePageItem' });
		
		var id = newTemplatePage;
		var name = pageName;
		
		var callback = $.proxy(function(response){
						
			var successCallback = $.proxy(function(){
				
				this.collection.set({path: ''});
				this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.options.view.initPagesList();

					this.initCarousel(this.templateDetails, id);
					
				}, this)});
		
				$(".templatePageDropdown li").show();
				$(".templatePageDropdown li").filter(function(){
							
					return $(this).find('.dataCache').data('id') === id
							
				}).hide();
				$("#pageDesignModal .templatePage").text(name);	
				$("#pageDesignModal .templatePage").data('page',newTemplatePage);

			},this);
			
			this.updateSuccess(response, successCallback);
			
		},this)
			
		model.sync('update', model, { data: $.param({pid: window['pid'], pageItemId: pageItemId, update: 'template-page', value: newTemplatePage}), success: callback, fail: this.updateFail });

			
	},
	
	initLabels: function(){
		
		var el = this.$el;	
		
		if(this.options.pageItem.el['required'] == true){
						
			$(".labelRequired", el).show();
			
		}else{
			$(".labelRequired", el).hide();
			
		}
		
	},
	
	initSettingMenu: function(){
		
		var el = this.$el;	
		
		if(this.options.pageItem.el['required'] == true){
						
			$(".resetPageContentMenuItem", el).show();
			$(".deletePageMenuItem", el).hide();
			$(".editPageTitleDescMenuItem",el).hide();
			
		}else{
			$(".resetPageContentMenuItem", el).hide();
			$(".deletePageMenuItem", el).show();
			$(".editPageTitleDescMenuItem",el).show();
			
		}
		
		
		if(typeof this.options.pageItem.el['last-published']  != 'undefined'){
			
			$(".unpublishPageContentMenuItem",el).show();
		}else{
			
			$(".unpublishPageContentMenuItem",el).hide();
		}
		
		$('.editPageTitleDesc', el).popover({
				
			html: true,
			placement: 'bottom',
			title : '<strong>Edit Name/Description</strong>'+
                '<button type="button" class="close" onclick="$(\'.editPageTitleDesc\').popover(\'hide\');">&times;</button>',
			content: $(".editTitleDescTemplate", el).html(),
			container: $("#pageDesignModal .modal-body")
			
		})
		.on('shown.bs.popover', $.proxy(function () {
						
			
			var currentTitle =  this.options.pageItem.el['name'] || '';
			var currentDesc =  this.options.pageItem.el['desc'] || '';
						
			
			$(".popover").filter(function(){
				
				return $(this).find('.editTitleDescForm').length > 0
				
			})
			.find('.arrow').hide().end()
			.find('.editPageTitle').val(currentTitle).end()
			.find('.editPageDesc').val(currentDesc);
			
			$(".viewURL.initialized").popover('hide');
			
									
			$('.popover .editTitleDescForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
				
				$(".popover .editTitleDescError").empty();
				
				var model = this.model;	
					
				model.set({'path': '/updatePageItem' });
				
				var callback = $.proxy(function(response){
								
					var successCallback = $.proxy(function(){
						
						$(".popover .editTitleDescError").empty();
						$('#pageDesignModal .modal-header .pageName').text($(".popover .editTitleDescForm .editPageTitle").val());
						$('#pageDesignModal .modal-header .pageDesc').text($(".popover .editTitleDescForm .editPageDesc").val());
						
						this.options.pageItem.el['name'] = $(".popover .editTitleDescForm .editPageTitle").val();
						this.options.pageItem.el['desc'] = $(".popover .editTitleDescForm .editPageDesc").val();
						$('.editPageTitleDesc').popover('hide');
						
						
						this.collection.set({path: ''});
						this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
						
							this.options.view.initPagesList();
									
						}, this)});
				
		
					},this);
					
					this.updateSuccess(response, successCallback);
					
				},this)
					
				model.sync('update', model, { data: $.param({pid: window['pid'], pageItemId: this.options.pageItem.key, update: 'desc', name: $(".popover .editTitleDescForm .editPageTitle").val(), desc: $(".popover .editTitleDescForm .editPageDesc").val()}), success: callback, fail: this.updateFail });
								
												
			}, this))
			
			$('.popover .editTitleDescCancel').off("click").on("click", function(event){
				
				event.preventDefault();
								
				$('.editPageTitleDesc').popover('hide');
				
			})
			
		
		
		}, this))
		.addClass('initialized');
		
		
		$('.viewURL', el).popover({
				
			html: true,
			placement: 'bottom',
			title : '<strong>Page URL</strong>'+
                '<button type="button" class="close" onclick="$(\'.viewURL\').popover(\'hide\');">&times;</button>',
			content: $(".viewURLTemplate", el).html(),
			container: $("#pageDesignModal .modal-body")
			
		})
		.on('shown.bs.popover', $.proxy(function () {
						
			$(".popover").filter(function(){
				
				return $(this).find('.viewURLForm').length > 0
				
			}).find('.arrow').hide();	
			
			$(".editPageTitleDesc.initialized").popover('hide');
			
			var defaultDomain = this.collection.pluck('defaultDomain')[0];
			
			
			for(key in defaultDomain){
			
				if(defaultDomain.hasOwnProperty(key)){
					
					if(typeof defaultDomain[key] == 'object' && defaultDomain[key].domain){
						
						var directURLTemplate = $($(".directURLTemplate").html());
						var goURLBttnTemplate = $($(".goURLBttnTemplate").html());
												
						if(defaultDomain[key]['domain-type'] == 'apps.dja.com'){
							
							var url = 'http://apps.dja.com/'+defaultDomain[key].domain+'/'+this.options.pageItem.key;
							
						}else if(defaultDomain[key]['domain-type'] == '*.dja.com'){
							
							var url = 'http://'+defaultDomain[key].domain+'.dja.com/'+this.options.pageItem.key;
							
						}else{
							
							var url = 'http://'+defaultDomain[key].domain+'/'+this.options.pageItem.key;
							
						}
						
						goURLBttnTemplate.data('url',url);
						
						goURLBttnTemplate.tooltip().on("click", function(e){
							
							e.preventDefault();
							
							window.open($(this).data('url'));
							
						})
						
						$('.popover .directURL').append(directURLTemplate.find('.directURLText').text(url).on("click", function(){
							if(window.getSelection){
								
								var span = this, sel, range;
			
								sel = window.getSelection();
								range = document.createRange();
							
								range.selectNode(span);
								sel.removeAllRanges();
								sel.addRange(range);
							 } else {
								range = document.body.createTextRange();
								range.moveToElementText(span);
								range.select()
							 }	
							
						}).end()).find('.directURLWrapper:last').append(goURLBttnTemplate);
						
					}
					
				}
				
			}
			
			if($('.popover .directURL .directURLText').length == 0){
				
				$('.popover .directURL').text('None');
				
			}
					
											
			if($.isEmptyObject(defaultDomain)){
				
				$('.popover .viewURLWarningNoURL').show();
				
			}else if(typeof this.options.pageItem.el['last-published'] == 'undefined'){
				
				$('.popover .viewURLWarningNotPublished').show();
				
			}
						
			$('.popover .configURLWrapper .configURLText').text(this.options.pageItem.el['configurable-url'] || '');
			
			if($('.popover .configURLWrapper .configURLText').text().length == 0){
				
				$('.popover .configURLWrapper .configURLText').text('None');
				
			}
			
			$(".popover .viewURLEdit").on("click", function(e){
			
				e.preventDefault();
				
				$(".popover .viewURLForm .configURLWrapper").hide();
				$(".popover .viewURLForm .viewURLEditFields").show();	
				$(".popover .viewURLForm .viewURLEditNamespace").focus();
				$(".popover .viewURLEditError").empty();
				
			})
			
			
			$(".popover .viewURLEditCancel").on("click", function(e){
			
				e.preventDefault();
				
				$(".popover .viewURLForm .configURLWrapper").show();
				$(".popover .viewURLForm .viewURLEditFields").hide();	
				
			})
						
			$(".popover .copyURLBttn, .popover .learnMore").tooltip({container: $("#pageDesignModal .modal-body")});			
			
			$('.popover .viewURLForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
				
				$(".popover .viewURLEditError").empty();
				
				$.post('/dashboard/pages/updateConfigurableURL', {pid: window['pid'], pageItemId: this.options.pageItem.key, namespace: $(".popover .viewURLForm .viewURLEditNamespace").val(), namespace_old: this.options.pageItem.el['configurable-url'] || ''}, $.proxy(function(response){
					
					if(response && response.error){
						
						$(".popover .viewURLEditError").text(response.error);
						
						
					}else if(response && response.pageItemId){
						$(".popover .viewURLEditError").empty();
						$('.popover .configURLWrapper .configURLText').text($(".popover .viewURLForm .viewURLEditNamespace").val());
						$(".popover .viewURLForm .configURLWrapper").show();
						$(".popover .viewURLForm .viewURLEditFields").hide();
						
						this.options.pageItem.el['configurable-url'] = $(".popover .viewURLForm .viewURLEditNamespace").val();
						
						
						this.collection.set({path: ''});
						
					
						this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
							this.options.view.initPagesList();
						}, this)});	
						
					}
										
				}, this),'json');
				
												
			}, this))
			
			$('.popover .viewURLClose').off("click").on("click", function(event){
				
				event.preventDefault();
								
				$('.popover .viewURLForm')[0].reset();
				$('.viewURL').popover('hide');
				
			})
			
		
		
		}, this))
		.addClass('initialized');		
	
		
		$('.configurePage', el).popover({
				
			html: true,
			placement: 'bottom',
			title : '<strong>Configure Page</strong>'+
                '<button type="button" class="close .configurePageClose" onclick="$(\'.configurePage\').popover(\'hide\');">&times;</button>',
			content: $(".configurePageTemplate", el).html(),
			container: $("#pageDesignModal .modal-body")
			
		})
		.on('shown.bs.popover', $.proxy(function () {
						
			$(".popover").filter(function(){
				
				return $(this).find('.configureURLForm').length > 0
				
			}).find('.arrow').hide();	
			
			$(".editPageTitleDesc.initialized").popover('hide');
			$(".viewURL.initialized").popover('hide');
						
			var variables = this.options.variables;
			
			var configurables = this.collection.pluck('pages')[0] || {};
			if(configurables && configurables[this.options.pageItem.key] && configurables[this.options.pageItem.key]['configurables']){
				configurables = configurables[this.options.pageItem.key]['configurables'];
			}else configurables = {};
						
			
			$(".popover .configurePageFields, .popover .configurePageFields-initialHidden").empty();
			
			for(key in variables){
			
				if(variables.hasOwnProperty(key)){
					
					if(typeof variables[key] == 'object' && variables[key].editable !== false){
						
						switch(variables[key].editableType){
							case 'textarea':
								var configurePageTemplate = $($(".configurePageTemplate .textarea-template").html());
							break;
							case 'image-upload':
								var configurePageTemplate = $($(".configurePageTemplate .image-upload-template").html());
							break;
							default:
								var configurePageTemplate = $($(".configurePageTemplate .input-template").html());
							break;
						}
						
						if(variables[key].placeholder){
							
							configurePageTemplate.find('.configurablePageEditField')
							.prop('placeholder', variables[key].placeholder);
							
						}
						
						if(typeof configurables[key] != 'undefined' && configurables[key] != null && !/^var=/.test(configurables[key])){
						
							configurePageTemplate.find('.configurablePageEditField')
							.val(configurables[key]);
							
						}
						
						if(configurables[key] && typeof configurables[key].defaultValue != 'undefined' && !/^var=/.test(configurables[key].defaultValue)){
						
							configurePageTemplate.find('.configurablePageEditField')
							.val(configurables[key].defaultValue);
							
						}
						
						if(key){
							
							configurePageTemplate.find('.configurablePageEditField')
							.data('var-name', key);
							
						}
						
						
						configurePageTemplate.filter(function(){ return $(this).hasClass('configurePageFieldDesc') }).html(variables[key].description);
						
						if(variables[key].initialHidden == true){
							$('.popover .configurePageFields-initialHidden').append(configurePageTemplate);
							
						}else{
							
							$('.popover .configurePageFields').append(configurePageTemplate);
						}
						
					}
					
				}
				
			}
			
			if($('.popover .configurePageFields-initialHidden .configurablePageEditField').length > 0)$(".configurePageFields-more-only").show();
			
			$(".popover .configurePagesToggleMoreOptions").on("click", function(e){
			
				e.preventDefault();
				
				$(".popover .configurePageFields-initialHidden").toggleClass('collapse');	
				$(this).toggleClass('collapsed');
				
			})
			
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
				maxFileSize: 1, 
				onBeforeUpload: function($el){
					$el.hide();
					$el.parents('.uploadImageContainer').find('.cloudUploadIcon').hide();
				  },
				onSuccess: function($el){
					$el.parents('.uploadImageContainer').find('.cloudUploadIcon').show();
				  }, 
				callback: function(data, $el){	
					$el.show();
					$el.parents('.uploadImageContainer').find('.configurablePageEditField').val(data.filename);
					
				   },
				error: function(error){
				 },
				mobileDetect: false
				
			});
			
			$('.popover .configureURLForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
				
				$(".popover .configurePageError").empty();
				
				var postVars = {};
				
				$(".popover .configureURLForm").find('.configurablePageEditField').each(function(){
				
					if($(this).data('var-name')){
						if($.trim($(this).val())){
							postVars[$(this).data('var-name')] = $(this).val();
						}else{
							postVars[$(this).data('var-name')] = variables[$(this).data('var-name')].defaultValue || '';
						}
						
						if(variables[$(this).data('var-name')].isReferral){
						
							postVars[$(this).data('var-name')+'.__isReferral'] = true
							
						}
					}
					
					
				})
				
				var pages = this.options.view.collection.pluck('pages')[0];
								
				$.post('/dashboard/pages/updateConfigurables', {pid: window['pid'], pageItemId: this.options.pageItem.key, value: postVars, applyToAllPages: $(".popover .configureURLForm").find('.applyConfigToAllPages').is(":checked"), pagesToApplyTo: Object.keys(pages)}, $.proxy(function(response){
					
					if(response && response.error){
						
						$(".popover .configurePageError").text(response.error);
						
						
					}else if(response && response.pageItemId){
						$(".popover .configurePageError").empty();
						
						//this.options.pageItem.el['configurable-url'] = $(".popover .viewURLForm .viewURLEditNamespace").val();
						
						
						this.collection.set({path: ''});
						
					
						this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
							this.options.view.initPagesList();
						}, this)});	
						
						Growl.success({
							title: 'Successfully updated!',
							text: 'The new configurations have been saved.'
						});
						
						
					}
										
				}, this),'json');
				
												
			}, this))
			
			$('.popover .configurePageClose').off("click").on("click", function(event){
				
				event.preventDefault();
								
				$('.popover .configureURLForm')[0].reset();
				$('.configurePage').popover('hide');
				
			})
			
		
		
		}, this))
		.addClass('initialized');

		
		
	},
	
	initHelpers: function(){
		var el = this.$el;	
		
		$('.learnMore', el).popover({
			html: true,
			trigger: 'click'
			
			
		});
		
	},
	
	
	
	render: function () {
		
		
		var selectedPage = this.options.pageItem.el['template-page'];
		
		
		$("#pageDesignModal .pageName").text(this.options.pageItem.el['name'] || 'Untitled Page');
		$("#pageDesignModal .pageDesc").text(this.options.pageItem.el['desc']);
		
		if(!this.options.pageItem.key){
			
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/pages/pageItem', {pid: window['pid'], type: this.options.pageItem.el['type'], name: this.options.pageItem.el['name'], desc: this.options.pageItem.el['desc'], template: this.options.defaultTemplate, 'template-page' : selectedPage}, function(response){
				newKey = response.pageItemId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.pageItem.key = newKey;
			
			$("#pagesBox .pageItems").empty();
			
			this.collection.set({path: ''});
			this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
			
				this.options.view.initPagesList();
				
			}, this)});
		}
		
		if(!this.options.pageItem.key){
		
			return;	
			
		}
		
		$("#pageDesignModal").data('id', this.options.pageItem.key);
		
	
		
		$.getJSON('/dashboard/pages/getTemplateDetails', {pid: window['pid'], templateId: this.options.pageItem.el['template']}, $.proxy(function(data){
			
			
			if(!selectedPage){
				for(k in data.pagesInfo){
			
					if(k)selectedPage = k;
					break;
					
				}
			}
			
			
			$("#pageDesignModal .templateName").text(data.templateName);
			$("#pageDesignModal .templateName").data('template', data.id);
			
			this.templateDetails = data;
						
			this.initCarousel(data, selectedPage);
			this.initTemplatePageDropdown(data, selectedPage);
			this.options.variables = data.variables || {};
			
			if(typeof this.options.variables == 'object' && !$.isEmptyObject(this.options.variables)){
				$('.configurePage', el).show()
			}else $('.configurePage', el).hide();
		
			
		},this));
		
		/*
		$.getJSON('/dashboard/pages/availTemplates', {pid: window['pid']}, $.proxy(function(data){
			
			this.initTemplateDropdown(data);
			
		},this));
		
		*/
		
		
		
		
		$(this.el).html(this.template({el: this.options.pageItem.el, key: this.options.pageItem.key}));
		var el = this.$el;	
		
		var formFieldElements = [];
		$(".formFieldElements li", el).each(function(){formFieldElements.push($(this).data('type'))})
		this.formFieldElements = formFieldElements;
						
		this.initLabels();
		this.initSettingMenu();
		this.initComponents();
		this.bindComponents();
		this.initHelpers();			
				 					 		
        return this;
    }
});