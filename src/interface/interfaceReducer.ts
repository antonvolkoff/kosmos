import { createSlice } from "@reduxjs/toolkit";

interface InterfaceState {
  transcript: {
    show: boolean;
  }
}

const initialState: InterfaceState = {
  transcript: { show: false },
};

const slice = createSlice({
  name: "interface",
  initialState,
  reducers: {
    toggleTranscript(state) {
      state.transcript.show = !state.transcript.show;
    },
  }
});

export const middlewares = [];
export const { actions, reducer } = slice;
export default reducer;
