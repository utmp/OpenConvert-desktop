
import { app, shell, BrowserWindow, ipcMain, dialog,session,screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { checkPluginInstalled, getSupportedFormats,documentConvert,isFormatSupported } from './initPlugin'
import {db,saveConversion,getAllConversions} from './db'
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const {width,height} = primaryDisplay.workAreaSize  
  const mainWindow = new BrowserWindow({
    minWidth: width/2,
    minHeight: height/1.5,
    maxHeight: height,
    maxWidth: width,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Handle dialog to select directory
  ipcMain.handle('dialog:selectDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select output directory'
    })
    if (canceled) return null
    return filePaths[0]
  })
  
  // Handle image processing with Sharp
ipcMain.handle('process:image', async (_, { filepath, name, options, savePath }) => {
  try {
    let pipeline = sharp(filepath);
    
    // Resize if dimensions provided
    if (options.width && options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: sharp.fit.contain,
        withoutEnlargement: true
      });
    }
    
    // Set quality
    if (options.format === 'webp') {
      pipeline = pipeline.webp({ quality: options.quality });
    } else if (options.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: options.quality });
    } else if (options.format === 'png') {
      pipeline = pipeline.png({ quality: options.quality });
    } else if (options.format === 'avif') {
      pipeline = pipeline.avif({ quality: options.quality });
    }else if (options.format === 'tiff') {
      pipeline = pipeline.tiff({ quality: options.quality });
    }else if (options.format === 'heif') {
      pipeline = pipeline.heif({ quality: options.quality });
    }else if (options.format === 'jxl') {
      pipeline = pipeline.jxl({ quality: options.quality });
    }
    // control if output type is tile    
    if(options.format === 'tile'){
      options.format = 'zip'
    }
    // Generate output filename
    const parsedName = path.parse(name);
    const outputName = `${parsedName.name}.${options.format}`;
    const outputPath = path.join(savePath, outputName);
    
    // Process and save
    await pipeline.toFile(outputPath);
    
    return {
      success: true,
      message: 'File processed successfully',
      outputPath
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
});
  
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
// handle document conversion
ipcMain.handle("document:convert", async (event, {filename,inputPath,outputPath, options}) => {
  try {
    const isInstalled = await checkPluginInstalled();
    if (!isInstalled) {
      return {
        success: false,
        message: 'MuPDF is not installed. Please install it from Plugins page'
      };
    }

    // Validate input format
    const inputFormat = path.extname(inputPath).slice(1);
    if (!isFormatSupported(inputFormat, 'input')) {
      return {
        success: false,
        message: `Unsupported input format: ${inputFormat}`
      };
    }

    // Validate output format
    const outputFormat = options?.format || getDefaultOutputFormat(inputFormat);
    if (!isFormatSupported(outputFormat, 'output')) {
      return {
        success: false,
        message: `Unsupported output format: ${outputFormat}`
      };
    }

    // Convert document
    const result = await documentConvert(filename,inputPath,outputPath, {
      format: outputFormat,
      ...options
    });

    return result;
  } catch (error) {
    console.error('Document conversion error:', error);
    return {
      success: false,
      message: error.message
    };
  }
});
ipcMain.handle('document:get-formats',async()=>{
  return getSupportedFormats();
})
//check if plugin is installed
ipcMain.handle('plugin:check-installed',async (event,pluginId)=>{
  const pluginPath = path.join(app.getAppPath(),'out','Plugins',`${pluginId}.exe`)
  return fs.existsSync(pluginPath)
})

// plugin installation
ipcMain.handle('plugin:install',async(event,{url,id})=>{
  const sess = session.defaultSession;
  return new Promise((resolve, reject) => {
   
    
    session.defaultSession.on('will-download', (event, item) => {
      const PLUGINS_DIR = path.join(app.getAppPath(),'out', 'Plugins')
      
      // Create plugins directory if it doesn't exist
      if (!fs.existsSync(PLUGINS_DIR)) {
        fs.mkdirSync(PLUGINS_DIR, { recursive: true })
      }
      
      const pluginPath = path.join(PLUGINS_DIR, `${id}.exe`)
      item.setSavePath(pluginPath)

      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          reject(new Error('Download interrupted'))
        }
      })

      item.once('done', (event, state) => {
        if (state === 'completed') {
          resolve(true)
        } else {
          reject(new Error(`Download failed with state: ${state}`))
        }
      })
    })
     sess.downloadURL(url)
  })
})
// delete plugin
ipcMain.handle('plugin:uninstall', async (event,pluginId)=>{
  const pluginPath = path.join(app.getAppPath(),'out','Plugins',`${pluginId}.exe`)
  try{
    if (fs.existsSync(pluginPath)){
      await fs.promises.unlink(pluginPath)
      return true
    }
  }catch(error){
    console.error('Failed to delete plugin: ',error)
    throw error
  }
})
//database operations
ipcMain.handle('db:save-history',async(_,conversionData)=>{
  try {
    const id = await saveConversion(
      conversionData.filename,
      conversionData.format,
      conversionData.resolution || 'NaN',
      conversionData.size
    )
    return { success: true, id }
  } catch (error) {
    console.error('Error saving conversion:', error)
    return { success: false, error: error.message }
  }
})
ipcMain.handle('db:get-data',async ()=>{
  try {
    const conversions = await getAllConversions()
    return { success: true, conversions }
  } catch (error) {
    console.error('Error getting conversions:', error)
    return { success: false, error: error.message }
  }
})