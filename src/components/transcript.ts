import { Component, createRef } from "react";
import { html } from "htm/react";
import { State } from "../state/state";

type TranscriptProps = {
  state: State;
};

type TranscriptState = {
  entries: string[];
  lastEntry: string;
};

const last = (results: string[]): string => {
  return results[results.length - 1] || "";
};

const propsToState = (props: TranscriptProps): TranscriptState => {
  return { entries: props.state.entries(), lastEntry: last(props.state.entries()) };
};

export default class Transcript extends Component<TranscriptProps, TranscriptState> {
  private lastEntryRef = createRef();

  constructor(props: TranscriptProps) {
    super(props);
    this.state = propsToState(props);
  }

  componentDidMount() {
    this.props.state.subscribe(() => {
      this.setState(propsToState(this.props));
    });
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    (this.lastEntryRef.current as any).scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    return html`
      <div className="transcript-wrapper">
        <div className="transcript-list">
          ${this.renderEntries()}
          ${this.renderLastEntry()}
        </div>
      </div>
    `;
  }

  renderEntries() {
    return this.state.entries.map(result => {
      return html`<div className="transcript-list-item">${result}</div>`;
    });
  }

  renderLastEntry() {
    return html`
      <div className="transcript-list-item has-no-border"
          ref=${this.lastEntryRef}>
      </div>
    `;
  }
};
