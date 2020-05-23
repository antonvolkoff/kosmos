import { Store } from "@reduxjs/toolkit";
import { ApplicationState } from "../store";

export default function Window(store: Store<ApplicationState>) {
  store.subscribe(() => {
    const state = store.getState();
    const title = `${state.default.file.filename} - Kosmos`;
    document.title = title;
  });
}
