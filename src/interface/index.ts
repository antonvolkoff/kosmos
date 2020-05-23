import { render } from "react-dom";
import { html } from "htm/react";

import Transcript from "./transcript";
import Control from "./control";
import { Store } from "redux";
import { ApplicationState } from "../store";
import { reducer, actions, middlewares } from "./interfaceReducer";
import * as selectors from "./selectors";

export { reducer, actions, middlewares, selectors };

export default function Interface(store: Store<ApplicationState>) {
  const transcriptPlaceholder = document.getElementById("transcript");
  const controlPlaceholder = document.getElementById("control");

  render(html`<${Transcript} store="${store}" />`, transcriptPlaceholder);
  render(html`<${Control} store=${store} />`, controlPlaceholder);
}
