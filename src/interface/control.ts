import { useState } from "react";
import { html } from "htm/react";

import { State } from "../state";
import PlayIcon from "./play_icon";
import TrashIcon from "./trash_icon";
import CastIcon from "./cast_icon";

interface Props {
  state: State;
}

export default function Control({ state }: Props) {
  const [selectedAtom, setSelectedAtom] = useState(undefined);
  const [connectedToRepl, setConnectedToRepl] = useState(false);

  state.subscribe(() => {
    setSelectedAtom(state.findSelectedAtom());
    setConnectedToRepl(state.connectedToRepl());
  });

  const onEvalClick = (event) => {
    event.preventDefault();
    state.evalSelectedAtom();
  }

  const onDeleteClick = (event) => {
    event.preventDefault();
    state.deleteAtom(selectedAtom);
  }

  return html`
    <div className="control-panel at-top">
      <button className="control-button" disabled=${!selectedAtom} onClick=${onEvalClick}>
        <${PlayIcon} />
      </button>
      <button className="control-button" disabled=${!selectedAtom} onClick=${onDeleteClick}>
        <${TrashIcon} />
      </button>
      <div className="control-separator"></div>
      <button className="control-status" disabled=${!connectedToRepl} title="Connection to REPL">
        <${CastIcon} />
      </button>
    </div>
  `;
};
