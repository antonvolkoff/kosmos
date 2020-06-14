import { read } from "./clojure_packer"

test("read numbers", () => {
  expect(read("1").nodes).toEqual({ "0": { value: 1, type: "number" } })
  expect(read("-1").nodes).toEqual({ "0": { value: -1, type: "number" } })
})

test("read strings", () => {
  expect(read(`"1"`).nodes).toEqual({ "0": { value: "1", type: "string" } })
  expect(read(`"abc"`).nodes).toEqual({ "0": { value: "abc", type: "string" } })
});

test("read keywords", () => {
  expect(read(":foo").nodes).toEqual({ "0": { value: ":foo", type: "keyword" } })
});

test("read symbols", () => {
  expect(read("print").nodes).toEqual({ "0": { value: "print", type: "symbol" } })
});

test("read empty list", () => {
  expect(read("()").nodes).toEqual({ "0": { value: "list", type: "list" } })
  expect(read("()").edges).toEqual({ "0": [] })
});

test("read list with numbers", () => {
  const graph = read("(1 2 3)")
  expect(graph.nodes).toEqual({
    "0": { value: "list", type: "list" },
    "1": { value: 1, type: "number" },
    "2": { value: 2, type: "number" },
    "3": { value: 3, type: "number" },
  })
  expect(graph.edges).toEqual({
    "0": ["1", "2", "3"],
    "1": [],
    "2": [],
    "3": [],
  })
})

test("read list with mixed values", () => {
  const graph = read(`(1 "2" :foo)`)
  expect(graph.nodes).toEqual({
    "0": { value: "list", type: "list" },
    "1": { value: 1, type: "number" },
    "2": { value: "2", type: "string" },
    "3": { value: ":foo", type: "keyword" },
  })
  expect(graph.edges).toEqual({
    "0": ["1", "2", "3"],
    "1": [],
    "2": [],
    "3": [],
  })
})

test("read list of lists with mixed values", () => {
  const graph = read(`((1 2) ("a" "b") (:foo (:bar) :baz))`)
  expect(graph.nodes).toEqual({
    "0": { value: "list", type: "list" },
    "1": { value: "list", type: "list" },
    "2": { value: 1, type: "number" },
    "3": { value: 2, type: "number" },
    "4": { value: "list", type: "list" },
    "5": { value: "a", type: "string" },
    "6": { value: "b", type: "string" },
    "7": { value: "list", type: "list" },
    "8": { value: ":foo", type: "keyword" },
    "9": { value: "list", type: "list" },
    "10": { value: ":bar", type: "keyword" },
    "11": { value: ":baz", type: "keyword" },
  })
  expect(graph.edges).toEqual({
    "0": ["1", "4", "7"],
    "1": ["2", "3"],
    "2": [],
    "3": [],
    "4": ["5", "6"],
    "5": [],
    "6": [],
    "7": ["8", "9", "11"],
    "8": [],
    "9": ["10"],
    "10": [],
    "11": [],
  })
})

test("read empty vector", () => {
  const graph = read("[]");
  expect(graph.nodes).toEqual({ "0": { value: "vector", type: "vector" } })
  expect(graph.edges).toEqual({ "0": [] })
});

test("read vector with values", () => {
  const graph = read("[1 2]");
  expect(graph.nodes).toEqual({
    "0": { value: "vector", type: "vector" },
    "1": { value: 1, type: "number" },
    "2": { value: 2, type: "number" },
  });
  expect(graph.edges).toEqual({ "0": ["1", "2"], "1": [], "2": [] })
});

test("read empty set", () => {
  const graph = read("#{}");
  expect(graph.nodes).toEqual({ "0": { value: "set", type: "set" } })
  expect(graph.edges).toEqual({ "0": [] })
});

test("read set with values", () => {
  const graph = read("#{1 2}");
  expect(graph.nodes).toEqual({
    "0": { value: "set", type: "set" },
    "1": { value: 1, type: "number" },
    "2": { value: 2, type: "number" },
  });
  expect(graph.edges).toEqual({ "0": ["1", "2"], "1": [], "2": [] })
});

test("read map", () => {
  const graph = read("{:a 1 :b 2 :c 3}");
  expect(graph.nodes).toEqual({
    "0": { value: "hash-map", type: "map" },
    "1": { value: ":a", type: "keyword" },
    "2": { value: 1, type: "number" },
    "3": { value: ":b", type: "keyword" },
    "4": { value: 2, type: "number" },
    "5": { value: ":c", type: "keyword" },
    "6": { value: 3, type: "number" },
  })
  expect(graph.edges).toEqual({
    "0": ["1", "2", "3", "4", "5", "6"],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
  })
});

test("read hello world", () => {
  const code = `
    (ns hello.core)

    (defn -main []
      (println "Hello, World!"))
  `

  const graph = read(code)
  expect(graph.nodes).toEqual({
    "0": { value: "list", type: "list" },
    "1": { value: "ns", type: "symbol" },
    "2": { value: "hello.core", type: "symbol" },
    "3": { value: "list", type: "list" },
    "4": { value: "defn", type: "symbol" },
    "5": { value: "-main", type: "symbol" },
    "6": { value: "vector", type: "vector" },
    "7": { value: "list", type: "list" },
    "8": { value: "println", type: "symbol" },
    "9": { value: "Hello, World!", type: "string" },
  })
  expect(graph.edges).toEqual({
    "0": ["1", "2"],
    "1": [],
    "2": [],
    "3": ["4", "5", "6", "7"],
    "4": [],
    "5": [],
    "6": [],
    "7": ["8", "9"],
    "8": [],
    "9": [],
  })
});
