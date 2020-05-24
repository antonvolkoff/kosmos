import { EventEmitter } from "events";

type Address = string;

interface Message {
  type: string;
  payload?: any;
  resolve?: Function;
};

export interface Actor {
  init?: (message: Message) => any;
  handleCall?: (state: any, message: Message, resolve: Function) => any;
  handleSend?: (state: any, message: Message) => any;
  terminate?: (state: any, message: Message) => any;
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
const mailbox = new EventEmitter();
const states = {};
const defaultActor: Actor = {
  init(message) {
    return null;
  },
  handleSend(state, message) {
    return state;
  },
  handleCall(state, message, resolve) {
    resolve(state);
    return state;
  },
  terminate(state, message) {
  },
};

export function start(behavior: Actor, name: string = ""): Address {
  const actor = { ...defaultActor, ...behavior };
  const address = id.next();
  states[address] = actor.init({ type: "init" });

  const handleMailboxMessage = (message: Message) => {
    const { type, resolve } = message;
    if (resolve) {
      states[address] = actor.handleCall(states[address], message, resolve);
    } else if (type == "terminate") {
      states[address] = actor.terminate(states[address], message);
    } else {
      states[address] = actor.handleSend(states[address], message);
    }
  };

  mailbox.on(address, handleMailboxMessage);
  if (name != "") {
    mailbox.on(name, handleMailboxMessage);
  }

  return address;
};

export function send(address: Address, message: Message) {
  mailbox.emit(address, message);
};

export async function call(address: Address, message: Message): Promise<any> {
  return new Promise(resolve => {
    mailbox.emit(address, { ...message, resolve });
  });
};

export function stop(address: Address) {
  send(address, { type: "terminate" });
  mailbox.removeAllListeners(address);
  delete states[address];
};

export function info(address: Address): any {
  return states[address];
}
