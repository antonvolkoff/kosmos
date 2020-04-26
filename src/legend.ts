import State from "./state/state";

const UnselectedText = "Press & Hold to create an atom";
const SelectedText = "Type to set value; Press & Hold to drag; Press Enter to evaluate";
const DraggingState = "Click to release; Press Backspace to delete";

export const text =
  () => {
    if (State.findDraggingAtom()) return DraggingState;
    if (State.findSelectedAtom()) return SelectedText;
    return UnselectedText;
  };
