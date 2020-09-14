import { promisify } from 'util';
import * as repl from "nrepl-client";
import { homedir } from "os";

import { ApplicationState } from "../store";
import { connectedToRepl } from "../store/defaultReducer";
import { Store } from 'redux';

type NReplState = "waiting-for-port" | "connecting" | "connected";

type NRepl = {
  state: NReplState;
  port: number | undefined;
  client: any;
  session: string | undefined;
};

export interface EvalResult {
  id: number;
  stdout: string;
  stderr: string;
  value: string;
}

const nReplPortFile = `${homedir()}/.nrepl-port`;

let nRepl: NRepl = {
  state: "waiting-for-port",
  port: undefined,
  client: undefined,
  session: undefined,
};

declare global {
  interface Window { kosmos: any }
}

export default function Repl(store: Store<ApplicationState>) {
  const process = (nRepl: NRepl): NRepl => {
    switch (nRepl.state) {
      case "waiting-for-port":
        try {
          const replConfig = window.kosmos.core.load("repl.edn");
          nRepl.port = replConfig.port;
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
        if (nRepl.session === undefined) {
          nRepl.client.clone((err, result) => {
            nRepl.session = result[0]["new-session"];
          });
        }

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
  const result = await evalPromise(code, undefined, nRepl.session);
  return {
    id: new Date().getTime(),
    value: result.reduce(reduceValue, ""),
    stdout: result.reduce(reduceOutput, ""),
    stderr: result.reduce(reduceError, ""),
  };
};
