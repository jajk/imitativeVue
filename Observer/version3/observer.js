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
		if(typeof val === 'object'){
			new Observer(val);
		}
		this.convert(key, val);
	});
	data.$Observer = this;
}

p.convert = function(key, val){
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
		}
	});
}

p.observe = function(data){
    if(typeof data === 'object'){
	    new Observer(data);	
	}	
}