"use client";
import React from "react";
import { Providers } from "./Providers";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState } from "./redux/store";
import { setTheme } from "./redux/themeSlice";
import { useDispatch } from "react-redux";
import "../style/styles.scss";
import Modal from "./components/Modal";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppContent>{children}</AppContent>
        </Providers>
        <div id="modal-root" />
      </body>
    </html>
  );
}
function AppContent({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <>
      <div className="content"> {children}</div>
      <Modal />
    </>
  );
}
