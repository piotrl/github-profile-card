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
var DOMOperator = (function() {
    'use strict';

    return {
        clearChildren: clearElementFromChildren,
        createError: createErrorSection,
        createProfile: createProfileSection,
        createTopLanguages: createTopLangsSection,
        createReposHeader: createReposHeader,
        createReposList: createReposListSection
    };

    ///////////////////

    function clearElementFromChildren($parent) {
        while($parent.hasChildNodes()) {
            $parent.removeChild(
                $parent.firstChild
            );
        }
    }

    function createErrorSection(error, username) {
        var $error = document.createElement('div');
        $error.className = 'error';
        $error.innerHTML = '<span>' + error.message + '</span>';

        if (error.isWrongUser) {
            $error.innerHTML = '<span>Not found user: ' + username + '</span>';
        }
        if (error.resetDate) {
            var remainingTime = error.resetDate.getMinutes() - new Date().getMinutes();
            remainingTime = (remainingTime < 0) ? 60 + remainingTime : remainingTime;

            $error.innerHTML += '<span class="remain">Come back after ' + remainingTime + ' minutes</span>';
        }

        return $error;
    }

    function createProfileSection (data) {
        var $followButton = followButton(data.login, data.html_url);
        var $followers = followers(data.followers_url, data.followers);
        var $followContainer = followContainer([$followButton, $followers]);

        var $avatar = avatar(data.avatar_url);
        var $name = name(data.html_url, data.name);

        return profile([ $avatar, $name, $followContainer ]);

        //////////////////

        function appendChildren($parent, nodes) {
            nodes.forEach(function($node) {
                $parent.appendChild($node);
            });
        }

        function profile(children) {
            var $profile = document.createElement('div');
            $profile.classList.add('profile');
            appendChildren($profile, children);

            return $profile;
        }

        function name(profileUrl, name) {
            var $name = document.createElement('a');
            $name.href = profileUrl;
            $name.className = 'name';
            $name.appendChild(document.createTextNode(name));

            return $name;
        }

        function avatar(avatarUrl) {
            var $avatar = document.createElement('img');
            $avatar.src = avatarUrl;
            $avatar.className = 'avatar';

            return $avatar;
        }

        function followButton(username, followUrl) {
            var $followButton = document.createElement('a');
            $followButton.href = followUrl;
            $followButton.className = 'follow-button';
            $followButton.innerHTML = 'Follow @' + username;

            return $followButton;
        }

        function followers(followersUrl, followersAmount) {
            $followers = document.createElement('span');
            $followers.href = followersUrl;
            $followers.className = 'followers';
            $followers.innerHTML = followersAmount;

            return $followers;
        }

        function followContainer(children) {
            var $followContainer = document.createElement('div');
            $followContainer.className = 'followMe';
            appendChildren(
                $followContainer,
                children
            );

            return $followContainer;
        }
    }

    function createTopLangsSection (langs) {
        var topLangs = [];
        for (var k in langs) {
            topLangs.push([k, langs[k]]);
        }
        topLangs.sort(function (a, b) {
            return b[1] - a[1];
        });

        // generating HTML structure
        var $langsList = document.createElement('ul');
        $langsList.className = 'languages';
        for (var i = 0; i < 3 && topLangs[i]; i++) {
            $langsList.innerHTML += '<li>' + topLangs[i][0] + '</li>';
        }

        return $langsList;
    }

    function createReposHeader(headerText) {
        var $reposHeader = document.createElement('span');
        $reposHeader.className = 'header';
        $reposHeader.appendChild(
            document.createTextNode(headerText + ' repositories')
        );

        return $reposHeader;
    }

    function createReposListSection (repos, sortyBy, maxRepos) {
        repos.sort(function (a, b) {
            // sorted by last commit
            if (sortyBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
            } else {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });

        var $reposList = document.createElement('div');
        $reposList.className = 'repos';
        for (var i = 0; i < maxRepos && repos[i]; i++) {
            var updated = new Date(repos[i].updated_at),
                $repoLink = document.createElement('a');

            $repoLink.href = repos[i].html_url;
            $repoLink.title = repos[i].description;
            $repoLink.innerHTML += '<span class="repo-name">' + repos[i].name + '</span>';
            $repoLink.innerHTML += '<span class="updated">Updated: ' + updated.toLocaleDateString() + '</span>';
            $repoLink.innerHTML += '<span class="star">' + repos[i].stargazers_count + '</span>';

            $reposList.appendChild($repoLink);
        }

        return $reposList;
    }
})();
var GitHubCard = (function() {
	'use strict';
	
	var username;

	var autoComplete = function (options) {
		var defaultConfig = {
			template: '#github-card',
			sortBy: 'stars', // possible: 'stars', 'updateTime'
			reposHeaderText: 'Most starred',
			maxRepos: 5,
			githubIcon: false
		};
		if (!options) {
			return defaultConfig;
		}
		for(var key in defaultConfig) {
			options[key] = options[key] || defaultConfig[key];
		}
		
		return options;
	};

	var GitHubCard = function (options) {
		options = autoComplete(options);
		this.$template = document.querySelector(options.template);

		username = options.userName || this.$template.dataset.username;

		this.profileData = null;
		this.repos = {};

		// load resources and render widget
		this.init(options);
	};

	GitHubCard.prototype = {
		init: init,
		getTopLanguages: getTopLanguages,
		render: render,
		refresh: refresh
	};

	return GitHubCard;

	function init(options) {
		var apiLoader = new GitHubApiLoader(username);
		var self = this;
		apiLoader.getData(function(err) {
			self.profileData = apiLoader.getProfile();
			self.repos = apiLoader.getRepos();
			self.url = apiLoader.getURLs();
			self.render(options, err);
		});
		this.$template.className = 'gh-profile-card';
	}

	// give rank (weights) to the language
	function calcPopularity(langStats) {
		var languagesRank = {};

		langStats.forEach(function(repoLangs) {
			var sum = 0;

			for (var k in repoLangs) {
				sum += repoLangs[k] || 0;
				languagesRank[k] = languagesRank[k] || 0;
				languagesRank[k] += repoLangs[k] / (sum * 1.00);
			}
		});

		return languagesRank;
	}

	function getTopLanguages(callback) {
		var langStats = []; // array of URL strings
		var langUrls = this.url.langs;

		// get URLs with language stats for each repository
		langUrls.forEach(function (apiURL) {
			var request = new XMLHttpRequest();
			request.addEventListener('load', calcResponse, false);
			request.open('GET', apiURL, true);
			request.send(null);
		});

		function calcResponse(loadEvent) {
			var response = loadEvent.target.responseText;
			var repoLangs = JSON.parse(response);
			langStats.push(repoLangs);

			if (langStats.length === langUrls.length) { // all requests were made
				var languagesRank = calcPopularity(langStats);
				callback(languagesRank);
			}
		}
	}

	function render(options, error) {
		var $root = this.$template;
		var repositories = this.repos;

		// clear root template element to prepare space for widget
		DOMOperator.clearChildren($root);

		if (error) {
			var $errorSection = DOMOperator.createError(error, username);
			$root.appendChild($errorSection);
	
			return;
		}

		// API doesn't return errors, try to built widget
		var $profile = DOMOperator.createProfile(this.profileData);

		this.getTopLanguages(function (langs) {
			$profile.appendChild(
				DOMOperator.createTopLanguages(langs)
			);
		});

		$root.appendChild($profile);

		if (options.maxRepos > 0) {
			var $reposHeader = DOMOperator.createReposHeader(options.reposHeaderText);
			var $reposList = DOMOperator.createReposList(repositories, options.sortBy, options.maxRepos);
			$reposList.insertBefore($reposHeader, $reposList.firstChild);

			$root.appendChild($reposList);
		}
	}

	function refresh(options) {
		options = autoComplete(options);
		this.render(options);
	}
})();