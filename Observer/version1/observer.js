'use strict';

function Observer(data){
	if(!(this instanceof Observer)){
		return new Observer(data);
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
			Observer(val);
		}
		this.convert(key, val);
	});
}

p.convert = function(key, val){
	Object.defineProperty(this.data, key, {
		get: ()=>{
			console.log('访问了'+key+'  值为'+val);
			return val;
		},
		set: (newVal)=>{
			console.log('设置了'+key+'  值为'+newVal);
			if(newVal !== val){
				val = newVal;
			}
		}
	});
}
