
window.onloadInit = function(){
	
	  
	  $('body').on('hidden.bs.popover', function() {
		  $('.popover:not(.in)').hide().detach();  //bootstrap 3 bug per https://github.com/twbs/bootstrap/issues/10568

		});
	
	  window.Growl = (function() {
	
		function Growl() {}
	
		Growl.info = function(options) {
			
		  $("#gritter-notice-wrapper").empty();	
		  options['class_name'] = "info";
		  options.title = "<i class='icon-info-sign'></i> " + options.title;
		  return $.gritter.add(options);
		};
	
		Growl.warn = function(options) {
			
		  $("#gritter-notice-wrapper").empty();	
		  options['class_name'] = "warn";
		  options.title = "<i class='icon-warning-sign'></i> " + options.title;
		  return $.gritter.add(options);
		};
	
		Growl.error = function(options) {
			
		  $("#gritter-notice-wrapper").empty();	
		  options['class_name'] = "error";
		  options.title = "<i class='icon-exclamation-sign'></i> " + options.title;
		  return $.gritter.add(options);
		};
	
		Growl.success = function(options) {
		
		  $("#gritter-notice-wrapper").empty();	
		
		  options['class_name'] = "success";
		  options.title = "<i class='icon-ok-sign'></i> " + options.title;
		  return $.gritter.add(options);
		};
	
		return Growl;
	
	  })();
  	
	  window.Theme = (function() {
	
		function Theme() {}
	
		Theme.colors = {
		  darkGreen: "#779148",
		  red: "#C75D5D",
		  green: "#96c877",
		  blue: "#6e97aa",
		  orange: "#ff9f01",
		  gray: "#6B787F",
		  lightBlue: "#D4E5DE"
		};
	
		return Theme;
	
	  })();
		
	
}

window.genericInit = function(){
		
	(function() {
	
		$('.main-content .icheck').iCheck({
		  checkboxClass: 'icheckbox_flat-aero',
		  radioClass: 'iradio_flat-aero'
		});
		$.uniform.defaults.fileButtonHtml = '+';
		$.uniform.defaults.selectAutoWidth = false;
		
		$('.main-content .tip, [rel=tooltip]').tooltip({
		  gravity: 'n',
		  fade: true,
		  html: true
		});
		
		/*
		
		$(".main-content .easy-pie-chart-percent").easyPieChart({
		  animate: 1000,
		  trackColor: "#444",
		  scaleColor: "#444",
		  lineCap: 'square',
		  lineWidth: 15,
		  size: 150,
		  barColor: function(percent) {
			return "rgb(" + Math.round(200 * percent / 100) + ", " + Math.round(200 * (1 - percent / 100)) + ", 0)";
		  }
		});
		
		$(".main-content .sparkline").each(function() {
		  var barSpacing, barWidth, color, height;
		  color = $(this).attr("data-color") || "red";
		  height = "18px";
		  if ($(this).hasClass("big")) {
			barWidth = "5px";
			barSpacing = "2px";
			height = "30px";
		  }
		  return $(this).sparkline("html", {
			type: "bar",
			barColor: Theme.colors[color],
			height: height,
			barWidth: barWidth,
			barSpacing: barSpacing,
			zeroAxis: false
		  });
		});
		
		*/
		
		//$('.main-content .datepicker').bdatepicker({
		//  todayBtn: true
		//});
		
		
		$(".main-content [data-percent]").each(function() {
		  return $(this).css({
			width: "" + ($(this).attr("data-percent")) + "%"
		  });
		});
		
		/*
		$.extend($.fn.dataTableExt.oStdClasses, {
		  "sWrapper": "dataTables_wrapper form-inline"
		});
		
		$(".main-content .dTable").dataTable({
		  bJQueryUI: false,
		  bAutoWidth: false,
		  sPaginationType: "full_numbers",
		  sDom: "<\"table-header\"fl>t<\"table-footer\"ip>"
		});
		
		$(".main-content .dTable-small").dataTable({
		  iDisplayLength: 5,
		  bJQueryUI: false,
		  bAutoWidth: false,
		  sPaginationType: "full_numbers",
		  sDom: "<\"table-header\"fl>t<\"table-footer\"ip>"
		});
		
		
		$(".main-content select.uniform, input:file, .main-content .dataTables_length select").uniform();
		
		
		$(".main-content .core-animate-bars .box-toolbar a").click(function(e) {
		  e.preventDefault();
		  return $(this).closest(".core-animate-bars").find(".progress .tip").each(function() {
			var percent, randomNumber;
			randomNumber = Math.floor(Math.random() * 80) + 20;
			percent = "" + randomNumber + "%";
			return $(this).attr("title", percent).attr("data-percent", randomNumber).attr("data-original-title", percent).css({
			  width: percent
			});
		  });
		});
		
		$(".main-content .normal-slider").slider();
		
		*/
		
		$(".main-content .iButton-icons").iButton({
		  labelOn: "<i class='icon-ok'></i>",
		  labelOff: "<i class='icon-remove'></i>",
		  handleWidth: 30
		});
		
		$(".main-content .iButton-enabled").iButton({
		  labelOn: "ENABLED",
		  labelOff: "DISABLED",
		  handleWidth: 30
		});
		
		$(".main-content .iButton").iButton();
		
		$(".main-content .iButton-icons-tab").each(function() {
		  if ($(this).is(":visible")) {
			return $(this).iButton({
			  labelOn: "<i class='icon-ok'></i>",
			  labelOff: "<i class='icon-remove'></i>",
			  handleWidth: 30
			});
		  }
		});
		
		$('.main-content [data-toggle="tab"]').on('shown', function(e) {
		  var id;
		  id = $(e.target).attr("href");
		  return $(id).find(".iButton-icons-tab").iButton({
			labelOn: "<i class='icon-ok'></i>",
			labelOff: "<i class='icon-remove'></i>",
			handleWidth: 30
		  });
		});
		
		
		$(".main-content #switch-sidebar").click(function() {
		  return $('body').toggleClass('dropdown-sidebar');
		});
		
		/*
		
		$('.main-content .textarea-html5').wysihtml5({
		  "font-styles": true,
		  "emphasis": true,
		  "lists": true,
		  "html": true,
		  "link": true,
		  "image": true,
		  "color": true,
		  stylesheets: true
		});
		
		*/
		
		$.extend($.gritter.options, {
		 	 position: 'top-right'
	   	});
		 
		$('body').on('click', function (e) {
			$('[data-toggle="popover"]').each(function () {
				if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
					$(this).popover('hide');
				}
			});
		});
                
               
		
	}).call(this);
		
		
}