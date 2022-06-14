async function updateMetadata(e) {
    let metaFile = e.target.title
    let select = document.getElementById("DropDown")
    let collectionName = select.value;
    let content = e.target.innerHTML
    let res = await window.electronAPI.updateMetadata(collectionName, metaFile, content)
}
async function deleteNFT(e) {
    let select = document.getElementById("DropDown")
    let collectionName = select.value;
    let metaFile = e.target.dataset.metadata
    let imageFile = e.target.dataset.img
    let res = await window.electronAPI.deleteNFT(collectionName, imageFile, metaFile)
    let res2 = await selectedCollection()
}

async function importScreen() {
    console.log('hi')
    midPanel = document.getElementById("midPanel")
    midPanel.innerHTML = ""
    let importCollectionField = document.getElementById("importCollectionName")
    let importCollectionName = importCollectionField.innerText;
    let data = await window.electronAPI.importCollection(importCollectionName)
    if (data.metadata === "not found"){
        midPanel.innerHTML += "<div>Metadata Not Found</div>"
        return
    }
    if (data.images === "not found"){
        midPanel.innerHTML += "<div>Images Not Found</div>"
        return
    }
    startUp()
    return
}

async function restoreNFT(e) {
    let select = document.getElementById("DropDown")
    let collectionName = select.value;
    let metaFile = e.target.dataset.metadata
    let imageFile = e.target.dataset.img
    let res = await window.electronAPI.restoreNFT(collectionName, imageFile, metaFile)
    let res2 = await collectionTrash()
}

async function collectionTrash() {
    let select = document.getElementById("DropDown")
    let value = select.value;
    let deletedImages = await window.electronAPI.getDeletedImages(value)
    let deletedMetadata = await window.electronAPI.getDeletedMetadata(value)
    midPanel = document.getElementById("midPanel")
    midPanel.innerHTML = ""
    for (const [key, value] of Object.entries(deletedImages)){
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
    for (const [key, value] of Object.entries(deletedMetadata)){
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
            let restoreBtn = document.createElement("div");
            restoreBtn.id = "deleteBtn"
            restoreBtn.dataset.img = img.id
            restoreBtn.dataset.metadata = `${key}.json`
            restoreBtn.addEventListener("click", restoreNFT)
            restoreBtn.innerHTML = "+"
            let data = document.createElement("div");
            data.id = "editMetadata"
            data.title = `${key}.json`;
            data.innerHTML = JSON.stringify(value)
            img.after(data)
            img.after(p)
            img.after(restoreBtn)
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
        html = `<div class="traitGroup" id="traitGroup"><div class="traitBtn">${key}</div><div class="traitItems">`
        value.map(traitVal => html += `<div class="traitItem" id="traitItem">${traitVal}</div>`)
        html += `</div></div>`
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
    var traitBtn = document.getElementsByClassName("traitBtn")
    for (i = 0; i < traitGroup.length; i++) {
        traitBtn[i].addEventListener("click", function() {
          this.classList.toggle("active");
          var currentTraitItems = this.nextSibling;
          if (currentTraitItems.style.display === "block") {
              currentTraitItems.style.display = "none";
          } else {
              currentTraitItems.style.display = "block";
          }
        });
      }
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
    for (const [i, value] of Object.entries(metadata)){
        console.log(i)
        console.log(value)
        value.attributes.forEach(att => {
            let key = Object.keys(att)[0]
            console.log(key)
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
        console.log(`${value.filename.slice(0,-5)}.jpg`)
        img = document.getElementById(`${value.filename.slice(0,-5)}.jpg`)
        if (img === null) {
            console.log(`${value.filename.slice(0,-5)}.jpg`)
            img = document.getElementById(`${value.filename.slice(0,-5)}.png`)
        }
        if (img === null) {
            console.log(value.name)
            img = document.getElementById(`${value.name.replace("#","")}.png`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace("#","")}.jpg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace("#","")}.jpeg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"   ").slice(-7).replace(" ","")}.png`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"   ").slice(-7).replace(" ","")}}.jpg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"   ").slice(-7).replace(" ","")}}.jpeg`)
        }
        if (img === null) {
            img = document.getElementById(`${value.name.replace('#',"").slice(-7).replace(" ","")}}.png`)
        }
        if (img != null) {
            let p = document.createElement("p");
            p.innerHTML = value.name
            let deleteBtn = document.createElement("div");
            deleteBtn.id = "deleteBtn"
            deleteBtn.dataset.img = img.id
            deleteBtn.dataset.metadata = `${value.filename}`
            deleteBtn.addEventListener("click", deleteNFT)
            deleteBtn.innerHTML = "x"
            let data = document.createElement("div");
            data.id = "editMetadata"
            data.title = `${value.filename}`;
            data.contentEditable = true;
            data.innerHTML = JSON.stringify(value)
            data.addEventListener("input", updateMetadata)
            img.after(data)
            img.after(p)
            img.after(deleteBtn)
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
        html = `<div class="traitGroup" id="traitGroup"><div class="traitBtn">${key}</div><div class="traitItems">`
        value.map(traitVal => html += `<div class="traitItem" id="traitItem">${traitVal}</div>`)
        html += `</div></div>`
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
    var traitBtn = document.getElementsByClassName("traitBtn")
    for (i = 0; i < traitGroup.length; i++) {
        traitBtn[i].addEventListener("click", function() {
          this.classList.toggle("active");
          var currentTraitItems = this.nextSibling;
          if (currentTraitItems.style.display === "block") {
              currentTraitItems.style.display = "none";
          } else {
              currentTraitItems.style.display = "block";
          }
        });
      }
}
async function startUp() {
    let data = await window.electronAPI.getCollectionsData()
    let collectionNames = Object.keys(data)
    let select = document.getElementById("DropDown")
    let importScreenBtn = document.getElementById("importCollection")
    let importCollectionName = document.getElementById("importCollectionName")
    importCollectionName.contentEditable = true;
    importScreenBtn.addEventListener("click", importScreen)
    select.addEventListener("change", selectedCollection);
    let trashBtn = document.getElementById("trashBtn")
    trashBtn.addEventListener("click", collectionTrash);
    for(var i=0; i<collectionNames.length; i++){
        var opt=collectionNames[i];
        var el=document.createElement("option");
        el.value = opt;
        el.innerHTML = opt;
        select.appendChild(el);
    }
}
startUp()