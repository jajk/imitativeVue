function SimpleVue(obj){
	this.$el = document.querySelector(obj.el);
	this.$options = obj;
	this._data = Object.create(null);
	this.listWatchmen = new Watchmen(); 
	this.init();
	obj = null;
};
SimpleVue.throttle = function(method, context, delay){
	clearTimeout(method.tId);
	method.tId = setTimeout(function(){
		method.call(context);
	}, delay);
};
SimpleVue.callHook = function(vm, hook){
	var handler = vm.$options[hook];
	if(handler){
		handler.call(vm);
	}
};
SimpleVue.prototype = {
	constructor: SimpleVue,
	init: function(){
		this.initNodes();
		this.initPage();
		this.watchData();
		SimpleVue.callHook(this, 'created');
	},
	initNodes: function(){
		var template = this.$el.outerHTML.replace(/[\n\r\t]/g, ''),
			body = document.body;
		this.nodes = transformHTML2Nodes.call(this, template);
	},
	initPage: function(){
        var parentNode = this.$el.parentNode,
		    newNode = this.nodes.render();
        parentNode.replaceChild(newNode, this.$el);
		this.$el = newNode;
        parentNode = newNode = null;		
	},
	watchData: function(){
		var data = this.$options.data,
			keys = Object.keys(data),
			that = this;
		keys.forEach(function(elem){
			Object.defineProperty(that, elem, {
				enumerable: true,
				configurable: true,
				get: function(){
					return that._data[elem];
				},
				set: function(newVal){
					var oldVal = that[elem];
					if(oldVal === newVal){
						return;
					}
					that._data[elem] = newVal;
					that.update(elem);
				}
			});
			that[elem] = data[elem];
		});
	},
	update: function(key){
	    this.listWatchmen.trigger(key);	
	},
	_gV: function(key){
	    return this[key];	
	}
};
function setDep(content, attrName, pNode){
	var subReg = /(\{\{)(\w*?)(\}\})/g,
		subResult = '',
		that = this;
	if(typeof attrName !== 'string'){
		pNode = attrName;
		attrName = '';
	}
	subResult = content.replace(subReg, function(ws, $1, $2, $3){
		that.listWatchmen.addAction($2, function(){
			var finalResult = '',
				gVreg =  /_gV\((\w*?)\)/g;
			finalResult = subResult.replace(gVreg, function(ws, $1){
				return that._gV($1);
			});
			if(attrName){
				pNode.el.removeAttribute(attrName);
				pNode.el.setAttribute(attrName, finalResult);	
			}else{
				pNode.el.innerHTML = finalResult;	
			}
		});
		return '_gV(' + $2 + ')';
	});
}
/*
	@Param: str(required)   --需要转换的html字符串，如上的html1、html2以及html3
	        pNode(optional) --父节点
*/
function transformHTML2Nodes(str, pNode){
	var result = null,
		reg = /(<(\w*).*?>)(.*?)<\/\2>/g,
		vnode = null,
		strNode = '',
		preIndex = 0,
		len = str.length;
	do{
		strNode = '';
		preIndex = reg.lastIndex;
		result = reg.exec(str);
		if(!result){
			return str.slice(preIndex);
		}
		vnode = new Node(result[0], result[1], result[2], this); 
		if(result[3]){
			strNode = transformHTML2Nodes.call(this, result[3], vnode);
			if(typeof strNode === 'string'){
				setDep.call(this, strNode, vnode);
				vnode.children.push(strNode);
			}
		}
		if(pNode){
		    pNode.children.push(vnode);	
		}
	}while(reg.lastIndex!==(len));
	return vnode;
};
/*
    @Param:  content --该节点下的outerHtml字符串
	        propsMsg --该节点中的属性信息字符串，如'<div id="container">'
			 tagName --该节点类型字符串，如div
*/
function Node(content, propsMsg, tagName, vm){
	if(!(this instanceof Node)){
		return new Node(tagName, props, children);
	}
	this.content = content;
	this.tagName = tagName;
	this.children = [];
	var that = this;
	var reg = /(\w+)\s*=\s*(["'])(.*?)\2/g,
	    props = {};
	if(propsMsg){
	    propsMsg.replace(reg, function(wd, $1, $2, $3){
			setDep.call(vm, $3, $1, that);
			props[$1] = $3;
		});	
	}
	this.props = props;
};
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
};
function Watchmen(){
	if(!(this instanceof Watchmen)){
		return new Watchmen();
	}
    this.listener = {};
};
Watchmen.prototype = {
    constructor:Watchmen,
    addAction: function(actionName, fn){
        if(typeof actionName === 'string' && typeof fn === 'function'){
            if(typeof this.listener[actionName] === 'undefined'){
                this.listener[actionName] = [fn];
            }
            else{
                this.listener[actionName].push(fn);
            }
        }
    },
    trigger: function(actionName){
        var actionArray = this.listener[actionName];
        if(actionArray instanceof Array){
            for(var i = 0, len = actionArray.length; i < len; i++){
                if(typeof actionArray[i] === 'function'){
                    actionArray[i]();
                }
            }   
        }
        actionArray = null;
    },
    remove: function(actionName, fn){
        var actionArray = this.listener[actionName];
        if(typeof actionName === 'string' && actionArray instanceof Array){
            if(typeof fn === 'function'){
                for(var i=0, len = actionArray.length; i < len; i++){
                    if(actionArray[i] === fn){
                        this.listener[actionName].splice(i,1);
                    }
                }
            }
        }
        actionArray = null;
    }
};