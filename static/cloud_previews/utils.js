class QuickButton{
    constructor(elem=null) {
        this.elem = elem
        this.button = document.createElement("button")
        this.button.classList.add("material-icons", "ripple", "mad-ripple")
    }
    title(title){
        this.button.title = title
        return this
    }
    class(...classes){
        this.button.classList.add(...classes)
        return this
    }
    attr(attr){
        for(let atr in attr){
            this.button.setAttribute(atr, attr[atr])
        }
        return this
    }
    icon(icon){
        this.button.innerHTML = icon
        return this
    }
    onClick(callback){
        this.button.addEventListener("click", e => {
            callback(this.button, e)
        })
        return this
    }
    spawn(elem=this.elem){
        elem.appendChild(this.button)
        return this
    }
    return(){
        return this.button
    }
    html(){
        return this.button.outerHTML
    }
}

class ContextButton{
    constructor(icon, text) {
        this.data = {icon, text, events: {}}
    }
    OnClick(callback){
        this.data.events.click = e => {
            callback(this, e)
        }
        return this
    }
    Classes(classes){
        this.data.classes = classes
        this.classList = classes.split(" ")
        this.classList.contains = key => {
            return this.classList.includes(key)
        }
        return this
    }
    Mode(mode){
        this.mode = mode
        return this
    }
    Display(bool){
        this.data.hidden = !bool
        return this
    }
    getAttribute(key){
        return this[key]
    }
    get(){
        return this.data
    }
}

function show_help(){
    let modal = new Modal("#modal-wrapper", {
        title: "Cloud Help & Info",
        centered: true,
        scrollable: true
    }, "max")
    modal.wrapper_body.style.height = "80vh"
    modal.Custom(`
        <div style="text-align: center; margin-top: 30vh">
            <div class="spinner-border"></div>
        </div>
    `)
    modal.show()
    fetch(`/cloud-help`).then(resp => {
        if(!resp.ok){
            modal.clear()
            modal.Custom(`<span class="text-danger">${resp.status}: ${resp.statusText}</span>`)
            return
        }
        resp.text().then(html => {
            modal.clear()
            modal.Custom(html)
        })
    }).catch(err => {
        modal.clear()
        modal.Custom(`<span class="text-danger">${err.status}: ${err.statusText}</span>`)
    })
}

function show_error(error){
    cloud_list.innerHTML = `
    <tr>
        <td><span class="text-danger">${error}</span></td>
        <td><span class="text-danger">-</span></td>
        <td><span class="text-danger">-</span></td>
        <td><span class="text-danger">-</span></td>
<!--        <td><span class="text-danger">-</span></td>-->
    </tr>
    `
}
function show_info(info){
    cloud_list.innerHTML = `
    <tr>
        <td>${info}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
<!--        <td>-</td>-->
    </tr>
    `
}



function download_blob(data, strFileName, strMimeType, callback= _ => {}) {
	let self = window,
		u = "application/octet-stream",
		m = strMimeType || u,
		x = data,
		D = document,
		a = D.createElement("a"),
		z = function(a){return String(a);},
		B = self.Blob || self.MozBlob || self.WebKitBlob || z,
		BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,
		fn = strFileName || "download",
		blob,
		b,
		// ua,
		fr;
	if(String(this)==="true"){
		x=[x, m];
		m=x[0];
		x=x[1];
	}
	if(String(x).match(/^data[\w+\-]+\/[\w+\-]+[,;]/)){
		return navigator.msSaveBlob ?
			navigator.msSaveBlob(d2b(x), fn) :
			saver(x) ;
	}
	try{
		blob = x instanceof B ?
			x :
			new B([x], {type: m}) ;
	}catch(y){
		if(BB){
			b = new BB();
			b.append([x]);
			blob = b.getBlob(m); // the blob
		}

	}
	function d2b(u) {
		let p= u.split(/[:;,]/),
		t= p[1],
		dec= p[2] === "base64" ? atob : decodeURIComponent,
		bin= dec(p.pop()),
		mx= bin.length,
		i= 0,
		uia= new Uint8Array(mx);
		for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);
		return new B([uia], {type: t});
	 }
	function saver(url, winMode){
		if ('download' in a) {
			a.href = url;
			a.setAttribute("download", fn);
			a.innerHTML = "downloading...";
			D.body.appendChild(a);
			setTimeout(function() {
				a.click();
				D.body.removeChild(a);
				if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
			}, 66);
			return true;
		}
		let f = D.createElement("iframe");
		D.body.appendChild(f);
		if(!winMode){
			url="data:"+url.replace(/^data:([\w\/\-]+)/, u);
		}
		f.src = url;
		setTimeout(function(){ D.body.removeChild(f); }, 333);
	}
	if (navigator.msSaveBlob) {
		return navigator.msSaveBlob(blob, fn);
	}
	if(self.URL){
		saver(self.URL.createObjectURL(blob), true);
	}else{
		if(typeof blob === "string" || blob.constructor===z ){
			try{
				return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  );
			}catch(y){
				return saver( "data:" +  m   + "," + encodeURIComponent(blob)  );
			}
		}
		fr=new FileReader();
		fr.onload=function(){
			saver(this.result);
		};
		fr.readAsDataURL(blob);
	}
	return true;
}