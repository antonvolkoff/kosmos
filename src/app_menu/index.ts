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
    const { filePaths } = await dialog.showOpenDialog({});
    send("workspace", "open", filePaths[0]);
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
  });

  ipcRenderer.on("click-transcript", () => {
    store.dispatch(toggleTranscript());
  });
}
