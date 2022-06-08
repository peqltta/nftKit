// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs');
let mainWindow;
async function startUp() {
  async function updateMetadata(collectionName, metaFile, content) {
    const metaPath = path.join(__dirname, `data/Collections/${collectionName}/metadata/${metaFile}`)
    fs.writeFile(metaPath, content, err => {
      if (err) {
        console.log(err);
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
          data.push(JSON.parse(file))
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
    ipcMain.handle('update-metadata', async(e, collectionName, metaFile, content) => {
      let res = await updateMetadata(collectionName, metaFile, content)
      console.log(res)
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
