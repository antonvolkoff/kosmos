import { promisify } from 'util';
import * as repl from "nrepl-client";
import { homedir } from "os";
import { readFileSync } from "fs";

import State from "./state/state";

type NReplState = "waiting-for-port" | "connecting" | "connected";

type NRepl = {
  state: NReplState;
  port: number | undefined;
  client: any;
};

const nReplPortFile = `${homedir()}/.nrepl-port`;

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
        State.setConnectedToRepl(true);
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

let nRepl: NRepl = {
  state: "waiting-for-port",
  port: undefined,
  client: undefined,
};

const processRepl = () => process(nRepl);

setTimeout(processRepl, 1000);

export default async function executor(code: string): Promise<string> {
  const evalPromise = promisify(nRepl.client.eval);
  const result = await evalPromise(code);
  return result[0].out || result[0].value;
};
