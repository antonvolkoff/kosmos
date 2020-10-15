- Start Date: 2020-10-15
- Status: Accepted

# Summary

This document defines the structure of an application database for storing nodes and edges.

# Context

I'm currently working on migrating from redux store to re-frame. It's a good point to define data
structure and API to access it.

# Decision

Application DB be a hashmap with the following keys:
- `nodes` to store hashmap where the key is the node's id and value is a node.
- `root` to store a root node id
- `loc` to store focused node id

Node should be represented as a hashmap with `id`, `type`, `value`, `children`, and `parent` keys.

Application should define the following event handlers to modify nodes:
- `[:nodes/make node]` create a node at given loc.
- `[:nodes/append-child child]` adds a child as a bottom child.
- `[:nodes/insert-child child]` adds a child as a top child.
- `[:nodes/insert-up child]` adds a sibling to up of loc.
- `[:nodes/insert-down child]` adds a sibling to down of loc.
- `[:nodes/remove]` removes node at loc; lot will be moved to the preceding node.
- `[:nodes/replace node]` replaces node at loc.

Following event handler to modify loc:
- `[:loc/root]` moves loc to root.
- `[:loc/down]` moves loc down.
- `[:loc/up]` moves loc up.
- `[:loc/bottom]` moves loc to bottom.
- `[:loc/top]` moves loc to top.
- `[:loc/right]` moves loc right.
- `[:loc/left]` moves loc left.

Following event handler to modify root:
- `[:root/change root]` change root to a new value.

## Alternative: Store Tree

I have looked into storing a tree in application db and update it using `clojure.zip`. It sounded
like a perfect idea at first, as it's one of the most convenient ways to work with ASTs in Clojure.

However, the solution that I came up with ended up being overly complicated and harder to reason
about. It requires a good understanding of `clojure.zip` and it pitfalls.

I took a nice API as inspiration when working on accepted decision.

## Alternative: Datascript

Datascript is a in-browser databased modeled based on Datomic. It sounds like a good fit for the
problem. However, I have decided not to go with this approach due to unclear benefits over a more
simple hashmap. Datascript will add an extra dependency and has some learning curve, as one needs
to understand datalog queries to work it.

There might be a case in the future where Datascript might come in handy. It should not be a
problem to add it later if there is a use case for it.
