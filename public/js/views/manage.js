
window.ManageView = Backbone.View.extend({
	
    initialize: function () {
		var ManageRouter = Backbone.Router.extend({

			routes: {
				"manage/user/add"   : "addUser",
				"manage/user/edit/:user"  : "editUser",
			},
			
			addUser : function(){
			
				var manage = new ManageUser();
				
				manage.set({username: 'groups'}).sync('groups', manage).success(function(model, response){
					
					manage.set({username: null});
					$("#content").html(new ManageAddUserView({model: manage, groups: true}).el);
					
				}).error(function(){
					
					manage.set({username: null});
					$("#content").html(new ManageAddUserView({model: manage, groups: false}).el);
					
				});
				
			},
			
			editUser : function(username){
			
				var manage = new ManageUser();
				$("#content").html(new ManageEditUserView({model: manage, username: username}).el);	
				
			}
		
		})
		
		var view = this;
		
		utils.loadTemplate(['ManageUserView', 'ManageAddUserView','ManageEditUserView'], function() {
			
			new ManageRouter();
			if(window['nextDeepRoute']){
				app.navigate('manage'+window['nextDeepRoute'], {trigger:true});	
				window['nextDeepRoute'] = '';
			}else{
      	  	  view.render();
			}
			
		})
		
    },
	
	events: {
		
		'click .addUserBttn' : function(event){ app.navigate('manage/user/add', {trigger: true});},
		'submit #searchUserForm' : 'searchUser',
		'click #clearSearchBttn' : 'clearSearch'
	},

    render: function () {
				
        $(this.el).html(this.template({users: this.collection.toJSON()}));
		
		$("#manageUserListBody", this.el).append(new ManageUserView({model: this.model, collection: this.collection}).el);
		 				
		var el = this.$el;	
				 		
        return this;
    },
	
	clearSearch: function(event){
		
		$(event.target).parents('#searchUserForm').find("input:eq(0)").val('');
		$(event.target).hide();
		this.searchUser(event);
		
		
	},
	
	searchUser: function(event){
		
			event.preventDefault();
			
			var searchForm = $(event.target);
				
			var searchUserSuccess = function(model, response){
																					
				$("#manageUserListBody")
				.find("tbody")
				.remove()
				.end()
				.html(new ManageUserView({model: model, collection: model}).el);
				
				if(searchForm.find("input:eq(0)").val()){
					searchForm.find("#clearSearchBttn").show();
				}else{
					searchForm.find("#clearSearchBttn").hide();
					}

			}
				
		this.model.clear({silent: true});		
		this.model.fetch({ data: $.param({keyword: searchForm.find("input:eq(0)").val()}), success: searchUserSuccess});
					
		
	}

});


window.ManageUserView = Backbone.View.extend({

    initialize: function () {
		
        this.render();
    },
	
	tagName: "tbody",
	
	events: {
		'click .editUserBttn' : function(event){ app.navigate('manage/user/edit/'+encodeURIComponent($(event.target).data('uid')), {trigger: true});}
    },
		
    render: function () {
											
        $(this.el).html(this.template({users: this.collection.toJSON()}));
        return this;
    }

});

window.ManageAddUserView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click .dropdown-menu li' : 'selectRole',
		'click #addUser' : 'addUser'
	},
	
	addUser: function(event){
		
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
		
		
		var addUserSuccess = function(model, response){
			$("#addUserForm .form-group").removeClass('has-error');
			if(!response.error && response.username && response.password){
				
				app.navigate('manage', {trigger: true});
				
				$(".alert").remove();
				
				_.delay(function(){
				var loginSuccessAlert = $('<div class="alert alert-success fade in" id="addUserSuccess" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('User '+response.username+' has been created with temporary password '+response.password)
					.insertAfter($('.wrapper .page-header-top'));
				}, 300);
				
				app.once("all", function(event){
					
					$("#addUserSuccess").remove();
															
				});
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="addError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#addUserForm'));
				
				var errFields = response.field.split(',');
				for(i=0;i< errFields.length; i++){
				
					$("#addUserForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
					
				}
					
			}
			
		}
		
		this.model.save($("#addUserForm").serializeObject(), {success: addUserSuccess});
		
	},
	
	selectRole: function(event){
		
		event.preventDefault();
		
		var text = $(event.target).text();

		$.getJSON('/manage/user/roles', function(response){
			
				$('#roles').tagsinput('add', _.findWhere(response, {text: text}));
			
			})
		
	},
	
	render: function () {
				
		$(this.el).html(this.template({groups: this.options.groups}));
		getScript('lib/bootstrap-tagsinput.min.js', function(){
			getScript('lib/typeahead.min.js', function(){
				
				if($('#groups').length > 0){
					$('#groups').tagsinput({
					  tagClass: function(){ return 'label alert-danger'},
					  itemValue: 'id',
					  itemText: 'title',
					  typeahead: {
					  source: function(query) {
						  return $.getJSON('/manage/user/groups');
						}
					  }
					  
					});
				}
				
				
				$('#roles').tagsinput({
				  tagClass: function(item) {
					switch (item.text) {
					  case 'View Promo'   : return 'label label-default';
					  case 'Edit Promo'   : return 'label label-primary';
					  case 'Add Promo'   : return 'label label-success';
					  case 'Analytics'   : return 'label label-info';
					  case 'Manage Users'   : return 'badge label-warning';
					  case 'Admin': return 'badge label-danger';
					}
				  },
				  itemValue: 'value',
				  itemText: 'text',
				  typeahead: {
				  source: function(query) {
					  return $.getJSON('/manage/user/roles');
					}
				  }
				  
				});
			 
			$('#roles').tagsinput('add', { "value": "1" , "text": "View Promo"     });
			$('#roles').tagsinput('add', { "value": "2" , "text": "Edit Promo"   });
			$('#roles').tagsinput('add', { "value": "3" , "text": "Add Promo"  });
			$('#roles').tagsinput('add', { "value": "4", "text": "Analytics"  });

			})
		})
		 				
		var el = this.$el;	
			
        return this;
		 
	}
	
});



window.ManageEditUserView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click .dropdown-menu li' : 'selectRole',
		'click #editUser' : 'editUser',
		'click #deleteUser' : function(){$("#deleteUserModal").modal('show');},
		'click #deleteUserConfirm' : 'deleteUser',
		'click #suspendUserConfirm' : 'suspendUser',
		'click #reactivateUser' : 'reactivateUser'
	},
	
	deleteUser: function(event){
				
		var deleteUserSuccess = function(model, response){
			
					$("#deleteUserModal").modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					
					app.navigate('manage', {trigger: true});
					
					$(".alert").remove();
					
					_.delay(function(){
						$('<div class="alert alert-warning fade in" id="deleteUserSuccess" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('User has been deleted.')
						.insertAfter($('.wrapper .page-header-top'));
					}, 300);
					
					app.once("all", function(event){
					
						$("#deleteUserSuccess").remove();
															
					});
				
		}
		
		var deleteUserFail = function(model, response){
			
					$("#deleteUserModal").modal('hide');				
					$(".alert").remove();
					
					$('<div class="alert alert-danger fade in" id="deleteUserFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You cannot delete this user.')
						.insertAfter($('.wrapper .page-header-top'));
						
					app.once("all", function(event){
					
						$("#deleteUserFail").remove();
															
					});
			
		}
				
		this.model.set({username: this.options.username});
		this.model.destroy({data: { user: this.options.username}, processData: true, success: deleteUserSuccess, error: deleteUserFail, wait: true});

		
	},
	
	reactivateUser: function(event){
				
		var reactivateUserSuccess = function(model, response){
			
					$("#deleteUserModal").modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					
					app.navigate('manage', {trigger: true});
					
					$(".alert").remove();
					
					_.delay(function(){
						$('<div class="alert alert-success fade in" id="reactivateUserSuccess" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('User has been reactivated.')
						.insertAfter($('.wrapper .page-header-top'));
					}, 300);
					
					_.delay(function(){
						
						$(".alert").fadeTo(500, 0).slideUp(500, function(){
							$(this).remove(); 
						});
						
					}, 2000);
				
				
		}
		
		var reactivateUserFail = function(model, response){
			
					$("#deleteUserModal").modal('hide');				
					$(".alert").remove();
					
					var editUserSuccessAlert = $('<div class="alert alert-danger fade in" id="reactivateUserFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You do not have the required rights to reactivate this user.')
						.insertAfter($('.wrapper .page-header-top'));
						
					app.once("all", function(event){
					
						$("#reactivateUserFail").remove();
															
					});
			
		}
				
		this.model.sync('reactivate', this.model, { data: $.param({ user: this.options.username}), success: reactivateUserSuccess, error: reactivateUserFail});


		
	},
	
	suspendUser: function(event){
				
		var suspendUserSuccess = function(model, response){
			
					$("#deleteUserModal").modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					
					app.navigate('manage', {trigger: true});
					
					$(".alert").remove();
					
					_.delay(function(){
						$('<div class="alert alert-warning fade in" id="suspendUserSuccess" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('User has been suspended.')
						.insertAfter($('.wrapper .page-header-top'));
					}, 300);
					
					app.once("all", function(event){
					
						$("#suspendUserSuccess").remove();
															
					});
				
		}
		
		var suspendUserFail = function(model, response){
			
					$("#deleteUserModal").modal('hide');				
					$(".alert").remove();
					
					var editUserSuccessAlert = $('<div class="alert alert-danger fade in" id="suspendUserFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You cannot suspend this user.')
						.insertAfter($('.wrapper .page-header-top'));
						
					app.once("all", function(event){
					
						$("#suspendUserFail").remove();
															
					});
			
		}
				
		this.model.sync('suspend', this.model, { data: $.param({ user: this.options.username}), success: suspendUserSuccess, error: suspendUserFail});


		
	},
	
	editUser: function(event){
				
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
		
		var editUserSuccess = function(response, status, xHr){
			$("#editUserForm .form-group").removeClass('has-error');
		
		
			if(!response.error && response.username){
				
				app.navigate('manage', {trigger: true});
				
				$(".alert").remove();
				
				_.delay(function(){
					
				 	editUserSuccessAlert = $('<div class="alert alert-success fade in" id="editUserSuccess" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('User '+response.username+' has been successfully updated.')
					.insertAfter($('.wrapper .page-header-top'));
					
				}, 300);
				
				_.delay(function(){
						
						$(".alert").fadeTo(500, 0).slideUp(500, function(){
							$(this).remove(); 
						});
						
				}, 1500);
				
		
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="Error" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#editUserForm'));
				
				var errFields = response.field.split(',');
				for(i=0;i< errFields.length; i++){
				
					$("#editUserForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
					
				}
					
			}
			
		}
		
		this.model.sync('update', this.model, { data: $.param($("#editUserForm").serializeObject()), success: editUserSuccess});
		
	},
	
	selectRole: function(event){
		
		event.preventDefault();
		
		var text = $(event.target).text();

		$.getJSON('/manage/user/roles', function(response){
			
				$('#roles').tagsinput('add', _.findWhere(response, {text: text}));
			
			})
		
	},
	
	render: function () {
		
		var model = this.model;
		var username = this.options.username;
		var view = this;
		getScript('lib/bootstrap-tagsinput.min.js', function(){
			getScript('lib/typeahead.min.js', function(){
				
				var fetchUserSuccess = function(model, response){
													
					$(view.el).html(view.template(model.toJSON()));
					
					if($('#groups').length > 0){
						$('#groups').tagsinput({
						  tagClass: function(){ return 'label alert-danger'},
						  itemValue: 'id',
						  itemText: 'title',
						  typeahead: {
						  source: function(query) {
							  return $.getJSON('/manage/user/groups');
							}
						  }
						  
						});
					}
						
					$('#roles').tagsinput({
					  tagClass: function(item) {
						switch (item.text) {
						  case 'View Promo'   : return 'label label-default';
						  case 'Edit Promo'   : return 'label label-primary';
						  case 'Add Promo'   : return 'label label-success';
						  case 'Analytics'   : return 'label label-info';
						  case 'Manage Users'   : return 'badge label-warning';
						  case 'Admin': return 'badge label-danger';
						}
					  },
					  itemValue: 'value',
					  itemText: 'text',
					  typeahead: {
					  source: function(query) {
						  return $.getJSON('/manage/user/roles');
						}
					  }
					  
					});
					
					if($('#groups').length > 0){
						var groups = response.groups;
						
						$.getJSON('/manage/user/groups', function(response){
					
							_.each(groups, function(group, i){
																					
								var groupData = _.findWhere(response, {id : group.toString()});
								$('#groups').tagsinput('add', groupData);
								
							});
					
						})
					}
									
					var roles = response.roles.split(',');
					
					$.getJSON('/manage/user/roles', function(response){
				
						_.each(roles, function(role, i){
																				
							var roleData = _.findWhere(response, {value : role.toString()});
							$('#roles').tagsinput('add', roleData);
							
						});
				
					})
					
					var el = view.$el;	
			
     			    return view;
							
					
				}
				
				var fetchUserFail = function(model, response){
				
					app.navigate('manage', {trigger: true});
					
					$(".alert").remove();
					
					_.delay(function(){
						 $('<div class="alert alert-danger fade in" id="editUserFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('User not found.')
						.insertAfter($('.wrapper .page-header-top'));
					}, 300);
				
				}
				
				model.fetch({ data: $.param({user: username}), success: fetchUserSuccess, error: fetchUserFail });
			

			})
		})
		 				
		 
	}
	
});

