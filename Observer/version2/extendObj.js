'use strict';

const extendObj = {};

function proxyObject(obj, key, val, enume){
    Object.defineProperty(obj, key, {
		value: val,
		enumerable: !!enume,
        writable: true,
        configurable: true
	});	
};

proxyObject(extendObj, '$set', function(key, val){
    if(this.hasOwnProperty(key)){
		return;
	}else{
		let ob = this.$Observer;
		ob.observe(val);
		ob.convert(key, val);	
	}	
});
