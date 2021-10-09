function ContextMenu(menu, options){
	let self = this;
	let num = ContextMenu.count++;

	this.menu = menu;
	this.contextTarget = null;

	if(!(menu instanceof Array)){
		throw new Error("Parameter 1 must be of type Array");
	}

	if(typeof options !== "undefined"){
		if(typeof options !== "object"){
			throw new Error("Parameter 2 must be of type object");
		}
	}else{
		options = {};
	}

	window.addEventListener("resize", function(){
		if(ContextUtil.getProperty(options, "close_on_resize", true)){
			self.hide();
		}
	});

	this.setOptions = function(_options){
		if(typeof _options === "object"){
			options = _options;
		}else{
			throw new Error("Parameter 1 must be of type object")
		}
	}

	this.changeOption = function(option, value){
		if(typeof option === "string"){
			if(typeof value !== "undefined"){
				options[option] = value;
			}else{
				throw new Error("Parameter 2 must be set");
			}
		}else{
			throw new Error("Parameter 1 must be of type string");
		}
	}

	this.getOptions = function(){
		return options;
	}

	this.reload = function(){
		if(document.getElementById('cm_' + num) == null){
			let cnt = document.createElement("div");
			cnt.className = "cm_container";
			cnt.id = "cm_" + num;

			document.body.appendChild(cnt);
		}

		let container = document.getElementById('cm_' + num);
		container.innerHTML = "";

		container.appendChild(renderLevel(menu));
	}

	function renderLevel(level){
		let ul_outer = document.createElement("ul");

		level.forEach(function(item){
			let li = document.createElement("li");
			li.menu = self;

			if(typeof item.type === "undefined"){
				let icon_span = document.createElement("span");
				icon_span.className = 'cm_icon_span';
				icon_span.classList.add("material-icons")

				if(ContextUtil.getProperty(item, "icon", "") !== ""){
					icon_span.innerHTML = ContextUtil.getProperty(item, "icon", "");
				}else{
					icon_span.innerHTML = ContextUtil.getProperty(options, "default_icon", "");
				}

				let text_span = document.createElement("span");
				text_span.className = 'cm_text';

				if(ContextUtil.getProperty(item, "text", "") !== ""){
					text_span.innerHTML = ContextUtil.getProperty(item, "text", "");
				}else{
					text_span.innerHTML = ContextUtil.getProperty(options, "default_text", "item");
				}

				let sub_span = document.createElement("span");
				sub_span.className = 'cm_sub_span';

				if(typeof item.sub !== "undefined"){
					if(ContextUtil.getProperty(options, "sub_icon", "") !== ""){
						sub_span.innerHTML = ContextUtil.getProperty(options, "sub_icon", "");
					}else{
						sub_span.innerHTML = '&#155;';
					}
				}

				for(let t of ContextUtil.getProperty(item, "classes", "dropdown-item").split(" ")){
					li.classList.add(t)
				}
				li.hidden = ContextUtil.getProperty(item, "hidden", false)

				li.appendChild(icon_span);
				li.appendChild(text_span);
				li.appendChild(sub_span);

				if(!ContextUtil.getProperty(item, "enabled", true)){
					li.setAttribute("disabled", "");
				}else{
					if(typeof item.events === "object"){
						let keys = Object.keys(item.events);

						for(let i = 0; i < keys.length; i++){
							li.addEventListener(keys[i], item.events[keys[i]]);
						}
					}

					if(typeof item.sub !== "undefined"){
						li.appendChild(renderLevel(item.sub));
					}
				}
			}else if(item.type === "xml"){
                let html_wrap = document.createElement("div")
                li.classList.add("cm_html")

                if(ContextUtil.getProperty(item, "html", "") !== ""){
					html_wrap.innerHTML = ContextUtil.getProperty(item, "html", "");
				}else{
					html_wrap.innerHTML = ContextUtil.getProperty(options, "default_text", "item");
				}

                li.appendChild(html_wrap)
            }else{
				if(item.type === ContextMenu.DIVIDER){
					li.className = "cm_divider";
				}
			}
			ul_outer.appendChild(li);
		});

		return ul_outer;
	}

	this.display = function(e, target){
		if(typeof target !== "undefined"){
			self.contextTarget = target;
		}else{
			self.contextTarget = e ? e.target : document;
		}

		let menu = document.getElementById('cm_' + num);

		let clickCoords = {x: e ? e.clientX : 0, y: e ? e.clientY : 0};
		let clickCoordsX = clickCoords.x;
		let clickCoordsY = clickCoords.y;

		let menuWidth = menu.offsetWidth + 4;
		let menuHeight = menu.offsetHeight + 4;

		let windowWidth = window.innerWidth;
		let windowHeight = window.innerHeight;

		let mouseOffset = parseInt(ContextUtil.getProperty(options, "mouse_offset", 2));

		if((windowWidth - clickCoordsX) < menuWidth){
			menu.style.left = windowWidth - menuWidth + "px";
		}else{
			menu.style.left = (clickCoordsX + mouseOffset) + "px";
		}

		if((windowHeight - clickCoordsY) < menuHeight){
			menu.style.top = windowHeight - menuHeight + "px";
		}else{
			menu.style.top = (clickCoordsY + mouseOffset) + "px";
		}

		let sizes = ContextUtil.getSizes(menu);

		if((windowWidth - clickCoordsX) < sizes.width){
			menu.classList.add("cm_border_right");
		}else{
			menu.classList.remove("cm_border_right");
		}

		if((windowHeight - clickCoordsY) < sizes.height){
			menu.classList.add("cm_border_bottom");
		}else{
			menu.classList.remove("cm_border_bottom");
		}

		menu.classList.add("display");

		if(ContextUtil.getProperty(options, "close_on_click", true)){
			window.addEventListener("click", documentClick);
			window.addEventListener("keydown", e => {
				if(e.key === "Escape"){
					documentClick(e)
				}
			})
		}

		if(e) {
			e.preventDefault();
		}
	}

	this.hide = function(){
		document.getElementById('cm_' + num).classList.remove("display");
		window.removeEventListener("click", documentClick);
		window.removeEventListener("keydown", documentClick);
	}

	function documentClick(){
		self.hide();
	}

	this.reload();
}

ContextMenu.count = 0;
ContextMenu.DIVIDER = "divider";

const ContextUtil = {
	getProperty: function(options, opt, def){
		if(typeof options[opt] !== "undefined"){
			return options[opt];
		}else{
			return def;
		}
	},

	getSizes: function(obj){
		let lis = obj.getElementsByTagName('li');

		let width_def = 0;
		let height_def = 0;

		for(let i = 0; i < lis.length; i++){
			let li = lis[i];

			if(li.offsetWidth > width_def){
				width_def = li.offsetWidth;
			}

			if(li.offsetHeight > height_def){
				height_def = li.offsetHeight;
			}
		}

		let width = width_def;
		let height = height_def;

		for(let i = 0; i < lis.length; i++){
			let li = lis[i];

			let ul = li.getElementsByTagName('ul');
			if(typeof ul[0] !== "undefined"){
				let ul_size = ContextUtil.getSizes(ul[0]);

				if(width_def + ul_size.width > width){
					width = width_def + ul_size.width;
				}

				if(height_def + ul_size.height > height){
					height = height_def + ul_size.height;
				}
			}
		}

		return {
			"width": width,
			"height": height
		};
	}
};