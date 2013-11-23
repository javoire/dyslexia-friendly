'use strict';

console.log('popup.js loaded');

// TODO: standardise message sending
function sendFontMessage(e) {
    console.log('font selected', e.target);
    var msg = {
        type: e.target.getAttribute('data-type'),
        value: e.target.getAttribute('data-value')
    };
    console.log('sending font message from popup', msg);
    chrome.extension.sendMessage(msg);
}

// TODO: repetetive code, fix
function sendColorMessage(e) {
    console.log('color selected', e.target.parentNode.querySelectorAll('.color')[0].value);
    var msg = {
        type: e.target.getAttribute('data-type'),
        value: '#' + e.target.parentNode.querySelectorAll('.color')[0].value
    };
    console.log('sending message from popup', msg);
    chrome.extension.sendMessage(msg);
}

window.onload = function() {
    document.getElementById('apply-bg-color').addEventListener('click', sendColorMessage, false);
    document.getElementById('apply-font-color').addEventListener('click', sendColorMessage, false);

    var fontLinks = document.querySelectorAll('.font-list li a');

    for (var i = fontLinks.length - 1; i >= 0; i--) {
        fontLinks[i].addEventListener('click', sendFontMessage, false);
    }
};