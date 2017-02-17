# GitHub Profile Card

Widget shows your GitHub profile directly on your website!  
Show your current projects — always up to date.

## Live [demo and configuration](http://github-profile.com/demo/)
![Screenshot](./demo/screenshot.png)

### Main features

- Top languages statistics
- Last updated repositories
- Configurable in HTML
- Copy-Paste installation
- No jQuery and any other libraries required

## Quick install

Include script and style inside of your `<head>` tag:

```
<link rel="stylesheet" href="http://github-profile.com/dist/gh-profile-card.min.css" />
<script type="text/javascript" src="http://github-profile.com/dist/gh-profile-card.min.js"></script>
```

Include HTML code anywhere you would like to place widget: 

```
<div id="github-card"
     data-username="YOUR_GITHUB_USERNAME">
</div>
```

Great! Widget will autoload. We're done here.

## Download

With *bower*

```
bower install github-profile-card
```

With [*npm*](https://www.npmjs.com/package/github-profile-card)

```
npm install github-profile-card --save
```

Main files are in `/dist/` directory.

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

HTML option (`data-` prefix)      | JavaScript option | Type                 | Default        | Details
---               | ---               | ---                  | ---            | ---
`username`   | `username`        | *string*			 | `—`            | GitHub profile username
`—`               | `template`        | *string*             | `#github-card` | DOM selector of your widget in HTML
`sort-by`    | `sortBy`          | `stars`, `updateTime`| `stars`        | Repositories sorting method
`max-repos`  | `maxRepos`        | *int*			     | `5`			  | Amount of listed repositories. `0` disables section
`header-text`| `headerText`      | *string*             | `Most starred repositories` | Text label above repositories list                           

## [Changelog](https://github.com/piotrl/github-profile-card/releases)

I love feedback, send me one!

- on twitter: [@constjs](https://twitter.com/constjs) 
- create [new issue](https://github.com/piotrl/github-profile-card/issues/new)

Remember no other libraries required. It's like gluten free 😉

![gluten-free](http://forthebadge.com/images/badges/gluten-free.svg)
