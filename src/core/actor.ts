type Address = string;

export interface Behavior {
  init?: () => any;
  terminate?: (state: any) => any;
  [key: string]: any;
}

function createIdGenerator(prefix = "actor/", start = 0) {
  let index = start;
  return {
    next(): string {
      index++;
      return prefix + index.toString();
    }
  }
};

const id = createIdGenerator();
const behaviors = {};
const states = {};
const defaultBehavior: Behavior = {
  init: () => null,
  terminate: (state) => state,
};

export function start(behavior: Behavior, name: string = ""): Address {
  const address = name == "" ? id.next() : name;
  const actor = { ...defaultBehavior, ...behavior };

  behaviors[address] = actor;
  states[address] = behavior.init();

  return address;
};

export function send(address: Address, message: string, payload: any = null) {
  const fn = behaviors[address][message];
  states[address] = fn(states[address], payload);
};

export function call(address: string, message: string, payload: any = undefined): any {
  const fn = behaviors[address][message];
  const { state, response } = fn(states[address], payload);
  states[address] = state;
  return response;
}

export function stop(address: Address) {
  send(address, "terminate");
  delete behaviors[address];
  delete states[address];
};

