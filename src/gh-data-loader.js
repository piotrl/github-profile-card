var GitHubApiLoader = (function() {
	'use strict';
	
	var getURL = function (url) {
		var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.send();
		
		return request;
	};

	var loadJSON = function (url) {
		var request = getURL(url);

		return {
			success: function(callback) {
				request.addEventListener('load', function () {
					if (callback && request.status === 200) {
						callback(JSON.parse(request.responseText));
					}
				});
			},
			error: function(callback) {
				request.addEventListener('load', function () {
					if (callback && request.status !== 200) {
						var result = JSON.parse(request.responseText);
						callback(result, request);
					}
				});
			}
		};
	};
	
	var getLangsURLs = function (repos) {
		var langs = [];
		
		for (var k in repos) {
			langs.push(repos[k].languages_url);
		}

		return langs;
	};

	var ghLoader = function (userName) {
		this.userName = userName;
		this.url = {
			api: 'https://api.github.com/users/' + userName,
			langs: []
		};
		this.error = null;
	};

	// call GitHub API to get profile data
	//
	ghLoader.prototype.getData = function (callback) {
		var handler = loadJSON(this.url.api);
		var self = this;
		handler.success(function(result) {
			self.profile = result;
			var reposPromise = loadJSON(result.repos_url);
			reposPromise.success(function (repos) {
				self.repos = repos;
				self.url.langs = getLangsURLs(self.repos);			
				callback(null, repos);
			});
			reposPromise.error(function (result) {
				self.repos = result;
				self.url.langs = getLangsURLs(self.repos);			
				callback(null, result);
			});
		});

		handler.error(function (result, request) {
			var limitRequests = request.getResponseHeader('X-RateLimit-Remaining');
			var error = {
				message: result.message
			};
			if (Number(limitRequests) === 0) {
				// API is blocked
				var resetTime = request.getResponseHeader('X-RateLimit-Reset');
				error.resetDate = new Date(resetTime * 1000);

				// full message is too long, leave only important thing
				error.message = error.message.split('(')[0]; 
			}
			if (request.status === 404) {
				error.isWrongUser = true;
			}

			callback(error, result);
		});
	};

	ghLoader.prototype.getRepos = function() {
		return this.repos;
	};

	ghLoader.prototype.getProfile = function() {
		return this.profile;
	};


	ghLoader.prototype.getURLs = function() {
		return this.url;
	};

	return ghLoader;
}());