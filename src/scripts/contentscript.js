'use strict';

$(document).ready(function(){

  // check config for what to enable etc

  //-------------------------------
  // Ruler that follows mouse vertically
  //-------------------------------
  $.get(chrome.extension.getURL('/ruler.html'), function(data) {
    $(data).appendTo('body');
  });
  $('body').mousemove(function(event) {
    $('#ruler').css('top', event.pageY - 30);
  });
});
