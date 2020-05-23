import { useState } from "react";
import { html } from "htm/react";
import { EvalResult } from "../repl";
import { Store } from "redux";
import { ApplicationState } from "../store";
import { getEntries } from "../store/defaultReducer";
import { getTranscript } from "./selectors";

interface Props {
  store: Store<ApplicationState>;
}

function EntryItemPart({ value, className }) {
  let multilineValue = value.split("\n").map(line => html`<div>${line}</div>`);
  return html`<div className=${className}>${multilineValue}</div>`;
}

function EntryItem({ stderr, stdout, value }: EvalResult) {
  return html`
    <div className="transcript-list-item">
      <${EntryItemPart} value=${stdout} className="entry-stdout" />
      <${EntryItemPart} value=${stderr} className="entry-error" />
      <${EntryItemPart} value=${value} className="entry-value" />
    </div>
  `;
}

function EntriesList({ entries }: { entries: EvalResult[] }) {
  const items = entries.map(({ stderr, stdout, value }) => {
    return html`
      <${EntryItem} stdout=${stdout} stderr=${stderr} value=${value} />
    `;
  });

  return html`<div className="transcript-list">${items}</div>`;
}

export default function Transcript({ store }: Props) {
  const [entries, setEntries] = useState([] as EvalResult[]);
  const [show, setShow] = useState(false);

  store.subscribe(() => {
    setEntries(getEntries(store.getState()));
    setShow(getTranscript(store.getState()).show);
  });

  if (!show) {
    return html`<div></div>`;
  } else {
    return html`
      <aside>
        <nav>Transcript</nav>
        <div className="transcript">
          <div className="transcript-wrapper">
            <${EntriesList} entries=${entries} />
          </div>
        </div>
      </aside>
    `;
  }
};
