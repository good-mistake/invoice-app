"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setModal } from "../redux/modalSlice";
import { useDispatch } from "react-redux";
import { setFilteredStatus } from "../redux/invoiceSlice";
import useWindowWidth from "@/utils/usewidth";
const Homecontent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const width = useWindowWidth();
  const invoiceList = useSelector((state: RootState) => state.invoice.list);
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const total = invoiceList.length;
  const filteredList = useSelector((state: RootState) => {
    if (!state.invoice.filteredStatus) return state.invoice.list;
    return state.invoice.list.filter(
      (i) => i.status === state.invoice.filteredStatus
    );
  });

  const handleToggleModal = (type: "create") => {
    dispatch(setModal(type));
  };
  const handleFilter = (status: string) => {
    setSelected(status);
    dispatch(setFilteredStatus(status === "no filter" ? null : status));
    setShowFilter(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const safeSelected = selected
    ? selected.toLowerCase() !== "no filter"
      ? selected
      : ""
    : "";
  return (
    <div className="home">
      <div className="top">
        <div className="title">
          <h1>Invoices</h1>
          <p>
            {width > 600
              ? `There are ${total} total invoices`
              : `${total} invoices`}
          </p>
        </div>
        <div className="btns">
          <div className="filterWrapper" ref={filterRef}>
            <button
              className="filter"
              onClick={() => setShowFilter((prev) => !prev)}
            >
              <p>
                {safeSelected
                  ? width > 600
                    ? `Show ${
                        safeSelected.charAt(0).toUpperCase() +
                        safeSelected.slice(1)
                      }`
                    : ` ${
                        safeSelected.charAt(0).toUpperCase() +
                        safeSelected.slice(1)
                      }`
                  : width > 600
                  ? "Filter by status"
                  : "Filter"}
              </p>
              <Image
                src={"/assets/icon-arrow-down.svg"}
                width={10}
                height={5}
                alt="arrow"
              />
            </button>
            <ul className={`${showFilter ? "showFilter" : ""}`}>
              {["No Filter", "Draft", "Pending", "Paid"].map((status) => (
                <li
                  key={status}
                  className={
                    selected?.toLowerCase() === status.toLowerCase()
                      ? "active"
                      : ""
                  }
                  onClick={() => handleFilter(status.toLowerCase())}
                >
                  {status}
                </li>
              ))}
            </ul>
          </div>

          <button
            className="create"
            onClick={() => handleToggleModal("create")}
          >
            <div>
              <Image
                src={"/assets/icon-plus.svg"}
                width={10}
                height={10}
                alt="arrow"
              />
            </div>
            <p>{width > 600 ? `New Invoice` : "New"}</p>
          </button>
        </div>
      </div>

      {Array.isArray(filteredList) ? (
        filteredList?.length === 0 ? (
          <div className="nothing">
            <Image
              src={"/assets/illustration-empty.svg"}
              width={241}
              height={241}
              alt="empty"
            />
            <h2>No invoices match this filter</h2>
            <p>Try a different status or create a new invoice.</p>
          </div>
        ) : (
          filteredList?.map((i) =>
            width < 600 ? (
              <ul
                key={i.userId || i.id || i._id}
                className=""
                onClick={() => router.push(`/detail/${i.id}`)}
              >
                <div>
                  <li>
                    <span>#</span>
                    {i.id}
                  </li>

                  <li className="name">{i.clientName}</li>
                </div>
                <div>
                  <div>
                    <li className="date">
                      <span>Due</span>
                      <div>
                        {i.paymentDue
                          ? new Date(i.paymentDue).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </li>
                    <li className="total">£ {i.total ? i.total : "N/A"}</li>
                  </div>
                  <div>
                    <li
                      className={`status ${
                        i.status === "paid"
                          ? "paid"
                          : i.status === "pending"
                          ? "pending"
                          : "draft"
                      }`}
                    >
                      <span></span>
                      {i.status}
                    </li>
                  </div>
                </div>
              </ul>
            ) : (
              <ul
                key={i.userId || i.id || i._id}
                onClick={() => router.push(`/detail/${i.id}`)}
              >
                <li>
                  <span>#</span>
                  {i.id}
                </li>
                <li className="date">
                  Due{" "}
                  {i.paymentDue
                    ? new Date(i.paymentDue).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </li>
                <li className="name">{i.clientName}</li>
                <li className="total">£ {i.total ? i.total : "N/A"}</li>
                <li
                  className={`status ${
                    i.status === "paid"
                      ? "paid"
                      : i.status === "pending"
                      ? "pending"
                      : "draft"
                  }`}
                >
                  <span></span>
                  {i.status}
                </li>
                <li>
                  <Image
                    width={4}
                    height={8}
                    src={"/assets/icon-arrow-right.svg"}
                    alt="arrow"
                  />
                </li>
              </ul>
            )
          )
        )
      ) : (
        <div className="nothing">
          <Image
            src={"/assets/illustration-empty.svg"}
            width={241}
            height={241}
            alt="empty"
          />
          <h2>There is nothing here</h2>
          <p>
            Create an invoice by clicking the New Invoice button and get started
          </p>
        </div>
      )}
    </div>
  );
};

export default Homecontent;
