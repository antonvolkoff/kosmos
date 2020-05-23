import { ApplicationState } from "../store";

export const getTranscript = (state: ApplicationState) =>
  state.interface.transcript;
