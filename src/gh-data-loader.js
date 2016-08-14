var GitHubApiLoader = (function() {
	'use strict';

	var API_USERS_URL = 'https://api.github.com/users/';

	var ghLoader = function (userName) {
		this.userName = userName;
		this.url = {
			api: API_USERS_URL + userName,
			langs: []
		};
		this.error = null;
	};

	ghLoader.prototype = {
		getData: fetchProfileData,
		getRepos: function () {
			return this.repos;
		},
		getProfile: function () {
			return this.profile;
		},
		getURLs: function () {
			return this.url;
		}
	};

	return ghLoader;

	// call GitHub API to get profile data
	//
	function fetchProfileData(callback) {
		var context = this;
		var handler = loadJSON(this.url.api);

		handler.success(function(result) {
			context.profile = result;

			loadJSON(result.repos_url)
				.success(function (repos) {
					context.repos = repos;
					context.url.langs = getLangURLs(repos);
					callback();
				});
		});

		handler.error(function (result, request) {
			var error = {
				message: result.message
			};
			checkSpecifiedError(error, request);
			callback(error);
		});
	}

	/////////////////////////////
	// Private
	//

	function checkSpecifiedError(error, request) {
		if (request.status === 404) {
			error.isWrongUser = true;
		}

		var limitRequests = request.getResponseHeader('X-RateLimit-Remaining');
		if (Number(limitRequests) === 0) {
			// API is blocked
			var resetTime = request.getResponseHeader('X-RateLimit-Reset');
			error.resetDate = new Date(resetTime * 1000);

			// full message is too long, leave only important thing
			error.message = error.message.split('(')[0];
		}
	}

	function getLangURLs(repos) {
		var langApiUrls = [];

		for (var k in repos) {
			langApiUrls.push(repos[k].languages_url);
		}

		return langApiUrls;
	}

	function loadJSON(url) {
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
	}

	function getURL(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.send();

		return request;
	}

}());