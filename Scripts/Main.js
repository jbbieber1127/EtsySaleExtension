const salesPageUrl = "https://www.etsy.com/your/shops/me/sales-discounts/step/createSale";

var uaidCookie;
var sessionKeyWwwCookie;
var xCsrfToken;
var shopId;

/// Set up helper functions

function getUaidCookie() {
  var cookieDetails = {name: "uaid", url: "https://www.etsy.com"};
  chrome.cookies.get(cookieDetails, function(cookie){
    uaidCookie = cookie;
  });
}

function getSessionKeyWwwCookie() {
  var cookieDetails = {name: "session-key-www", url: "https://www.etsy.com"};
  chrome.cookies.get(cookieDetails, function(cookie){
    sessionKeyWwwCookie = cookie;
  });
}

function buildAndSendCreateSalesRequest() {
  var createSalesRequest = buildCreateSalesRequest();
  sendCreateSalesRequest(createSalesRequest);
}

function buildCreateSalesRequest(){
  var startDatePicker = document.getElementById("startDatePicker");
  var startDate = startDatePicker.valueAsNumber / 1000 + (new Date()).getTimezoneOffset()*60;
  var nbrDaysPerSale = document.getElementById("nbrDaysPerSale");
  var daysPerSale = parseInt(nbrDaysPerSale.value);
  var nbrSales = document.getElementById("nbrSales");
  var numberOfSales = parseInt(nbrSales.value);
  var pctOff = document.getElementById("pctOff");
  var percentDiscount = parseInt(pctOff.value);
  return {
    shopId, xCsrfToken, percentDiscount, startDate, numberOfSales, daysPerSale
  }
}

function parseDateISOString(s) {
  let ds = s.split(/\D/).map(s => parseInt(s));
  ds[1] = ds[1] - 1; // adjust month
  return new Date(...ds);
}

function sendCreateSalesRequest(createSalesRequest){
  (async () => {
    const [tab] = await chrome.tabs.query({url: salesPageUrl});
    await chrome.tabs.sendMessage(tab.id, {type: "createSales", createSalesRequest});
  })();
}


function setUpExtensionView() {
  var startDatePicker = document.getElementById("startDatePicker");
  var divGoToSalesDashboard = document.getElementById("divGoToSalesDashboard");
  var divCreateSales = document.getElementById("divCreateSales");
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (tab.url == salesPageUrl) {
      divCreateSales.style["display"] = "block"
      divGoToSalesDashboard.style["display"] = "none"
      
      var today = new Date(new Date().toLocaleDateString());
      var todayDatePicker = today.toJSON().slice(0, 10);
      startDatePicker.min = todayDatePicker;

      var tomorrow = new Date(new Date().toLocaleDateString());
      tomorrow.setDate(tomorrow.getDate() + 1);
      var tomorrowDatePicker = tomorrow.toJSON().slice(0, 10);
      startDatePicker.value = tomorrowDatePicker;

      sixMonthsAhead = new Date(new Date().toLocaleDateString());
      sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);
      var sixMonthsAheadDatePicker = sixMonthsAhead.toJSON().slice(0, 10);
      startDatePicker.max = sixMonthsAheadDatePicker;
    }
    else
    {
      divCreateSales.style["display"] = "none"
      divGoToSalesDashboard.style["display"] = "block"
    }
  })();
  
}

function handleBtnCreateSalesClick() {
  (async () => {
    const [tab] = await chrome.tabs.query({url: salesPageUrl});
    const response = await chrome.tabs.sendMessage(tab.id, {type: "getPageData"});
    // do something with response here, not outside the function
    console.log("response", response);
    shopId = response.shopId;
    xCsrfToken = response.xCsrfToken;
    buildAndSendCreateSalesRequest();
  })();
}

/// Set up listeners for content script data



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("received message", request);
    // if (request.greeting === "hello")
    //   sendResponse({farewell: "goodbye"});
  }
);

/// When the page loads

setUpExtensionView();
getUaidCookie();
getSessionKeyWwwCookie();

/// Respond to form commands


document.getElementById("btnCreateSales").onclick = () => {
  handleBtnCreateSalesClick();
}