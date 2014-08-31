var GitHubWidget = (function() {
	'use strict';
	
	var username;
	
	var completeOptions = function (options) {
		var defaultConfig = {
			template: '#github-widget',
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

	var GitHubWidget = function (options) {
		options = completeOptions(options);
		username = options.userName || this.$template.dataset.username;
		
		this.$template = document.querySelector(options.template);
		this.profileData = null;
		this.repos = {};

		// load resources and render widget
		this.init(options);
	};

	GitHubWidget.prototype.init = function(options) {
		var apiLoader = new GitHubApiLoader(username);
		var self = this;
		apiLoader.getData(function(err, result) {
			self.profileData = apiLoader.getProfile();
			self.repos = apiLoader.getRepos();
			self.url = apiLoader.getURLs();
			self.render(options, self.repos, err);
		});
		this.$template.className = 'gh-profile-widget';
	};

	var createErrorSection = function (error) {
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
	};

	GitHubWidget.prototype.getTopLanguages = function (callback) {
		var langStats = []; // array of URL strings
		// get URLs with language stats for each repository
		this.url.langs.forEach(function (apiURL) {
			var context = this,
				request = new XMLHttpRequest();

			request.addEventListener('load', function () {

				var repoLangs = JSON.parse(request.responseText);
				langStats.push(repoLangs);

				if (langStats.length === context.url.langs.length) { // all requests were made
					calcPopularity(context.langs, callback);
				}

			}, false);

			request.open('GET', apiURL, true);
			request.send(null);
		}, this);

		// give rank (weights) to the language
		var calcPopularity = function (langs, callback) {
			langStats.forEach(function(repoLangs) {
				var k, sum = 0;

				for (k in repoLangs) {
					if (repoLangs[k] !== undefined) {
						sum += repoLangs[k];
						langs[k] = langs[k] || 0;
					}
				}

				for (k in repoLangs) {
					if (repoLangs[k] !== undefined) {
						langs[k] += repoLangs[k] / (sum * 1.00); // force floats
					}
				}
			}, this);
			callback(langs);
		};
	};

	GitHubWidget.prototype.render = function (options, repos, error) {
		options = options || this.defaultConfig;

		var $root = this.$template;

		// clear root template element to prepare space for widget
		while($root.hasChildNodes()) {
			$root.removeChild($root.firstChild);
		}

		// handle API errors
		if (error) {
			$root.appendChild(
				createErrorSection(error)
			);
	
			return false;
		}

		// API doesen't return errors, try to built widget
		var $profile = createProfileSection(this.profileData);

		this.getTopLanguages(function (langs) {
			$profile.appendChild(
				createTopLangsSection(langs)
			);
		});

		$root.appendChild($profile);

		if (options.maxRepos > 0) {
			var $reposHeader = document.createElement('span');
			$reposHeader.className = 'header';
			$reposHeader.appendChild(document.createTextNode(options.reposHeaderText + ' repositories'));

			$root.appendChild(
				createReposSection(repos, $reposHeader, options.sortBy, options.maxRepos)
			);
		}
	};

	function createReposSection (repos, $header, sortyBy, maxRepos) {
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

		$reposList.insertBefore($header, $reposList.firstChild);
		return $reposList;
	}

	function createProfileSection (data) {	
		var $name = document.createElement('a');
		$name.href = data.html_url;
		$name.className = 'name';
		$name.appendChild(document.createTextNode(data.name));
		
		var $avatar = document.createElement('img');
		$avatar.src = data.avatar_url;
		$avatar.className = 'avatar';

		var $followButton = document.createElement('a');
		$followButton.href = $name.href;
		$followButton.className = 'follow-button';
		$followButton.innerHTML = 'Follow @' + username;

		var $followers = document.createElement('span');
		$followers.href = data.followers_url;
		$followers.className = 'followers';
		$followers.innerHTML = data.followers;

		var $followContainer = document.createElement('div');
		$followContainer.className = 'followMe';
		$followContainer.appendChild($followButton);
		$followContainer.appendChild($followers);

		var $profile = document.createElement('div');
		var $stats  = document.createElement('div');
		$profile.appendChild($avatar);
		$profile.appendChild($name);
		$profile.appendChild($followContainer);
		$profile.appendChild($stats);
		$profile.classList.add('profile');

		return $profile;
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

	GitHubWidget.prototype.refresh = function (options) {
		this.render(options, this.repos);
	};

	return GitHubWidget;
})();