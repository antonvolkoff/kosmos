import * as p5 from "p5";
import { remote, ipcRenderer } from "electron";
import { render } from "react-dom";
import { html } from "htm/react";

import State from "./state/state";
import Transcript from "./components/transcript";
import Control from "./components/control";
import Sketch from "./sketch";
import Keyboard from "./keyboard";

const { dialog } = remote;

ipcRenderer.on('click-new', () => {
  State.newFile();
});
ipcRenderer.on('click-open', () => {
  dialog.showOpenDialog({}).then(result => {
    State.openFile(result.filePaths[0]);
  });
});
ipcRenderer.on('click-save', () => {
  if (State.hasFile()) {
    State.saveFile();
  } else {
    dialog.showSaveDialog({}).then(result => {
      State.saveAsFile(result.filePath);
    });
  }
})
ipcRenderer.on('click-save-as', () => {
  dialog.showSaveDialog({}).then(result => {
    State.saveAsFile(result.filePath);
  });
});
ipcRenderer.on("click-export", () => {
  dialog.showSaveDialog({}).then(result => {
    State.exportAsClojure(result.filePath);
  });
});

State.subscribe(() => {
  document.title = `${State.file().name} - Kosmos`;
});

Keyboard(State);

const canvasPlaceholder = document.getElementById("canvas");
const transcriptPlaceholder = document.getElementById("transcript");
const controlPlaceholder = document.getElementById("control");

new p5(Sketch, canvasPlaceholder);

render(html`<${Transcript} state="${State}" />`, transcriptPlaceholder);
render(html`<${Control} state=${State} />`, controlPlaceholder);
