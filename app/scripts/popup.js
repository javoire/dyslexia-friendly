'use strict';

console.log('popup.js loaded');

// TODO: standardise message sending
function injectCss(e) {
    var type = e.target.getAttribute('data-type');
    var key = e.target.getAttribute('data-key');
    var value = e.target.getAttribute('data-value');

    if (key.match(/color/)) {
        value = '#' + e.target.parentNode.querySelectorAll('.color')[0].value; // get hex color from input
    } else if (key.match(/font/)) {
        value = '"' + value + '"';
    }

    switch(type) {
    case 'css':
        var css = '* { ' + key + ': ' + value + ' !important}';
        console.log('injecting css from popup.js', css);
        chrome.tabs.insertCSS({
            code: css
        });
        break;
    }
}

window.onload = function() {
    document.getElementById('apply-bg-color').addEventListener('click', injectCss, false);
    document.getElementById('apply-font-color').addEventListener('click', injectCss, false);

    // add listeners to font links
    var fontLinks = document.querySelectorAll('.font-list li a');
    for (var i = fontLinks.length - 1; i >= 0; i--) {
        fontLinks[i].addEventListener('click', injectCss, false);
    }
};