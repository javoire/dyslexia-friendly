'use strict';

// console.log('popup.js loaded');

function onSettingClicked(e) {
  var type = e.target.getAttribute('data-type');
  var key = e.target.getAttribute('data-key');
  var value = e.target.getAttribute('data-value');

  if (key.match(/color/)) {
    value = '#' + e.target.parentNode.querySelectorAll('.color')[0].value; // get hex color from input
  } else if (key.match(/font/)) {
    chrome.storage.sync.set({'dfFont': value}); // save font setting in storage
    value = '"' + value + '"'; // font family needs to be in quotes
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

}

window.onload = function() {
  // document.getElementById('apply-bg-color').addEventListener('click', onSettingClicked, false);
  // document.getElementById('apply-font-color').addEventListener('click', onSettingClicked, false);

  var fontLinks = document.querySelectorAll('.font-list li a');

  // set selected based on whats saved in storage
  chrome.storage.sync.get('dfFont', function(data) {
    // console.log('got dfFont from storage', data);
    if (!data.dfFont) {
      // console.log('no font saved');
      return;
    }
    var userFont = data.dfFont;
    for (var i = fontLinks.length - 1; i >= 0; i--) {
      fontLinks[i].className = ''; // clear
      // console.log('if', fontLinks[i].getAttribute('data-value'), userFont);
      if (fontLinks[i].getAttribute('data-value') === userFont) {
        fontLinks[i].className = 'selected'; // set
      }
    }
  });

  function setSelected(e) {
    for (var i = fontLinks.length - 1; i >= 0; i--) { // clear selected
      fontLinks[i].className = '';
    }
    e.target.className = 'selected';
  }

  for (var i = fontLinks.length - 1; i >= 0; i--) {
    fontLinks[i].addEventListener('click', onSettingClicked, false);
    fontLinks[i].addEventListener('click', setSelected, false);
  }
};
