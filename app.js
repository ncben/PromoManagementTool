
/**
 * Module dependencies.
 */

var express = require('express'),
	cluster = require('cluster'),
    http = require('http'),
	//https = require('https'),
	path = require('path'),
	engines = require('consolidate');
	
connectTimeout = require('connect-timeout'),
auth = require('./routes/auth'),
templates = require('./routes/templates'),
promo = require('./routes/promo'),
aws = require('./routes/aws'),
manage = require('./routes/manage'),
profile = require('./routes/profile'),
dashboard = require('./routes/dashboard'),
dashboardbasic = require('./routes/dashboardbasic'),
dashboardfbtab = require('./routes/dashboardfbtab'),
dashboardregform = require('./routes/dashboardregform'),
dashboardessaycontest = require('./routes/dashboardessaycontest'),
dashboardphotocontest = require('./routes/dashboardphotocontest'),
dashboardvideocontest = require('./routes/dashboardvideocontest'),
dashboardgallery = require('./routes/dashboardgallery'),
dashboardpages = require('./routes/dashboardpages'),
dashboardanalytics = require('./routes/dashboardanalytics'),
dashboarddatamanager = require('./routes/dashboarddatamanager');
	
var memcachedStore = require('connect-memcached')(express);

sessionObj = new memcachedStore({
				hosts: [ '1.2.3.4:11211' ],
				prefix: 'sample'
			});


if (cluster.isMaster) {
	// Fork workers.
	
	var numCPUs = require('os').cpus().length;
	
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('online', function(worker) {
		console.log( 'Worker ' + worker.process.pid + ' is online.' );
	});
	
	var timeouts = [];
	function errorMsg() {
		console.error("Something must be wrong with the connection ...");
	}
	
	cluster.on('fork', function(worker) {
		timeouts[worker.id] = setTimeout(errorMsg, 2000);
	});
	cluster.on('listening', function(worker, address) {
		clearTimeout(timeouts[worker.id]);
	});
	cluster.on('exit', function(worker, code, signal) {
		clearTimeout(timeouts[worker.id]);
		errorMsg();
		if (worker.suicide === true) {
			console.log('Oh, it was just suicide\' – no need to worry');
		}
		console.log('worker %d died (%s). restarting...',
		worker.process.pid, signal || code);
		cluster.fork();
	});
	
	cluster.on('disconnect', function(worker) {
		clearTimeout(timeouts[worker.id]);
		console.log('The worker #' + worker.id + ' has disconnected');
	});
	
	cluster.on('listening', function(worker, address) {
		console.log("A worker is now connected to " + address.address + ":" + address.port);
	});
	
	//Start Cron
	cronprocess = require('./routes/cronprocess');
	cronprocess.queueJobs();
	
	Object.keys(cluster.workers).forEach(function(id) {
		cluster.workers[id].on('message', function(msg){
							
			try{
				var msg = require('jsonfn').JSONfn.parse(msg);
			}catch(Error){
				console.log(Error);
				 var msg = {};
			}

			if (msg && typeof msg.func == 'function') {
				msg.func();
			}	
			
		});
	});
	
		
} else {
	
	// Configurations
		
	var app = express();
		
	app.enable('trust proxy');
	app.disable('x-powered-by');
	app.set('views', __dirname + '/views');
	app.engine('html', engines.ejs);
	app.set('view engine', 'ejs');
	app.set('view options',{layout:false});
	app.use(express.compress());
	app.use(express.timeout(9000));
	app.use(express.methodOverride());
	//app.use(express.staticCache());
	app.use(express.logger('dev'));
	//app.use(express.favicon());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.cookieParser('xxx'));
	app.use(express.session({
		key: 'sample',
		secret: 'xxx',
		cookie: {
			path: '/',
			httpOnly : true,
			secure: false,  
			maxAge  : new Date(Date.now() + 3600000)
		},
		store: sessionObj
	}));
		
	//app.use(express.csrf()); //CSRF protection middleware
	
	if(app.get('env') == 'development'){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	}
	
	if(app.get('env') == 'production'){
	  app.use(express.errorHandler());
	}
	
	// Routes
	
	require('./routes/routes.js')(app, express);
	
	app.use(express.static(path.join(__dirname, 'public') /* , { maxAge: 31557600000 } */));
	
	//The Error Route
	
	app.use(function(req, res, next){
		
		//404 Route
	
		if(!res.headerSent){
			setTimeout(function(){
			  
				if(!res.headerSent){
					if(!req.xhr) {
						res.status(404);
						res.render('../public/tpl/404.html');
						return;
					}else{
						res.send(404);
						
					}
				
				}
			  
			}, 1000);
		}
		
	});
	
	app.use(function(err,req, res, next){
		
		//500 Route
	
		console.log(err);
	
		if(!res.headerSent){
			if (req.xhr) {
				res.json(500,{error:'We\'re currently unable to process your request. Please try again later.'});
			}else{
				res.status(500);
				res.sendfile(__dirname+'/public/tpl/500.html');
			}
		 }
		
	});
	
	process.argv.forEach(function (val, index, array) {
	
		if(/^\d{2,5}$/.test(val)){
			app.listen(val, function(){
				console.log("Express server listening on port "+val+" in %s mode", app.settings.env);
				
			});
		}
	});
	
	
}



//Global Error Logging

process.on('uncaughtException', function(err) {
	
	//https://coderwall.com/p/4yis4w
	console.error((new Date()).toUTCString() + " uncaughtException: " + err.message);
	console.error(err.stack);
	
});

process.on('ReferenceError', function(err){
	console.log('ReferenceError exception: ' + err);
})

process.on('exit', function() {
	console.log('About to exit.');
});




/*
var sslOptions = {
  key: fs.readFileSync('cert/xxx.com.key'),
  cert: fs.readFileSync('cert/xxx.com.crt'),
  ca: [
  	fs.readFileSync('cert/ca.crt', 'utf8')
	]
};

https.createServer(sslOptions, app).listen(443, function(){
  console.log("Express server listening on port **SSL** 443 in %s mode", app.settings.env);
});

*/

/*
process.on('SIGINT', function() {
  console.log('Got SIGINT.  Press Control-D to exit.');
});
*/

/*
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
*/
