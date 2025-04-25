
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
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
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
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
// In your main process
ipcMain.handle('process:image', async (_, { filepath, name, options, savePath }) => {
  console.log(filepath)
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.