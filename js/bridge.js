
// 向页面注入JS
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/main.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		this.parentNode.removeChild(this);
	};
	document.head.appendChild(temp);
}
setTimeout(function() {
    injectCustomJs('js/main.js')
},1000)