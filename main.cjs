const { app, BrowserWindow, desktopCapturer, session, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, bypassCSP: true, corsEnabled: true } }
]);

let mainWindow;

function createWindow() {
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#000000',
    title: 'Delta7 Workstation Console',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('app://-/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const additionalData = { myKey: 'delta7synth-instance' };
const gotTheLock = app.requestSingleInstanceLock(additionalData);

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Intercept app:// requests and serve from dist directory
    protocol.handle('app', (request) => {
      const url = new URL(request.url);
      let relativePath = url.pathname;
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
      }
      if (!relativePath || relativePath === '/') {
        relativePath = 'index.html';
      }
      const absolutePath = path.join(__dirname, 'dist', relativePath);
      return net.fetch(pathToFileURL(absolutePath).toString());
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
      desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
        const source = sources.find(s => s.id.startsWith('screen:')) || sources[0];
        callback({
          video: source,
          audio: 'loopback'
        });
      });
    });

    // Grant all permissions (audioCapture, midi, etc.) unconditionally to the renderer.
    // This resolves permission issues where Chromium requests 'audioCapture' or other
    // platform-specific names that aren't mapped to standard 'media' strings.
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      callback(true);
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      return true;
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
