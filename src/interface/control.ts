import { useState } from "react";
import { html } from "htm/react";
import { Store } from "redux";

import { ApplicationState } from "../store";
import { deleteAtom, evalSelectedAtom } from "../store/defaultReducer";
import { selectors } from "../canvas";
import PlayIcon from "./play_icon";
import TrashIcon from "./trash_icon";
import CastIcon from "./cast_icon";

const { getSelectedAtomId } = selectors;

interface Props {
  store: Store<ApplicationState>;
}

export default function Control({ store }: Props) {
  const [selectedAtomId, setSelectedAtomId] = useState(null);
  const [connectedToRepl, setConnectedToRepl] = useState(false);

  store.subscribe(() => {
    setSelectedAtomId(getSelectedAtomId(store.getState()));
    setConnectedToRepl(store.getState().default.connectedToRepl);
  });

  const onEvalClick = (event) => {
    event.preventDefault();
    store.dispatch(evalSelectedAtom());
  }

  const onDeleteClick = (event) => {
    event.preventDefault();
    store.dispatch(deleteAtom(selectedAtomId));
  }

  return html`
    <div className="control-panel at-top">
      <button className="control-button" disabled=${!selectedAtomId} onClick=${onEvalClick}>
        <${PlayIcon} />
      </button>
      <button className="control-button" disabled=${!selectedAtomId} onClick=${onDeleteClick}>
        <${TrashIcon} />
      </button>
      <div className="control-separator"></div>
      <button className="control-status" disabled=${!connectedToRepl} title="Connection to REPL">
        <${CastIcon} />
      </button>
    </div>
  `;
};
