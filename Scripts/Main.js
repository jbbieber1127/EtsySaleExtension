function getUaidCookie() {
var cookieDetails = {name: "uaid", url: "https://www.etsy.com"};
chrome.cookies.get(cookieDetails, function(cookie){
  console.log(cookie);
  return cookie;
});
}

function getSessionKeyWwwCookie() {
var cookieDetails = {name: "session-key-www", url: "https://www.etsy.com"};
chrome.cookies.get(cookieDetails, function(cookie){
  console.log(cookie);
  return cookie;
});
}

console.log("x-csrf-token", getUaidCookie());
console.log("x-csrf-token", getSessionKeyWwwCookie());
