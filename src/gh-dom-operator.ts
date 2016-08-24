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
        const $followers = followers(data.followers);
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

        function avatar(avatarUrl: string): HTMLImageElement {
            const $avatar = document.createElement('img');
            $avatar.src = avatarUrl;
            $avatar.className = 'avatar';

            return $avatar;
        }

        function followButton(username: string, followUrl: string): HTMLAnchorElement {
            const $followButton = document.createElement('a');
            $followButton.href = followUrl;
            $followButton.className = 'follow-button';
            $followButton.innerHTML = 'Follow @' + username;

            return $followButton;
        }

        function followers(followersAmount: number): HTMLSpanElement {
            const $followers = document.createElement('span');
            $followers.className = 'followers';
            $followers.innerHTML = followersAmount;

            return $followers;
        }

        function followContainer(children: HTMLElement[]): HTMLDivElement {
            const $followContainer = document.createElement('div');
            $followContainer.className = 'followMe';
            appendChildren(
                $followContainer,
                children
            );

            return $followContainer;
        }
    }

    public static createTopLanguages(langs): HTMLUListElement {
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
        for (let i = 0; i < 3 && topLangs[i]; i++) {
            $langsList.innerHTML += `<li> ${topLangs[i][0]} </li>`;
        }

        return $langsList;
    }

    public static createRepositoriesHeader(headerText): HTMLSpanElement {
        var $repositoriesHeader = document.createElement('span');
        $repositoriesHeader.className = 'header';
        $repositoriesHeader.appendChild(
            document.createTextNode(`${headerText} repositories`)
        );

        return $repositoriesHeader;
    }

    public static createRepositoriesList(repos: IApiRepository[], maxRepos: number): HTMLDivElement {
        var $reposList = document.createElement('div');
        $reposList.className = 'repos';
        for (var i = 0; i < maxRepos && repos[i]; i++) {
            const updated = new Date(repos[i].updated_at);
            const $repoLink = this.createRepositoryElement(repos[i], updated);

            $reposList.appendChild($repoLink);
        }

        return $reposList;
    }

    private static createRepositoryElement(repository: IApiRepository, updated: Date) {
        const $repoLink = document.createElement('a');

        $repoLink.href = repository.html_url;
        $repoLink.title = repository.description;
        $repoLink.innerHTML = `
                <span class="repo-name"> ${repository.name} </span>
                <span class="updated">Updated: ${updated.toLocaleDateString()} </span>
                <span class="star"> ${repository.stargazers_count} </span>
        `;
        return $repoLink;
    }
}