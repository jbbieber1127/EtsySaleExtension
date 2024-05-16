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


  console.log("x-csrf-token", getXCsrfToken());
  console.log("shop_id", getShopId());
