import { useState, useEffect } from "react";
import { html } from "htm/react";
import { State } from "./state";

interface Props {
  state: State;
}

function PlayIcon() {
  return html`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  `;
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
