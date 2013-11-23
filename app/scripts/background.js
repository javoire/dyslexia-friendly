'use strict';

console.log('background.js loaded');

chrome.runtime.onInstalled.addListener( function (details) {
    console.log('previousVersion', details.previousVersion);
});

// forward incoming msg from popup to content script
// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
chrome.extension.onMessage.addListener(function(message) {
    console.log('click event in popup received', message);

    switch(message.type) {
        case 'font-family':
            console.log('changing font family to', message.value);
            var css = '* { font-family: "'+message.value+'" !important; }';
            console.log('injecting css', css);
            chrome.tabs.insertCSS(css);
            break;
    }

    // chrome.tabs.getSelected(null, function(tab){
    //     var msg = {
    //         type: message.type,
    //         value: message.value
    //     };
    //     console.log('background.js sending message to content script', msg);
    //     chrome.tabs.sendMessage(tab.id, msg);
    // });

    return true;
});