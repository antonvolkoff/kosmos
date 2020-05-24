import { start, stop, Actor, send, info, call } from "./actor";

test("should start and stop an actor", () => {
  let initWasCalled = false;
  let terminateWasCalled = false;

  const testActor: Actor = {
    init() {
      initWasCalled = true;
      return {};
    },
    terminate(state) {
      terminateWasCalled = true;
    },
  };

  const address = start(testActor);
  expect(initWasCalled).toEqual(true);
  expect(terminateWasCalled).toEqual(false);

  stop(address);
  expect(initWasCalled).toEqual(true);
  expect(terminateWasCalled).toEqual(true);
});

test("should send", () => {
  const actor: Actor = {
    init() {
      return 0;
    },

    handleSend(state, message) {
      if (message.type == "set") {
        return message.payload;
      } else {
        return state;
      }
    },
  };
  const address = start(actor);

  send(address, { type: "set", payload: 42 });
  expect(info(address)).toEqual(42);

  stop(address);
});

test("should call", async (done) => {
  const actor: Actor = {
    init() {
      return "hi";
    },

    handleCall(state, message, resolve) {
      if (message.type == "read") {
        resolve(state);
      }
      return state;
    },
  };
  const address = start(actor);

  const value = await call(address, { type: "read" });
  expect(value).toEqual("hi");

  stop(address);
  done();
});
