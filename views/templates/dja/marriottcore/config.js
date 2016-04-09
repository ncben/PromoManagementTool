var config = {}

config.enabled = true;

config.pages =  ['standard'];

config.templateName =  'Marriott Core';

config.thumbnail =  'template-default.png';

config.pagesInfo = {
	'standard' : {
			
		'name' : 'Standard Side-by-Side View',
		'panels' : {1: 'header', 2: 'left-panel', 3: 'right-panel', 4: 'footer'  },
		'panels-detail' : {1: 'Page Header', 2: 'Main Content (Left)', 3: 'Main Content (Right)', 4: 'Footer' }
	},

}

delete require.cache[require.resolve('../default/configdefault.js')];
var configDefault = require('../default/configdefault.js');
var extend = require('node.extend');
var config = extend(configDefault, config);

config.variables = {
	
	
	'pageName' : {
			defaultValue: 'var=pageName',
			description: 'Page Title',
			placeholder: '(Leave blank to use promotion name)',
		},
	'ogURL' : {
			placeholder: '(Leave blank to use current page URL)',
			defaultValue: 'var=originalUrl',
			description: 'Facebook Share URL',
			isReferral: true
		},
	'ogTitle' : {
			defaultValue: 'var=pageName',
			description: 'Facebook Share Title',
			placeholder: '(Leave blank to use promotion name)',
		},
	'ogDescription' : {
			editableType: 'textarea',
			description: 'Facebook Share Copy'
		},
	'ogType' : {
			defaultValue: 'website',
			initialHidden: true,
			description: 'og:type'
		},
	
	'ogImage' : {
			editableType: 'image-upload',
			description: 'Facebook Share Image',
			placeholder: '(200x200 or above recommended)',
		},
	
	'twitterShareCopy' : {
			defaultValue: '',
			placeholder: '(Max 140 characters)',
			description: 'Twitter Share Copy'
		},
	'twitterShareURL' : {
			defaultValue: '',
			placeholder: '(Leave blank to not include an URL)',
			description: 'Twitter Share URL (Added to the end of share copy and counts as 22 characters)',
			isReferral: true
		},
	'pinterestImage' : {
			editableType: 'image-upload',
			description: 'Pinterest Image',
			placeholder: '',
		},
	'pinterestDescription' : {
			editableType: 'textarea',
			description: 'Pinterest Share Copy',
			placeholder: '',
		},
	'pinterestURL' : {
			defaultValue: 'var=originalUrl',
			placeholder: '(Leave blank to use current page URL)',
			description: 'Pinterest Share URL',
			isReferral: true
		},
	'app_id' : {
			initialHidden: true,
			defaultValue: 'var=app_id',
			description: 'fb:app_id'
		},
	'fbAdmin' : {
			defaultValue: 'var=fbAdmin',
			initialHidden: true,
			description: 'fb:admins'
		},
	'twitterCardType': {
			defaultValue: 'summary',
			initialHidden: true,
			description: '<a href="https://dev.twitter.com/docs/cards" target="_blank">twitter:card</a>'
		},	
	'lang' : {
			defaultValue: 'en',
			initialHidden: true,
			description: '&lt;html&gt; lang'
		},	
	'customHeadValues': {
		initialHidden: true,
		description: 'Insert codes between &lt;head&gt;&lt;/head&gt;',
		editableType: 'textarea',
		placeholder: 'Allowed tags: <script></script>, <style></style> or <meta /> tags'
	}

};

module.exports = config;
