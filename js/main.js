(function() {
  var myRequestConfig = {
    articleUrl: 'https://web-api.juejin.im/query',
    topicUrl: 'https://short-msg-ms.juejin.im/v1/pinList/topic',
    aboutUrl: 'https://post-storage-api-ms.juejin.im/v1/getRecommendEntryByTagIds',
    switch: true
  }
  
  var rawOpen = XMLHttpRequest.prototype.open;
  const handleResponse = (xhr, responseText) => {  
    var resp = JSON.parse(responseText || "{}");
    console.log(resp)
    if (xhr.myRequestType == 'article' && resp.data.articleFeed) {
        const edges = resp.data.articleFeed.items.edges;
        const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
        const filterData = getFilter(edges, blockData, 'article');
        resp.data.articleFeed.items.edges = filterData
      return JSON.stringify(resp);
    }
  
    if (xhr.myRequestType == 'topic' && resp.d.list) {
      const curList = resp.d.list;
      const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
      const filterData = getFilter(curList, blockData, 'topic');
      resp.d.list = filterData
      return JSON.stringify(resp);
    }
  
    if (xhr.myRequestType == 'about' && resp.d.entrylist) {
      const curList = resp.d.entrylist;
      const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
      const filterData = getFilter(curList, blockData, 'about');
      resp.d.entrylist = filterData
      return JSON.stringify(resp);
    }
  }
  XMLHttpRequest.prototype.open = function() {
    var url = arguments[1];
    if (url === myRequestConfig.articleUrl) {
      this.myRequestType = 'article'
    } else if (url.match(myRequestConfig.topicUrl)) {
      this.myRequestType = 'topic'
    } else if (url.match(myRequestConfig.aboutUrl)) {
      this.myRequestType = 'about'
    } else {
      this.myRequestType = ''
    }
    if (!this._hooked) {
      this._hooked = true;
      setupHook(this);
    }
    rawOpen.apply(this, arguments);
  }
  
  function setupHook(xhr) {
    function getter() {
      delete xhr.responseText;
      var ret = xhr.responseText;
      setup();
      if (xhr.myRequestType) {
        return handleResponse(xhr, ret)
      } else {
        return ret
      }
    }
    function setup() {
      Object.defineProperty(xhr, 'responseText', {
        get: getter,
        configurable: true
      });
    }
    setup();
  }
  
  function getFilter(edges, blockData, type) {
    let newArr = [];
    var blockedArr = [];
    for (let index = 0; index < edges.length; index++) {
      const element = edges[index];
      if (!isContain(element, blockData, type)) {
        newArr.push(element)
      } else {
        blockedArr.push(element)
      }
    }
    return newArr;
  }
  function isContain(item, blockData, type) {
    let flag = false;
    for (let index = 0; index < blockData.length; index++) {
      const block = blockData[index];
      if (type == 'topic') {
        if (block.type == 'user') {
          if (block.userId == item.uid) {
            flag = true;
            break;
          }
        } else if (block.type == 'article') {
          const isMatch = block.postName.match(item.content.trim().substr(0,10))
          if (block.userId == item.uid && isMatch) {
            flag = true;
            break;
          }
        }
      } else if (type == 'article') {
        if (block.type == 'user') {
          if (block.userId == item.node.user.id) {
            flag = true;
            break;
          }
        } else if (block.type == 'article') {
          if (block.userId == item.node.user.id && block.postUrl == item.node.originalUrl) {
            flag = true;
            break;
          }
        }
      } else if (type == 'about') {
        if (block.type == 'user') {
          if (block.userId == item.user.objectId) {
            flag = true;
            break;
          }
        } else if (block.type == 'article') {
          if (block.userId == item.user.objectId && block.postUrl == item.originalUrl) {
            flag = true;
            break;
          }
        }
      }
      
    }
    return flag;
  }  
})()

