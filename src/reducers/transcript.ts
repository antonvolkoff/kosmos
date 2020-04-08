import { createAction, createReducer, PayloadAction } from "@reduxjs/toolkit";

const add = createAction<string>("transcript/add");

const reducer = createReducer([], {
  [add.type]: (state, action: PayloadAction<string>) => {
    return [...state, action.payload];
  },
});

export default { reducer, add };
