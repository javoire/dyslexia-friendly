DyslexiaFriendly
================

#### [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/dyslexia-friendly/miepjgfkkommhllbbjaedffcpkncboeo)

Description
-----------

DyslexiaFriendly is a Google Chrome extension that increases readabilty of web pages by allowing you to switch to a dyslexia friendlier font and providing some extra tools to facilitate the reading.

Features
--------

You can change the font on all web sites to either Open Dyslexic or Comic Sans. The visual appearance of all web sites is also enhanced with odd/even background shading of paragraphs and a vertical ruler that follows the mouse cursor.

The features listed here are also implemented: http://antijingoist.github.io/web-accessibility/

Develop
-----

To use the extension in developer mode, navigate to

> chrome://extensions

in Google Chrome, enable "Developer mode", click "Load unpacked extension" and select the `src/` folder.

### Publish

After a PR is merged to master:

1. Update the version in `src/manifest.json`
1. Create a new git tag and the publish pipeline will be triggered.

### Design

CSS and UI elements are from https://tailwind-elements.com/

Roadmap
-------

Further customization of fonts and colors

Attributions
--------

This extension is based on resources and ideas from:

* http://antijingoist.github.io/web-accessibility/
* http://opendyslexic.org/
