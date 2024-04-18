/**
 * index.ts: Mainly responsible for createWindows and handling electron lifecycle events,
 * like app.on('ready').
 */
import { app, BrowserWindow } from 'electron';
import { loadEnvs, readSettings, writeSettings } from './workspace';
import './workspace';

// ************************************************************************************************
// Electron app, window etc
// ************************************************************************************************

export let mainWindow: BrowserWindow;
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 1600,
    width: 1800,
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
  mainWindow.webContents.openDevTools();

  const settings = readSettings();
  writeSettings(settings);
  if (settings.workspace) loadEnvs(settings.workspace);

  mainWindow.setTitle(`Data Story - ${settings.workspace || 'Untitled'}`);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});
