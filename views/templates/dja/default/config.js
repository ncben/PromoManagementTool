var config = {}

config.enabled = true;

config.pages =  ['standard','single-panel'];

config.templateName =  'Simple';

config.thumbnail =  'template-default.png';

config.pagesInfo = {
	'standard' : {
			
		'name' : 'Standard Side-by-Side View',
		'panels' : {1: 'header', 2: 'left-panel', 3: 'right-panel', 4: 'footer'  },
		'panels-detail' : {1: 'Page Header', 2: 'Main Content (Left)', 3: 'Main Content (Right)', 4: 'Footer' }
	},
	
	'single-panel' : {
			
		'name' : 'Single Panel View',
		'panels' : {1: 'header', 2: 'main-panel', 4: 'footer'  },
		'panels-detail' : {1: 'Page Header', 2: 'Main Content', 4: 'Footer' }
	}
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
	'app_id' : {
			initialHidden: true,
			defaultValue: 'var=app_id',
			description: 'fb:app_id'
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
