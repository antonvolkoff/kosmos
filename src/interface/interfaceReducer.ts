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
    showTranscript(state) {
      state.transcript.show = true;
    },
    hideTranscript(state) {
      state.transcript.show = false;
    },
    toggleTranscript(state) {
      state.transcript.show = !state.transcript.show;
    },
  }
});

export const middlewares = [];
export const { actions, reducer } = slice;
export default reducer;
