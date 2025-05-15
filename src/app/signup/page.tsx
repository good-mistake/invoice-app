"use client";
import React from "react";
import { useState, useEffect } from "react";
import { setLoading, setError, setSuccess } from "@/app/redux/userSlice";
import { RootState } from "../redux/store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const success = useSelector((state: RootState) => state.user.success);
  const dispatch = useDispatch();
  const route = useRouter();
  useEffect(() => {
    dispatch(setError(""));
    dispatch(setLoading(false));
    dispatch(setSuccess(false));
  }, [dispatch]);
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(""));
    dispatch(setLoading(true));

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      dispatch(setError("Please fill every input"));
      dispatch(setLoading(false));
      return;
    }
    if (password !== confirmPassword) {
      dispatch(setError("Password Does not match!"));
      dispatch(setLoading(false));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch(setError("Enter a valid email address"));
      dispatch(setLoading(false));
      return;
    }

    try {
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(setError(data.error || "SignUp failed"));
      } else {
        dispatch(setSuccess(true));
        localStorage.setItem("token", data.token);
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
        <h1>Signup</h1>
        <form action="" onSubmit={handleSignup}>
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
          />{" "}
          <label htmlFor="Cpassword">Confirm Password</label>
          <input
            type="password"
            name="Cpassword"
            id="Cpassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              <motion.span
                key="loading"
                className="loading"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                Signing up...
              </motion.span>
            ) : (
              "Sign Up"
            )}{" "}
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
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}{" "}
          {success && (
            <motion.div
              key="success"
              className="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Signup successful. Redirecting...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SignUp;
