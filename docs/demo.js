(function (GitHubCard) {

	// Generating new widget from user input
    document.addEventListener('DOMContentLoaded', function() {
        var options = {
            template: '#github-card-demo',
            sortBy: 'stars', // possible: 'stars', 'updateTime'
            headerText: 'Most starred repositories',
            maxRepos: 5
        };

        var widget = new GitHubCard(options);
        widget.init();

        initSortingControl(options, refreshWidget);
        initRepositoriesControl(options, refreshWidget);
        initUserControl(options, initWidget);

        function initWidget(options) {
            widget = new GitHubCard(options);
            widget.init();
        }

        function refreshWidget(updatedOptions) {
            widget.refresh(updatedOptions);
        }
    });

    // Sort repository acording to
    // radio inputs on website
    function initSortingControl(options, refreshWidget) {
        var $sortingRadios = document.querySelectorAll('.choose-repo-sorting label');

        // sort by update time
        $sortingRadios[0].addEventListener('click', function (element) {
            element.target.classList.add('active');
            $sortingRadios[1].classList.remove('active');

            options.sortBy = 'updateTime';
            options.reposHeaderText = element.target.textContent;

            refreshWidget(options);
        });

        // sort by starrgazers
        $sortingRadios[1].addEventListener('click', function (element) {
            element.target.classList.add('active');
            $sortingRadios[0].classList.remove('active');

            options.sortBy = 'stars';
            options.reposHeaderText = element.target.textContent;

            refreshWidget(options);
        });
    }

    // Manipulating the number of repositories
    function initRepositoriesControl(options, refreshWidget) {
        var $inputNumber = document.getElementById('gh-reposNum');

        $inputNumber.onchange = function() {
            options.maxRepos = $inputNumber.value;

            refreshWidget(options);
        };
    }

    // Creating brand new widget instance
    // for user that we type in input
    function initUserControl(options, fn) {
        var	$input = document.getElementById('gh-uname'),
            $submit = document.getElementById('gh-uname-submit');

        $submit.addEventListener('click', function (element) {
            options.username = $input.value;
            fn(options);

            element.preventDefault();
        });
    }
})(window.GitHubCard);