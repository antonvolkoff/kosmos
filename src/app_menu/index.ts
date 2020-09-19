import { remote, ipcRenderer } from "electron";
import { Store } from "@reduxjs/toolkit";
import { ApplicationState } from "../store";
import { actions } from "../interface";
import { send, call } from "../core/actor";

const { dialog } = remote;
const { toggleTranscript } = actions;

export default function AppMenu(store: Store<ApplicationState>) {
  ipcRenderer.on("click-new", () => send("workspace", "new"));

  ipcRenderer.on("click-open", async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({});
      send("workspace", "open", filePaths[0]);
      window.kosmos.core.dispatch(["menu/clicked-open", filePaths[0]]);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
  });

  ipcRenderer.on("click-save", async () => {
    const hasFile = call("workspace", "hasFile");
    if (hasFile) {
      send("workspace", "save");
    } else {
      const { filePath } = await dialog.showSaveDialog({});
      send("workspace", "saveAs", filePath);
    }
  });

  ipcRenderer.on("click-save-as", async () => {
    const { filePath } = await dialog.showSaveDialog({});
    send("workspace", "saveAs", filePath);
    window.kosmos.core.dispatch(["menu/clicked-save-as", filePath]);
  });

  ipcRenderer.on("click-transcript", () => {
    store.dispatch(toggleTranscript());
  });
}
