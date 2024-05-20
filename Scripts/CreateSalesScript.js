function getXCsrfToken(){
    var metaTags = document.getElementsByTagName("meta");
  
    for(var i = 0; i < metaTags.length; i++) {
      var metaTag = metaTags[i];
      if (!metaTag) {
        continue;
      }
      var nameAttr = metaTag.getAttribute("name");
      if (nameAttr == 'csrf_nonce'){
        return metaTag.getAttribute("content");
      }
    }
}

function getShopId() {
  var scriptTags = document.getElementsByTagName('script');
  for(var i = 0; i < scriptTags.length; i++){
    var innerHTML = scriptTags[i].innerHTML;
    var shopIdStr = "\"shop_id\":";
    var indexOfShopId = innerHTML.indexOf(shopIdStr);
    if (indexOfShopId > -1){
      var subStrIdx = indexOfShopId + shopIdStr.length;
      var shop_id = innerHTML.substring(subStrIdx, innerHTML.indexOf(",", subStrIdx));
      return shop_id.trim();
    }
  }
}

// Handle messages from the extension

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === "getPageData") {
      var pageData = {
        xCsrfToken: getXCsrfToken(),
        shopId: getShopId()
      };
      sendResponse(pageData);
    }
    else if (request.type === "createSales") {
      handleCreateSalesRequest(request.createSalesRequest, 0);
    }
  }
);

function handleCreateSalesRequest(createSalesRequest, i){
  if (i < createSalesRequest.numberOfSales) {
    var secondsInADay = 24*60*60;
    var startDateSSinceEpoch = createSalesRequest.startDate;
    var saleStartDateSSinceEpoch = startDateSSinceEpoch + (i * createSalesRequest.daysPerSale)*secondsInADay;
    var saleEndDateSSinceEpoch = saleStartDateSSinceEpoch + (createSalesRequest.daysPerSale)*secondsInADay - 1;
    var promotionName = makeSaleName(saleStartDateSSinceEpoch) + "TO" + makeSaleName(saleEndDateSSinceEpoch);
    createSale(createSalesRequest.shopId, createSalesRequest.xCsrfToken, promotionName, saleStartDateSSinceEpoch, saleEndDateSSinceEpoch, createSalesRequest.percentDiscount);
  
    setTimeout(() => {
      handleCreateSalesRequest(createSalesRequest, i + 1);
    }, 500);
  }
}

function makeSaleName(secondSinceEpoch) {
  var saleEndDate = new Date(secondSinceEpoch*1000);
  var year = saleEndDate.getFullYear();
  var day = saleEndDate.getDate();
  var month = saleEndDate.getMonth() + 1;
  return year.toString() + (month > 9 ? month.toString() : "0" + month.toString()) + (day > 9 ? day.toString() : "0" + day.toString());
}

function createSale(shop_id, xCsrfToken, promotion_name, start_date, end_date, percent_discount) {
  var url = `https://www.etsy.com/api/v3/ajax/shop/${shop_id}/sales-coupons/create`;

  var salesBody = {
    "promotion_type": "percent_discount_on_entire_order",
    "discoverability_type": "sale",
    "venue_id": 1, // TODO?
    "start_date": start_date,
    "currency_code": "USD", // TODO?
    "promotion_name": promotion_name,
    "end_date": end_date,
    "reward_set_listing_ids": "",
    "condition_min_total_order_price": null, 
    "condition_min_num_order_items": null,
    "reward_fixed_discount_on_order": null, 
    "reward_percent_discount_on_order": percent_discount,
    "seller_description": "",
    "is_thank_you": false,
    "eligible_region_id": null, 
    "coupon_created_from": "seller-platform-mcnav",
    "is_share_and_save": true
  };

  var succeeded;
  var promotion_id;
  fetch(
    url,
    {
      method: 'post',
      body: JSON.stringify(salesBody),
      headers: new Headers({
          'Content-Type': 'application/json',
          'x-csrf-token': xCsrfToken
        }) 
    }
  ).then((response) => {
      succeeded = true;
      promotion_id = response.promotion.promotion_id;
    }
  ).catch((error) => {
      succeeded = false;
    }
  ).finally(() => {
    
    (async () => {
      await chrome.runtime.sendMessage({
        type: "saveSale",
        saveSaleRequest: {
          succeeded,
          percent_discount,
          start_date,
          end_date,
          promotion_name,
          promotion_id
        }
      });
    })();
  });
}