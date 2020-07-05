import Edge from "./edge";
import edge from "./edge";

describe("id", () => {
test("should create an id from an edge", () => {
    const edge = { sourceId: "1", targetId: "2" };
    expect(Edge.id(edge)).toEqual("1-->2");
  });
});

describe("parseId", () => {
  test("should return an edge from an id", () => {
    const id = "1-->2";
    expect(Edge.parseId(id)).toEqual({ sourceId: "1", targetId: "2" });
  });
});
