import { Store } from "redux";

export default function Window(store: Store) {
  store.subscribe(() => {
    const state = store.getState();
    const title = `${state.file.filename} - Kosmos`;
    document.title = title;
  });
}