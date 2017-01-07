'use strict';

function Observer(data){
	if(!(this instanceof Observer)){
		return new Observer(data);
	}
	data.__proto__ = extendObj;
	if(Array.isArray(data)){
		data.__proto__.__proto__ = extendArr;
	}
    this.data = data;
    this.walk(data);	
}

let p = Observer.prototype = Object.create(null);

p.walk = function(data){
    let keys = Object.keys(data);
	keys.forEach( key => {
		let val = data[key];
	    this.observe(key, val);
		this.convert(key, val);
	});
	data.$Observer = this;
}

p.convert = function(key, val){
	let ob = this;
	Object.defineProperty(this.data, key, {
		enumerable: true,
        configurable: true,
		get: ()=>{
			console.log('访问了属性--'+key);
			return val;
		},
		set: (newVal)=>{
			console.log('设置了-'+key+'-  值为'+newVal);
			if(newVal === val){
				return;
			}else{
				val = newVal;
			}
			ob.notify('set', key);
		}
	});
}

p.observe = function(key, data){
	if(typeof data === 'object'){
	    let ob = new Observer(data);	
		ob._parent = {
			key,
			ob: this
		};
	}	
}

p.on = function(eventName, fn){
    let listener = this.listener = this.listener || [];
	if(typeof eventName === 'string' && typeof fn === 'function'){
		if(!listener[eventName]){
			listener[eventName] = [fn];
		}else{
			listener[eventName].push(fn);
		}
	}	
}

p.off = function(eventName, fn){
	let listener = this.listener = this.listener || [];
    let actionArray = listener[eventName];
	if(typeof eventName === 'string' && Array.isArray(actionArray)){
		if(typeof fn === 'function'){
			actionArray.forEach( (func, i, arr) => {
				if(func === fn){
				    arr.splice(i,1);	
				}
			});
		}
	}
}

p.emit = function(eventName){
	let listener = this.listener = this.listener || [];
    let actionArray = listener[eventName];
	if(Array.isArray(actionArray)){
		actionArray.forEach( func => {
			if(typeof func === 'function'){
			    func();	
			}
		});  
	}
}

p.notify = function(eventName){
    let ob = this._parent && this._parent.ob;
	let key = ob && this._parent.key || 'root';
	console.log('parent--'+key+'  event--'+eventName);
	this.emit(eventName);
    ob && ob.notify(eventName);	
}