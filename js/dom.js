const parseDom = function (targetEle) {
  var parentEle = targetEle.closest('.item');
  var id = new Date().getTime();
  var userId = parentEle.querySelector('.user-popover-box').getAttribute('st:state');
  var userName = parentEle.querySelector('.user-popover-box a').innerText;
  var postUrl = parentEle.querySelector('.title').href;
  var postName = parentEle.querySelector('.title').innerText;
  var data = {
    id,
    userId,
    userName,
    postUrl,
    postName
  }
  return data;
}
export {
  parseDom
}