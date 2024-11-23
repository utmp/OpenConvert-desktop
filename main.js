const path = require('node:path')
const os = require('node:os');
const fs = require('node:fs');
const {app, BrowserWindow,ipcMain,screen,dialog, nativeTheme,shell} = require('electron');
const {exec} = require('child_process');
let custom = "OpenConvert"
const dir = os.homedir()
if(!fs.existsSync(path.join(dir,`${custom}`))){fs.mkdirSync(path.join(dir,`${custom}`))}
let mainWindow,settingWindow;
function createMainWindow(){
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width,height} = primaryDisplay.workAreaSize
    /* you can open mainWindow in external display\\
     --> External display (exaple size: 1280x1024)
    const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })
  console.log(externalDisplay)
  */
     mainWindow = new BrowserWindow({
        icon:'./icons/logo.png',
        minWidth:width/1.5,
        minHeight:height/1.5,
        maxWidth:width,
        maxHeight:height,
        frame:false,
        backgroundColor:'#FFF',
        webPreferences:{
            contextIsolation: true,
            nodeIntegration:true,
            preload:path.join(__dirname,'preload.js')
        }
    })
    
    mainWindow.loadFile(path.join(__dirname,'index.html'))
    mainWindow.on('closed',()=>{mainWindow==null;})
    //mainWindow.webContents.openDevTools(); //--> open dev tools if you want
}
app.whenReady().then(()=>{
    createMainWindow()
    ipcMain.on('open-settings',()=>{settingsWindow()})
})

ipcMain.on("convert-image",(event,image)=>{
    console.log(image)
    for(i=0;i<image.fileLength;i++){
        imageConverter(image.imagepth,image.filename,image.filesize,image.fileExtension)
    }
    shell.openPath(path.join(dir,`${custom}`))
    addData(image.filename,image.filesize)
})
ipcMain.on("convert-video",(event,video)=>{
    for(i=0;i<video.fileLength;i++){
        videoConverter(video.videopath,video.filename,video.filesize,video.fileExtension)
    }
    shell.openPath(path.join(dir,`${custom}`))
    addData(video.filename,video.filesize)
})
ipcMain.on('convert-audio',(event,audio)=>{
    for(i=0;i<audio.fileLength;i++){
        audioConverter(audio.audiopath,audio.filename,audio.filesize,audio.fileExtension)
    }
    shell.openPath(path.join(dir,`${custom}`))
    addData(audio.filename,audio.filesize)
})
ipcMain.on('minimize-window',()=>{
    mainWindow.minimize()
})
ipcMain.on('close-window',()=>{
    mainWindow.close()
})
ipcMain.on('max-window',()=>{
    if(mainWindow.isMaximized()){
        mainWindow.unmaximize()
    }else{
        mainWindow.maximize()
    }
})
ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    customFilePath = result.filePaths[0]
    return result.filePaths[0];
});
//open settings file \\
function settingsWindow(){
     settingWindow = new BrowserWindow({
        width:500,
        height:500,
        webPreferences:{
            preload:path.join(__dirname,'./settings/settings.js')
        }
    })
    settingWindow.loadFile(path.join(__dirname,'./settings/settings.html'))
    settingWindow.setResizable(false);
    settingWindow.on('close',()=>{settingWindow==null})
    settingWindow.setMenu(null)
}
/*
    writeDatabase function
    json based
*/
const dbFilePath = path.join(__dirname,'./db.json')
const readDb = ()=>{
    if(fs.existsSync(dbFilePath)){
        const data = fs.readFileSync(dbFilePath)
        try{
            return JSON.parse(data);
        }catch(error){
            console.log(error)
            return [];
        }
    }else{
        return[]
    }
}
const writeDb = (data)=>{
    fs.writeFileSync(dbFilePath,JSON.stringify(data,null,2))
}
const addData = (fileName,fileSize)=>{
    const db = readDb()
    const newId = db.length > 0 ? db[db.length-1].id+1 : 1;
    const newData = {id:newId,fileName,fileSize}
    db.push(newData);
    writeDb(db);
}
//dark mode\\
ipcMain.handle('dark-mode-toggle',()=>{
    if(nativeTheme.shouldUseDarkColors){
        nativeTheme.themeSource = "light"
    }else{
        nativeTheme.themeSource = "dark"
    }
    return nativeTheme.shouldUseDarkColors
})
ipcMain.handle('dark-mode-system',()=>{
    nativeTheme.themeSource = 'system'
})
// converter functions \\
async function videoConverter(video,filename,filesize,fileExtension){
    const filepath = path.join(dir,`./${custom}/${filename}(1).${fileExtension}`)
    try {
       await exec(`ffmpeg -i "${video}" "${filepath}"`,(err,stdout,stderr)=>{
        if(err){
            throw err;
        }
    })
    } catch (error) {
        throw error;
    }
}
async function imageConverter(image,filename,filesize,fileExtension){
    const filepath = path.join(dir,`./${custom}/${filename}.${fileExtension}`)
    try {
        await exec(`vips copy "${image}" "${filepath}"`,(err,out,outerr)=>{
            if(err){
                throw err;
            }
        })  
    } catch (error) {
        throw error
    }  
}
async function audioConverter(audio,filename,filesize,fileExtension){
    const filepath = path.join(dir,`./${custom}/${filename}.${fileExtension}`)
    try{
        await exec(`ffmpeg -i "${audio}" "${filepath}"`,(err,out,outerr)=>{
            if(err){
                throw err;
            }
        })
    }catch(err){
        throw err;
    }
}