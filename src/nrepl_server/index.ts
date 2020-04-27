import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { homedir } from "os";

const command = "clj";
const args = [
  "-Sdeps", `{:deps {nrepl/nrepl {:mvn/version "0.7.0"}}}`,
  "-m", "nrepl.cmdline",
];
const options: SpawnOptions = { cwd: homedir() };

console.log(homedir());

export const start =
  (): ChildProcess => spawn(command, args, options);

export const stop =
  (p: ChildProcess): void => p.kill("SIGTERM");