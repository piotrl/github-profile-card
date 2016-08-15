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