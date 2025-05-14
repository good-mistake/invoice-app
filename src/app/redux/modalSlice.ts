import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modal: null as string | null,
  error: null as string | null,
  success: false,
  loading: false,
  preview: null as string | null,
  file: null as File | null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal(state, action) {
      state.modal = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetModal: (state) => {
      state.modal = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setPreview: (state, action) => {
      state.preview = action.payload;
    },
    setFile: (state, action) => {
      state.file = action.payload;
    },
  },
});

export const {
  resetModal,
  setError,
  setLoading,
  setModal,
  setSuccess,
  setFile,
  setPreview,
} = modalSlice.actions;

export default modalSlice.reducer;
