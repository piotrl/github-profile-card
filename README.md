# GitHub profile card

Widget shows your GitHub profile directly on your website!  
Show your current projects — always up to date.

![Screenshot](./docs/screenshot.png)

### Main features

- Top languages statistic
- Configurable list of repositories by most starred or last updated
- Amount of followers
- No jQuery and other libraries required


### Live [demo](http://codepen.io/piotrl/full/cwbgJ/)

## Download
With *bower* or just clone this repository.

```
bower install github-profile-card
```

With [*npm*](https://www.npmjs.com/package/github-profile-card)

```
npm install github-profile-card --save
```

Important files are in `/dist/` directory.

## Installation

Include script and style inside of your `<head>` tag:

```
<link rel="stylesheet" href="dist/gh-profile-card.min.css" />
<script type="text/javascript" src="dist/gh-profile-card.min.js"></script>
```

Include HTML code anywhere you would like to place widget: 

```
<div id="github-card"
     data-username="YOUR_GITHUB_USERNAME">
</div>
```

Great! Widget will autoload. We're done here.

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
    maxRepos: 5
});

widget.init();
```

## Configuration options   

HTML option       | JavaScript option | Type                 | Default        | Details
---               | ---               | ---                  | ---            | ---
`data-username`   | `username`        | *string*			 | `—`            | GitHub profile username
`—`               | `template`        | *string*             | `#github-card` | DOM selector of your widget in HTML
`data-sort-by`    | `sortBy`          | `stars`, `updateTime`| `stars`        | Repositories sorting method
`data-max-repos`  | `maxRepos`        | *int*			     | `5`			  | Amount of listed repositories. `0` disables section
`data-header-text`| `headerText`      | *string*             | `Most starred repositories` | Text label above repositories list                           

## [Changelog](https://github.com/piotrl/github-profile-card/releases)

I love feedback, send me one!

- on twitter: [@constjs](https://twitter.com/constjs) 
- create [new issue](https://github.com/piotrl/github-profile-card/issues/new)

Remember no other libraries required. It's like gluten free 😉

![gluten-free](http://forthebadge.com/images/badges/gluten-free.svg)
