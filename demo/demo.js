
// Generating new widget from user input
document.addEventListener('DOMContentLoaded', function() {
	var options = widget.defaultConfig;

	// Sort repository acording to
	// radio inputs on website

	var $sortingRadios = document.querySelectorAll('.choose-repo-sorting label');

	// sort by update time
	$sortingRadios[0].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[1].classList.remove('active');

		options.sortBy = 'updateTime';
		options.reposHeaderText = element.target.textContent;

		widget.render(options);

	});

	// sort by starrgazers
	$sortingRadios[1].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[0].classList.remove('active');

		options.sortBy = 'stars';
		options.reposHeaderText = element.target.textContent;

		widget.render(options);
	});

	// Manipulating the number of repositories

	var $inputNumber = document.getElementById('gh-reposNum');

	$inputNumber.onchange = function() {
		options.maxRepos = $inputNumber.value;

		widget.render(options);
	}

	// Creating brand new widget instance
	// for user that we type in input

	var	$input = document.getElementById('gh-uname'),
		$submit = document.getElementById('gh-uname-submit');

	$submit.addEventListener('click', function (element) {
		widget = new GitHubWidget({ userName: $input.value });

		element.preventDefault();
	});
 });

