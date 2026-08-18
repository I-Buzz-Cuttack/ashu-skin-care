// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as authAPI from "./authAPI";
// import { removeToken, setToken } from "../../utils/tokenService";

// // ✅ LOGIN
// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async (data, { rejectWithValue }) => {
//     try {
//       console.log("data");
//       const res = await authAPI.login(data);
//       console.log(res.data.result);

//       const { accessToken, refreshToken, user } = res.data.result;

//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       localStorage.setItem("user", JSON.stringify(user));

//       return user;

//     } catch (err) {
//       return rejectWithValue(err.response?.data || "Login failed");
//     }
//   }
// );

// // ✅ PROFILE
// export const fetchProfile = createAsyncThunk(
//   "auth/profile",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await authAPI.getProfile();
//       return res.data;
//     } catch (err) {
//       return rejectWithValue("Failed to fetch profile");
//     }
//   }
// );

// // ✅ LOGOUT
// export const logoutUser = createAsyncThunk("auth/logout", async () => {
//   try {
//     await authAPI.logout();
//   } catch (e) { }
//   removeToken();
// });

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: null,
//     isAuthenticated: false,
//     loading: false,
//     error: null,
//   },

//   reducers: {},

//   extraReducers: (builder) => {
//     builder

//       // LOGIN
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//         state.isAuthenticated = true;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // PROFILE
//       .addCase(fetchProfile.fulfilled, (state, action) => {
//         state.user = action.payload;
//         state.isAuthenticated = true;
//       })

//       // LOGOUT
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//       });
//   },
// });

// export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authAPI from "./authAPI";
import { removeToken } from "../../utils/tokenService";

// ✅ LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.login({
        email: data.email,
        password: data.password,
      });
      const { accessToken, refreshToken, user } = res.data.result;
      return { user, accessToken, refreshToken };
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === "object" ? (data.message || data.error || JSON.stringify(data)) : String(data || "Login failed");
      return rejectWithValue(msg);
    }
  }
);

// ✅ PROFILE
export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getProfile();
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to fetch profile");
    }
  }
);

// ✅ LOGOUT
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authAPI.logout();
  } catch (e) {}
  removeToken();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // PROFILE
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
