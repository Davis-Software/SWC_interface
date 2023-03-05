const zipFilePath = document.querySelector("#zip-path")
const zipTable = document.querySelector("#zip-table")


function addToTable(item){
    const row = document.createElement("tr")

    row.innerHTML = `
        <td>${item.directory ? `<strong>${item.name.slice(0, -1).split("/").pop() + "/"}</strong>` : item.name.split("/").pop()}</td>
        <td>${item.directory ? "-" : (item.size + "B")}</td>
    `

    zipTable.appendChild(row)
    return row
}


function occurrences(string, char){
    return string.split("").filter(c => c === char).length
}


function buildZIPStructure(path, raw_data){
    zipFilePath.innerHTML = "/" + path
    zipTable.innerHTML = ""

    let zipPath = path.slice(0, -1)
    let directories = raw_data.filter(item => item.directory)
    let files = raw_data.filter(item => !item.directory)

    if(zipPath !== ""){
        const parent = document.createElement("tr")
        parent.innerHTML = `
            <td>..</td>
            <td></td>
        `
        zipTable.appendChild(parent)
        parent.addEventListener("click", () => {
            buildZIPStructure(zipPath.slice(0, zipPath.lastIndexOf("/") + 1), raw_data)
        })
    }
    directories.forEach(folderItem => {
        if(folderItem.name === zipPath) return

        let folderPath = folderItem.name
            .slice(0, -1)
            .split("/")
            .slice(0, -1)
            .join("/")
        if(folderPath !== zipPath) return

        addToTable(folderItem).addEventListener("click", () => {
            buildZIPStructure(folderItem.name, raw_data)
        })
    })
    files.forEach(fileItem => {
        let filePath = fileItem.name
            .split("/")
            .slice(0, -1)
            .join("/")
        if(filePath !== zipPath) return

        addToTable(fileItem).addEventListener("click", () => {
            if(
                confirm(`Do you want to download ${fileItem.name.split("/").pop()}?`)
            ){
                open(`?preview&force-preview=ARCHIVE&zip-file&file=${fileItem.path}`, "_blank")
            }
        })
    })
}


function loadZIPContent(){
    fetch(`?preview&force-preview=ARCHIVE&zip-file`)
        .then(response => response.json())
        .then(data => {
            // Remove the first item if it's a directory to avoid a bug
            if(occurrences(data[0].name, "/") > 1){
                data = data.map(item => ({
                    ...item,
                    name: item.name
                        .split("/")
                        .slice(occurrences(data[0].name, "/") - 1)
                        .join("/")
                }))
            }

            buildZIPStructure("", data)
        })
}

loadZIPContent()
