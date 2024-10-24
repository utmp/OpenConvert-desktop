const os = require('node:os');
const path = require('node:path')
const fs = require('node:fs') 
const data = fs.readFileSync(path.join(__dirname,'./db.json'))
let total=0,id=0;
const {contextBridge,ipcRenderer,webUtils} = require('electron');
const pr = new Promise((resolve, reject) => {
    try {
        resolve(JSON.parse(data));
    } catch (error) {
        reject(error);
    }
});
pr.then(
    function(value){
       const db = value
       id = db[db.length - 1].id;
       
db.forEach(data=>{
    total+=data.fileSize;   
})
    },
    function(err){
        console.log(err)
    }
)
contextBridge.exposeInMainWorld('os',{
    homedir:()=>os.homedir()
})
contextBridge.exposeInMainWorld('path',{
    join:(...args)=> path.join(...args)
})
contextBridge.exposeInMainWorld('ipcRenderer',{
    send:(OriginPath,filename,filesize,fileExtension)=> ipcRenderer.send('convert-image',OriginPath,filename,filesize,fileExtension)
})
contextBridge.exposeInMainWorld('convertvideo',{
    video:(OriginPath,filename,filesize,fileExtension)=>ipcRenderer.send('convert-video',OriginPath,filename,filesize,fileExtension)
})
contextBridge.exposeInMainWorld('convertaudio',{
    audio:(OriginPath,filename,filesize,fileExtension)=>ipcRenderer.send('convert-audio',OriginPath,filename,filesize,fileExtension)
})
contextBridge.exposeInMainWorld('webutils',{
    showFilePath:(file)=>{
        const filePath = webUtils.getPathForFile(file)
        return filePath;
    }
})
// settings menu\\
contextBridge.exposeInMainWorld('settings',{
    settings:()=>ipcRenderer.send('open-settings')
})
// total converted file size\\
contextBridge.exposeInMainWorld('convertedTotal',{
    getTotal: () => total,
    getId: () => id
})
//custom title bar
window.addEventListener('DOMContentLoaded',()=>{
    const minizimeBtn = document.getElementById('min-button')
    const maxBtn = document.getElementById('max-button')
    const closeBtn = document.getElementById('close-button')
    const restoreBtn = document.getElementById('restore-button')
    minizimeBtn.addEventListener('click',()=>{
        ipcRenderer.send('minimize-window')
    })
    maxBtn.addEventListener('click',()=>{
        ipcRenderer.send('max-window')
    })
    closeBtn.addEventListener('click',()=>{
        ipcRenderer.send('close-window')
    }) 
})

contextBridge.exposeInMainWorld('darkMode',{
    toggle: ()=> ipcRenderer.invoke('dark-mode-toggle'),
    system:()=> ipcRenderer.invoke('dark-mode-system')
})
