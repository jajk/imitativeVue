var html1 = '<div id="container">'
				+'<h1 style="color:red">simple virtual dom</h1>'
				+'<p>hello world</p>'
				+'<ul class="ItemAll">'
					+'<li>item #1</li>'
					+'<li>item #2</li>'
				+'</ul>'
			+'</div>';
var html2 = '<div><h1>dddd</h1>other</div>';
var html3 = '<div id="container">'
				+'<h1 style="color:red">simple virtual dom</h1>'
				+'<p>hello world</p>'
			+'</div>';
/*
	@Param: str(required)   --需要转换的html字符串，如上的html1、html2以及html3
	        pNode(optional) --父节点
*/
function run(str, pNode){
	var result = null,
		reg = /(<(\w*).*?>)(.*?)<\/\2>/g,
		vnode = null,
		strNode,
		preIndex = 0,
		len = str.length;
	do{
		strNode = 0;
		preIndex = reg.lastIndex;
		result = reg.exec(str);
		if(!result){
			return str.slice(preIndex);
		}
		vnode = new Node(result[0], result[1], result[2]); 
		if(result[3]){
			strNode = run(result[3], vnode);
			if(typeof strNode === 'string'){
				vnode.children.push(strNode);
			}
		}
		if(pNode){
		    pNode.children.push(vnode);	
		}
	}while(reg.lastIndex!==(len));
	return vnode;
}
/*
    @Param:  content --该节点下的outerHtml字符串
	        propsMsg --该节点中的属性信息字符串，如'<div id="container">'
			 tagName --该节点类型字符串，如div
*/
function Node(content, propsMsg, tagName){
	if(!(this instanceof Node)){
		return new Node(tagName, props, children);
	}
	this.content = content;
	this.tagName = tagName;
	this.children = [];
	var reg = /(\w+)\s*=\s*(["'])(.*)\2/g,
	    props = {};
	if(propsMsg){
	    propsMsg.replace(reg, function(wd, $1, $2, $3){
			props[$1] = $3;
		});	
	}
	this.props = props;
}
Node.prototype.render = function(){
	var el = document.createElement(this.tagName),
	    props = this.props,
		propName,
		propValue;
	for(propName in props){
		propValue = props[propName];
		el.setAttribute(propName, propValue);
	}
	this.children.forEach(function(child){
		var childEl = null;
		if(child instanceof Node){
			childEl = child.render();
		}else{
			childEl = document.createTextNode(child);
		}
		el.appendChild(childEl);
	});
	this.el = el;
	return el;
}