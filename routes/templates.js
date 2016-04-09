var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;
var ejs = require('ejs');
var fs = require('fs');
var includeFBInit = false;

getTemplateHTML = function(type, options, template, userGroup, config){
				
			
	switch (type) {
		
		case 'text-field':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.inputText.name), 'utf8');

			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				label: options.label, // This is where the label goes
				placeholder: options.placeholder, //Text for the placeholder
				id: options.id, //This is the id of the input field
				inputName: options.id, //Name of the input	
				dataMatch: options.validation == 'match' ? options['match'] : '', //Match , say for confirm email	
				validation: options.validation, 
				required: options.req,
				maxlength: options.maxlength					
			});
			return html;
			break;
						
		case 'textarea': 
			var compiled = ejs.compile(fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.textarea.name), 'utf8'));
			var html = compiled({
				id: options.id,
				name: options.id,
				label: options.label,
				width: '100%',
				height: '150px',
				placeholder: '', // place holder copy
				required: options.req, // required field (1/0)
				gridPanelSize:options.sizex, // Size of Panel (1-12)
			});
			return html;
			break;
			
		
			
		case 'submit-button':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.submitButton.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			
			var html = compiled({
				gridPanelSize:options.sizex, // size of panel (1-12)
				id: options.id, // id of element
				name: options.id, // name of element,
				label: options.label,
				color: options.action == 'blue' ? 'info' : options.action == 'green' ? 'success' :  options.action == 'red' ? 'danger' : 'default',
				style: options.style,
				imageUrl: options.imageUrl || ''
			});
			
			return html;
			break;
			
		case 'state-drop-down':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.inputStateDropDown.name), 'utf8');
			var dropDownData = options.value.split(',');
			
			var selectData = [];
			
			for(var x=0;x<dropDownData.length;x++){
				
				selectData[x] = {};
				selectData[x].label = (options.abbreviated === 'true') ? dropDownData[x].split('-')[0] : dropDownData[x].split('-')[1];
				selectData[x].value = dropDownData[x].split('-')[0];
				
			}
			
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				label: options.label, // description
				gridPanelSize:options.sizex, // size of panel (1-12)
				selectData: selectData,
				name: options.id, // name of select elements
				id: options.id, // id of select
				required: options.req
			});
			return html;
			break;
			
		case 'country-drop-down':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.countryDropDown.name), 'utf8');
			var dropDownData = options.value.split(',');
			
			var selectData = [];
			
			for(var x=0;x<dropDownData.length;x++){
				
				selectData[x] = {};
				selectData[x].label = dropDownData[x].split('|')[1];
				selectData[x].value = dropDownData[x].split('|')[0];
				
			}
			
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				label: options.label, // description
				gridPanelSize:options.sizex, // size of panel (1-12)
				selectData: selectData,
				name: options.id, // name of select elements
				id: options.id, // id of select
				required: options.req
			});
			return html;
			break;
			
		case 'drop-down':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.dropDown.name), 'utf8');
			var dropDownData = options.value.replace(/\r\n/g, "\n").split("\n");
						
			var selectData = [];
			
			for(var x=0;x<dropDownData.length;x++){
				
				selectData[x] = {};
				selectData[x].label = dropDownData[x];
				selectData[x].value = (x==0 && options.action == 'firstOptionNoValue') ? '' : dropDownData[x].replace(/"/g, '&quot;');
				
			}
			
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				label: options.label, // description
				gridPanelSize:options.sizex, // size of panel (1-12)
				selectData: selectData,
				name: options.id, // name of select elements
				id: options.id, // id of select
				required: options.req
			});
			return html;
			break;
			
		case 'slider':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.slider.name), 'utf8');
			var slides = options.value.split(',');
			var slideData = [];
			
			for(x=0;x<slides.length;x++){
			
				slideData[x] = {};
				slideData[x].thumbNail = slides[x];
				slideData[x].src = slides[x];
				
			}
			
			
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				slideData: slideData, // must be array
									// array must look like 
									// 	slideData[].thumbNail = '';
									// 	slideData[].src = ''
				id: options.id
				
			});
			return html;
			break;
			
		case 'date-of-birth':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.dobFull.name), 'utf8');
			var dobMonthArray = [{label: 'Jan', value: '01'},{label: 'Feb', value: '02'}, {label: 'Mar', value: '03'}, {label: 'Apr', value: '04'}, {label: 'May', value: '05'}, {label: 'Jun', value: '06'}, {label: 'Jul', value: '07'}, {label: 'Aug', value: '08'}, {label: 'Sep', value: '09'}, {label: 'Oct', value: '10'}, {label: 'Nov', value: '11'}, {label: 'Dec', value: '12'}];
					
			var dobDayArray = [];
			
			for(var x=1;x<=31;x++){
				
				dobDayArray.push({value: ((x.toString().length == 1) ? '0' : '') + x.toString(), label: x.toString()});
				
			}
			
			var dobYearArray = [];
			
			for(var x=new Date().getFullYear();x>=1900;x--){
				
				dobYearArray.push({value: x.toString(), label: x.toString()});
				
			}
		
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // size of panel (1-12)
				label: options.label, // label of DOB
				id: options.style.split(',').indexOf('month') !== -1 ? options.id+'.m' : options.style.split(',').indexOf('day') !== -1 ? options.id+'.d' : options.id+'.y', 
				name: options.style.split(',').indexOf('month') !== -1 ? options.id+'.m' : options.style.split(',').indexOf('day') !== -1 ? options.id+'.d' : options.id+'.y', 
				type: options.style.split(','),
				
				required: options.req,
				
				monthName: options.id+'[m]', // Name of Month Element
				monthID: options.id+'.m', // ID of Month Element
				dobMonth: dobMonthArray, // Array of Object contain label and value; dobMonth[].label, dobMonth[].value
				
				dayName: options.id+'[d]', // Name of Day Element
				dayID: options.id+'.d', // ID of Day element
				dobDay: dobDayArray, // Array of Object contain label and value; dobDay[].label, dobDay[].value

				yearName: options.id+'[y]', // Name of Year Element
				yearID: options.id+'.y', // ID of year element
				dobYear: dobYearArray, // Array of Object contain label and value; dobYear[].label, dobYear[].value
			});
			return html;
			break;
			
						
		case 'checkbox':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.checkbox.name), 'utf8');
			var example = new Array();	
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				label: options.label, // This is where the label goes
				id: options.id, //This is the id of the input field
				inputName: options.id, //Name of the input
				required: options.req,
				prechecked: options.prechecked
										
			});
			return html;
			break;
			
		case 'image':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.image.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				src: options.value, // Image source link
				alt: 'image', //Alt tag
				id: options.id, //ID
				maxWidth: '100%', //Max width for image,
				width: '100%', //Width for image
			});
			return html;
			break;
			
		case 'text':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.text.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				text: options.value, 
				id: options.id //ID
			});
			return html;
			break;
			
		case 'phone-field':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.inputPhone.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				label: options.label,//Phone number label
				id: options.id+'.0',//ID
				name: options.id,
				maxlength: '15',
				placeholder: '',
				required: options.req,
				style: options.style,
				name: options.id,
				placeholderAreaCode: '', //Place holder for area code
				AreaCodeID: options.id+'.0', //ID for the input for area code
				AreaCodeName: options.id+'[0]', //Name for the input for area code
				AreaCodeMaxlength: '3', //Maxlength for the area code
				placeholderPrefix: '', //Place holder for the prefix
				PrefixID: options.id+'.1', //Id for the input for the prefix
				PrefixName: options.id+'[1]',//Name for the input for the prefix
				PrefixMaxlength: '3', //Maxlength for the prefix
				placeholderLinenumber: '', //Place holder for the line number
				LinenumberID: options.id+'.2', //Id for the input for the line number
				LinenumberName: options.id+'[2]', //Name for the input for the line number
				LinenumberMaxlength: '4', //Maxlength for the line number
			});
			return html;
			break;	
			
		case 'recaptcha':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.recaptcha.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				id: options.id,//ID
				style: options.style
			
			});
			return html;
			break;
			
		case 'radio-button':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.inputRadio.name), 'utf8');
			
			var radioGroupData = [];
			var radioButtonData = options.value.replace(/\r\n/g, "\n").split("\n");
			
			for(var x=0;x<radioButtonData.length;x++){
				
				if(radioButtonData[x]){
					radioGroupData[x] = {};
					radioGroupData[x].label = radioButtonData[x];
					radioGroupData[x].value = radioButtonData[x].replace(/"/g,'&quot;');
				}
				
			}
			

			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				label: options.label,
				gridPanelSize:options.sizex, // size of panel (1-12)
				radioData: radioGroupData,
				required: options.req,
				id: options.id,
				name: options.id // name of radio elements
			});
			return html;
			break;	
			
		case 'link':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.textLink.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // size of panel (1-12)
				id: options.id, // id of element
				text: options.label, 
				target: options.action,
				style: options.style || '',
				href: options.value
			});
			return html;
			break;
		
		case 'button-link':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.buttonLink.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // size of panel (1-12)
				id: options.id, 
				text: options.label,
				href: options.value,
				color: options['imageUrl'] == 'blue' ? 'info' : options['imageUrl'] == 'green' ? 'success' :  options['imageUrl'] == 'red' ? 'danger' : 'default',
				target: options['action'],
				style: options['style'] || ''
				});
				return html;
			break;
			
		case 'image-link':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.imageLink.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex, // Size of Panel (1-12)
				href: options.value,
				src: options.label,
				target: options.action,
				alt: '', 
				style: options['style'] || '',
				id: options.id, 
				maxWidth: '100%'
			});
			return html;
			break;	
		case 'line-break':
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.lineBreak.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				id: options.id,
			});
			return html;
			break;	
		
		case 'like-button':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.likeButton.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				layout: options.value,
				style: options.style || '',
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'like-box':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.likeBox.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				colorscheme: options.value,
				id: options.id,
				showposts: options.action || ''  == 'show-posts' ? true : false,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'send-button':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.sendButton.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
		
		case 'share-button':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.shareButton.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				id: options.id,
				style: options.style,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'embedded-post':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.embeddedPost.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'follow-button':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.followButton.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				layout: options.value,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'comment-box':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.commentBox.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				href: options.label,
				colorscheme: options.value,
				numposts: options.action || '5',
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'app-request':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.appRequest.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				title: options.label,
				src: options.imageUrl,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			
			return html;
		
			break;
			
		case 'fb-send':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.sendDialog.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				url: options.value,
				src: options.imageUrl,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			
			return html;
		
			break;
			
		case 'fb-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.feedDialog.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				url: options.action,
				src: options.imageUrl,
				picture: options.style,
				title: options.label,
				description: options.value,
				id: options.id,
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			
			return html;
		
			break;
			
		case 'twitter-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.twitterShare.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				src: options.imageUrl || '',
				action: options.action || '',
				custom: options.custom || '',
				style: options.style || '',
				text: options.value,
				id: options.id
			});
			
			return html;
		
			break;
			
		case 'google-plus-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.googlePlusShare.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				src: options.imageUrl || '',
				url: options.label || '',
				style: options.style || '',
				id: options.id
			});
			
			return html;
		
			break;
			
		case 'pinterest-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.pinterestShare.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				src: options.custom || '',
				url: options.label || '',
				style: options.style || '',
				description: options.value || '',
				img: options.imageUrl,
				pincount: options.action,
				id: options.id
			});
			
			return html;
		
			break;
			
		case 'linkedin-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.linkedInShare.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				src: options.imageUrl || '',
				url: options.label || '',
				style: options.style || '',
				title: options.action || '',
				summary: options.value || '',
				source: options.custom || '',
				id: options.id
			});
			
			return html;
		
			break;
			
		case 'email-share':
						
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.emailShare.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				src: options.imageUrl || '',
				subject: options.label || '',
				description: options.value || '',
				id: options.id
			});
			
			return html;
		
			break;
			
		case 'disqus':
				
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.disqus.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				id: options.id,
				href: options.label == 'custom' && options.value ?  options.value : ''
			});
			return html;
		
			break;
			
		case 'prefill-with-facebook':
		
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.prefillWithFacebook.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				id: options.id,
				src: options['imageUrl'],
				map: options.value.split(','),
				includeFBInit: !includeFBInit ? includeFBInit = true : false
			});
			return html;
		
			break;
			
		case 'hidden-input':
		
			var file = fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.hiddenInput.name), 'utf8');
			var compiled = ejs.compile(file, {compileDebug: false, debug: false});
			var html = compiled({
				gridPanelSize:options.sizex,
				id: options.id,
				inputName: options.id,
				label: options.label
			});
			return html;
		
			break;
		
				
		//INCOMPETE BELOW THIS LINE
		
		case 'essay': 
			var compiled = ejs.compile(fs.readFileSync(require('path').resolve('views/templates/'+userGroup+'/'+template+'/'+config.essay.name), 'utf8'));
			var html = compiled({
				description: '', // essay description
				min: 0, // min # of (word/char)
				max: 0, // max # of (word/char)
				limitby: 'char', // (word/char)
				trim: 1, // trim the essay
				placeholder: '', // place holder copy
				required: 1, // required field (1/0)
				gridPanelSize: 1, // Size of Panel (1-12)
			});
			return html;
			break;
						
		
	
			
	
		default:
			return '';																				
	}


}

exports.previewFullPage = function(req, res, cb){
		
	var cb = cb;
		
  	var run = function(req,res){						
		var isGet = true;
		
		if(!req.query.pageItemId || !req.query.pageItemId.trim()){
			
			if(typeof req.body == 'object' && req.body.pageItemId && req.body.pageItemId.trim()){
				
				isGet = false;
				
			}else{
		
				res.writeHead(400);
				res.end(); 
				return;
			}
				
			
		}
			
		var pageItemId  = isGet ? req.query.pageItemId.trim() : req.body.pageItemId.trim();
			
				
						
		db.getRowWithColumns('promobuilder', 'promo:'+(isGet ? req.query.pid : req.body.pid), ["pages:"], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}		
													
			var response = {};	
			var panels = {};
			
			for(key in data[0].columns){
															
				var pageId = key.replace('pages:','').split(":")[0];
				
				if(pageId == pageItemId){
					
					var type = key.replace('pages:'+pageItemId+':','').split(":")[0];
					
					if(type == 'type'){ response.type = data[0].columns[key].value; continue; }
					if(type == 'name'){ response.name = data[0].columns[key].value; continue; }
					if(type == 'desc'){ response.desc = data[0].columns[key].value; continue; }
					if(type == 'template'){ response.template = data[0].columns[key].value; continue; }
					if(type == 'template-page'){ response['template-page'] = data[0].columns[key].value; continue; }
					if(type == 'configurables'){ 
						
						if(typeof response['configurables'] == 'undefined')response['configurables'] = {};
						response['configurables'][key.replace('pages:'+pageItemId+':configurables:','')] = data[0].columns[key].value;
						continue; 
					}
					
					var panelId = parseInt(key.replace('pages:'+pageItemId+':','').split(":")[0]);
					
					if(panelId != '' && !isNaN(panelId)){
								
						var column = key.replace('pages:'+pageItemId+':'+panelId+':','').split(":");
						var index = parseInt(column[0]);
						
						if(typeof panels[panelId] == 'undefined')panels[panelId] = {};
						
						if(column[0] != '' && /^[0-9]+$/.test(column[0])){
							
							if(typeof panels[panelId]['data'] == 'undefined')panels[panelId]['data'] = [];
																																		
							if(typeof panels[panelId]['data'][index] == 'undefined')panels[panelId]['data'][index] = {};

							panels[panelId]['data'][index][column[column.length-1]] = data[0].columns[key].value;
							
						}else{
						
							panels[panelId][column[column.length-1]] = data[0].columns[key].value;
							
						}
						
					}
				}
				
			
			}
			
			for(panelId in panels){
				
				panels[panelId]['data'].sort(function(a,b){
					rowA = parseInt(a.row);
					rowB = parseInt(b.row);
					colA = parseInt(a.col);
					colB = parseInt(b.col);
					sizeyA = parseInt(a.sizey);
					sizeyB = parseInt(b.sizey);
					
					 if(rowA > rowB)return 1;
					 	else if ( rowA < rowB )return -1;
					 	else if (colA > colB )return 1;
					 	else if ( colA < colB )return -1;
					 	else if (sizeyA > sizeyB)return -1;
					 	else if ( sizeyA < sizeyB )return 1;
					 	else return 0;
				})
				
				
			}
						
			if(!response.template){
				res.send(400);
				return;
			}
			delete require.cache[require.resolve('../views/templates/'+req.userGroup+'/'+response.template+'/config.js')];
			var config = require('../views/templates/'+req.userGroup+'/'+response.template+'/config.js');
						
			var panelInfo = {};
			
			var hasFormElement = [];
			
			includeFBInit = false;
			
			for(panelId in panels){
				
				panelInfo[panelId] = [];
				
				var rowsCounted = [];
				
				
				if(typeof panels[panelId]['data'] == 'object' &&  panels[panelId]['data'].length > 0){
										
					for(var i=0;i<panels[panelId]['data'].length;i++){
						
						panels[panelId]['data'][i].panel = panelId;
						
						var html = getTemplateHTML(panels[panelId]['data'][i].type, panels[panelId]['data'][i], response.template, req.userGroup, config);
						
						if(panels[panelId]['data'][i].isFormElement == 'true' && hasFormElement.indexOf(panelId) === -1){
							hasFormElement.push(panelId);
						}
						
						if(i==0 && panels[panelId]['data'][i].row == 1 && panels[panelId]['data'][i].col != 1){
							
								html = '<div class="col-md-'+(parseInt(panels[panelId]['data'][i].col) - 1)+'"></div>'+html;
							
						}
						
						if(typeof panels[panelId]['data'][i-1] == 'object' &&  (parseInt(panels[panelId]['data'][i-1].col)+parseInt(panels[panelId]['data'][i-1].sizex)) < parseInt(panels[panelId]['data'][i].col) && panels[panelId]['data'][i-1].row === panels[panelId]['data'][i].row){
							var blank_sizex = parseInt(panels[panelId]['data'][i].col) - (parseInt(panels[panelId]['data'][i-1].col)+parseInt(panels[panelId]['data'][i-1].sizex));
							
							if(blank_sizex>0){
								html = '<div class="col-md-'+blank_sizex+'"></div>'+html;
							}
							
							
						}
						
						if(typeof panels[panelId]['data'][i-1] == 'object' &&  panels[panelId]['data'][i-1].row !== panels[panelId]['data'][i].row && parseInt(panels[panelId]['data'][i].col) > 1){
																					
							var previous_col_on_row = 0;
							
							for(var x=(i-1); x>=0;x--){
							
								if(((parseInt(panels[panelId]['data'][x].row)+parseInt(panels[panelId]['data'][x].sizey))-1) >= panels[panelId]['data'][i].row){
									if((parseInt(panels[panelId]['data'][x].col)+parseInt(panels[panelId]['data'][x].sizex)) <= panels[panelId]['data'][x].col){
										previous_col_on_row = Math.max(previous_col_on_row, (parseInt(panels[panelId]['data'][x].col)+parseInt(panels[panelId]['data'][x].sizex)));
									}
									
								}
								
							}
														
							var blank_sizex = parseInt(panels[panelId]['data'][i].col) - previous_col_on_row -1;
							
							if(blank_sizex>0){
								html = '<div class="col-md-'+blank_sizex+'"></div>'+html;
							}
							
							
						}
						
						
						if(rowsCounted.indexOf(panels[panelId]['data'][i].row) === -1){
							
							html = '<div class="row">'+html;
							if(parseInt(panels[panelId]['data'][i].row) > 1)html = '</div>'+html;
							rowsCounted.push(panels[panelId]['data'][i].row);
							if(parseInt(panels[panelId]['data'][i].sizey) > 1){
								
								for(var x= (parseInt(panels[panelId]['data'][i].row)+1); x< (parseInt(panels[panelId]['data'][i].row)+parseInt(panels[panelId]['data'][i].sizey));x++){
									
									rowsCounted.push(x.toString());
									
								}
								
							}
							
						}
						
						panelInfo[panelId].push(html);
						
					}
					
				}
				
				
			}
			
			for(key in panelInfo){
												
				panelInfo[key] = panelInfo[key].join('')+'</div>';
				
				if(hasFormElement.indexOf(key) !== -1){
				
					panelInfo[key] = '<form data-submit="'+panels[key]['save-data-from']+'" data-path="/'+pageItemId+'.'+key+'">'+panelInfo[key]+'</form>';
					
					
				}
								
			}
			
			var reqType = isGet ? req.query.type : req.body.type;
						
			if(reqType == 'json'){
				
				response.panels = panels;
				response.html = panelInfo;
				res.send(response);
				return;
				
			}else if(reqType == 'generateHTML'){
				if(typeof cb == 'function')cb( req, res, response, panelInfo, config, pageItemId, panels, hasFormElement);
				
			}else{
								
				if(config.pages.indexOf(response['template-page']) !== -1){
					
					fs.readFile(require('path').resolve('views/templates/'+req.userGroup+'/'+response.template+'/'+response['template-page']+'.html'), function(err, file){
						
						if (err){
							console.log(err);	
							res.send(500);
							return;
						}												
						
					
						var compiled = ejs.compile(file.toString(), {filename: require('path').resolve('views/templates/'+req.userGroup+'/'+response.template+'/'+response['template-page']+'.html'), compileDebug: false, debug: false});
					
						var html = compiled({
							 showPanelNumber : false,
							 panels: panelInfo,
							 templateName: config.templateName,
							 pageName: config.pagesInfo[response['template-page']].name
						});
						
						html = html.replace(/<\$\$(.*)\$\$>/g, '');
						
						res.send(html);
						
					})
					
						
				}else{
					res.send(404);
				}
				
			}
		
					
		});			
		
			
						  
					
			
		
	}
  
  
    if(req.bypassAuth)run(req, res);
		else dashboard.checkRequiredRoles([1], run, req, res);
	
}


exports.previewBasic = function(req, res){
		
  	var run = function(req,res){						
		
		if(!req.userGroup){
			res.send(400);
			return;	
		}
		
		if(!req.query.template || !/^[a-zA-Z0-9]+$/.test(req.query.template)){
			res.send(404);
			return;	
		}
		
		if(!req.query.type || !/^[a-zA-Z0-9]+$/.test(req.query.type)){
			res.send(404);
			return;	
		}
		
		delete require.cache[require.resolve('../views/templates/'+req.userGroup+'/'+req.query.template+'/config.js')];
		var config = require('../views/templates/'+req.userGroup+'/'+req.query.template+'/config.js');
				
		if(req.query.type == 'page'){
			
			if(!req.query.page || !/^[a-zA-Z0-9_\-]+$/.test(req.query.page)){
				res.send(404);
				return;	
			}			
			
			if(config.pages.indexOf(req.query.page) !== -1){
				
				if(req.query['preview-panel-id'] && req.query['preview-component']){
				
					config.pagesInfo[req.query.page]['panels-detail'][req.query['preview-panel-id']] = getTemplateHTML(req.query['preview-component'], {}, req.query.template, req.userGroup, config)
										
				}

				res.render('templates/'+req.userGroup+'/'+req.query.template+'/'+req.query.page+'.html', {showPanelNumber : req.query['show-panel-number'] == 'true' ? true : false, panels: config.pagesInfo[req.query.page]['panels-detail'], templateName: config.templateName, pageName: config.pagesInfo[req.query.page].name, preview: true}, function(err, html){
				
						html = html.replace(/<\$\$(.*)\$\$>/g, '');
						html = html.replace(/window\.self != window\.top/g, 'false')
						res.end(html);
					
				});
				
				
			}else res.send(404);
		}else if(req.query.type == 'thumbnail'){
						
			if(config.thumbnail)
											
				res.sendfile(require('path').resolve('views/templates/'+req.userGroup+'/'+req.query.template+'/'+config.thumbnail));
			else
				res.send(404);
		}
	}
  
  	dashboard.checkRequiredRoles([1], run, req, res);
	
}
