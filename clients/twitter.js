define(function (require, exports, module) {
	var OAuth = require('./lib/jsOAuth').OAuth,
		name = 'Twitter',
		key = 'TwitterApiCredentials',
		options = {
			consumerKey: 'YOUR_KEY_HERE',
			consumerSecret: 'YOUR_SECRET_HERE',
			callbackUrl:  '/oauth-callback.html'
		},
		urls = {
			oauthRequestToken: 'https://api.twitter.com/oauth/request_token',
			oauthAuthorizeToken: 'https://api.twitter.com/oauth/authorize?',
			oauthVerifyToken: 'https://api.twitter.com/oauth/authorize',
			verifyCredentials: 'https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
			getFriendIds: 'https://api.twitter.com/1/friends/ids.json',
			lookupUsers: 'https://api.twitter.com/1/users/lookup.json',
			updateStatus: 'https://api.twitter.com/1/statuses/update.json'
		};

	function TwitterApi() {
		this.oauth = new OAuth(options);
	}

	TwitterApi.prototype.authorise = function authorise(cb) {
		var credentials, self = this;

		this.oauth.get(urls.oauthRequestToken, function handleRequestTokenResponse(data) {
			var ctx = self,
				reqParams = data.text,
				callback = cb;

			var authWindow = window.open(urls.oauthAuthorizeToken + '?' + data.text);
			// TODO: Handle token
		});
	};

	TwitterApi.prototype.parseVerification = function (qs) {
		var token, verifier, pairs, kvp, i, l;

		pairs = qs.split('&');
		for (i = 0, l = pairs.length; i < l; i++) {
			kvp = pairs[i].split('=');
			if (kvp[0] === 'oauth_token') {
				token = kvp[1];
			}
			else if (kvp[0] === 'oauth_verifier') {
				verifier = kvp[1];
			}
		}

		return {
			token: token,
			verifier: verifier
		};
	};

	TwitterApi.prototype.verifyToken = function (token, verifier, reqParams, cb) {
		var self = this, callback = cb;

		this.oauth.get(urls.oauthVerifyToken + '?oauth_verifier='+ verifier +'&' + reqParams,
			function handleAccessTokenResponse(data) {
				var accessParams = {},
					qvars_tmp = data.text.split('&');

				for (var i = 0; i < qvars_tmp.length; i++) {
					var y = qvars_tmp[i].split('=');
					accessParams[y[0]] = decodeURIComponent(y[1]);
				}

				if (accessParams.oauth_token &&
					accessParams.oauth_token_secret) {
					var accessData = {};
					accessData.accessToken = accessParams.oauth_token;
					accessData.accessSecret = accessParams.oauth_token_secret;
					self.oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
					callback(null, accessData);
				}
			},
			function (data) {
				callback(new Error(data));
			});
	};

	TwitterApi.prototype.start = function initialise(cb) {
		var self = this;

		this.oauth.get(urls.verifyCredentials,
			function handleCredentialsResponse(data) {
				var entry, item, parsedItem;

				entry = JSON.parse(data.text);
				cb(null, entry);
			},
			function handleCredentialsError(data) {
				cb(new Error(data));
			});
	};

	TwitterApi.prototype.getContacts = function getContacts(handle, cb){
		var screenName, item,  parsedItem, url, self = this;

		url = urls.getFriendIds + '?&screen_name=' + handle;
		this.oauth.get(url, function handleFriendsIdsResponse(data) {
			var res, friendIds, idString = '', url, i;

			res = JSON.parse(data.text);
			friendIds = res.ids;

			// NOTE: Twitter only allows you to request 100 at a time
			for (i = 0; i < 100; i++) {
				idString += friendIds[i];
				if (i !== 99) idString += ',';
			}

			self.oauth.get(urls.lookupUsers + '?user_id=' + idString, 
						function handleUserLookupResponse(data) {
				var users, item, parsedItem;

				users = JSON.parse(data.text);
				cb(null, users);
			}, function handleUserLookupError(data) {
				cb(new Error(data));
			});
		}, function handleFriendsIdsError(data) {
			cb(new Error(data));
		});
	};

	TwitterApi.prototype.sendLink = function (message) {
		var url, status;
		status = encodeURICompenent('@' + message.recipient + ' ' + message.link);

		self.oauth.post(urls.updateStatus, { status: status }, function handleStatusUpdateResponse(data) {
			var statusResponse, parsedResponse;

			parsedResponse = JSON.parse(statusResponse);
			cb(null, parsedResponse);
		}, function handleStatusUpdateError(data) {
			cb(new Error(data));
		});
	};

	exports.TwitterApi = TwitterApi;
});
