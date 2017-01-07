'use strict';

let arrKeys = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const extendObj = {};
const extendArr = [];

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

!function(){
    arrKeys.forEach(function(key){
		proxyObject(extendArr, key, function(){
			console.log('Fun ' + key + ' is observed');
			let result;
			let arrProto = Array.prototype;
			let ob = this.$Observer;
			let arr = arrProto.slice.call(arguments);
			let inserted;
			let index;
			switch(key){
				case 'push': {
					inserted = arr;
					index = this.length;
					break;
				}
				case 'unshift': {
					inserted = arr;
					index = 0;
					break;
				}
				case 'splice': {
					inserted = arr.slice(2);
					index = arr[0];
					break;
				}
			}
			result = arrProto[key].apply(this, arguments);
			if(inserted){
				inserted.forEach(val => {
					ob.observe(val);
					ob.convert(index++, val);
				});
			}
			return result;
		});
	});
}();
