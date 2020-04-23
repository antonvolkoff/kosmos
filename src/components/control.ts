import { useState } from "react";
import { html } from "htm/react";

import { State } from "../state/state";
import PlayIcon from "./play_icon";
import TrashIcon from "./trash_icon";

interface Props {
  state: State;
}

export default function Control({ state }: Props) {
  const [selectedAtom, setSelectedAtom] = useState(undefined);

  state.subscribe(() => {
    setSelectedAtom(state.findSelectedAtom());
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
    </div>
  `;
};
