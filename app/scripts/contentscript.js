'use strict';

console.log('[CONTENT SCRIPT] content script loaded');

$(document).ready(function(){
    console.log('[CONTENT SCRIPT] document loaded and jquery is with us!');
    
    //-------------------------------
    // Ruler that follows mouse vertically
    //-------------------------------
    $.get(chrome.extension.getURL('/ruler.html'), function(data) {
        console.log('ruler html', data);
        $(data).appendTo('body');
    });
    $('body').mousemove(function(event) {
        $("#ruler").css('top', event.pageY - 30);
        $("#ruler").css('width', $(window).innerWidth());
    });
});

// var all = document.getElementsByTagName('*');

// for (var i = all.length - 1; i >= 0; i--) {
    // all[i].style.backgroundColor = '#eee' // default bg color
    // all[i].style.color = '#000' // default bg color
    // all[i].style.border = 'none' // default
    // all[i].style.fontFamily = OpenDyslexicFontName; // default
// }

// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) { // JSHint gives error when params are unused
// chrome.extension.onMessage.addListener(function(message) {
//     console.log('content script received message', message);
    // var all = document.getElementsByTagName('*');
    // switch(message.type) {
    //     case 'font-family':
    //         console.log('changing font family to', message.value);
    //         chrome.tabs.getSelected(null, function(tab){
    //             chrome.tabs.insertCSS(tab.id, '* { font-family: "'+message.value+'" !important; }');
    //         });
    //         break;
    // case 'bg-color':
    //     console.log('changing bg color to', message.value);
    //     // for (var i = all.length - 1; i >= 0; i--) {
    //     //     if (all[i].nodeName !== 'P' || all[i].nodeName !== 'LI') {
    //     //         all[i].style.backgroundColor = message.value;
    //     //     }
    //     // }
    //     break;
    // case 'font-color':
    //     console.log('changing font color to', message.value);
    //     // for (var j = all.length - 1; j >= 0; j--) {
    //     //     all[j].style.color = message.value;
    //     // }
    //     // break;
    // case 'font-family':
    //     console.log('changing font family to', message.value);
    //     chrome.tabs.getSelected(null, function(tab){
    //         chrome.tabs.insertCSS(tab.id, '* { font-family: "'+message.value+'" !important; }');
    //     }
    //     break;
    // }
// });