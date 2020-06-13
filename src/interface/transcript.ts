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

const splitLines = (value: string) => {
  return value
    .split("\n")
    .map((line, idx) => html`<div key=${idx}>${line}</div>`);
}

function Stdout({ value }) {
  return html`<div className="entry-stdout">${value}</div>`;
}

function Stderr({ value }) {
  return html`<div className="entry-error">${value}</div>`;
}

function Value({ value }) {
  return html`<div className="entry-value">${value}</div>`;
}

function EntriesList({ entries }: { entries: EvalResult[] }) {
  const items = entries.map(entry => {
    const { id, stderr, stdout, value } = entry;
    return html`
      <div className="transcript-list-item" key=${id.toString()}>
        <${Stdout} value=${splitLines(stdout)} />
        <${Stderr} value=${splitLines(stderr)} />
        <${Value} value=${splitLines(value)} />
      </div>
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
