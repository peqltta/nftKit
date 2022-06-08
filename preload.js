const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  getCollectionsData: () => ipcRenderer.invoke('get-collections-data'),
  getCollectionImages: (selection) => ipcRenderer.invoke('get-collection-images',selection),
  getCollectionMetadata: (selection) => ipcRenderer.invoke('get-collection-metadata', selection),
  updateMetadata: (collectionName, metaFile, content) => ipcRenderer.invoke('update-metadata', collectionName, metaFile, content)
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
