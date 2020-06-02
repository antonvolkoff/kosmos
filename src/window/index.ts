import { start } from "../core/actor";

interface WindowState {
  title: string;
}

const Window = {
  init(): WindowState {
    document.title = "Kosmos";
    return { title: "Kosmos" };
  },

  changeTitle(state, newTitle: string): WindowState {
    document.title = newTitle;
    return { title: newTitle };
  },
}

start(Window, "window");
