# GitHub profile card

Widget shows your GitHub profile directly on your website!  
Show your current projects — always up to date.

![Screenshot](./demo/screenshot.png)

### Main features
- Top languages statistic
- Configurable list of repositories by most starred or last updated
- Amount of followers
- No jQuery and other libraries required


**Live demo on [CodePen](http://codepen.io/piotrl/full/cwbgJ/)**

---

## Download
With *bower* or just clone this repository.
```
bower install github-profile-card
```
You will find important files in `/dist/` directory.

## Installation

Include script and style inside of your `<head>` tag:
```
<script type="text/javascript" src="gh-profile-card.js"></script>
<link rel="stylesheet" href="gh-profile-card.css" />
```

Include HTML tag anywhere you would like to place widget: 
```
<div id="github-card"></div>
```
You can also add attribute data-username with `YOUR_GITHUB_USERNAME`.

```
<div id="github-card" data-username="YOUR_GITHUB_USERNAME"></div>
```

We are almost done. You only need to init your new widget:

## Configuration
Example of use
```
new GitHubCard({
	template: '#github-card',
	sortBy: 'stars',
	reposHeaderText: 'Most starred',
	maxRepos: 5
});
```

## Configuration options   

Attribute  | Options                   | Default             | Description
---        | ---                       | ---                 | ---
`username` | *string*				   | `—`                | GitHub profile username
`template` | *string*                  | `#github-card`    | DOM selector of your widget in HTML
`sortBy`   | `stars`, `updateTime`     | `stars`             | Repositories sorting method
`maxRepos` | *int*			           | `5`				 | Amount of showed repositories. `0` Shows anything.
`reposHeaderText`     | *string*       | `Most starred`      | Text label above repositories list                           

---

I love feedback, send me one!
- on twitter: [@constjs](https://twitter.com/constjs) 
- create [new issue](https://github.com/piotrl/github-profile-card/issues/new)

Remember no other libraries required. It's like gluten free ;)

![gluten-free](http://forthebadge.com/images/badges/gluten-free.svg)