"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setLoading, setError, setSuccess } from "@/app/redux/userSlice";
import Image from "next/image";
const ResetPassword = () => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.user.error);
  const loading = useSelector((state: RootState) => state.user.loading);
  const success = useSelector((state: RootState) => state.user.success);
  const [password, setPassword] = useState("");
  const route = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  useEffect(() => {
    dispatch(setError(""));
    dispatch(setLoading(false));
    dispatch(setSuccess(false));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    if (!password) {
      dispatch(setError("Please fill every Input"));
      dispatch(setLoading(false));
      return;
    }
    if (password.length < 6) {
      dispatch(setError("Password must be at least 6 characters"));
      dispatch(setLoading(false));
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
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
    <>
      <div
        onClick={() => route.push("/home")}
        className="goBackBtn backForLogin"
      >
        <Image
          width={9}
          height={9}
          src={"/assets/icon-arrow-left.svg"}
          alt="arrow"
        />
        <p>Go back</p>
      </div>{" "}
      <div className="login">
        <h1>Reset Password</h1>
        <form action="" onSubmit={handleSubmit}>
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
              Saved. Redirecting...
            </motion.div>
          )}{" "}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ResetPassword;
