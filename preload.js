const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  getCollectionsData: () => ipcRenderer.invoke('get-collections-data'),
  getCollectionImages: (selection) => ipcRenderer.invoke('get-collection-images',selection),
  getCollectionMetadata: (selection) => ipcRenderer.invoke('get-collection-metadata', selection),
  getDeletedImages: (selection) => ipcRenderer.invoke('get-deleted-images',selection),
  getDeletedMetadata: (selection) => ipcRenderer.invoke('get-deleted-metadata', selection),
  deleteNFT: (collectionName, imageFile, metaFile) => ipcRenderer.invoke('delete-nft', collectionName, imageFile, metaFile),
  restoreNFT: (collectionName, imageFile, metaFile) => ipcRenderer.invoke('restore-nft', collectionName, imageFile, metaFile),
  updateMetadata: (collectionName, metaFile, content) => ipcRenderer.invoke('update-metadata', collectionName, metaFile, content),
  importCollection: (importCollectionName) => ipcRenderer.invoke('import-collection', importCollectionName),
})
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
