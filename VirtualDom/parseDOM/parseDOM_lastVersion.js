function Node(tagName, props, children){
	if(!(this instanceof Node)){
		return new Node(tagName, props, children);
	}
	if(Array.isArray(props)){
		children = props;
		props = {};
	}
	this.tagName = tagName;
	this.props = props || {};
	this.children = children || [];
	this.el = '';
	var count = 0;
	this.children.forEach(function(child, i){
		if(child instanceof Node){
			count+=child.count;
		}else{
			children[i] = ''+child;
		}
		count++;
	});
	this.count = count;
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
//test
var vdom = Node('div', {'id': 'container'}, [
	Node('h1', {style:'color:red'},['simple virtual dom']),
	Node('p', ['hello world']),
	Node('ul', [Node('li', ['item #1']),Node('li', ['item #2'])])
]);