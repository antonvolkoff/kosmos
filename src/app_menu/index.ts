import { remote, ipcRenderer } from "electron";
const { dialog } = remote;

import { State } from "../state";

export default function AppMenu(state: State) {
  ipcRenderer.on('click-new', () => {
    state.newFile();
  });

  ipcRenderer.on('click-open', () => {
    dialog.showOpenDialog({}).then(result => {
      state.openFile(result.filePaths[0]);
    });
  });

  ipcRenderer.on('click-save', () => {
    if (state.hasFile()) {
      state.saveFile();
    } else {
      dialog.showSaveDialog({}).then(result => {
        state.saveAsFile(result.filePath);
      });
    }
  });

  ipcRenderer.on('click-save-as', () => {
    dialog.showSaveDialog({}).then(result => {
      state.saveAsFile(result.filePath);
    });
  });

  ipcRenderer.on("click-export", () => {
    dialog.showSaveDialog({}).then(result => {
      state.exportAsClojure(result.filePath);
    });
  });
}
