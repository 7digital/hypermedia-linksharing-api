var restify = require('restify'),
	contacts = require('./lib/contacts'),
	server;

server = restify.createServer({
	formatters: {
		'application/vnd.7digital.linksharing+json':
			function formatJson(req, res, body) {
			// Just defer to the usual JSON formatter
			return this['application/json'](req, res, body);
		}
	}
});

server.use(restify.acceptParser(server.acceptable));

server.get('/', function apiRoot(req, res, next) {
	res.send({
		links: [
			{ href: '/contacts', rel: 'contact-list' }
		]
	});
});

server.get('/contacts', contacts.get);
server.post('/share', function respond(req, res, next) {
	res.send(req.params);
});

server.use(function setContentType(req, res, next) {
	res.header('Content-type', 'application/vnd.7digital.linksharing+json');
	return next();
});

server.listen(+process.env.PORT || 8080, function serverStarted() {
	console.log('%s listening at %s', server.name, server.url);
});
