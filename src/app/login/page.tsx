"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  setLoading,
  setError,
  setSuccess,
  setUser,
} from "@/app/redux/userSlice";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = useSelector((state: RootState) => state.user.error);
  const loading = useSelector((state: RootState) => state.user.loading);
  const success = useSelector((state: RootState) => state.user.success);
  const dispatch = useDispatch();

  const route = useRouter();
  useEffect(() => {
    dispatch(setError(""));
    dispatch(setLoading(false));
    dispatch(setSuccess(false));
  }, [dispatch]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    if (!password || !email) {
      dispatch(setError("Please fill every Input"));
      dispatch(setLoading(true));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch(setError("Enter a valid email address"));
      dispatch(setLoading(false));

      return;
    }
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(setError(data.error || "Login failed"));
      } else {
        dispatch(setSuccess(true));
        dispatch(setUser(data));

        localStorage.setItem("token", data.token);
        localStorage.removeItem("preview");
        localStorage.setItem("preview", "/assets/image-avatar.jpg");
        setTimeout(() => {
          route.push("/home");
        }, 1500);
      }
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));

        console.error(e);
      } else {
        dispatch(setError("Something went wrong"));

        console.error("Unknown error", e);
      }
      dispatch(setSuccess(false));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <form action="" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <motion.span
              key="loading"
              className="loading"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              Login in...
            </motion.span>
          ) : (
            "Login"
          )}
        </button>
      </form>
      <AnimatePresence>
        {error &&
        (error.toLowerCase().includes("password") ||
          error.toLowerCase().includes("invalid")) ? (
          <div className="forgotPassword">
            <motion.p
              key="error"
              className="error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
            <button onClick={() => route.push("/forgot-password")}>
              Forgot Password?
            </button>
          </div>
        ) : (
          <motion.p
            key="error"
            className="error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.div
            key="success"
            className="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Login successful. Redirecting...
          </motion.div>
        )}{" "}
      </AnimatePresence>
      <div className="createAcc">
        <p>
          Don&apos;t have an account?{" "}
          <button onClick={() => route.push("/signup")}>Create one</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
