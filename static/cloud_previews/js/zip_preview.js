const zipFilePath = document.querySelector("#zip-path")
const zipTable = document.querySelector("#zip-table")

let zipPath = "/"


function buildZIPStructure(path, raw_data){
    let data = raw_data
    zipFilePath.innerHTML = path
    path = path.slice(1)
    if(path !== ""){
        for(let walker of path.split("/")){
            data = data[walker]
        }
    }
    zipTable.childNodes.forEach(child => child.remove())
    for(let key in data){
        let element = data[key]
        let directory = !element.hasOwnProperty("name")
        let newRow = document.createElement("tr")
        newRow.innerHTML = `
            <td>${directory ? key + "/" : element.name}</td>
            <td>${directory ? "-" : element.type}</td>
            <td>${directory ? "-" : (element.size + "B")}</td>
        `
        newRow.addEventListener("click", () => {
            if(!directory) return
            buildZIPStructure(zipPath + key + "/", raw_data)
        })
        zipTable.appendChild(newRow)
    }
}


function loadZIPContent(){
    fetch(`?preview&force-preview=ARCHIVE&zip-file`)
        .then(response => response.json())
        .then(data => {
            buildZIPStructure(zipPath, data)
        })
}

loadZIPContent()
