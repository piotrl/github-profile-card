
// Generating new widget from user input
document.addEventListener('DOMContentLoaded', function() {
	var options = {
		sortBy: 'stars', // possible: 'stars', 'updateTime'
		reposHeaderText: 'Most starred',
		maxRepos: 5
	};
	var widget = new GitHubCard(options);

	// Sort repository acording to
	// radio inputs on website

	var $sortingRadios = document.querySelectorAll('.choose-repo-sorting label');

	// sort by update time
	$sortingRadios[0].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[1].classList.remove('active');

		options.sortBy = 'updateTime';
		options.reposHeaderText = element.target.textContent;

		widget.refresh(options);

	});

	// sort by starrgazers
	$sortingRadios[1].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[0].classList.remove('active');

		options.sortBy = 'stars';
		options.reposHeaderText = element.target.textContent;

		widget.refresh(options);
	});

	// Manipulating the number of repositories

	var $inputNumber = document.getElementById('gh-reposNum');

	$inputNumber.onchange = function() {
		options.maxRepos = $inputNumber.value;

		widget.refresh(options);
	};

	// Creating brand new widget instance
	// for user that we type in input

	var	$input = document.getElementById('gh-uname'),
		$submit = document.getElementById('gh-uname-submit');

	$submit.addEventListener('click', function (element) {
		widget = new GitHubCard({ userName: $input.value });

		element.preventDefault();
	});
 });