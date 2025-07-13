# DyslexiaFriendly

#### [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/dyslexia-friendly/miepjgfkkommhllbbjaedffcpkncboeo)

## Description

DyslexiaFriendly is a Google Chrome extension that increases readabilty of web pages by allowing you to switch to a dyslexia friendlier font and providing some extra tools to facilitate the reading.

## Features

You can change the font on all websites to either Open Dyslexic or Comic Sans. The visual appearance of all web sites is also enhanced with odd/even background shading of paragraphs and a vertical ruler that follows the mouse cursor.

The features listed here are also implemented: http://antijingoist.github.io/web-accessibility/

## Develop

### Website

```shell
$ yarn start
```

### Extension Popup

Run the popup of the extension only. However, any messages to background or content scripts will not be sent (as those scripts don't exist in this mode). This devserver is useful for quicker tweaking and styling the popup.

```
$ yarn start-extension
```

### Full extension

Do once:

1. Run `yarn build`
1. Navigate to `chrome://extensions` in Chrome
1. Enable "Developer mode",
1. Click "Load unpacked extension" and select the `build/` folder

Do on changes to source files:

1. Run `yarn build`
1. Navigate to `chrome://extensions` in Chrome
1. Click the reload button on the extension card (circular arrow icon)

### Testing

```bash
yarn test # runs all tests
yarn test:integration # runs integration tests
yarn test:unit # runs unit tests
yarn verify # verify all
```

### Publish

The CI pipeline triggers publish on new git tags.

After a PR is merged to master:

1. Update the version number in `src/extension/manifest.json` on master
1. Create a new Release (and tag) for that version and the publish-pipeline will be triggered

Note: The publish-pipeline may fail if another version was recently published, since the past version will still be
stuck in the review process. The review process is usually ~1 day.

### Deploy

The website is deployed on all merges to master in CI.

### Design

CSS and UI elements are from https://tailwind-elements.com/

### Tips

To inspect the local storage object, go to `chrome://extensions` and click on the "background page" link for this extension and paste this in the console:

```ts
chrome.storage.sync.get(console.log);
```

## Roadmap

Further customization of fonts and colors

## Attributions

This extension is based on resources and ideas from:

- http://antijingoist.github.io/web-accessibility/
- http://opendyslexic.org/
