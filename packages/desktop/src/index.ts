import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { Application, coreNodeProvider } from '@data-story/core';
import { nodeJsProvider, SocketServer } from '@data-story/nodejs';
import dotenv from 'dotenv';
import path from 'path';
import fsAsync from 'fs/promises';
import fs from 'fs';
import os from 'os';
import { hubspotProvider } from '@data-story/hubspot';
import { IpcResult } from './types';

// ************************************************************************************************
// Electron app, window etc
// ************************************************************************************************

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

ipcMain.handle('save-diagram', async(event, jsonData: string): Promise<IpcResult> => {
  const result: IpcResult = {
    data: '',
    isSuccess: false,
  };

  try {
    // Show the save dialog
    const file = await dialog.showSaveDialog({
      title: 'Save your Diagram JSON',
      defaultPath: path.join(app.getPath('documents'), 'diagram.json'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!file.canceled && file.filePath) {
      await fsAsync.writeFile(file.filePath, jsonData);
      result.isSuccess = true;
    }

    return result;
  } catch(err) {
    result.data = err;
    return result;
  }
});


ipcMain.handle('open-diagram', async(): Promise<IpcResult> => {
  const result: IpcResult = {
    data: '{}',
    isSuccess: false,
  }
  try {
    const file = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON', extensions: ['json'] }
      ]
    });

    if (!file.canceled && file.filePaths.length > 0) {
      result.data = await fsAsync.readFile(file.filePaths[0], 'utf8');
      result.isSuccess = true;
    }
    return result;
  } catch(err) {
    result.data = err;
    return result;
  }
});

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // Modify the Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          'default-src \'self\' \'unsafe-inline\' data:; ' +
          'script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' ws://localhost:3100; ' +
          'connect-src \'self\' ws://localhost:3100'
        ]
      }
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  const settings = readSettings();
  writeSettings(settings);
  if (settings.workspace) loadEnvs(settings.workspace);
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const dataStory = new Application();

dataStory.register([
  coreNodeProvider,
  nodeJsProvider,
  hubspotProvider,
]);

dataStory.boot();

const server = new SocketServer({
  app: dataStory,
  port: 3100
})

server.start();

// ************************************************************************************************
// DataStory Settings
// ************************************************************************************************
const settingsFilePath = path.join(os.homedir(), '.data-story.json');

function readSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const rawSettings = fs.readFileSync(settingsFilePath).toString();
      return JSON.parse(rawSettings);
    }
  } catch(err) {
    console.error('Error reading settings file:', err);
  }

  return {}; // Default settings or empty object
}

function writeSettings(settings: Record<string, any>) {
  try {
    const settingsString = JSON.stringify(settings, null, 2); // Pretty print
    fs.writeFileSync(settingsFilePath, settingsString);
    console.log('Saved settings!')
  } catch(err) {
    console.error('Error writing settings file:', err);
  }
}


function loadEnvs(workspacePath: string) {
  const envPath = path.join(workspacePath, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Environment variables loaded from:', envPath);
  } else {
    console.log('.env file not found in workspace:', workspacePath);
  }
}
