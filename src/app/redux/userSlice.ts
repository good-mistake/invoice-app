import { createSlice } from "@reduxjs/toolkit";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "./store";
const getOrCreatePublicUserId = async () => {
  let publicUserId = localStorage.getItem("publicUserId");
  if (!publicUserId) {
    const res = await fetch("/api/guest", { method: "POST" });
    const data = await res.json();
    publicUserId = data.publicUserId;
    localStorage.setItem("publicUserId", publicUserId || "");
  }
  return publicUserId;
};

const initialState = {
  user: null,
  loading: false,
  error: null as string | null,
  success: false,
  publicUserId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
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
    resetUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setPublicUserId: (state, action) => {
      state.publicUserId = action.payload;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  resetUser,
  setSuccess,
  setPublicUserId,
} = userSlice.actions;

export default userSlice.reducer;

export const initializePublicUserId =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => async (dispatch: ThunkDispatch<RootState, undefined, any>) => {
    const publicUserId = await getOrCreatePublicUserId();
    dispatch(setPublicUserId(publicUserId));
  };
