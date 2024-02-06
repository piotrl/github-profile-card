# GitHub Profile Card

> Widget shows your GitHub profile directly on your website.  
> Show your current projects — always up to date.

![Screenshot](./demo/screenshot.png)

## Live [demo and configuration](https://piotrl.github.com/github-profile-card/demo?username=piotrl)

## Contents

- [GitHub Profile Card](#github-profile-card)
  - [Main features](#main-features)
  - [Live demo and configuration](#live-demo-and-configuration)
  - [Changelog](#changelog)
- [Quick install](#quick-install)
  - [Download](#download)
  - [Advanced configuration](#advanced-configuration)
  - [Configuration options](#configuration-options)
- [FAQ](#faq)
- [Feedback](#feedback)

### Main features

- Top languages statistics
- Last updated repositories
- Configurable in HTML
- Copy-Paste installation
- No jQuery and any other libraries required

### [Changelog](https://github.com/piotrl/github-profile-card/releases)

## Quick install

Include script and style just before `</body>` tag:

```
<script type="text/javascript" src="https://piotrl.github.com/github-profile-card/dist/gh-profile-card.min.js"></script>
```

Include HTML code anywhere you would like to place widget:

```
<div id="github-card"
     data-username="YOUR_GITHUB_USERNAME">
</div>
```

Great! Widget will autoload. We're done here.

## Download

With [_npm_](https://www.npmjs.com/package/github-profile-card)

```
npm install github-profile-card --save
```

## Advanced configuration

Configure widget in HTML:

```
<div id="github-card"
     data-username="YOUR_GITHUB_USERNAME"
     data-max-repos="3"
     data-sort-by="stars"
     data-header-text="Most starred repositories">
</div>
```

For special usages, it is possible to configure widget(s) in JavaScript.
You have to use different template than `#github-card`.

```
var widget = new GitHubCard({
    username: 'YOUR_GITHUB_USERNAME'
    template: '#github-card-demo',
    sortBy: 'stars',
    reposHeaderText: 'Most starred',
    maxRepos: 5,
    hideTopLanguages: false,
});

widget.init();
```

## Configuration options

| HTML option (`data-` prefix) | JavaScript option  | Default                     | Details                                                                                                                          |
| ---------------------------- | ------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `username`                   | `username`         | None                        | GitHub profile username                                                                                                          |
| `—`                          | `template`         | `#github-card`              | DOM selector of your widget in HTML                                                                                              |
| `sort-by`                    | `sortBy`           | `stars`                     | Repositories sorting method (`stars` or `updateTime`)                                                                            |
| `max-repos`                  | `maxRepos`         | `5`                         | Amount of listed repositories. `0` disables section                                                                              |
| `header-text`                | `headerText`       | `Most starred repositories` | Text label above repositories list                                                                                               |
| `hide-top-languages`         | `hideTopLanguages` | `false`                     | Avoids heavy network traffic for calculating `Top Languages` section. Recommended for profiles with huge amount of repositories. |

## FAQ

- **My language statistic is affected by libraries and dependencies**

  Consider ignoring them with .gitattributes: [My repository is detected as the wrong language](https://github.com/github/linguist#overrides)

- **How language statistic is build?**

  It is sum of all characters written in language you use.
  One big repository in `C#` will be ranked higher than many small `JavaScript` repositories.

  It is based on 10 last updated repositories, to represent your current interests.

- **How to show two or more profiles on page?**

  You have to create two widgets with different ID, then initialize each manually in JS.

  e.g.

  ```
  <div id="github-card-1" data-username="user1"></div>
  <div id="github-card-2" data-username="user2"></div>

  <script>
      new GitHubCard({ template: '#github-card-1' }).init();
      new GitHubCard({ template: '#github-card-2' }).init();
  </script>
  ```

## Feedback

I love feedback, send me one!

- show me website on which you're using this widget: [leave comment](https://github.com/piotrl/github-profile-card/issues/15)
- ping me on twitter: [@constjs](https://twitter.com/constjs)
- create [new issue](https://github.com/piotrl/github-profile-card/issues/new)

Remember no other libraries required. It's like gluten free 😉

![gluten-free](http://forthebadge.com/images/badges/gluten-free.svg)
