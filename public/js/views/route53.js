
window.Route53View = Backbone.View.extend({
	
    initialize: function () {
		this.render();
			
		
    },
	
	events: {
		
		'click .addHostedZoneBttn' : function(event){ app.navigate('CreateHostedZone', {trigger: true});},
		'submit #searchHostedZoneForm' : 'searchHostedZone',
		'keyup #searchHostedZoneForm input' : 'searchHostedZone',
		'click #clearSearchBttn' : 'clearSearch',
		'click .deleteHostedZoneBttn' : function(event){$("#deleteHostedZoneModal").modal('show').data('uid',$(event.target).data('uid'));},
		'click #deleteHostedZoneModal .confirm' : 'deleteHostedZone'
	},
	
	deleteHostedZone: function(event){
				
		var deleteHostedZoneSuccess = function(model, response){
			
					$("#deleteHostedZoneModal").modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					
					
					
					app.ListHostedZones();
					
					$(".alert").remove();
					
					_.delay(function(){
						$('<div class="alert alert-warning fade in" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('Hosted zone (Zone ID: '+response.HostedZoneId+') has been deleted.')
						.insertAfter($('.wrapper .page-header-top'))[0].scrollIntoView();
					}, 700);
					
			
				
		}
		
		var deleteHostedZoneFail = function(model, response){
			
					$("#deleteHostedZoneModal").modal('hide');				
					$(".alert").remove();
					
					$('<div class="alert alert-danger fade in" id="deleteHostedZoneFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You cannot delete this hosted zone.')
						.insertAfter($('.wrapper .page-header-top'));
				
		}
				
		this.collection.set({path: 'DeleteHostedZone'});
		this.collection.first().destroy({data: { HostedZoneId: $("#deleteHostedZoneModal").data('uid')}, processData: true, success: deleteHostedZoneSuccess, error: deleteHostedZoneFail, wait: true});

		
	},
	
	clearSearch: function(event){
		
		
		if(event){
			$(event.target).parents('form').find("input:eq(0)").val('');
			$(event.target).hide();
		}else{
			
			$("#searchHostedZoneForm").find("#clearSearchBttn").hide();
		}
		
		$("#hostedZonesListBody tbody tr").show();
		
		
	},
	
	searchHostedZone: function(event){
		
			event.preventDefault();
			
			var searchForm = ($(event.target).is("form")) ? $(event.target) : $(event.target).parents('form');
			
			if(searchForm.find("input:eq(0)").val()){
				searchForm.find("#clearSearchBttn").show();
			}else{
				searchForm.find("#clearSearchBttn").hide();
				}
			
			if(searchForm.find("input:first").val().length == 0){
				this.clearSearch();
				return;
				
			}
			
			$("#hostedZonesListBody tbody tr").hide();
			$("#hostedZonesListBody tbody tr").filter(function(){
				
				return $(this).text().toLowerCase().indexOf(searchForm.find("input:first").val().toLowerCase()) !== -1
				
			}).show();
				
			
			
		
	},

    render: function () {
				
        $(this.el).html(this.template());
		
		$("#hostedZonesListBody", this.el).append(new Route53HostedZonesView({model: this.model, collection: this.collection}).el);
		 				
		var el = this.$el;	
				 		
        return this;
    },

});



window.Route53ListResourceRecordSetsView = Backbone.View.extend({
	
    initialize: function () {
		this.render();
			
		
    },
	
	events: {
		
		'click .addResourceRecordBttn' : function(event){ app.navigate('addResourceRecord/'+$("#resourceRecordListBody").data('hostedZoneId'), {trigger: true});},
		'submit #searchResourceRecordForm' : 'searchResourceRecord',
		'keyup #searchResourceRecordForm input' : 'searchResourceRecord',
		'click #clearSearchBttn' : 'clearSearch',
		'click .viewAllHostedZonesBttn' : function(event){ app.navigate('', {trigger: true});},
		'click #deleteResourceRecordModal .confirm' : 'deleteResourceRecord'
		
	},
	
	deleteResourceRecord: function(event){
						
		var deleteResourceRecordSuccess = function(model, response){
			
					$("#deleteResourceRecordModal").modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					
					var removedName = response.name;
					
					$("#resourceRecordListBody tr").filter(function(){
					
						return $(this).children('td:first').text() == removedName;
						
					}).remove();
					
					$(".alert").remove();
				
					$('<div class="alert alert-warning fade in" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Resource record '+response.name+' has been deleted.')
					.insertAfter($('.wrapper .page-header-top'))[0].scrollIntoView();
				
				
		}
		
		var deleteResourceRecordFail = function(model, response){
			
					$("#deleteResourceRecordModal").modal('hide');				
					$(".alert").remove();
					
					$('<div class="alert alert-danger fade in"/>')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You cannot delete this resource record.')
						.insertAfter($('.wrapper .page-header-top'));
				
		}
				
		this.collection.set({path: 'DeleteResourceRecord'});
		this.collection.first().destroy({data: { HostedZoneId: $("#resourceRecordListBody").data('hostedZoneId'), name :$("#deleteResourceRecordModal").data('name'), type :$("#deleteResourceRecordModal").data('type'), ttl :$("#deleteResourceRecordModal").data('ttl'), value: $("#deleteResourceRecordModal").data('value')}, processData: true, success: deleteResourceRecordSuccess, error: deleteResourceRecordFail, wait: true});

		
	},
	
	loadMore: function(){
						
		if($("#resourceRecordListBody").data('next-record-name') && $("#resourceRecordListBody").data('next-record-type')){
		
			this.collection.fetch({data: { HostedZoneId: $("#resourceRecordListBody").data('hostedZoneId'), NextRecordName: $("#resourceRecordListBody").data('next-record-name'), NextRecordType: $("#resourceRecordListBody").data('next-record-type')}}).success($.proxy(function(){
			
			$("#resourceRecordListBody").append(new Route53ListResourceRecordSetsItemView({model: this.model, collection: this.collection}).el);
		
			$("#resourceRecordListBody").data('hostedZoneId', this.collection.pluck('hostedZoneId')[0]);
			
			var reachedEnd = this.collection.pluck('reachedEnd')[0];
			if(!reachedEnd)	{
			
				$("#resourceRecordListBody").data('next-record-name', this.collection.pluck('NextRecordName')[0]);
				$("#resourceRecordListBody").data('next-record-type', this.collection.pluck('NextRecordType')[0]);
				this.loadMore();
			}	
				
			},this));
			
		}
		
		
		
	},
	
	clearSearch: function(event){
		
		
		if(event){
			$(event.target).parents('form').find("input:eq(0)").val('');
			$(event.target).hide();
		}else{
			
			$("#searchResourceRecordForm").find("#clearSearchBttn").hide();
		}
		
		$("#resourceRecordListBody tbody tr").show();
		
		
	},
	
	searchResourceRecord: function(event){
		
			event.preventDefault();
			
			var searchForm = ($(event.target).is("form")) ? $(event.target) : $(event.target).parents('form');
			
			if(searchForm.find("input:eq(0)").val()){
				searchForm.find("#clearSearchBttn").show();
			}else{
				searchForm.find("#clearSearchBttn").hide();
				}
			
			if(searchForm.find("input:first").val().length == 0){
				this.clearSearch();
				return;
				
			}
			
			$("#resourceRecordListBody tbody tr").hide();
			$("#resourceRecordListBody tbody tr").filter(function(){
				
				return $(this).text().toLowerCase().indexOf(searchForm.find("input:first").val().toLowerCase()) !== -1
				
			}).show();
				
			
			
		
	},
	
	GetHostedZone: function(){
		
		this.collection.set({path: '/GetHostedZone'});
		this.collection.fetch({data: { HostedZoneId: $("#resourceRecordListBody", this.el).data('hostedZoneId')}}).success($.proxy(function(){
			
			var HostedZoneDetails = this.collection.pluck('HostedZone')[0];
			var NameServer = this.collection.pluck('NameServer')[0];
			
			$(".HostedZoneDetails").append("<h5>"+HostedZoneDetails.Name+"</h5>");
			$(".HostedZoneDetails").append("<div>"+HostedZoneDetails.Id+"</div>");
			$(".HostedZoneDetails").append("<div>"+HostedZoneDetails.CallerReference+"</div>");
			if(HostedZoneDetails.Config.Comment)$(".HostedZoneDetails").append("<div>"+HostedZoneDetails.Config.Comment+"</div>");
			
			for(i=0;i<NameServer.length;i++){
				$(".NameServerDetails").append("<div>"+NameServer[i]+"</doiv>");
			}
			
		}, this));

		
	},

    render: function () {
				
        $(this.el).html(this.template());
		
		$("#resourceRecordListBody", this.el).append(new Route53ListResourceRecordSetsItemView({model: this.model, collection: this.collection}).el);
		
		
		$("#resourceRecordListBody", this.el).data('hostedZoneId', this.collection.pluck('hostedZoneId')[0]);
		
		var reachedEnd = this.collection.pluck('reachedEnd')[0];
		
		if(!reachedEnd)	{
		
			$("#resourceRecordListBody", this.el).data('next-record-name', this.collection.pluck('NextRecordName')[0]);
			$("#resourceRecordListBody", this.el).data('next-record-type', this.collection.pluck('NextRecordType')[0]);
			setTimeout($.proxy(function(){this.loadMore()},this), 0);;
			
		}
		
		this.GetHostedZone();
				 		
        return this;
    },

});


window.Route53ListResourceRecordSetsItemView = Backbone.View.extend({

    initialize: function () {
		
        this.render();
    },
	
	tagName: "tbody",
	
	events: {
		'click .deleteResourceRecordBttn' :function(event){
			
			$("#deleteResourceRecordModal").modal('show')
			.data('name',$(event.target).data('name'))
			.data('type',$(event.target).data('type'))
			.data('ttl',$(event.target).data('ttl'))
			.data('value',$(event.target).parents('tr').find('.recordValue').find('div:first').text())
			
		}
    },
	
	
		
    render: function () {
		
        $(this.el).html(this.template({ResourceSets: this.collection.pluck('data')[0]}));
        return this;
    }

});




window.Route53HostedZonesView = Backbone.View.extend({

    initialize: function () {
		
        this.render();
    },
	
	tagName: "tbody",
		
    render: function () {
		
        $(this.el).html(this.template({HostedZones: this.collection.pluck('HostedZone')[0]}));
        return this;
    }

});



window.Route53AddHostedZoneView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click #addHostedZone' : 'addHostedZone'
	},
	
	addHostedZone: function(event){
		
		$.fn.serializeObject = function()
		{
		   var o = {};
		   var a = this.serializeArray();
		   $.each(a, function() {
			   if (o[this.name]) {
				   if (!o[this.name].push) {
					   o[this.name] = [o[this.name]];
				   }
				   o[this.name].push(this.value || '');
			   } else {
				   o[this.name] = this.value || '';
			   }
		   });
		   return o;
		};
		
		
		var addHostedZoneSuccess = function(model, response){
			$("#addHostedZoneForm .form-group").removeClass('has-error');
			if(!response.error && response.name){
				
				app.navigate('', {trigger: true});
				
				$(".alert").remove();
					
				_.delay(function(){
					$('<div class="alert alert-success fade in" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Hosted zone '+response.name+' has been created. Please use the following nameservers: <br><br>'+response.NameServer.join('<br>'))
					.insertAfter($('.wrapper .page-header-top'));
				}, 700);
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="addError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#addHostedZoneForm'));
				
				if(response.field){
					var errFields = response.field.split(',');
					for(i=0;i< errFields.length; i++){
					
						$("#addHostedZoneForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
						
					}
				}
					
			}
			
		}
		
		this.model.set({path: 'CreateHostedZone'});
		this.model.save($("#addHostedZoneForm").serializeObject(), {success: addHostedZoneSuccess});
		
	},
	
	
	render: function () {
				
		$(this.el).html(this.template());
		 				
		var el = this.$el;	
			
        return this;
		 
	}
	
});


window.Route53AddResourceRecordView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click #addResouceRecord' : 'addResouceRecord',
		'click .addPresetIp': 'addPresetIp',
		'click .cancel': 'returnToResourceSetsView'
	},
	
	returnToResourceSetsView: function(event){
		
		event.preventDefault();
				
		app.navigate('GetHostedZone/'+$("#addResourceRecordForm").data('hostedZoneId'), {trigger: true});
		
		
	},
	
	addPresetIp: function(event){
		
		event.preventDefault();
		
		$("#value").val($(event.target).data('value'));
		
		
	},
	
	addResouceRecord: function(event){
		
		$.fn.serializeObject = function()
		{
		   var o = {};
		   var a = this.serializeArray();
		   $.each(a, function() {
			   if (o[this.name]) {
				   if (!o[this.name].push) {
					   o[this.name] = [o[this.name]];
				   }
				   o[this.name].push(this.value || '');
			   } else {
				   o[this.name] = this.value || '';
			   }
		   });
		   return o;
		};
		
		
		var addResourceRecordSuccess = function(model, response){
			$("#addResourceRecordForm .form-group").removeClass('has-error');
			if(!response.error && response.name){
				
				app.navigate('GetHostedZone/'+$("#addResourceRecordForm").data('hostedZoneId'), {trigger: true});
				
				$(".alert").remove();
					
				_.delay(function(){
					$('<div class="alert alert-success fade in" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Resource record '+response.name+' has been created. It may take a few minutes to take effect.')
					.insertAfter($('.wrapper .page-header-top'));
				}, 700);
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="addError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#addResourceRecordForm'));
				
				if(response.field){
					var errFields = response.field.split(',');
					for(i=0;i< errFields.length; i++){
					
						$("#addResourceRecordForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
						
					}
				}
					
			}
			
		}
		
		this.model.set({path: 'CreateResourceRecord'});
		this.model.save($("#addResourceRecordForm").serializeObject(), {success: addResourceRecordSuccess});
		
	},
	
	
	render: function () {
				
		$(this.el).html(this.template());

		var HostedZoneDetails = this.collection.pluck('HostedZone')[0];	
		
		$("#addResourceRecordForm #name", this.el).prop("placeholder", 'Name (something.'+HostedZoneDetails.Name.substring(0, HostedZoneDetails.Name.length - 1)+')');
				
		$("#addResourceRecordForm", this.el).data('hostedZoneId', HostedZoneDetails.Id.split('/')[2]);
		
		$("#HostedZoneId", this.el).val(HostedZoneDetails.Id.split('/')[2]);
		$("#domainName", this.el).val(HostedZoneDetails.Name);
			
        return this;
		 
	}
	
});