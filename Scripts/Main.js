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

function sendCreateSalesRequest(createSalesRequest){
  (async () => {
    const [tab] = await chrome.tabs.query({url: salesPageUrl});
    await chrome.tabs.sendMessage(tab.id, {type: "createSales", createSalesRequest});
  })();
}

function showHideControls() {
  var divGoToSalesDashboard = document.getElementById("divGoToSalesDashboard");
  var divCreateSales = document.getElementById("divCreateSales");
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (tab.url == salesPageUrl) {
      divCreateSales.style["display"] = "block"
      divGoToSalesDashboard.style["display"] = "none"
    }
    else
    {
      divCreateSales.style["display"] = "none"
      divGoToSalesDashboard.style["display"] = "block"
    }
  })();
}

function setUpDatePicker() {
  var startDatePicker = document.getElementById("startDatePicker");
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

function setUpExtensionView() {
  showHideControls();
  setUpDatePicker();
}

function handleBtnCreateSalesClick() {
  (async () => {
    const [tab] = await chrome.tabs.query({url: salesPageUrl});
    const response = await chrome.tabs.sendMessage(tab.id, {type: "getPageData"});
    
    shopId = response.shopId;
    xCsrfToken = response.xCsrfToken;
    buildAndSendCreateSalesRequest();
  })();
}

function handleBtnGoToDashboardClick() {
  (async () => {
    await chrome.tabs.create({url: salesPageUrl, active: true});
    showHideControls();
  })();
}

/// Set up listeners for content script data

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("received message", request);
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

document.getElementById("btnGoToDashboard").onclick = () => {
  handleBtnGoToDashboardClick();
}