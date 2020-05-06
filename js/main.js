
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
let myRequest = {
  config: {
    articleUrl: 'https://web-api.juejin.im/query',
    topicUrl: 'https://short-msg-ms.juejin.im/v1/pinList/topic',
    aboutUrl: 'https://post-storage-api-ms.juejin.im/v1/getRecommendEntryByTagIds',
    switch: true
  },
  originalXHR: window.XMLHttpRequest,
  myXHR: function() {
    const handleResponse = () => {  
      
      var resp = JSON.parse(this.responseText || "{}");
      console.log(resp)
      if (this.responseURL.match(myRequest.config.articleUrl) && resp && resp.data && resp.data.articleFeed) {
        const edges = resp.data.articleFeed.items.edges;
        const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
        const filterData = getFilter(edges, blockData, 'article');
        resp.data.articleFeed.items.edges = filterData
        this.responseText = JSON.stringify(resp);
      }

      if (this.responseURL.match(myRequest.config.topicUrl) && resp && resp.d && resp.d.list) {
        const curList = resp.d.list;
        const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
        const filterData = getFilter(curList, blockData, 'topic');
        resp.d.list = filterData
        this.responseText = JSON.stringify(resp);
      }

      if (this.responseURL.match(myRequest.config.aboutUrl) && resp && resp.d && resp.d.entrylist) {
        const curList = resp.d.entrylist;
        const blockData = JSON.parse(localStorage.getItem('block-data') || "[]")
        const filterData = getFilter(curList, blockData, 'about');
        resp.d.entrylist = filterData
        this.responseText = JSON.stringify(resp);
      }
    }
    const xhr = new myRequest.originalXHR;

    
    for (let attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            handleResponse();
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        continue;
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {
          if (myRequest.config.switch) {
            handleResponse();
            setTimeout(function() {
              window.scrollTo(0,window.scrollY + 1)
            }, 100)
          }
          this.onload && this.onload.apply(this, args);
        }
        continue;
      }
  
      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        if (attr === 'responseText' || attr === 'response') {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          });
        }
      }
    }
  }
}


initXml();
function initXml() {
  if (location.href.match('editor')) {
    window.XMLHttpRequest = myRequest.originalXHR;
    
  } else {
    window.XMLHttpRequest = myRequest.myXHR;
  }
  
}
