"use client";
import React, { useEffect, useState } from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setModal } from "@/app/redux/modalSlice";
import { updateInvoiceInList } from "@/app/redux/invoiceSlice";
import { motion, AnimatePresence } from "framer-motion";
import useWindowWidth from "@/utils/usewidth";
interface DetailPageProps {
  id: string | null;
}
const Detail: React.FC<DetailPageProps> = () => {
  const params = useParams() as { id: string };
  const dispatch = useDispatch();
  const id = params.id;
  const width = useWindowWidth();
  const invoiceList = useSelector((state: RootState) => state.invoice.list);
  const [loading, setLoading] = useState(true);
  const handleToggleModal = (type: "edit" | "delete") => {
    dispatch(setModal(type));
  };

  const router = useRouter();

  const invoice = invoiceList.find((i) => i.id === id);
  const total = invoice?.items.reduce((acc, i) => acc + (i.total || 0), 0);
  useEffect(() => {
    if (invoice) {
      setLoading(false);
    }
  }, [invoice]);

  const handlePaid = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const publicUserId =
      typeof window !== "undefined"
        ? localStorage.getItem("publicUserId")
        : null;

    if (!invoice) return;

    let nextStatus = "";
    if (invoice.status === "draft") nextStatus = "pending";
    else if (invoice.status === "pending") nextStatus = "paid";
    else return;

    const body = { id: invoice?.id, status: nextStatus };
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : { "x-public-user-id": publicUserId || "" }),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(updateInvoiceInList(data));
      } else {
        console.error("Error:", data.message);
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detail">
      <Sidebar />
      <div className="detailContent">
        {loading ? (
          <AnimatePresence>
            <div className="loadingAnime">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </div>
          </AnimatePresence>
        ) : (
          <>
            <div onClick={() => router.push("/home")} className="goBackBtn">
              <Image
                width={9}
                height={9}
                src={"/assets/icon-arrow-left.svg"}
                alt="arrow"
              />
              <p>Go back</p>
            </div>
            <section className="top">
              <div className="status">
                <p>Status</p>
                <div
                  className={`status ${
                    invoice?.status === "paid"
                      ? "paid"
                      : invoice?.status == "pending"
                      ? "pending"
                      : "draft"
                  }`}
                >
                  <span></span>
                  {invoice?.status}
                </div>
              </div>
              {width > 600 && (
                <div className="btnContainer">
                  <button
                    className="editBtn"
                    onClick={() => handleToggleModal("edit")}
                  >
                    Edit
                  </button>
                  <button
                    className="deleteBtn"
                    onClick={() => handleToggleModal("delete")}
                  >
                    Delete
                  </button>
                  <button className="pendingBtn" onClick={handlePaid}>
                    {invoice?.status === "draft"
                      ? "Mark as pending"
                      : invoice?.status === "pending"
                      ? "Mark as paid"
                      : "Paid"}
                  </button>
                </div>
              )}
            </section>{" "}
            <div className="bottom">
              <section className="topSec">
                <div className="idAndAddress">
                  <div className="id">
                    <h1>
                      <span>#</span>
                      {invoice?.id}
                    </h1>
                    <p>{invoice?.description}</p>
                  </div>
                  <div className="address">
                    {invoice?.senderAddress && (
                      <ul>
                        <li>{invoice.senderAddress.street}</li>
                        <li>{invoice.senderAddress.city}</li>
                        <li>{invoice.senderAddress.postCode}</li>
                        <li>{invoice.senderAddress.country}</li>
                      </ul>
                    )}
                  </div>
                </div>
                <div className="otherDetail">
                  {width < 600 ? (
                    <>
                      <div className="dateAndDue">
                        <div>
                          <div className="date">
                            <p>Invoice Date</p>
                            <div>
                              {invoice?.createdAt
                                ? new Date(
                                    invoice?.createdAt
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </div>
                          </div>
                          <div className="due">
                            <p>Payment Due</p>
                            <div>
                              {invoice?.paymentDue
                                ? new Date(
                                    invoice?.paymentDue
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="bill">
                          <p>Bill To</p>
                          <div>{invoice?.clientName}</div>
                          <div className="address">
                            {invoice?.clientAddress && (
                              <ul>
                                <li>{invoice.clientAddress.street}</li>
                                <li>{invoice.clientAddress.city}</li>
                                <li>{invoice.clientAddress.postCode}</li>
                                <li>{invoice.clientAddress.country}</li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>{" "}
                      <div className="sent">
                        <p>Sent to</p>
                        <div>{invoice?.clientEmail}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      {" "}
                      <div className="dateAndDue">
                        <div className="date">
                          <p>Invoice Date</p>
                          <div>
                            {invoice?.createdAt
                              ? new Date(invoice?.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                        </div>
                        <div className="due">
                          <p>Payment Due</p>
                          <div>
                            {invoice?.paymentDue
                              ? new Date(
                                  invoice?.paymentDue
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="bill">
                        <p>Bill To</p>
                        <div>{invoice?.clientName}</div>
                        <div className="address">
                          {invoice?.clientAddress && (
                            <ul>
                              <li>{invoice.clientAddress.street}</li>
                              <li>{invoice.clientAddress.city}</li>
                              <li>{invoice.clientAddress.postCode}</li>
                              <li>{invoice.clientAddress.country}</li>
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="sent">
                        <p>Sent to</p>
                        <div>{invoice?.clientEmail}</div>
                      </div>
                    </>
                  )}
                </div>
              </section>
              <section className="bottomSec">
                {width > 600 && (
                  <ul>
                    <li>Item Name</li>
                    <li>QTY.</li>
                    <li>Price</li>
                    <li>Total</li>
                  </ul>
                )}

                {invoice?.items?.map((i) => {
                  return width > 600 ? (
                    <ul key={i._id}>
                      <li>{i.name}</li>
                      <li>{i.quantity}</li>
                      <li>£ {i.price.toFixed(2)}</li>
                      <li>£ {i.total.toFixed(2)}</li>
                    </ul>
                  ) : (
                    <ul key={i._id}>
                      <div>
                        <li>{i.name}</li>
                        <li>
                          {i.quantity} x £ {i.price.toFixed(2)}
                        </li>
                      </div>
                      <li>£ {i.total.toFixed(2)}</li>
                    </ul>
                  );
                })}
                <div className="amountDue">
                  <h3>Amount Due</h3> <p>£ {total?.toFixed(2)}</p>
                </div>
              </section>{" "}
            </div>
            {width < 600 && (
              <div className="btnContainer">
                <button
                  className="editBtn"
                  onClick={() => handleToggleModal("edit")}
                >
                  Edit
                </button>
                <button
                  className="deleteBtn"
                  onClick={() => handleToggleModal("delete")}
                >
                  Delete
                </button>
                <button className="pendingBtn" onClick={handlePaid}>
                  {invoice?.status === "draft"
                    ? "Mark as pending"
                    : invoice?.status === "pending"
                    ? "Mark as paid"
                    : "Paid"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Detail;
