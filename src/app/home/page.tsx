"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Homecontent from "../components/DummyHome";
import { useDispatch } from "react-redux";
import { setInvoice } from "../redux/invoiceSlice";
import { motion } from "framer-motion";

const Home: React.FC<{
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      let publicUserId = localStorage.getItem("publicUserId");

      if (!token) {
        if (!publicUserId) {
          const userAgent = navigator.userAgent;
          const res = await fetch("/api/guest", {
            method: "POST",
            body: JSON.stringify({ userAgent }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();
          publicUserId = data.publicUserId;
          localStorage.setItem("publicUserId", publicUserId || "");
        }

        const finalRes = await fetch("/api/invoices", {
          headers: {
            "x-public-user-id": publicUserId!,
          },
        });
        const get = await finalRes.json();
        dispatch(setInvoice(get));
      } else {
        const finalRes = await fetch("/api/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const get = await finalRes.json();
        dispatch(setInvoice(get));
      }

      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loadingAnime">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <main>
      <Sidebar />
      <div>
        <Homecontent />
      </div>
    </main>
  );
};

export default Home;
