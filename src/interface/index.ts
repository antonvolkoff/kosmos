import { render } from "react-dom";
import { html } from "htm/react";

import { State } from "../state";
import Transcript from "./transcript";
import Control from "./control";

export default function Interface(state: State) {
  const transcriptPlaceholder = document.getElementById("transcript");
  const controlPlaceholder = document.getElementById("control");

  render(html`<${Transcript} state="${state}" />`, transcriptPlaceholder);
  render(html`<${Control} state=${state} />`, controlPlaceholder);
}