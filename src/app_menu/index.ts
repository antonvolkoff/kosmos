import { remote, ipcRenderer } from "electron";
import { Store } from "redux";
import { createNewFile, openFile, saveFile, saveFileAs, exportToFile } from "../store";
const { dialog } = remote;

export default function AppMenu(store: Store) {
  ipcRenderer.on('click-new', () => {
    store.dispatch(createNewFile());
  });

  ipcRenderer.on('click-open', () => {
    dialog.showOpenDialog({}).then(result => {
      const path = result.filePaths[0];
      store.dispatch(openFile(path));
    });
  });

  ipcRenderer.on('click-save', () => {
    const hasFile = store.getState().hasFile;

    if (hasFile) {
      store.dispatch(saveFile());
    } else {
      dialog.showSaveDialog({}).then(result => {
        const path = result.filePath;
        store.dispatch(saveFileAs(path));
      });
    }
  });

  ipcRenderer.on('click-save-as', () => {
    dialog.showSaveDialog({}).then(result => {
      const path = result.filePath;
      store.dispatch(saveFileAs(path));
    });
  });

  ipcRenderer.on("click-export", () => {
    dialog.showSaveDialog({}).then(result => {
      const path = result.filePath;
      store.dispatch(exportToFile(path));
    });
  });
}
