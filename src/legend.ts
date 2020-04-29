import State from "./state/state";

const UnselectedText = "Press & Hold to create an atom";
const SelectedText = `
Type to set value; Press CMD+e to evaluate; Press CMD+Backspace to delete
Press Tab to create a child atom; Press Enter to create a sibling atom
`;

export const text =
  () => {
    if (State.findSelectedAtom()) return SelectedText;
    return UnselectedText;
  };
