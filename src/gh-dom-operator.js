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