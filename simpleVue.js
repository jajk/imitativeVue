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
		this.watchData();
		SimpleVue.callHook(this, 'created');
	},
	getTemplate: function(){
	    this.template = this.$el.innerHTML;	
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
					SimpleVue.throttle(that.update, that, 50);
				}
			});
			that[elem] = data[elem];
		});
	},
	update: function(){
		var that = this,
			template = that.template,
			reg = /(.*?)\{\{(\w*)\}\}/g,
			result = '';
		result = template.replace(reg, function(rs, $1, $2){
			var val = that[$2] || '';
			return $1 + val;
		});
		this.$el.innerHTML = result;
		console.log('update');
	}
};