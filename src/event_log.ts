
interface Entry {
  id?: number;
  type: string;
  payload: {
    [key: string]: any;
  }
}

interface EventLog {
  getLog(): Entry[];
  send(payload: any): void;
}

interface Consumer {
  next(): { entry: Entry, done: boolean };
}

export function createEventLog(): EventLog {
  let id = -1;
  let logs: Entry[] = [];

  return {
    getLog() {
      return logs;
    },

    send(entry: Entry) {
      id += 1;
      logs.push({ id, ...entry });
    },
  };
};

export function createConsumer(eventLog: EventLog, start = 0): Consumer {
  let nextIndex = start;

  return {
    next() {
      const entry = eventLog.getLog()[nextIndex];
      if (entry) nextIndex++;
      const done = entry ? false : true;

      return { entry, done };
    }
  }
}