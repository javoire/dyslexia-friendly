// Körs när ikonen klickas i chrome
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('Turning ' + tab.url + ' red!');
chrome.tabs.executeScript( null, {code:"var x = 10; x"},
   function(results){ console.log(results);} );
});
function magic(){
document.body.style.backgroundColor="red";
}