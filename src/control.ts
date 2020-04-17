import { useState } from "react";
import { html } from "htm/react";

import { State } from "./state";
import PlayIcon from "./play_icon";

interface Props {
  state: State;
}

export default function Control({ state }: Props) {
  const [selectedAtom, setSelectedAtom] = useState(undefined);

  state.subscribe(() => {
    setSelectedAtom(state.findSelectedAtom());
  });

  const onClick = (event) => {
    event.preventDefault();
    state.evalAtom(selectedAtom);
  }

  return html`
    <div className="control-panel at-top">
      <button className="control-button" disabled=${!selectedAtom} onClick=${onClick}>
        <${PlayIcon} />
      </button>
    </div>
  `;
};
