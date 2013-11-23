'use strict';

console.log('popup.js loaded');

// TODO: standardise message sending
function onSettingClicked(e) {
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
        chrome.runtime.sendMessage({
            message: 'css',
            data: {
                key: key,
                value: value
            }
        });
        break;
    }

    // save setting in storage
    chrome.storage.sync.set({'dfFont': value});
}

window.onload = function() {
    // document.getElementById('apply-bg-color').addEventListener('click', onSettingClicked, false);
    // document.getElementById('apply-font-color').addEventListener('click', onSettingClicked, false);

    // add listeners to font links
    var fontLinks = document.querySelectorAll('.font-list li a');

    function setSelected(e) {
        // clear seletec
        for (var i = fontLinks.length - 1; i >= 0; i--) {
            fontLinks[i].className = '';
        }
        // set clicked as selected
        e.target.className = 'selected';
    }

    for (var i = fontLinks.length - 1; i >= 0; i--) {
        fontLinks[i].addEventListener('click', onSettingClicked, false);
        fontLinks[i].addEventListener('click', setSelected, false);
    }
};