
// Generating new widget from user input
document.addEventListener('DOMContentLoaded', function() {


	// Sort repository acording to
	// radio inputs on website

	var $sortingRadios = document.querySelectorAll('.choose-repo-sorting label');

	// sort by update time
	$sortingRadios[0].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[1].classList.remove('active');

		widget.render({ 
			sortBy: 'updateTime', 
			labelText: element.target.textContent  
		});

	});

	// sort by starrgazers
	$sortingRadios[1].addEventListener('click', function (element) {
		element.target.classList.add('active');
		$sortingRadios[0].classList.remove('active');

		widget.render({ 
			sortBy: 'stars',
			labelText: element.target.textContent 
		});
			
	});

	// Creating brand new widget instance
	// for user that we type in input

	var	$input = document.getElementById('gh-uname'),
		$submit = document.getElementById('gh-uname-submit');

	$submit.addEventListener('click', function (element) {
		widget = new GitHubWidget({ userName: $input.value });

		element.preventDefault();
	});
});

