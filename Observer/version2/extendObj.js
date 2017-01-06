let extendObj = {};

function proxyObject(obj, key, func){
    Object.defineProperty(obj, key, {
		enumerable: true,
        writable: true,
        configurable: true,
		value: func
	});	
};

proxyObject(extendObj, '$set', function(key, val){
    let ob = this.$Observer;
	ob.observe(val);
	ob.convert(key, val);	
});
