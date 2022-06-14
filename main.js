// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const JSONdb = require('simple-json-db');
const path = require('path')
const fs = require('fs');
let mainWindow;
// async function createDB() {
//   const db = new JSONdb('/data/storage.json', asyncWrite=true)
//   return db
// }
// db = createDB()

async function importCollection(importCollectionName) {
  const collectionsPath = path.join(__dirname,`data/Collections/`)
  const collectionPath = path.join(collectionsPath, `${importCollectionName}`)
  const newmetadataPath = path.join(collectionPath, `/metadata/`)
  const newimagesPath = path.join(collectionPath, `/images/`)
  let dir = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  const metadataPath = path.join(dir.filePaths[0], `/metadata/`)
  const imagesPath = path.join(dir.filePaths[0], `/images/`)
  let data = {metadata:"",images:""}
  if (fs.existsSync(metadataPath)) {
    data.metadata = metadataPath
  }
  else{
    data.metadata = "not found"
    return data
  }
  if (fs.existsSync(imagesPath)) {
    data.images = imagesPath
  }
  else{
    data.images = "not found"
    return data
  }
  nft = {
    "collection":"",
    "imageLocation":"",
    "metadataLocation":"",
    "tag":"",
  }
  try {
    fs.mkdir(collectionPath, err => {
      if (err) {
      }
    })
    fs.mkdir(newmetadataPath, err => {
      if (err) {
      }
    })
    fs.mkdir(newimagesPath, err => {
      if (err) {
      }
    })
    fs.readdir(metadataPath, function (err, files) {
      files.map((filename, i) => {
        console.log(filename)
        let metaFile = path.join(metadataPath, `${filename}`)
        let newMetaFile = path.join(newmetadataPath, `${filename}`)
        fs.copyFile(metaFile, newMetaFile, (err) => {
          if (err) throw err;
        });
      })
    })
    fs.readdir(imagesPath, function (err, files) {
      files.map((filename, i) => {
        console.log(filename)
        let imageFile = path.join(imagesPath, `${filename}`)
        let newimageFile = path.join(newimagesPath, `${filename}`)
        fs.copyFile(imageFile, newimageFile, (err) => {
          if (err) throw err;
        });
      })
    })
  }catch (err){
    console.log(err)
  }
  return data
}

async function startUp() { 
  async function restoreNFT(collectionName, imageFile, metaFile) {
  const collectionPath = path.join(__dirname,`data/Collections/${collectionName}`)
  const restoredPath = path.join(collectionPath,`/`)
  const restoredImagePath = path.join(restoredPath, `/images/`)
  const restoredMetadataPath = path.join(restoredPath, `/metadata/`)
  const restoredImageFilePath = path.join(restoredImagePath, `/${imageFile}`)
  const restoredMetadataFilePath = path.join(restoredMetadataPath, `/${metaFile}`)
  const metaPath = path.join(collectionPath, `/deleted/metadata/${metaFile}`)
  const imagePath = path.join(collectionPath, `/deleted/images/${imageFile}`)
  try {
    fs.mkdir(restoredPath, err => {
      if (err) {
      }
    })
    fs.mkdir(restoredImagePath, err => {
      if (err) {
      }
    })
    fs.mkdir(restoredMetadataPath, err => {
      if (err) {
      }
    })
  }
  catch (err){
  }
  fs.rename(metaPath, restoredMetadataFilePath, (err) => {
    if (err) throw err;
  });
  fs.rename(imagePath, restoredImageFilePath, (err) => {
    if (err) throw err;
  });
}
  async function deleteNFT(collectionName, imageFile, metaFile) {
    const collectionPath = path.join(__dirname,`data/Collections/${collectionName}`)
    const deletedPath = path.join(collectionPath,`/deleted/`)
    const deletedImagePath = path.join(deletedPath, `/images/`)
    const deletedMetadataPath = path.join(deletedPath, `/metadata/`)
    const deleteImageFilePath = path.join(deletedImagePath, `/${imageFile}`)
    const deleteMetadataFilePath = path.join(deletedMetadataPath, `/${metaFile}`)
    const metaPath = path.join(collectionPath, `/metadata/${metaFile}`)
    const imagePath = path.join(collectionPath, `/images/${imageFile}`)
    try {
      fs.mkdir(deletedPath, err => {
        if (err) {
        }
      })
      fs.mkdir(deletedImagePath, err => {
        if (err) {
        }
      })
      fs.mkdir(deletedMetadataPath, err => {
        if (err) {
        }
      })
    }
    catch (err){
    }
    fs.rename(metaPath, deleteMetadataFilePath, (err) => {
      if (err) throw err;
    });
    fs.rename(imagePath, deleteImageFilePath, (err) => {
      if (err) throw err;
    });
  }

  async function updateMetadata(collectionName, metaFile, content) {
    const metaPath = path.join(__dirname, `data/Collections/${collectionName}/metadata/${metaFile}`)
    fs.writeFile(metaPath, content, err => {
      if (err) {
      }
    }
    )
    return 'Metadata Updated'
  }
  async function getCollectionMetadata(collectionName) {
    const collectionMetadataPath = path.join(__dirname, `data/Collections/${collectionName}/metadata`)
    return new Promise((resolve, rej) => {
      fs.readdir(collectionMetadataPath, function (err, files) {
        files.map(async (filename, i) => {
        dataPath = path.join(collectionMetadataPath,filename)
        data = []
        await fs.readFile(dataPath, function(err, file) {
          nftdata = JSON.parse(file)
          nftdata.filename = filename
          data.push(nftdata)
          if (i === files.length - 1) {resolve(data)}
        })
        })
      })
    })
  }
  async function getCollectionImages(collectionName) {
    const collectionImagesPath = path.join(__dirname, `data/Collections/${collectionName}/images`)
    return new Promise((resolve, rej) => {
      fs.readdir(collectionImagesPath, function (err, files) {
        files.map(async (filename, i) => {
          imagePath = path.join(collectionImagesPath, filename)
          images = {}
          await fs.readFile(imagePath, function (err, file) {
            images[filename] = file
            if (i === files.length - 1) { resolve(images) }
          })
        })
      })
    })
  }
  async function getDeletedMetadata(collectionName) {
    const collectionMetadataPath = path.join(__dirname, `data/Collections/${collectionName}/deleted/metadata`)
    return new Promise((resolve, rej) => {
      fs.readdir(collectionMetadataPath, function (err, files) {
        files.map(async (filename, i) => {
        dataPath = path.join(collectionMetadataPath,filename)
        data = []
        await fs.readFile(dataPath, function(err, file) {
          let nftdata = JSON.parse(file)
          nftdata.filename = filename
          data.push(nftdata)
          if (i === files.length - 1) {resolve(data)}
        })
        })
      })
    })
  }
  async function getDeletedImages(collectionName) {
    const collectionImagesPath = path.join(__dirname, `data/Collections/${collectionName}/deleted/images`)
    return new Promise((resolve, rej) => {
      fs.readdir(collectionImagesPath, function (err, files) {
        files.map(async (filename, i) => {
          imagePath = path.join(collectionImagesPath, filename)
          images = {}
          await fs.readFile(imagePath, function (err, file) {
            images[filename] = file
            if (i === files.length - 1) { resolve(images) }
          })
        })
      })
    })
  }
  async function getCollectionsData() {
    let collectionData = {}
    const collectionsPath = path.join(__dirname, 'data/Collections')
    return new Promise((resolve, rej) => {
      fs.readdir(collectionsPath, function (err, files) {
        files.map((filename, i) => {
          collectionData[filename] = { 'images': [], 'metadata': [] }
          if (i === files.length - 1) { resolve(collectionData) }
        })
      })
    })
  };
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: true,
      titleBarOverlay: {
        color: '#1e1e1e',
        symbolColor: '#B80C09'
      },
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
      }
    })
    mainWindow.loadFile('index.html')
    // mainWindow.webContents.openDevTools()
  }
  app.whenReady().then(() => {
    ipcMain.handle('get-collections-data', getCollectionsData)
    ipcMain.handle('get-collection-images', async (e, arg) => {
      let images = await getCollectionImages(arg)
      return images
    })
    ipcMain.handle('get-collection-metadata', async(e, arg) => {
      let data = await getCollectionMetadata(arg)
      return data
    })
    ipcMain.handle('get-deleted-images', async(e, arg) => {
      let data = await getDeletedImages(arg)
      return data
    })
    ipcMain.handle('get-deleted-metadata', async(e, arg) => {
      let data = await getDeletedMetadata(arg)
      return data
    })
    ipcMain.handle('update-metadata', async(e, collectionName, metaFile, content) => {
      let res = await updateMetadata(collectionName, metaFile, content)
    })
    ipcMain.handle('delete-nft', async(e, collectionName, imageFile, metaFile) => {
      let res = await deleteNFT(collectionName, imageFile, metaFile)
    })
    ipcMain.handle('restore-nft', async(e, collectionName, imageFile, metaFile) => {
      let res = await restoreNFT(collectionName, imageFile, metaFile)
    })
    ipcMain.handle('import-collection', async(e, importCollectionName) => {
      let res = await importCollection(importCollectionName)
      return res
    })
    createWindow()
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

}
startUp()
