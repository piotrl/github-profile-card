class DOMOperator {
    public static clearChildren($parent: Node) {
        while ($parent.hasChildNodes()) {
            $parent.removeChild($parent.firstChild);
        }
    }

    public static createError(error: IApiError, username: string): HTMLDivElement {
        const $error = document.createElement('div');
        $error.className = 'error';
        $error.innerHTML = `<span>${error.message}</span>`;

        if (error.isWrongUser) {
            $error.innerHTML = `<span>Not found user: ${username}</span>`;
        }
        if (error.resetDate) {
            var remainingTime = error.resetDate.getMinutes() - new Date().getMinutes();
            remainingTime = (remainingTime < 0) ? 60 + remainingTime : remainingTime;

            $error.innerHTML += `<span class="remain">Come back after ${remainingTime} minutes</span>`;
        }

        return $error;
    }

    public static createProfile(data: IApiProfile): HTMLDivElement {
        const $followButton = followButton(data.login, data.html_url);
        let $followers = followers(data.followers_url, data.followers);
        const $followContainer = followContainer([$followButton, $followers]);

        const $avatar = avatar(data.avatar_url);
        const $name = name(data.html_url, data.name);

        return profile([$avatar, $name, $followContainer]);

        //////////////////

        function appendChildren($parent: HTMLElement, nodes: HTMLElement[]): void {
            nodes.forEach($parent.appendChild);
        }

        function profile(children: HTMLElement[]): HTMLDivElement {
            const $profile = document.createElement('div');
            $profile.classList.add('profile');
            appendChildren($profile, children);

            return $profile;
        }

        function name(profileUrl, name): HTMLAnchorElement {
            const $name = document.createElement('a');
            $name.href = profileUrl;
            $name.className = 'name';
            $name.appendChild(document.createTextNode(name));

            return $name;
        }

        function avatar(avatarUrl) {
            const $avatar = document.createElement('img');
            $avatar.src = avatarUrl;
            $avatar.className = 'avatar';

            return $avatar;
        }

        function followButton(username: string, followUrl: string) {
            const $followButton = document.createElement('a');
            $followButton.href = followUrl;
            $followButton.className = 'follow-button';
            $followButton.innerHTML = 'Follow @' + username;

            return $followButton;
        }

        function followers(followersUrl: string, followersAmount: number) {
            $followers = document.createElement('span');
            $followers.href = followersUrl;
            $followers.className = 'followers';
            $followers.innerHTML = followersAmount;

            return $followers;
        }

        function followContainer(children) {
            const $followContainer = document.createElement('div');
            $followContainer.className = 'followMe';
            appendChildren(
                $followContainer,
                children
            );

            return $followContainer;
        }
    }

    public static createTopLanguages(langs) {
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

    public static createReposHeader(headerText) {
        var $reposHeader = document.createElement('span');
        $reposHeader.className = 'header';
        $reposHeader.appendChild(
            document.createTextNode(headerText + ' repositories')
        );

        return $reposHeader;
    }

    public static createReposList(repos, sortyBy, maxRepos) {
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
}