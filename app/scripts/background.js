'use strict';

console.log('background.js loaded');

// forward incoming msg from popup to content script
// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
chrome.extension.onMessage.addListener(function(message) {
    console.log('click event in popup received', message);
    return true;
});