
window.PromoDashboardBasicView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
		
    },
	
	events: {
		
		'click .generateAccessToken': 'generateAccessToken',
		'change .siteUpDownSwitch': 'siteUpDownSwitch',
		'change .lockChangesSwitch': 'lockChangesSwitch',
		'click #deletePromotionModal .confirm': 'deletePromotion',
		'click #previewTemplateModal .confirm': 'updateDefaultTemplate', 
		'click #siteDownModal .confirm': 'siteDown',
		'click .deletePromotion': 'deletePromotionModal',
		'click .cancelComponentChanges': 'cancelComponentChanges',
		'click .saveComponentChanges': 'saveComponentChanges',
		'submit .searchTemplate': 'searchTemplate',
		'keyup .searchTemplate input': 'searchTemplate',
		'click .addDefaultDomain' : 'addDefaultDomain',
		'change .hostname' : 'changeHostNameType',
		'click #deleteDefaultDomainModal .confirm' : 'deleteDefaultDomain'		
	},
	
	changeHostNameType: function(event){
		
		event.preventDefault();
		if($(event.target).val() == '*.dja.com'){
		
		
			$(".addDomainNameNameSpace").parent().hide();	
			$(".addDomainNameCustomDomain").parent().hide();	
			$(".addDomainNameDJASubdomain").parent().show().end().focus();
				
		}else if($(event.target).val() == 'custom'){
		
			$(".addDomainNameNameSpace").parent().hide();	
			$(".addDomainNameCustomDomain").parent().show().end().focus();
			$(".addDomainNameDJASubdomain").parent().hide();	
			
		}else{
		
			$(".addDomainNameNameSpace").parent().show().end().focus();
			$(".addDomainNameCustomDomain").parent().hide();	
			$(".addDomainNameDJASubdomain").parent().hide();	
		}
		
				
	},
	
	addDefaultDomain: function(event){
		
		event.preventDefault();
		
		$(".viewDetails.initialized, .domainName.editable-open, .domainLandingPage.editable-open, .domainProtocol.editable-open").popover('hide');
				
	},
	
	searchTemplate: function(event){
		event.preventDefault();
				
		if($(event.target).is('input'))
			var searchTerm = $.trim($(event.target).val());
		else
			var searchTerm = $.trim($(event.target).find('input').val());
		
		$(".availableTemplates .dataCache").show();
		
		if(searchTerm){
			$(".availableTemplates .dataCache").filter(function(){
				
				return $(this).find('a').prop('title').toLowerCase().indexOf(searchTerm.toLowerCase()) === -1
				
			}).hide();
		}
			
	},
	
	cancelComponentChanges: function(event){
		event.preventDefault();
		var type = this.collection.get('/').get('type');
		$("#site-components .site-component:checkbox").prop("checked",false);


		for(i=0;i<type.length;i++){
		
			$("#site-components .site-component:checkbox[data-id='"+type[i]+"']").prop("checked",true);
			
		}
		
	},
	
	saveComponentChanges: function(event){
		event.preventDefault();
		
		var data = [];
		
		$("#site-components").find(".site-component:checkbox").each(function(){
		
			var status = ($(this).is(":checked")) ? '1' : '0';
			var id = $(this).data('id');
			
			data.push({status: status, id: id})	;
			
		})
		
		$.ajax({
			url: '/dashboard/basic/typeChanges',
			type: 'PUT',
			dataType: 'json',
			data: {type: data, pid: window['pid']},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.pid){
					
					var sidebarCollection = new PromoDashboardSidebarCollection();
					sidebarCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(response){
		
						app.sidebarView.detachComponents(response.type);	
						
					});
								
					return Growl.success({title: 'Successfully updated!', text: 'New components have been saved.'});
					
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
	
	updateLockChanges: function(status){
		
		if(status == 1){
			
			var successResponse = {title: 'All changes locked!', text: 'Changes are now restricted.', type: 'warn'}
			
		}else if(status == 0){
			
			var successResponse = {title: 'Changes allowed!', text: 'You can now make changes to this promotion.', type: 'success'}
		}
		
		
		$.ajax({
			url: '/dashboard/basic/lockChanges',
			type: 'PUT',
			dataType: 'json',
			data: {pid: window['pid'], status: status},
			success: function(response) {
				
			
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.pid){
					if(successResponse.type == 'success'){
						return Growl.success(successResponse);
					}else if(successResponse.type == 'warn'){
						return Growl.warn(successResponse);
					}
				}
				
				
				
			}
		})
	
	},
	
	updateSiteUpDown: function(status){
		
		if(status == 1){
			
			var successResponse = {title: 'Site is published!', text: 'The site is now online.', type: 'success'}
			
		}else if(status == 0){
			
			var successResponse = {title: 'Site is unpublished!', text: 'The promotion is now OFFLINE.', type: 'warn'}
		}
		
		
		$.ajax({
			url: '/dashboard/basic/siteUpDown',
			type: 'PUT',
			dataType: 'json',
			data: {pid: window['pid'], status: status},
			success: function(response) {
				
				$('#siteDownModal').off('hidden.bs.modal');
				$("#siteDownModal").modal('hide');
				
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.pid){
					if(successResponse.type == 'success'){
						return Growl.success(successResponse);
					}else if(successResponse.type == 'warn'){
						return Growl.warn(successResponse);
					}
				}
				
				
				
			}
		})
	
	},
	
	updateDefaultTemplate: function(event){
		
		event.preventDefault();
		
		var defaultTemplate = $(event.target).parents('#previewTemplateModal').data('id');
		
		$.ajax({
			url: '/dashboard/basic/defaultTemplate',
			type: 'PUT',
			dataType: 'json',
			data: {
				pid: window['pid'], 
				defaultTemplate:defaultTemplate,
				applyChangesToAllPages: $(event.target).parents('#previewTemplateModal').find(".applyChangesToAllPages").is(":checked")
				},
			success: $.proxy(function(response) {
				
				$("#previewTemplateModal").modal('hide');
				
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.pid){
					
					this.collection.get('/').set({'template':defaultTemplate});

					this.initTemplates();
					return Growl.success({title: 'Default Template Updated!', text: 'New default template setting has been saved.'});
				}
				
				
				
			}, this)
		})
		
	},
	
	lockChangesSwitch: function(event){
		
		
		if(!$(event.target).is(":checked")){
		
			this.updateLockChanges(0);
			
		}else{
			
			this.updateLockChanges(1);
		}
		
		
	},
	
	siteUpDownSwitch: function(event){
		
		
		if(!$(event.target).is(":checked")){
		
			$("#siteDownModal").modal('show');
			$('#siteDownModal').off('hidden.bs.modal').on('hidden.bs.modal', $.proxy(function () {
			 	$(event.target).prop("checked", true).trigger('change');
			},event));
			
		}else{
			
			this.updateSiteUpDown(1);
		}
		
		
	},
	
	siteDown: function(event){
		event.preventDefault();
		
		this.updateSiteUpDown(0);
		
	},
	
	deletePromotionModal: function(event){
		
		event.preventDefault();
		$("#deletePromotionModal").modal('show');

		
	},
	
	deletePromotion: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = function(model, response){
			
			if(response && response.pid){
						
				window.location = '/';	
				
			}else deleteFail();
			
		}
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.first().set({path: 'deletePromotion'});
				
		this.collection.first().destroy({data: {pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});		
	
		
	},
	
	generateAccessToken: function(e){
		
		e.preventDefault();
		
		$.post('/dashboard/basic/accessToken', {pid: window['pid']}, function(response){
			
			if(response.accessToken)$(".accessTokenSpan").html(response.accessToken);
			
			
		},'json')
		
	},
	
	initTemplates: function(){
		
		var defaultTemplate = this.collection.get('/').get('template');
				
		this.collection.set({path: 'templates'},{add: true, remove: false, merge: true});
								
		this.collection.last().fetch({data: $.param({pid: window['pid']})}).success(function(response){

			var response = response.templates;
		
			$(".availableTemplates").empty();
			
			for(i in response){
				if(response.hasOwnProperty(i)){
				
					var availableTemplatesTemplate = $($(".availableTemplatesTemplate").html());
					
					availableTemplatesTemplate
					.data('id', response[i].id)
					.data('name', response[i].templateName)
					.data('info', response[i].pagesInfo)
					.find('a')
					.prop('href','/dashboard/templates/?pid='+window['pid']+'&template='+response[i].id+'&type=thumbnail')
					.prop('title',response[i].templateName)
					.css('background-image','url(/dashboard/templates/?pid='+window['pid']+'&template='+response[i].id+'&type=thumbnail)');
					
					availableTemplatesTemplate.find('a').on("click", function(e){
					
						e.preventDefault();
						
						$("#previewTemplateModal").modal('show').data('id',$(this).parents('.dataCache').data('id'));
						
						$("#previewTemplateModal .previewImg").prop('src',$(this).prop('href'));
						$("#previewTemplateModal .previewName").text($(this).parents('.dataCache').data('name'));
						
						var pageInfo = $(this).parents('.dataCache').data('info');
						
						
						$("#previewTemplateModal .previewPageButtons").empty();
						for(page in pageInfo){

							if(pageInfo.hasOwnProperty(page)){
								
								var previewPageButtonTemplate = $($("#previewTemplateModal .previewPageButtonTemplate").html());
								previewPageButtonTemplate.find('.previewPageName').text(pageInfo[page].name ? pageInfo[page].name : 'Untitled Page');
								previewPageButtonTemplate.data('id',$(this).parents('.dataCache').data('id')).data('pageid',page).find('a').on("click", function(e){
									e.preventDefault();
									
									$('#previewTemplateModal .previewPageButton .previewToggleBttns').removeClass('active');
									$(this).addClass('active');
									
									$("#previewTemplateModal .previewIframe").prop('src', '/dashboard/templates/?pid='+window['pid']+'&template='+$(this).parents('.previewPageButton').data('id')+'&page='+$(this).parents('.previewPageButton').data('pageid')+'&type=page');
									
								})
							}

						$("#previewTemplateModal .previewPageButtons").append(previewPageButtonTemplate);
						}
						
						
						$("#previewTemplateModal .previewToggleBttns:first").trigger('click');
						
					})
					
					$("#previewTemplateModal .updateIframeWidthButtons .previewToggleBttns").off("click").on("click", function(e){
						e.preventDefault();
						
						$('#previewTemplateModal .updateIframeWidthButtons .previewToggleBttns').removeClass('active');
						$(this).addClass('active');
						$("#previewTemplateModal .previewIframe").css("width", (parseInt($(this).data('width')) > 0 ? $(this).data('width') : '100%'));

						
					})
					
					$("#previewTemplateModal .updateIframeWidthButtons .previewToggleBttns:first").trigger('click');

					
					$(".availableTemplates").append(availableTemplatesTemplate);
					
					if(response[i].id == defaultTemplate){
						
						availableTemplatesTemplate.find('.availableTemplatesTemplateSelected').show();
					}else{
						availableTemplatesTemplate.find('.availableTemplatesTemplateNotSelected').show();
					}
					
				}
				
			}
			
						
		});
		
	},
	
	initPromoTitle: function(){
		
		$('#promoTitle').data('original-title', promoTitle).editable({
			type: 'text',
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.promoTitle = params.value;
				return params;
			},
			name: 'promoTitle',
			title: 'Enter promo title',
			url: '/dashboard/basic/promoTitle',
			success: function(response, newValue) {
       			if(response.error) return response.error;
				if(!response.pid) return 'Bad Request';
  		  	}
		});
		
		
	},
	
	initAddDefaultDomainPopover: function(){
		
		var el = this.$el;	
		$('.addDefaultDomain', el).popover({
			
			html: true,
			placement: 'left',
			title: 'Add a URL',
			content: $(".addDefaultDomainTemplate", el).html()
			
		})
		.on('shown.bs.popover', $.proxy(function () {
			
			$(".popover .learnMore").tooltip();
			
			var pages = this.collection.get('/').get('pages');
						
			if(typeof pages == 'object'){
				
				for(key in pages){
					if(pages.hasOwnProperty(key)){
					
						$(".popover .landingPage").append($('<option />').attr('value', key).text(pages[key].name || 'Untitled Page'));			
						
					}
					
				}
				
			}
				
			$('.popover .addNewURLForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
				$(".popover .addURLError").empty();
				var domainType =  $('.popover .addNewURLForm').find('.hostname').val();				
				var domain = domainType == 'apps.dja.com' ? $('.popover .addNewURLForm').find('.addDomainNameNameSpace').val() : domainType == '*.dja.com' ? $('.popover .addNewURLForm').find('.addDomainNameDJASubdomain').val() : $('.popover .addNewURLForm').find('.addDomainNameCustomDomain').val();
				
				$.post('/dashboard/basic/domain', {pid: window['pid'], 'create' : true, 'protocol': $('.popover .addNewURLForm').find('.protocol').val(), 'domain-type': domainType, 'domain': domain,  'landing-page': $('.popover .addNewURLForm').find('.landingPage').val()}, $.proxy(function(response){
										
					if(response && response.domainItemId){
						
						if(domainType == '*.dja.com'){
							
							$("#subdomainInfoModal").modal('show');
							
						}else if(domainType == 'custom'){
							
							$("#customDomainInfoModal").modal('show');
						}
						
						$('.popover .addNewURLForm')[0].reset();
						$('.addDefaultDomain').popover('hide');
						
						
					}else if(response.error){
						
						$(".popover .addURLError").text(response.error);
						return;
					}
				
						
					this.collection.get('/').set({path:''});											
					this.collection.get('').fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
						this.populateDefaultDomain();
					}, this)});
						
										
				}, this),'json');
				
												
			}, this));
			
			$('.popover .addURLCancel').off("click").on("click", function(event){
				
				event.preventDefault();
				
				$('.popover .addNewURLForm')[0].reset();
				$('.addDefaultDomain').popover('hide');
				
			})
			
		
		
		}, this))
		
	},
	
	deleteDefaultDomain: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.domainItemId){
			
				var deleteObj = $(".defaultDomains .dataCache").filter(function(){
					
					return $(this).data('id') == response.domainItemId;
					
				}).parents('tr');
				
				deleteObj.remove();
				
				$(".defaultDomains").empty();
								
				this.collection.set({'path':''},{add: true, remove: false, merge: true});
				
				$.proxy(this.collection.last().fetch({data: $.param({pid: window['pid']}), success: $.proxy(function(){
					
					
					this.populateDefaultDomain();
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.get('/').set({path: 'domain'});
				
		this.collection.get('domain').destroy({remove: false, data: { 
		domainItemId: $("#deleteDefaultDomainModal").data('id'), 
		pid: window['pid'], 
		'domain-type': $('.dataCache[data-id="'+$("#deleteDefaultDomainModal").data('id')+'"]').parents('tr').find('.domainType').data('value'),
		'protocol': $('.dataCache[data-id="'+$("#deleteDefaultDomainModal").data('id')+'"]').parents('tr').find('.domainProtocol').data('value'), 
		'domain': $('.dataCache[data-id="'+$("#deleteDefaultDomainModal").data('id')+'"]').parents('tr').find('.domainName').data('value'), 
		'landing-page' : $('.dataCache[data-id="'+$("#deleteDefaultDomainModal").data('id')+'"]').parents('tr').find('.domainLandingPage').data('value') 
		}, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
		

		$("#deleteDefaultDomainModal").modal('hide');
		
	
		
	},
	
	populateDefaultDomain: function(){
		
		var el = this.$el;	
		var defaultDomain = this.collection.get('/').get('defaultDomain');
		
		
		$('.defaultDomains', el).empty();
				
		_.each(defaultDomain, $.proxy(function(defaultDomainEl, key){
			 $('.defaultDomains', el).append(new PromoDashboardBasicURLItemView({model: this.model, collection: this.collection, defaultDomain: {el: defaultDomainEl, key: key}}).el);
			
		}), this);
		
		
	},
	
    render: function () {
		
		var promoTitle = this.collection.get('/').get('promoTitle');
		var accessToken = this.collection.get('/').get('accessToken');
		var lockChanges = this.collection.get('/').get('lockChanges');
		var siteUpDown = this.collection.get('/').get('siteUpDown');
		var type = this.collection.get('/').get('type');
		
        $(this.el).html(this.template({promoTitle: promoTitle, lockChanges: lockChanges, siteUpDown:siteUpDown, accessToken: accessToken}));
		
		var el = this.$el;
		
		if(lockChanges == 1){
			
			$(".lockChangesSwitch", el).prop("checked",true);
		}	
		
		if(siteUpDown == 0){
			
			$(".siteUpDownSwitch", el).prop("checked",false);
		}	
		
		
		for(i=0;i<type.length;i++){
		
			$("#site-components .site-component:checkbox[data-id='"+type[i]+"']", el).prop("checked",true);
			
		}
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		
		this.initTemplates();
		
		this.populateDefaultDomain();
		
		this.initPromoTitle();
		
		this.initAddDefaultDomainPopover();
				 				
				 		
        return this;
    }
	
});





window.PromoDashboardBasicURLItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
	
	tagName : 'tr',
	
	events: {
		
		'click .removeDefaultDomain' : function(event){
			
			event.preventDefault();
			
			$("#deleteDefaultDomainModal")
			.data('id', $(event.target).parents('tr').find('.dataCache').data('id'))
			.modal('show');
			
		},
		
		'click .viewDetails' : function(event){event.preventDefault();},
		
		'click button[data-toggle="dropdown"]' : function(){
			$(".viewDetails.initialized, .domainName.editable-open, .domainLandingPage.editable-open, .domainProtocol.editable-open, .addDefaultDomain").popover('hide');
		}
		
	},
	
	initViewDetails: function(){
		
		
		$('.viewDetails', this.el).popover({
				
			html: true,
			placement: 'top',
			title : '<strong>URL Details</strong>'+
                '<button type="button" class="close" onclick="$(\'.viewDetails\').popover(\'hide\');">&times;</button>',
			content: $(".viewURLTemplate", this.el).html(),
			container: $(".main-content")
			
		})
		.on('shown.bs.popover', $.proxy(function () {
					
			$(".addDefaultDomain").popover('hide');
						
			var thisId = this.options.defaultDomain.key;
			
			var dataObj = $('.dataCache[data-id="'+thisId+'"]').parents('tr');
			var domainType =  dataObj.find('.domainType').data('value');
			
			var domainValue = dataObj.find('.domainName').data('value');
			
			var landingPage = dataObj.find('.domainLandingPage').text();
			
			landingPage = landingPage == 'Empty' ? 'None selected' : landingPage;
									
			var url = domainType == 'apps.dja.com' ? 'apps.dja.com/'+domainValue : domainType == '*.dja.com' ? domainValue+'.dja.com' : domainValue;
			
			url = 'http://'+url;
			
			
			$('.viewDetails').filter(function(){
			
				return $(this).parents('.dataCache').data('id') != thisId
				
			}).popover('hide');
			
				
						
			$(".popover").filter(function(){
				
				return $(this).find('.viewURLForm').length > 0
				
			})
			.find('.arrow').hide()
			.end().css({'left':'auto','right':'15px'})
			.find('.learnMore').tooltip({
				
				placement: 'top',
				container: '.main-content'
				
			})
			.end().find('.directURL').text(url).on("click", function(){
				
			
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
				
			}).end().find('.CNAME').on("click", function(){
				
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
				
			})
			.end().find('.landingPage').text(landingPage)
			.end().find('.goToURL').on("click", function(e){
				
				e.preventDefault();
				
				window.open(url);
				
				
			}).end().find('.CNAMEWrapper').filter(function(){ return domainType != 'custom' }).hide();
			
			
			$('.popover .viewURLForm').off("submit").on("submit", $.proxy(function(e){
				
				e.preventDefault();
								
				$.post('/dashboard/pages/url', {pid: window['pid'], type: 'custom', name: $('.popover .viewURLForm').find('.addNewPageTitle').val(), desc: $('.popover .viewURLForm').find('.addNewPageDesc').val(), template: this.collection.pluck('defaultTemplate')[0], 'template-page' : ''}, $.proxy(function(response){
					
					if(response && response.pageItemId){
						
						$('.popover .viewURLForm')[0].reset();
						$('.addNewPage').popover('hide');
					}
												
					this.collection.set({path: ''});
					
					this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
						this.initPagesList();
					}, this)});
						
										
				}, this),'json');
				
												
			}, this))
			
			$('.popover .viewURLClose').off("click").on("click", function(event){
				
				event.preventDefault();
								
				$('.popover .viewURLForm')[0].reset();
				$('.viewURL').popover('hide');
				
			})
			
		
		
		}, this))
		.addClass('initialized');
		
	},
	
	initEditables: function(){
		
	
		$('.domainName', this.el).off("click.closeotherpopover").on("click.closeotherpopover", function(){
			
			$(".viewDetails.initialized, .addDefaultDomain").popover('hide');
			
		}).editable({
			showbuttons: true,
			url: '/dashboard/basic/domain',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'domain';
				params['domain'] = params.value;
				params['domain-old-value'] = $(this).data('value');
				params['domain-type'] = $(this).parents('tr').find('.domainType').data('value');
				params['protocol'] = $(this).parents('tr').find('.domainProtocol').data('value');
				params['landing-page'] = $(this).parents('tr').find('.domainLandingPage').data('value');
				params.domainItemId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			ajaxOptions: {
			  type: 'PUT'
			},
			type: 'text',
			validate: function(newValue) {
				
				
				if($(this).siblings('.domainType').data('value') == 'custom'){
						
					if(/\.dja\.com$/.test(newValue)){
					
						return 'Please enter a custom domain name. To use a dja.com subdomain, please add a new url.';	
					
					}
					
					if(!/([0-9a-zA-Z-]+\.)?[0-9a-zA-Z-]+\.[a-zA-Z]{2,7}/.test(newValue)){
						
						return 'Please enter a valid domain name';	
						
					}
						
				}
				
				if(!/^[a-zA-Z0-9_\-\.]+$/.test(newValue)){
					
					return 'Please enter a valid hostname';	
					
				}
				
				if(!/^[a-zA-Z0-9]/.test(newValue) || !/[a-zA-Z0-9]$/.test(newValue)){
					
					return 'Hostname must begin and end with a letter or a number';	
					
				}
				
				
				var defaultDomainCombinations = [];
				$(".defaultDomains tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.hostname = $(this).find('.domainName').data('value');
					obj.type = $(this).find('.domainType').data('value');
					if(obj.hostname != null && obj.type != null)defaultDomainCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.type = $(this).parents('tr').find('.domainType').data('value');
				thisObj.hostname = newValue;
					
				if(_.findWhere(defaultDomainCombinations, thisObj)){
					return 'This hostname has already been defined.';
				}
				
				
			},
			display: function(value){
				
				if(value){
					
					if($(this).siblings('.domainType').data('value') == 'apps.dja.com'){
						$(this).text('apps.dja.com/'+value);
					}else if($(this).siblings('.domainType').data('value') == '*.dja.com'){
						$(this).text(value+'.dja.com');
					}else if($(this).siblings('.domainType').data('value') == 'custom'){
						$(this).text(value);
					}

											
				}	
				
			},
			success: function(response, newValue){
				
				if(response.error){
					
					return response.error;	
					
				}
								
				
				$(this).data('value', newValue);
				
				
				if($(this).siblings('.domainType').data('value') == '*.dja.com'){
							
					$("#subdomainInfoModal").modal('show');
					
				}else if($(this).siblings('.domainType').data('value') == 'custom'){
					
					$("#customDomainInfoModal").modal('show');
				}
							
					
			}
		});
		
		$('.domainLandingPage', this.el).off("click.closeotherpopover").on("click.closeotherpopover", function(){
			
			$(".viewDetails.initialized, .addDefaultDomain").popover('hide');
			
		}).editable({
			showbuttons: false,
			url: '/dashboard/basic/domain',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'landing-page';
				params['landing-page'] = params.value;
				params['domain-type'] = $(this).parents('tr').find('.domainType').data('value');
				params['protocol'] = $(this).parents('tr').find('.domainProtocol').data('value');
				params['domain'] = $(this).parents('tr').find('.domainName').data('value');
				params.domainItemId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			ajaxOptions: {
			  type: 'PUT'
			},
			type: 'select',
			
			source: $.proxy(function(){
			
				var pages = this.collection.get('/').get('pages');
				var choices = [
					
				];
				_.each(pages, function(value, key){
					
					choices.push({value: key, text: value.name || 'Untitled Page'});
					
				})
					
				
				return choices;
				
			},this),
			
			success: function(response, newValue){
				
				if(response.error){
					
					return response.error;	
					
				}
				$(this).data('value', newValue);	
				
			}
		});
		
		$('.domainProtocol', this.el).off("click.closeotherpopover").on("click.closeotherpopover", function(){
		
			$(".viewDetails.initialized, .addDefaultDomain").popover('hide');
			
		}).editable({
			showbuttons: false,
			url: '/dashboard/basic/domain',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'protocol';
				params['protocol'] = params.value;
				params['domain-type'] = $(this).parents('tr').find('.domainType').data('value');
				params['landing-page'] = $(this).parents('tr').find('.domainLandingPage').data('value');
				params['domain'] = $(this).parents('tr').find('.domainName').data('value');
				params.domainItemId = $(this).parents('tr').find('td.dataCache').data('id');
				return params;
			},
			ajaxOptions: {
			  type: 'PUT'
			},
			type: 'select',
			validate: function(newValue) {
				
				var defaultDomainCombinations = [];
				$(".defaultDomains tr").not($(this).parents('tr')).each(function(){
					
					var obj = {};
					obj.hostname = $(this).find('.domainName').data('value');
					obj.type = $(this).find('.domainType').data('value');
					if(obj.hostname != null && obj.type != null)defaultDomainCombinations.push(obj);
					
				})
				
				var thisObj = {};
				thisObj.hostname = $(this).parents('tr').find('.domainName').data('value');
				thisObj.type = $(this).parents('tr').find('.domainType').data('value');
					
				if(_.findWhere(defaultDomainCombinations, thisObj)){
					return 'This hostname has already been defined.';
				}
				
				
			},
			
			source: function(){
			
				var choices = [
					{value: 'https', text: 'https'},
					{value: 'http/https', text: 'http/https'},
					
				];	
				
			
				return choices;
				
			},
			success: function(response, newValue){
				
				if(response.error){
					
					return response.error;	
					
				}
				$(this).data('value', newValue);	
				
			
					
			},
			
		});
		
	},
	
	render: function () {
		 
		 
		var model = this.model;
		var collection = this.collection;
		
		if(!this.options.defaultDomain.key){
			
			return;
		}
		
		$(this.el).html(this.template({el: this.options.defaultDomain.el, key: this.options.defaultDomain.key}));
		
		this.initEditables();
		this.initViewDetails();
		
			 					 		
        return this;
    }
});
