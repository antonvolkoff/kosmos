import * as util from 'util';
import * as repl from "nrepl-client";

const replClient = repl.connect({ port: 58597 });
replClient.once('connect', () => {
  console.log("Connected to REPL");
});

const evalPromise = util.promisify(replClient.eval);

export default async function executor(code: string): Promise<string> {
  const result = await evalPromise(code);
  return result[0].out || result[0].value;
};
