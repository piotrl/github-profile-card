(function(GitHubCard, widgetGenerator) {
    'use strict';

    // Generating new widget from user input
    document.addEventListener('DOMContentLoaded', () => {
        const options = {
            template: '#github-card-demo',
            sortBy: 'stars', // possible: 'stars', 'updateTime'
            headerText: 'Most starred repositories',
            maxRepos: 5
        };
        overrideOptionsByUrlParams(options);

        let widget = new GitHubCard(options);
        widget.init();
        refreshConfigTextarea(options);

        initSortingControl(options, refreshWidget);
        initRepositoriesControl(options, refreshWidget);
        initUserControl(options, initWidget);

        function initWidget(options) {
            widget = new GitHubCard(options);
            widget.init();
            refreshConfigTextarea(options);
        }

        function refreshWidget(updatedOptions) {
            widget.refresh(updatedOptions);
            refreshConfigTextarea(updatedOptions);
        }
    });

    function refreshConfigTextarea(updatedOptions) {
        const textarea = document.getElementById('install-code');
        textarea.value = widgetGenerator.regenerate(updatedOptions);
    }

    // Sort repository acording to
    // radio inputs on website
    function initSortingControl(options, refreshWidget) {
        var $sortingRadios = document.querySelectorAll(
            '.choose-repo-sorting label'
        );

        // sort by update time
        $sortingRadios[0].addEventListener('click', event => {
            event.target.classList.add('active');
            $sortingRadios[1].classList.remove('active');

            options.sortBy = 'updateTime';
            options.headerText = event.target.textContent + ' repositories';

            refreshWidget(options);
        });

        // sort by starrgazers
        $sortingRadios[1].addEventListener('click', event => {
            event.target.classList.add('active');
            $sortingRadios[0].classList.remove('active');

            options.sortBy = 'stars';
            options.headerText = event.target.textContent + ' repositories';

            refreshWidget(options);
        });
    }

    // Manipulating the number of repositories
    function initRepositoriesControl(options, refreshWidget) {
        const $inputNumber = document.getElementById('gh-reposNum');

        $inputNumber.onchange = () => {
            options.maxRepos = $inputNumber.value;
            refreshWidget(options);
        };
    }

    // Creating brand new widget instance
    // for user that we type in input
    function initUserControl(options, cb) {
        const $input = document.getElementById('gh-uname');
        const $submit = document.getElementById('gh-uname-submit');

        $submit.addEventListener('click', event => {
            options.username = $input.value;
            cb(options);

            event.preventDefault();
        });
    }

    function overrideOptionsByUrlParams(options) {
        const queryParameters = new URL(document.location).searchParams;
        for (const [key, value] of queryParameters) {
            options[key] = value;
        }
    }
})(window.GitHubCard, window.widgetGenerator);
