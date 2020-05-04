// 解析文章
function parseArticleDom (parentEle) {
  var id = new Date().getTime();
  var userId = parentEle.querySelector('.user-popover-box').getAttribute('st:state');
  var userName = parentEle.querySelector('.user-popover-box a').innerText;
  var postUrl = parentEle.querySelector('.title').href;
  var postName = parentEle.querySelector('.title').innerText.trim();;
  var data = {
    id,
    userId,
    userName,
    postUrl,
    postName,
    contentType: 'article'
  }
  return data;
}
// 解析话题
function parseTopicDom (parentEle, topicType) {
  var id = new Date().getTime();
  var userId = parentEle.querySelector('.user-popover-box').getAttribute('st:state');
  var userName = parentEle.querySelector('.username').innerText;
  var postUrl = '';
  var postName = parentEle.querySelector('.content-box span').innerText.trim();
  var data = {
    id,
    userId,
    userName,
    postUrl,
    postName,
    contentType: topicType
  }
  return data;
}
// 解析dom
function parseDom(targetEle) {
  var parentEle = targetEle.closest('.item');
  var singleTopicParentEle = targetEle.closest('.pin__box');
  window.currentBlockElement = parentEle || singleTopicParentEle || null;
  console.log('parentEle', parentEle);
  if (parentEle ) {
    if (parentEle.querySelector('.pin') && parentEle.querySelector('.username')) {
      // this is topic
      return parseTopicDom(parentEle, 'topic')
    } else if (parentEle.querySelector('.entry-box') && parentEle.querySelector('.title')) {
      // this is article
      return parseArticleDom(parentEle)
    }
  } else if (singleTopicParentEle) {
    return parseTopicDom(targetEle.closest('.pin__box'), 'isSingleTopic')
  } else {
    return null
  }
  
}


document.onmousedown = function(e) {
  var e = e || window.event;
  const data = parseDom(e.target);
  window.currentBlockData = data;
}
function initLocalData(data) {
    // 获取数据
  chrome.storage.sync.get('blockData', function(e) {
    const data = e.blockData;
    if (data) {
      window.myBlockData = JSON.parse(data);
    } else {
      window.myBlockData = [];
    }
    console.log('获取成功！', data);
    localStorage.setItem('block-data', JSON.stringify(window.myBlockData));
    firstInit(window.myBlockData)
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  if (!window.currentBlockData) return
  window.currentBlockData.type = message.type;
  window.myBlockData.push(window.currentBlockData);
  var localDataStr = JSON.stringify(window.myBlockData);
  // 保存数据
  chrome.storage.sync.set({'blockData': localDataStr}, function() {
    initLocalData(localDataStr);
    if (message.type === 'user') {
      // 屏蔽用户
      if (window.currentBlockData.contentType === 'article') {
        // 首页数据
        var all = document.querySelectorAll('.entry-list>li.item');
        for (let index = 0; index < all.length; index++) {
          const element = all[index];
          var userEle = element.querySelector('.username a');
          if (userEle && userEle.href && userEle.href.match(window.currentBlockData.userId)) {
            element.remove()
          }
        }
      } else if (window.currentBlockData.contentType === 'topic') {
        
        var all = document.querySelectorAll('.pin-list-view>ul>li.item');
        for (let index = 0; index < all.length; index++) {
          const element = all[index];
          var userEle = element.querySelector('.username');
          if (userEle && userEle.href && userEle.href.match(window.currentBlockData.userId)) {
            element.remove()
          }
        }
      } else if (window.currentBlockData.contentType === 'isSingleTopic') {
        var all = document.querySelectorAll('.pin-content>.pin__box');
        for (let index = 0; index < all.length; index++) {
          const element = all[index];
          var userEle = element.querySelector('.username');
          if (userEle && userEle.href && userEle.href.match(window.currentBlockData.userId)) {
            element.remove()
          }
        }
      }
      
    } else if (message.type === 'article') {
      // 屏蔽内容
      currentBlockElement.remove();
    }
  });
});

function delFilterDom(domList, block, pageType, blockType) {
  for (let index = 0; index < domList.length; index++) {
    const element = domList[index];
    var userId = element.querySelector('.user-popover-box').getAttribute('st:state');
    if (blockType == 'user' && userId == block.userId) {
      element.remove();
    }
    if (blockType == 'article') {
      if (pageType === 'timeline' || pageType === 'about') {
        // 首页
        var postLink = element.querySelector('.entry-link').href;
        if (postLink === block.postUrl) {
          element.remove();
        }
      } else if (pageType === 'topic' || pageType === 'isSingleTopic') {
        var content = element.querySelector('.content-box span').innerText;
        const isMatch = block.postName.indexOf(content.trim().substr(0,10))!= -1
        if (isMatch) {
          element.remove();
        }
      }
    }
  }
}
function firstInit(blockData) {

  let pageType = 'timeline';
  var domList = null;
  if (location.href.match('timeline')) {
    pageType = 'timeline';
    domList = document.querySelectorAll('.entry-list>li[data-growing-title]');
  } else if (location.href.match('pins/topic')) {
    pageType = 'topic';
    domList = document.querySelectorAll('.pin-list-view .pin-list>.item');
  } else if (location.href.match('im/topic/')) {
    pageType = 'isSingleTopic';
    domList = document.querySelectorAll('.pin-content>.pin');
  } else if (location.href.match('im/post/')){
    pageType = 'about';
    domList = document.querySelectorAll('.recommended-entry-list>li[data-growing-title]');
  } else {
    return
  }
  if (domList.length) {
    for (let index = 0; index < blockData.length; index++) {
      const block = blockData[index];
      if (block.type == 'user') {
        delFilterDom(domList, block, pageType, 'user')
      } else if (block.type == 'article') {
        delFilterDom(domList, block, pageType, 'article')
      }
    }
    window.scrollTo(0,window.scrollY + 1)
  } else {
    setTimeout(function() {
      firstInit(blockData)
    }, 100)
  }
  
}

function getFilter(edges, blockData, type) {
  let newArr = [];
  for (let index = 0; index < edges.length; index++) {
    const element = edges[index];
    if (!isContain(element, blockData, type)) {
      newArr.push(element)
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
        const isMatch = block.postName.indexOf(item.content.trim().substr(0,10)) != -1
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
    }
    
  }
  return flag;
}

initLocalData();


