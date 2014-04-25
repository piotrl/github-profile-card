#!/bin/sh

# No minification
sass --watch gh-profile-widget.scss:../gh-profile-widget.css --style expanded

#sass --watch gh-profile-widget.scss:../../dist/gh-profile-widget.min.css --style compressed

exit 0