var userTab = document.querySelector('#userTab');
var articleTab = document.querySelector('#articleTab');

var userTabContent = document.querySelector('.user-list');
var articleTabContent = document.querySelector('.article-list');

var blockList = [];

userTab.addEventListener('click', function() {
    userTab.className = 'tab-item tab-user active';
    articleTab.className = 'tab-item tab-article';

    articleTabContent.className =  'content article-list';
    userTabContent.className =  'content user-list active';
})

articleTab.addEventListener('click', function() {
    userTab.className = 'tab-item tab-user';
    articleTab.className = 'tab-item tab-article active';

    articleTabContent.className =  'content article-list active';
    userTabContent.className =  'content user-list';
})
function eventInit() {
    var parent = document.querySelector(".main");
    parent.onclick = function(e){
        var newList = [];
        if(e.target.tagName.toLocaleLowerCase() === "span"){
            var type = e.target.getAttribute('type');
            var id = e.target.getAttribute('id');
            console.log("您点击了child元素", id);
            blockList.map((item) => {
                if (item.id != id) {
                    newList.push(item)
                }
            })
            chrome.storage.sync.set({'blockData': JSON.stringify(newList)}, function() {
                init()
            });
        }
    }   
}

eventInit();
function init() {
    // 获取数据
    chrome.storage.sync.get('blockData', function(e) {
        blockList = JSON.parse(e.blockData || "[]");
        var userStr = '';
        var articleStr = '';
        var userIndex = 0;
        var articleIndex = 0;
        for (let index = 0; index < blockList.length; index++) {
            const item = blockList[index];
            if (item.type === 'user') {
                userIndex = userIndex + 1;
                userStr += `
                    <li class="block-item user-block-item">
                        <span class="index">${userIndex}</span><a href="https://juejin.im/user/${item.userId}"
                            title="${item.userName}"
                            target="_blank"
                            class="block-item-link">${item.userName}</a>
                        <span class="del del-user-block" id="${item.id}">删除</span>
                    </li>
                `
            } else {
                articleIndex = articleIndex + 1;
                articleStr += `
                    <li class="block-item user-block-item">
                    <span class="index">${articleIndex}</span><a href="${item.postUrl}" 
                            title="${item.postName}"
                            target="_blank"
                            class="block-item-link">${item.postName}</a>
                        <span class="del del-article-block" id="${item.id}">删除</span>
                    </li>
            `
            }
        }
        userTabContent.innerHTML = userStr;
        articleTabContent.innerHTML = articleStr;
    });
}
init()