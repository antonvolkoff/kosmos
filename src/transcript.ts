import { Component, createRef } from "react";
import { html } from "htm/react";

type TranscriptProps = {
  store: any;
};

type TranscriptState = {
  results: string[];
  lastResult: string;
};

const last = (results: string[]): string => {
  return results[results.length - 1] || "";
};

const propsToState = (props: TranscriptProps): TranscriptState => {
  const results = props.store.getState() as string[];
  return { results: results, lastResult: last(results) };
};

export default class Transcript extends Component<TranscriptProps, TranscriptState> {
  private lastEntryRef = createRef();

  constructor(props: TranscriptProps) {
    super(props);
    this.state = propsToState(props);
  }

  componentDidMount() {
    this.props.store.subscribe(() => {
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
    return this.state.results.map(result => {
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
