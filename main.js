const path = require('node:path')
const os = require('node:os');
const fs = require('node:fs');
const {app, BrowserWindow,ipcMain,screen,dialog, nativeTheme,shell} = require('electron');
const {exec} = require('child_process');
const { writeData } = require('./db')
let custom = "Converted-Files"
let pwd = app.getAppPath('directory')
//datatime\\
const now = new Date();
const date = now.toLocaleDateString(); 
const time = now.toLocaleTimeString(); 
//\\
if(!fs.existsSync(path.join(__dirname,`${custom}`))){fs.mkdirSync(path.join(__dirname,`${custom}`))}
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
    shell.openPath(path.join(pwd,`${custom}`))
})
ipcMain.on("convert-video",(event,video)=>{
    for(i=0;i<video.fileLength;i++){
        videoConverter(video.videopath,video.filename,video.filesize,video.fileExtension)
    }
    shell.openPath(path.join(pwd,`${custom}`))
})
ipcMain.on('convert-audio',(event,audio)=>{
    for(i=0;i<audio.fileLength;i++){
        audioConverter(audio.audiopath,audio.filename,audio.filesize,audio.fileExtension)
    }
    shell.openPath(path.join(pwd,`${custom}`))
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
    const filepath = path.join(pwd,`./${custom}/${filename}(1).${fileExtension}`)
    try {
       await exec(`ffmpeg -i "${video}" "${filepath}"`,(err,stdout,stderr)=>{
        if(err){
            throw err;
        }
    })
    } catch (error) {
        throw error;
    }
    writeData(`${date}${time}`,filesize,filename,filepath)
}
async function imageConverter(image,filename,filesize,fileExtension){
    const filepath = path.join(pwd,`./${custom}/${filename}.${fileExtension}`)
    try {
        await exec(`vips copy "${image}" "${filepath}"`,(err,out,outerr)=>{
            if(err){
                throw err;
            }
        })  
    } catch (error) {
        throw error
    }
    writeData(`${date}${time}`,filesize,filename,filepath)
}
async function audioConverter(audio,filename,filesize,fileExtension){
    const filepath = path.join(pwd,`./${custom}/${filename}.${fileExtension}`)
    try{
        await exec(`ffmpeg -i "${audio}" "${filepath}"`,(err,out,outerr)=>{
            if(err){
                throw err;
            }
        })
    }catch(err){
        throw err;
    }
    writeData(`${date}${time}`,filesize,filename,filepath)
}