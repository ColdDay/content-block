(function() {
  // 解析dom
  function parseDom(targetEle) {
    var parentEle = null;
    var id = new Date().getTime();
    var userId = '';
    var userName = '';
    var postUrl = '';
    var postName = '';

    if (location.href.match('im/post/')) {
      // 文章内容页面
      userId = document.querySelector('.author-info-box .username').href.split('user/')[1];
      userName = document.querySelector('.username').innerText;
      postUrl = location.href;
      postName = document.querySelector('.article-title').innerText.trim();
    } else if (location.href.match('im/timeline/')) {
      // 首页文章列表
      var parentEle = targetEle.closest('.item');
      if (!parentEle) return null;
      userId = parentEle.querySelector('.user-popover-box').getAttribute('st:state');
      userName = parentEle.querySelector('.user-popover-box a').innerText;
      postUrl = parentEle.querySelector('.title').href;
      postName = parentEle.querySelector('.title').innerText.trim();
    } else {
      return null;
    }
    window.currentBlockElement = parentEle;
    var data = {
      id,
      userId,
      userName,
      postUrl,
      postName
    }
    return data;
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
      // chrome插件限制，无法和浏览器共享js，所以这里通过localStorage传递数据
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
        var all = document.querySelectorAll('.entry-list>li.item');
        for (let index = 0; index < all.length; index++) {
          const element = all[index];
          var userEle = element.querySelector('.username a');
          if (userEle && userEle.href && userEle.href.match(window.currentBlockData.userId)) {
            element.remove()
          }
        }
      } else if (message.type === 'article') {
        // 屏蔽内容
        currentBlockElement.remove();
      }
    });
  });

  function delFilterDom(domList, block, blockType) {
    for (let index = 0; index < domList.length; index++) {
      const element = domList[index];
      var userId = element.querySelector('.user-popover-box').getAttribute('st:state');
      if (blockType == 'user' && userId == block.userId) {
        element.remove();
      }
      if (blockType == 'article') {
        var postLink = element.querySelector('.entry-link').href;
        if (postLink === block.postUrl) {
          element.remove();
        }
      }
    }
  }

  // 首次进入页面，删掉匹配内容
  function firstInit(blockData) {
    var domList = null;
    if (location.href.match('timeline')) {
      domList = document.querySelectorAll('.entry-list>li[data-growing-title]');
    } else {
      return
    }
    if (domList.length) {
      for (let index = 0; index < blockData.length; index++) {
        const block = blockData[index];
        if (block.type == 'user') {
          delFilterDom(domList, block, 'user')
        } else if (block.type == 'article') {
          delFilterDom(domList, block, 'article')
        }
      }
      window.scrollTo(0,window.scrollY + 1)
    } else {
      setTimeout(function() {
        firstInit(blockData)
      }, 100)
    }
  }
  initLocalData();
})()
