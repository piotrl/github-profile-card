var GitHubWidget = (function() {
	'use strict';

	var GitHubWidget = function (options) {
		var template = 'github-widget';
		var defaultConfig = {
			sortBy: 'stars', // possible: 'stars', 'updateTime'
			reposHeaderText: 'Most starred',
			maxRepos: 5
		};

		options = options || defaultConfig;

		for(var key in defaultConfig) {
			options[key] = options[key] || defaultConfig[key];
		}

		this.$template = document.getElementById(template);
		this.user = options.userName || this.$template.dataset.username;

		this.url = {
			api: 'https://api.github.com/users/' + this.user,
			langs: []
		};

		this.error = null;
		this.data = null;

		this.profile = {};
		this.repos = {};
		this.langs = {};

		// load resources and render widget
		this.init(options);
	};

	GitHubWidget.prototype.init = function(options) {
		var apiLoader = new GitHubApiLoader(this.user);
		var self = this;
		apiLoader.getData(function(errors, result) {
			self.data = apiLoader.getProfile();
			self.errors = errors;
			self.url = apiLoader.getURLs();
			self.render(options, apiLoader.getRepos());
		});
		
		this.loadCSS();
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

	GitHubWidget.prototype.render = function (options, repos) {
		options = options || this.defaultConfig;

		var $root = this.$template;

		// clear root template element to prepare space for widget
		while($root.hasChildNodes()) {
			$root.removeChild($root.firstChild);
		}

		// handle API errors
		if (this.error) {
			var $error = document.createElement('div');
			$error.className = 'error';

			$error.innerHTML = '<span>' + this.error.message + '</span>';

			if (this.error.isWrongUser) {
				$error.innerHTML = '<span>Not found user: ' + this.user + '</span>';
			}

			if (this.error.resetDate) {
				var remainingTime = this.error.resetDate.getMinutes() - new Date().getMinutes();
				remainingTime = (remainingTime < 0) ? 60 + remainingTime : remainingTime;

				$error.innerHTML += '<span class="remain">Come back after ' + remainingTime + ' minutes</span>';
			}

			$root.appendChild($error);

			return false;
		}

		// API doesen't return errors, try to built widget
		var $profile = this.render.profile.bind(this)();

		this.getTopLanguages((function (langs) {
			var $langs = this.render.langs(langs);
			$profile.appendChild($langs);
		}).bind(this));

		$root.appendChild($profile);

		if (options.maxRepos > 0) {
			var $repos = this.render.repos.bind(this)(repos, options.sortBy, options.maxRepos),
				$reposHeader = document.createElement('span');
			$reposHeader.className = 'header';
			$reposHeader.appendChild(document.createTextNode(options.reposHeaderText + ' repositories'));

			$repos.insertBefore($reposHeader, $repos.firstChild);
			$root.appendChild($repos);
		}
	};

	GitHubWidget.prototype.render.repos = function (repos, sortyBy, maxRepos) {
		var $reposList = document.createElement('div');

		repos.sort(function (a, b) {
			// sorted by last commit
			if (sortyBy == 'stars') {
				return b.stargazers_count - a.stargazers_count;
			} else {
				return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
			}
		});

		for (var i = 0; i < maxRepos && repos[i]; i++) {
			var updated = new Date(repos[i].updated_at);
			var $repoLink = document.createElement('a');

			$repoLink.href = repos[i].html_url;
			$repoLink.title = repos[i].description;
			$repoLink.innerHTML += '<span class="repo-name">' + repos[i].name + '</span>';
			$repoLink.innerHTML += '<span class="updated">Updated: ' + updated.toLocaleDateString() + '</span>';
			$repoLink.innerHTML += '<span class="star">' + repos[i].stargazers_count + '</span>';

			$reposList.appendChild($repoLink);
		}

		$reposList.className = 'repos';
		return $reposList;
	};

	GitHubWidget.prototype.render.profile = function () {
		var $profile = document.createElement('div'),
			$name   = document.createElement('a'),
			$avatar = document.createElement('img'),
			$stats  = document.createElement('div'),
			$followContainer = document.createElement('div'),
			$followButton = document.createElement('a'),
			$followers = document.createElement('span');

		$name.href = this.data.html_url;
		$name.className = 'name';
		$name.appendChild(document.createTextNode(this.data.name));
		
		$avatar.src = this.data.avatar_url;
		$avatar.className = 'avatar';

		$followButton.href = $name.href;
		$followButton.className = 'follow-button';
		$followButton.innerHTML = 'Follow @' + this.user;

		$followers.href = this.data.followers_url;
		$followers.className = 'followers';
		$followers.innerHTML = this.data.followers;

		$followContainer.className = 'followMe';
		$followContainer.appendChild($followButton);
		$followContainer.appendChild($followers);

		$profile.appendChild($avatar);
		$profile.appendChild($name);
		$profile.appendChild($followContainer);
		$profile.appendChild($stats);
		$profile.classList.add('profile');

		return $profile;
	};

	GitHubWidget.prototype.render.langs = function (langs) {

		var $langsList = document.createElement('ul');

		var topLangs = [];
		for (var k in langs) {
			topLangs.push([k, langs[k]]);
		}

		topLangs.sort(function (a, b) {
			return b[1] - a[1];
		});

		// generating HTML structure
		for (var i = 0; i < 3 && topLangs[i]; i++) {
			$langsList.innerHTML += '<li>' + topLangs[i][0] + '</li>';
		}

		$langsList.className = 'languages';
		return $langsList;
	};

	GitHubWidget.prototype.loadCSS = function() {
		this.$template.className = 'gh-profile-widget';
	};

	return GitHubWidget;
})();