import { app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from "electron";
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';

installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile("../index.html")

  // Open the DevTools.
  // win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

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

// const template : MenuItemConstructorOptions[] = [
//   { role: "appMenu" },
//   // { role: "fileMenu" },
//   {
//     label: "File",
//     submenu: [
//       {
//         label: "Open...",
//         click: () => {
//           dialog.showOpenDialog({ properties: ['openFile'] }).then(value => {
//             console.log(value.filePaths);
//           });
//         },
//       },
//       { label: "Save" },
//       { role: "close" },
//     ],
//   },
//   { role: "editMenu" },
//   { role: "windowMenu" },
// ];
// const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
