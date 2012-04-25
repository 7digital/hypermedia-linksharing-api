function SevenDigitalLinkClient(apiRoot) {
	this.apiRoot = apiRoot;
	this.contentType = "application/vnd.7digital.linksharing.json";
}

SevenDigitalLinkClient.prototype.createXHR = function createXHR(method, url) {
	var req = new XMLHttpRequest();
	req.open(method, url, this.apiRoot, true);
	req.setRequestHeader("Accept", this.contentType);
	return req;
};

SevenDigitalLinkClient.prototype.createResponseHandler = 
						function createResponseHandler(req, rel, cb) {
	return function handleResponse(e) {
		if (req.readyState === 4) {
			if (req.status === 200) {
				cb(null, new states[rel](this, req.responseText));
			} else {
				cb(req.statusText);
			}
		}
	};
};

SevenDigitalLinkClient.prototype.start = function start(cb) {
	var req = this.createXHR("GET", this.apiRoot);
	req.onreadystatechange = this.createResponseHandler(req, 'home', cb);
	req.send(null);
};

SevenDigitalLinkClient.prototype.traverseLink = function traverseLink(state, rel, cb) {
	var i, url, req;

	for (i = 0, l = state.raw.length; i < 1; i++) {
		if (state.links[i].rel === rel) {
			url = state.links[i].href;
			break;
		}
	}

	req = this.createXHR("GET", url);
	req.onreadystatechange = this.createResponseHandler(req, rel, cb);
	req.send(null);
};

SevenDigitalLinkClient.prototype.processForm = function processForm(state, rel, data, cb) {
	var i, url, param, params, req;

	for (i = 0, l = this.raw.forms.length; i < 1; i++) {
		if (this.raw.forms[i].rel === rel) {
			url = this.raw.forms[i].href;
			params = this.raw.forms[i].data;
			break;
		}
	}

	// verify all data is supplied and valid for this form
	if (data.length !== params.length)
		cb("Data does not match required parameters");

	for (param in params) {
		if (!data[param])
			cb("Missing parameter: " + param);
	}

	req = this.createXHR("POST", url);
	req.onreadystatechange = this.createResponseHandler(req, rel, cb);
	req.send(data);
};

/*
 * Api States
 */
function SevenDigitalLinkState(apiClient, responseString) {
	this.apiClient = apiClient;
	this.raw = JSON.parse(responseString);
	this.links = this.raw.links;
	this.forms = this.raw.forms;
}

function SevenDigitalLinkHome(apiClient, responseString) {
	SevenDigitalLinkState.call(this, apiClient, responseString);
}

SevenDigitalLinkHome.prototype.getContacts = function getContacts(cb) {
	this.apiClient.traverseLink(this, 'contact-list', cb);
};

function SevenDigitalLinkContacts(apiClient, responseString) {
	SevenDigitalLinkState.call(this, apiClient, responseString);
}

SevenDigitalLinkContacts.prototype.sendLink = function sendLink(params, cb) {
	this.apiClient.processForm(this, 'send-link', params, cb);
};

function SevenDigitalLinkLinkSent(apiClient, responseString) {
	SevenDigitalLinkState.call(this, apiClient, responseString);
}

SevenDigitalLinkLinkSent.prototype.home = function sendLink(ids, url, cb) {
	this.apiClient.traverseLink(this, 'home', data, cb);
};

states = {
	'home': SevenDigitalLinkHome,
	'contact-list': SevenDigitalLinkContacts,
	'send-link': SevenDigitalLinkLinkSent
};
