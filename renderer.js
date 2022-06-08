async function updateMetadata(e) {
    let metaFile = e.target.title
    let select = document.getElementById("DropDown")
    let collectionName = select.value;
    let content = e.target.innerHTML
    let res = await window.electronAPI.updateMetadata(collectionName, metaFile, content)
}

async function selectedCollection() {
    let select = document.getElementById("DropDown")
    let label = document.getElementById("collectionLabel")
    let value = select.value;
    label.innerHTML = value;
    let images = await window.electronAPI.getCollectionImages(value)
    let metadata = await window.electronAPI.getCollectionMetadata(value)
    midPanel = document.getElementById("midPanel")
    midPanel.innerHTML = ""
    for (const [key, value] of Object.entries(images)){
        let cont = document.createElement("div")
        cont.id = `${key}container`
        cont.className = "imageContainer"
        let e = document.createElement("img")
        e.id = key
        e.src = URL.createObjectURL(new Blob([value.buffer], { type: 'image/png' } /* (1) */))
        cont.appendChild(e)
        midPanel.appendChild(cont)
    }
    let traitList = [];
    for (const [key, value] of Object.entries(metadata)){
        value.attributes.forEach(att => {
            let key = Object.keys(att)[0]
            if (key === "trait_type"){
                let traitKey = att.trait_type
                let traitValue = att.value
                let trait = {}
                trait[traitKey] = traitValue
                traitList.push(trait)
            }
            else {
                trait = {}
                trait[key] = att
                traitList.push(trait)
                }
            })
        img = document.getElementById(key)
        if (img === null) {
            img = document.getElementById(`${key}.png`)
        }
        if (img === null) {
            img = document.getElementById(`${key}.jpg`)
        }
        if (img === null) {
            img = document.getElementById(`${key}.jpeg`)
        }
        // if (img != null) {
        //     let p = document.createElement("p");
        //     p.innerHTML = key
        //     img.after(p)
        // }
        if (img === null) {
            img = document.getElementById(`${value.name}.jpg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name}.jpeg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"")}.png`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"")}}.jpg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"")}}.jpeg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"")}}.png`)
        }
        if (img != null) {
            let p = document.createElement("p");
            p.innerHTML = value.name
            let data = document.createElement("div");
            data.id = "editMetadata"
            data.title = `${key}.json`;
            data.contentEditable = true;
            data.innerHTML = JSON.stringify(value)
            data.addEventListener("input", updateMetadata)
            img.after(data)
            img.after(p)
        }
    }
    let filterMenu = document.getElementById('filterMenu')
    filterMenu.innerHTML = ""
    traitData = {}
    traitList.map(trait => {
        let traitGroup = Object.keys(trait)[0]
        let traitValue = trait[traitGroup]
        if (typeof traitValue === "object") {
            traitValue = trait[traitGroup][traitGroup]
        }
        if (!traitData[traitGroup]){
            traitData[traitGroup] = [traitValue]
        }
        else {
            if (!traitData[traitGroup].includes(traitValue)) {
                traitData[traitGroup].push(traitValue)
              }
        }
    })
    for (const [key, value] of Object.entries(traitData)){
        html = `<div class="traitGroup" id="traitGroup">${key}`
        value.map(traitVal => html += `<div class="traitItem" id="traitItem">${traitVal}</div>`)
        html += `</div>`
        filterMenu.innerHTML += html
    }
    let filterButtons = document.getElementsByClassName("traitItem")
    let filterResetBtn = document.getElementById("filterResetBtn")
    filterResetBtn.addEventListener("click", selectedCollection)
    for (var i=0; i< filterButtons.length; i++) {
        filterButtons[i].addEventListener("click", function (e) {
            let filterSelection = e.target.innerHTML;
            let midPanel = document.getElementById("midPanel")
            let imageContainers = midPanel.getElementsByClassName("imageContainer")
            let html = ""
            for (var i=0; i<imageContainers.length; i++){
                if (imageContainers[i].innerText.includes(filterSelection)){
                    html += imageContainers[i].outerHTML
                }
            }
            midPanel.innerHTML = html
        });
    }
}
async function startUp() {
    let data = await window.electronAPI.getCollectionsData()
    let collectionNames = Object.keys(data)
    let select = document.getElementById("DropDown")
    select.addEventListener("change", selectedCollection);
    for(var i=0; i<collectionNames.length; i++){
        var opt=collectionNames[i];
        var el=document.createElement("option");
        el.value = opt;
        el.innerHTML = opt;
        select.appendChild(el);
    }
}
startUp()