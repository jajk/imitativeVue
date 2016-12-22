var html1 = '<div id="container">'
				+'<h1 style="color:red">simple virtual dom</h1>'
				+'<p>hello world</p>'
				+'<ul class="ItemAll">'
					+'<li>item #1</li>'
					+'<li>item #2</li>'
				+'</ul>'
			+'</div>';
var html2 = '<div><h1>dddd</h1>other</div>';//text必须用html标签包裹，不然不行
var html3 = '<div id="container">'
				+'<h1 style="color:red">simple virtual dom</h1>'
				+'<p>hello world</p>'
			+'</div>';
function run(str, Pnode){
	var result = null,
		reg = /(<(\w*).*?>)(.*?)<\/\2>/g,
		vnode = null,
		strNode,
		len = str.length;
	do{
		strNode = 0;
		result = reg.exec(str);
		if(!result){
			return str;
		}
		vnode = new getNode(result[0], result[1], result[2]); 
		if(result[3]){
			strNode = run(result[3], vnode);
			if(typeof strNode === 'string'){
				vnode.children.push(strNode);
			}
		}
		if(Pnode){
		    Pnode.children.push(vnode);	
		}
	}while(reg.lastIndex!==(len));
	return vnode;
}
function getNode(content, propsMsg, tagName){
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