'use strict';

console.log('[CONTENT SCRIPT] content script loaded');

// load saved settings
// send message to background.js and tell it to inject font from storage
chrome.runtime.sendMessage({ message: 'init' } );

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
        $('#ruler').css('top', event.pageY - 30);
        $('#ruler').css('width', $(window).innerWidth());
    });
});