import { createAction, createReducer } from "@reduxjs/toolkit";

export const changeMode =
  createAction("mode/change", (mode: string) => ({ payload: { mode } }));
