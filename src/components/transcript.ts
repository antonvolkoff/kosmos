import { Component, createRef } from "react";
import { html } from "htm/react";
import { State } from "../state/state";
import { EvalResult } from "../executor";

type TranscriptProps = {
  state: State;
};

type TranscriptState = {
  entries: EvalResult[];
  lastEntry: EvalResult;
};

const emptyResult: EvalResult = { stderr: "", stdout: "", value: "" };

const last = (results: EvalResult[]): EvalResult => {
  return results[results.length - 1] || emptyResult;
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

  convertToMultiline(text: string) {
    return text.split("\n").map(line => html`<div>${line}</div>`);
  }

  renderEntries() {
    const entryPart = (text: string, className: string) => {
      return text.length > 0 ? html`<div className="${className}">${this.convertToMultiline(text)}</div>` : "";
    }

    return this.state.entries.map(result => {
      const stdout = entryPart(result.stdout, "entry-stdout");
      const value = entryPart(result.value, "entry-value");
      const stderr = entryPart(result.stderr, "entry-error");

      return html`
        <div className="transcript-list-item">
          ${stderr}
          ${stdout}
          ${value}
        </div>
      `;
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
