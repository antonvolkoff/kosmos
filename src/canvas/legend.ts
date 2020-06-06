import { Store } from "redux";
import { ApplicationState } from "../store";

const UnselectedText = "Double click to create a node";
const SelectedText = `
Type to set value; Press CMD+e to evaluate; Press CMD+Backspace to delete
Press Tab to create a child node; Press CMD+Enter to create a sibling atom
`;

export const text =
  (store: Store<ApplicationState>) => {
    if (store.getState().canvas.selectedAtomId) return SelectedText;
    return UnselectedText;
  };
