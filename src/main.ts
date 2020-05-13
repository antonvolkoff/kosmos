import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';

let win: BrowserWindow;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile("index.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
  .then(() => { return installExtension(REDUX_DEVTOOLS) })
  .then((name) => console.log(`Added Extension:  ${name}`))
  .then(() => { createWindow(); })
  .catch((err) => console.log('An error occurred: ', err));

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let template: MenuItemConstructorOptions[] = [
  // { role: 'appMenu' },
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      {
        label: "New",
        click() {
          win.webContents.send("click-new");
        },
      },
      { type: "separator" },
      {
        label: "Open",
        click() {
          win.webContents.send("click-open");
        },
      },
      { type: "separator" },
      {
        label: "Save",
        click() {
          win.webContents.send("click-save");
        },
      },
      {
        label: "Save As",
        click() {
          win.webContents.send("click-save-as");
        },
      },
      { type: "separator" },
      {
        label: "Export",
        click() {
          win.webContents.send("click-export");
        },
      },
      { type: "separator" },
      { role: "close" },
    ]
  },
];

const editMenu: MenuItemConstructorOptions = {
  label: 'Edit',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'pasteAndMatchStyle' },
    { role: 'delete' },
    { role: 'selectAll' },
    { type: 'separator' },
  ]
};

const viewMenu: MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'reload' },
    { role: 'forceReload' },
    { role: 'toggleDevTools' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  ]
};

const windowMenu: MenuItemConstructorOptions = {
  label: 'Window',
  submenu: [
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' },
    { type: 'separator' },
    { role: 'window' }
  ]
};

if (!app.isPackaged) {
  template.push(editMenu);
  template.push(viewMenu);
  template.push(windowMenu);
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
