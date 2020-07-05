import { useState } from "react";
import { html } from "htm/react";
import { Store } from "redux";

import { ApplicationState } from "../store";
import { deleteAtom, evalSelectedAtom, deleteEdge } from "../store/defaultReducer";
import { selectors as canvasSelectors } from "../canvas";
import PlayIcon from "./play_icon";
import TrashIcon from "./trash_icon";
import CastIcon from "./cast_icon";
import BookIcon from "./book_icon";
import { actions } from "./interfaceReducer";

const { getSelectedAtomId, getSelectedEdgeId } = canvasSelectors;
const { toggleTranscript } = actions;

interface Props {
  store: Store<ApplicationState>;
}

export default function Control({ store }: Props) {
  const [selectedAtomId, setSelectedAtomId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [connectedToRepl, setConnectedToRepl] = useState(false);

  store.subscribe(() => {
    setSelectedAtomId(getSelectedAtomId(store.getState()));
    setSelectedEdgeId(getSelectedEdgeId(store.getState()));
    setConnectedToRepl(store.getState().default.connectedToRepl);
  });

  const onEvalClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    store.dispatch(evalSelectedAtom());
  }

  const onDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (selectedAtomId) store.dispatch(deleteAtom(selectedAtomId));
    if (selectedEdgeId) store.dispatch(deleteEdge(selectedEdgeId));
  }

  const onTranscriptClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    store.dispatch(toggleTranscript());
  };

  const onPanelClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  }

  return html`
    <div className="control-panel at-top" onClick=${onPanelClick}>
      <button className="control-button"
              disabled=${!selectedAtomId}
              onClick=${onEvalClick}>
        <${PlayIcon} />
      </button>
      <button className="control-button"
              disabled=${!selectedAtomId && !selectedEdgeId}
              onClick=${onDeleteClick}>
        <${TrashIcon} />
      </button>
      <div className="control-separator"></div>
      <button className="control-status"
              disabled=${!connectedToRepl}
              title="Connection to REPL">
        <${CastIcon} />
      </button>
      <div className="control-separator"></div>
      <button className="control-status"
              title="Transcript"
              onClick=${onTranscriptClick}>
        <${BookIcon} />
      </button>
    </div>
  `;
};
