"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setError,
  setSuccess,
  setLoading,
  resetModal,
} from "../redux/modalSlice";
import { removeInvoice } from "../redux/invoiceSlice";
import { RootState } from "../redux/store";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
const DeleteModal = () => {
  const invoiceList = useSelector((state: RootState) => state.invoice.list);
  const dispatch = useDispatch();
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const invoice = invoiceList.find((i) => i.id === id);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(""));
    dispatch(setSuccess(false));
    dispatch(setLoading(true));

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const publicUserId =
      typeof window !== "undefined"
        ? localStorage.getItem("publicUserId")
        : null;

    const endpoint = `/api/invoices`;
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : { "x-public-user-id": publicUserId || "" }),
        },
        body: JSON.stringify({ id: invoice?.id }),
      });

      if (res.ok) {
        const updatedInvoice = await res.json();
        dispatch(setError(""));
        dispatch(setSuccess(true));
        dispatch(removeInvoice({ id: updatedInvoice.id }));
        router.push("/home");
      } else {
        const errorData = await res.json();
        dispatch(setError(errorData.message || "Failed to delete invoice"));
        dispatch(setSuccess(false));
      }
    } catch (error) {
      console.error("Error delete invoice:", error);
      dispatch(setError("Failed to delete invoice"));
      dispatch(setSuccess(false));
    } finally {
      dispatch(setLoading(false));
      dispatch(resetModal());
    }
  };
  return (
    <div className="deleteModalOverlay">
      <div className="deleteModal">
        <h2>Confirm Deletion</h2>
        <p>
          Are you sure you want to delete invoice #{id}? This action cannot be
          undone.
        </p>
        <div>
          <button onClick={() => dispatch(resetModal())}>Cancel</button>
          <button onClick={handleSubmit}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
