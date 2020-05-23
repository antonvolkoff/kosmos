import { remote, ipcRenderer } from "electron";
import { Store } from "@reduxjs/toolkit";
import { ApplicationState } from "../store";
import {
  createNewFile, openFile, saveFile, saveFileAs, exportToFile, getHasFile
} from "../store/defaultReducer";
const { dialog } = remote;

export default function AppMenu(store: Store<ApplicationState>) {
  let hasFile: boolean = false;

  const updateLocalState = () => {
    hasFile = getHasFile(store.getState());
  };
  updateLocalState();
  store.subscribe(updateLocalState);

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
