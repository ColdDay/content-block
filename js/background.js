chrome.contextMenus.create({
    type: 'normal',
    title: '内容屏蔽',
    id: 'menuDemo',
    contexts: ['all']
}, function () {
    
});

chrome.contextMenus.create({
    type: 'normal',
    title: '不喜欢作者',
    id: 'user',
    contexts: ['all'],
    parentId: 'menuDemo',
    onclick: blockUser
}, function () {
});

chrome.contextMenus.create({
    type: 'normal',
    title: '不喜欢这篇文章',
    id: 'article',
    contexts: ['all'],
    parentId: 'menuDemo',
    onclick: blockArticle
}, function () {
    
});
function blockUser(info, tab ) {
    chrome.tabs.sendMessage(tab.id, { type: "user" });
}
function blockArticle(info, tab) {
    chrome.tabs.sendMessage(tab.id, { type: "article" });
}
