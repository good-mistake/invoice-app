"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setLoading, setError, setSuccess } from "@/app/redux/userSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.user.error);
  const loading = useSelector((state: RootState) => state.user.loading);
  const success = useSelector((state: RootState) => state.user.success);
  const [email, setEmail] = useState("");

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
    if (!email) {
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
      const res = await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        dispatch(setError(data.error || "Error"));
      } else {
        dispatch(setSuccess(true));

        setTimeout(() => {
          route.push("/login");
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
      <h1>Forgot Password</h1>
      <form action="" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
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
              Submitting...
            </motion.span>
          ) : (
            "Submit"
          )}
        </button>
      </form>
      <AnimatePresence>
        {error && (
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
            check your email. Redirecting...
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

export default ForgotPassword;
