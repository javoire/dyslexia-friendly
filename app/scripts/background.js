'use strict';

console.log('background.js loaded');

function injectCss(key, value) {
    var css = '* { ' + key + ': ' + value + ' !important}';
    console.log('injecting css', css);
    chrome.tabs.insertCSS({
        code: css
    });
}

// TODO: this is ugly
chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.message === 'init') {
            console.log('received init message', request.message);
            chrome.storage.sync.get('dfFont', function(data) {
                console.log('data from storage: ', data);
                if (!data.dfFont) {
                    return;
                }

                injectCss('font-family', data.dfFont);
            });
            return;
        }

        if (request.message === 'css') {
            console.log('received css message', request.data);
            injectCss(request.data.key, request.data.value);
        }
    }
);