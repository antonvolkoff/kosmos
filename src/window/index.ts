import { State } from "../state";

export default function Window(state: State) {
  state.subscribe(() => {
    document.title = `${state.file().name} - Kosmos`;
  });
}