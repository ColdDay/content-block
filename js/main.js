(function() {
  var myRequestConfig = {
    articleUrl: 'https://web-api.juejin.im/query'
  }
  
  var rawOpen = XMLHttpRequest.prototype.open;
  function filterResponse (xhr, responseText) {  
    var resp = JSON.parse(responseText || "{}");
    if (xhr.myRequestType == 'article' && resp.data && resp.data.articleFeed) {
      const edges = resp.data.articleFeed.items.edges;
      const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
      const filterData = getFilter(edges, blockData, 'article');
      resp.data.articleFeed.items.edges = filterData
      return JSON.stringify(resp);
    } else {
      return responseText
    }
  }
  // 修改XMLHttpRequest open方法
  XMLHttpRequest.prototype.open = function() {
    var url = arguments[1];
    if (url.match(myRequestConfig.articleUrl)) {
      this.myRequestType = 'article'
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
        return filterResponse(xhr, ret)
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
  // 过滤返回数据，剔除屏蔽列表中的数据
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
  // 判断是否在屏蔽列表中
  function isContain(item, blockData, type) {
    let flag = false;
    for (let index = 0; index < blockData.length; index++) {
      const block = blockData[index];
      if (block.type == 'user') {
        // 屏蔽作者
        if (block.userId == item.node.user.id) {
          flag = true;
          break;
        }
      } else if (block.type == 'article') {
        // 屏蔽文章
        if (block.userId == item.node.user.id && block.postUrl == item.node.originalUrl) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }  
})()