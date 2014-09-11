# Unofficial GitHub profile widget

This widget retrieves data about your GitHub profile and shows it up directly on your website. Always up to date.

- Live demo at [CodePen](http://codepen.io/piotrl/pen/cwbgJ)
- Send me feedback on twitter: [@piotlr](http://twitter.com/piotlr)

## Download
You need bower:
```
bower install github-profile-widget
```
You will find important files in `/dist/` directory.

## Usage

Include script and style inside of your `<head>` tag:
```
<script type="text/javascript" src="gh-profile-widget.js"></script>
<link rel="stylesheet" href="gh-profile-widget.js" />
```
We are almost done. You only need to configure your widget:

## Configuration
Example of use
```
var githubWidget = new GitHubWidget({
	template: '#github-widget',
	sortBy: 'stars',
	reposHeaderText: 'Most starred',
	maxRepos: 5
});
```

You need to reserve now some space for your widget
```
<div id="github-widget"></div>
```
You can also add attribute data-username with `YOUR_GITHUB_USERNAME`.

## Options   

Attribute  | Options                   | Default             | Description
---        | ---                       | ---                 | ---
`username` | *string*				   | `null`              | GitHub profile username
`template` | *string*                  | `#github-widget`    | DOM selector of your widget in HTML
`sortBy`   | `stars`, `updateTime`     | `updateTime`        | Repositories sorting method
`maxRepos` | *int*			           | `5`				 | Indicates amount of showed repositories. `0` Shows anything.
`reposHeaderText`     | *string*       | `Last updated repositories`| Text that is shown in labbel above repositories list                           
