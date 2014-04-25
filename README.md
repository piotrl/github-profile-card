# Unofficial GitHub profile widget

This widget retrieves data about your GitHub profile and shows it up directly on your website. Always up to date.

- Live demo at [CodePen](http://codepen.io/piotrl/pen/cwbgJ)
- [@piotlr](http://twitter.com/piotlr)

## Download
- Production [js](https://raw.github.com/piotrl/github-profile-widget/master/dist/gh-profile-widget.js) / [css](https://raw.github.com/piotrl/github-profile-widget/master/dist/gh-profile-widget.css)
- [Source](https://github.com/piotrl/github-profile-widget)

## Usage

Include script just before end of the `<body>` tag:
```
	<script type="text/javascript" src="gh-profile-widget.js"></script>
```
`gh-profile-widget.js` and `gh-profile-widget.css` must be in one directory.

Include this HTML template wherever you want to show widget
```
	<div id="github-widget" data-username="YOUR_GITHUB_USERNAME"></div>
```
Where `YOUR_GITHUB_USERNAME` is your github account username.

There is no need for additional configuration.