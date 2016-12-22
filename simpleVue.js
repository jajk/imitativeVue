function SimpleVue(obj){
	this.$el = document.querySelector(obj.el);
	this.$options = obj;
	this._data = Object.create(null);
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
}
SimpleVue.prototype = {
	constructor: SimpleVue,
	init: function(){
		this.getTemplate();
		this.initNodes();
		this.initPage();
		this.watchData();
		SimpleVue.callHook(this, 'created');
	},
	getTemplate: function(){
	    this.innerTemplate = this.$el.innerHTML;	
	},
	initNodes: function(){
		var template = this.$el.outerHTML.replace(/[\n\r\t]/g, ''),
			body = document.body;
		this.nodes = transformHTML2Nodes(template);
	},
	initPage: function(){
		var body = document.body;
		body.innerHTML = '';
        body.appendChild(this.nodes.render());		
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
					that.update('{{'+elem+'}}', newVal);
				}
			});
			that[elem] = data[elem];
		});
	},
	update: function(key, param){
	    ListWatcher.trigger(key, param);	
	}
};
/*
	@Param: str(required)   --需要转换的html字符串，如上的html1、html2以及html3
	        pNode(optional) --父节点
*/
function transformHTML2Nodes(str, pNode){
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
			strNode = transformHTML2Nodes(result[3], vnode);
			if(typeof strNode === 'string'){
				ListWatcher.addAction(strNode, function(val){
				    this.el.innerHTML = val;	
				}.bind(vnode));
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
	var reg = /(\w+)\s*=\s*(["'])(.*?)\2/g,
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
function EventTarget(){
    this.listener = {};
}
EventTarget.prototype = {
    constructor:EventTarget,
    addAction: function(actionName, fn){
        if(typeof actionName === 'string' && typeof fn === 'function'){
            //如果不存在actionName，就新建一个
            if(typeof this.listener[actionName] === 'undefined'){
                this.listener[actionName] = [fn];
            }
            //否则，直接往相应actinoName里面塞
            else{
                this.listener[actionName].push(fn);
            }
        }
    },
    trigger: function(actionName){
        var actionArray = this.listener[actionName],
		    otherVal = Array.prototype.slice.call(arguments, 1);
        //触发一系列actionName里的函数
        if(actionArray instanceof Array){
            for(var i = 0, len = actionArray.length; i < len; i++){
                if(typeof actionArray[i] === 'function'){
                    actionArray[i].apply(null,otherVal);
                }
            }   
        }
        actionArray = null;
    },
    remove: function(actionName, fn){
        var actionArray = this.listener[actionName];
        if(typeof actionName === 'string' && actionArray instanceof Array){
            if(typeof fn === 'function'){
                //清除actionName中对应的fn方法
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
var ListWatcher = new EventTarget();