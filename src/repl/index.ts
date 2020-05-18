import { promisify } from 'util';
import * as repl from "nrepl-client";
import { homedir } from "os";
import { readFileSync } from "fs";

import { connectedToRepl, ApplicationState } from "../store";
import { Store } from 'redux';

type NReplState = "waiting-for-port" | "connecting" | "connected";

type NRepl = {
  state: NReplState;
  port: number | undefined;
  client: any;
};

export interface EvalResult {
  stdout: string;
  stderr: string;
  value: string;
}

const nReplPortFile = `${homedir()}/.nrepl-port`;

let nRepl: NRepl = {
  state: "waiting-for-port",
  port: undefined,
  client: undefined,
};

export default function Repl(store: Store<ApplicationState>) {
  const process = (nRepl: NRepl): NRepl => {
    switch (nRepl.state) {
      case "waiting-for-port":
        try {
          const buffer = readFileSync(nReplPortFile);
          nRepl.port = parseInt(buffer.toString());
          nRepl.state = "connecting";
          setTimeout(processRepl, 1000);
        } catch(err) {
          setTimeout(processRepl, 10000);
        }
        break;

      case "connecting":
        try {
          nRepl.client = repl.connect({ port: nRepl.port });
          nRepl.state = "connected";
          store.dispatch(connectedToRepl());
        } catch (error) {
          console.log("Error:", error);
        }

        setTimeout(processRepl, 1000);
        break;

      case "connected":
        setTimeout(processRepl, 10000);
        break;
    }
    return nRepl;
  }

  const processRepl = () => process(nRepl);

  setTimeout(processRepl, 1000);
}

const reduceValue =
  (aggregate, msg) => msg.value ? aggregate + msg.value : aggregate;

const reduceOutput =
  (aggregate, msg) => msg.out ? aggregate + msg.out : aggregate;

const reduceError =
  (aggregate, msg) => msg.err ? aggregate + msg.err : aggregate;

export async function execute(code: string): Promise<EvalResult> {
  const evalPromise = promisify(nRepl.client.eval);
  const result = await evalPromise(code);
  return {
    value: result.reduce(reduceValue, ""),
    stdout: result.reduce(reduceOutput, ""),
    stderr: result.reduce(reduceError, ""),
  };
};
