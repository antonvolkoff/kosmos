import { extensions, unpack, pack } from "./dot_packer";
import { Node } from "./default_packer";

const expectedOutput = `strict digraph {
  one
  two
  three
  one -> two
}
`;

describe("extensions", () => {
  test("should include .dot", () => {
    expect(extensions).toContain(".dot");
  });
});

describe("unpack", () => {
  test("should be successful", () => {
    const dotFile = `digraph { 1 [label="One"]; 2; 1 -> 2 }`;
    expect(unpack(dotFile)).toEqual([
      {
        "1": { id: "1", value: "One" },
        "2": { id: "2", value: "2" },
      },
      [
        { sourceId: "1", targetId: "2" },
      ],
    ]);
  });

  describe("pack", () => {
    test("should be successful", () => {
      const nodes: Node[] = [
        { value: "one", children: [{ value: "two", children: [] }]},
        { value: "three", children: [] },
      ];

      expect(pack(nodes)).toEqual(expectedOutput);
    });
  });
});
