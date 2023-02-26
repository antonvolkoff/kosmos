import * as Mousetrap from "mousetrap";
import { ApplicationState } from "../store";
import {
  deleteAtom as deleteAtomAction, addAtom, connectAtoms, childrenSelector,
  evalSelectedAtom, parentSelector, deepChildrenSelector, deleteEdge
} from "../store/defaultReducer";
import { buildNodeGeometry } from "../canvas/node_geometry";
import { createAtom } from "../store/atom";
import { nearestGridPoint } from "../canvas/grid";
import { actions, selectors } from "../canvas";
import { actions as interfaceActions } from "../interface";
import { Store } from "redux";
import { send, call } from "../core/actor";
import { dialog } from "electron";

const { select, unselect, changeMode } = actions;
const { toggleTranscript } = interfaceActions;
const { getSelectedAtom, getMode, getSelectedEdgeId } = selectors;

export default function Keyboard(store: Store<ApplicationState>) {
  let state = store.getState();
  let mode = getMode(store.getState());
  let selectedAtom = getSelectedAtom(store.getState());
  let selectedEdgeId = getSelectedEdgeId(store.getState());

  store.subscribe(() => {
    state = store.getState();
    mode = getMode(store.getState());
    selectedAtom = getSelectedAtom(store.getState());
    selectedEdgeId = getSelectedEdgeId(store.getState());
  });

  const standardAtomOffset = 40;
  const evaluateAtom = () => store.dispatch(evalSelectedAtom());

  const deleteSelectedAtom = () => {
    const parent = parentSelector(state.default, selectedAtom.id);
    store.dispatch(deleteAtomAction(selectedAtom.id));
    if (parent) store.dispatch(select(parent.id));
  };

  const deleteSelectedEdge = () => store.dispatch(deleteEdge(selectedEdgeId));

  const deleteSelectedElement = (event) => {
    if (selectedAtom) {
      event.preventDefault();
      deleteSelectedAtom();
    }

    if (selectedEdgeId) {
      event.preventDefault();
      deleteSelectedEdge();
    }
  };

  const createChildAtom = (event) => {
    if (!selectedAtom) return;

    event.preventDefault();

    const children = deepChildrenSelector(state.default, selectedAtom.id);
    const bottomAtom = children[children.length - 1];

    const width = buildNodeGeometry(selectedAtom).border.width + standardAtomOffset;
    const height = bottomAtom ? bottomAtom.y - selectedAtom.y + standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: selectedAtom.x + width, y: selectedAtom.y + height });
    const child = createAtom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(selectedAtom.id, child.id));
    store.dispatch(select(child.id));
  };
  const handleCmdEnter = (event) => {
    if (!selectedAtom) return;

    event.preventDefault();

    const parent = parentSelector(state.default, selectedAtom.id);
    const children = deepChildrenSelector(state.default, parent.id);
    const bottomAtom = children[children.length - 1];

    const height = bottomAtom ? standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: selectedAtom.x, y: bottomAtom.y + height });
    const child = createAtom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(parent.id, child.id));
    store.dispatch(select(child.id));
  };

  const handleEsc = () => {
    if (!selectedAtom) return;

    switch (mode) {
      case "edit":
        store.dispatch(changeMode("ready"));
        break;
      case "enter":
        store.dispatch(changeMode("ready"));
        break;
      case "ready":
        store.dispatch(unselect());
        break;
    }
  };

  const handleEnter = () => {
    if (!selectedAtom) return;

    switch (mode) {
      case "edit":
        break;
      case "enter":
        break;
      case "ready":
        store.dispatch(changeMode("edit"));
        break;
    }
  };

  const moveToParent = (event) => {
    if (!selectedAtom) return;

    event.preventDefault();
    const parent = parentSelector(state.default, selectedAtom.id);
    if (parent) store.dispatch(select(parent.id));
  };
  const moveToChild = () => {
    if (!selectedAtom) return;

    const child = childrenSelector(state.default, selectedAtom.id)[0];
    if (child) store.dispatch(select(child.id));
  };
  const moveToNextSibling = () => {
    if (!selectedAtom) return;

    const parent = parentSelector(state.default, selectedAtom.id);
    if (!parent) return;

    const children = childrenSelector(state.default, parent.id);
    const myIndex = children.findIndex(sibling => sibling.id == selectedAtom.id);
    const gotoAtom = children[myIndex + 1];
    if (gotoAtom) store.dispatch(select(gotoAtom.id));
  };
  const moveToPreviousSibling = () => {
    if (!selectedAtom) return;

    const parent = parentSelector(state.default, selectedAtom.id);
    if (!parent) return;

    const children = childrenSelector(state.default, parent.id);
    const myIndex = children.findIndex(sibling => sibling.id == selectedAtom.id);
    const gotoAtom = children[myIndex - 1];
    if (gotoAtom) store.dispatch(select(gotoAtom.id));
  };

  const saveFile = async () => {
    const hasFile = call("workspace", "hasFile");
    if (hasFile) {
      send("workspace", "save");
    } else {
      const { filePath } = await dialog.showSaveDialog({});
      send("workspace", "saveAs", filePath);
    }
  };

  const openFile = async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ["openFile", "showHiddenFiles"],
      });
      send("workspace", "open", filePaths[0]);
      window.kosmos.api.dispatch(["keyboard/open-file", filePaths[0]]);
    } catch (error) {
      console.log(error);
    }
  };

  const copy = async (e) => true;

  const paste = async (e) => true;

  Mousetrap.bind("command+e", evaluateAtom);
  Mousetrap.bind("command+backspace", deleteSelectedElement);
  Mousetrap.bind("tab", createChildAtom);
  Mousetrap.bind("command+enter", handleCmdEnter);
  Mousetrap.bind("esc", handleEsc);
  Mousetrap.bind("enter", handleEnter);
  Mousetrap.bind("option+left", moveToParent);
  Mousetrap.bind("option+right", moveToChild);
  Mousetrap.bind("option+down", moveToNextSibling);
  Mousetrap.bind("option+up", moveToPreviousSibling);
  Mousetrap.bind("command+s", saveFile);
  Mousetrap.bind("command+o", openFile);
  Mousetrap.bind("command+c", copy);
  Mousetrap.bind("command+v", paste);

  Mousetrap.bind("command+shift+t", () => {
    store.dispatch(toggleTranscript());
  });
}
