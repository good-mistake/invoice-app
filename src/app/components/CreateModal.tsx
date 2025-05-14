"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import DatePicker from "react-datepicker";
import Select from "react-select";
import Image from "next/image";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
import {
  resetModal,
  setError,
  setLoading,
  setSuccess,
} from "../redux/modalSlice";
import { motion, AnimatePresence } from "framer-motion";
import { addInvoiceToList } from "../redux/invoiceSlice";
import { FormData } from "@/utils/type";
import useWindowWidth from "@/utils/usewidth";

const CreateModal = () => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.modal.error);
  const loading = useSelector((state: RootState) => state.modal.loading);
  const success = useSelector((state: RootState) => state.modal.success);
  const width = useWindowWidth();

  const options = Array.from({ length: 35 }, (_, i) => ({
    value: i + 1,
    label: `Net ${i + 1} day${i + 1 > 1 ? "s" : ""}`,
  }));

  const [formData, setFormData] = useState<FormData>({
    id: crypto.randomUUID().slice(0, 6),
    clientName: "",
    clientEmail: "",
    description: "",
    paymentTerms: 30,
    paymentDue: new Date(
      new Date().setDate(new Date().getDate() + 30)
    ).toISOString(),
    status: "",
    createdAt: new Date().toISOString(),
    senderAddress: {
      street: "",
      city: "",
      postCode: "",
      country: "",
    },
    clientAddress: {
      street: "",
      city: "",
      postCode: "",
      country: "",
    },
    items: [],
    total: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "paymentTerms" ? Number(value) : value,
    }));
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "senderAddress" | "clientAddress"
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value,
      },
    }));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = {
          ...item,
          [field]: field === "quantity" || field === "price" ? +value : value,
        };

        updatedItem.total = updatedItem.quantity * updatedItem.price;
        return updatedItem;
      });

      const updatedTotal = updatedItems.reduce(
        (acc, item) => acc + item.total,
        0
      );

      return { ...prev, items: updatedItems, total: updatedTotal };
    });
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.clientName.trim()) errors.push("Client name is required.");

    if (!formData.clientEmail.trim()) {
      errors.push("Client email is required.");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail)) {
        errors.push("Client email is invalid.");
      }
    }

    const postcodeRegex = /^\d+$/;

    if (!postcodeRegex.test(formData.senderAddress.postCode)) {
      errors.push("Sender postcode must be a number.");
    }

    if (!postcodeRegex.test(formData.clientAddress.postCode)) {
      errors.push("Client postcode must be a number.");
    }

    formData.items.forEach((item, i) => {
      if (!item.name?.trim()) errors.push(`Item ${i + 1} is missing a name.`);
      if (isNaN(item.quantity) || item.quantity <= 0)
        errors.push(`Item ${i + 1} has invalid quantity.`);
      if (isNaN(item.price) || item.price < 0)
        errors.push(`Item ${i + 1} has invalid price.`);
    });

    return errors;
  };

  const handleSubmit = async (status: string) => {
    dispatch(setError(""));
    dispatch(setSuccess(false));
    dispatch(setLoading(true));

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      dispatch(setError(validationErrors[0]));
      dispatch(setLoading(false));
      return;
    }

    const token = localStorage.getItem("token");
    const publicUserId = localStorage.getItem("publicUserId");
    const endpoint = token ? "/api/invoices" : "/api/invoices";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : { "x-public-user-id": publicUserId || "" }),
        },
        body: JSON.stringify({ ...formData, status }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Response not OK:", text);
        try {
          const errorData = JSON.parse(text);
          dispatch(setError(errorData.message || "Failed to update invoice"));
        } catch {
          dispatch(setError("Unexpected error occurred"));
        }
        dispatch(setSuccess(false));
        return;
      }

      const responseInvoice = await res.json();
      dispatch(setError(""));
      dispatch(setSuccess(true));
      dispatch(addInvoiceToList(responseInvoice));
      setTimeout(() => {
        dispatch(resetModal());
      }, 1200);
    } catch (error) {
      console.error("Error updating invoice:", error);
      dispatch(setError("Failed to update invoice"));
      dispatch(setSuccess(false));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Sidebar />
      <div className="showModal">
        <form className="editForm">
          {width < 600 && (
            <div onClick={() => dispatch(resetModal())} className="goBackBtn">
              <Image
                width={9}
                height={9}
                src={"/assets/icon-arrow-left.svg"}
                alt="arrow"
              />
              <p>Go back</p>
            </div>
          )}{" "}
          <h1>New Invoice </h1>
          <div className="billFrom">
            <h2>Bill From</h2>
            <label htmlFor="StreetAddress">Street Address</label>
            <input
              name="street"
              value={formData.senderAddress.street}
              onChange={(e) => handleAddressChange(e, "senderAddress")}
              placeholder="Street"
              id="StreetAddress"
            />
            <div className="address">
              <div>
                <label htmlFor="City">
                  City
                  <input
                    name="city"
                    value={formData.senderAddress.city}
                    onChange={(e) => handleAddressChange(e, "senderAddress")}
                    placeholder="City"
                    id="City"
                  />
                </label>
              </div>
              <div>
                <label htmlFor="postCode">
                  Post Code
                  <input
                    name="postCode"
                    value={formData.senderAddress.postCode}
                    onChange={(e) => handleAddressChange(e, "senderAddress")}
                    placeholder="Post Code"
                    id="postCode"
                  />
                </label>
              </div>
              <div>
                <label htmlFor="country">
                  Country
                  <input
                    name="country"
                    value={formData.senderAddress.country}
                    onChange={(e) => handleAddressChange(e, "senderAddress")}
                    placeholder="Country"
                    id="country"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="billTo">
            <h2>Bill To</h2>
            <label htmlFor="name">
              Client’s Name
              <input
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Client Name"
                id="name"
              />
            </label>

            <label htmlFor="clientEmail">
              Client Email
              <input
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="Client Email"
                id="clientEmail"
              />
            </label>
            <label htmlFor="Street">
              Street Address
              <input
                name="street"
                value={formData.clientAddress.street}
                onChange={(e) => handleAddressChange(e, "clientAddress")}
                placeholder="Street"
                id="Street"
              />
            </label>
            <div className="address">
              <div>
                <label htmlFor="city">
                  City
                  <input
                    name="city"
                    value={formData.clientAddress.city}
                    onChange={(e) => handleAddressChange(e, "clientAddress")}
                    placeholder="City"
                    id="city"
                  />
                </label>
              </div>
              <div>
                <label htmlFor="postCode">
                  Post Code
                  <input
                    name="postCode"
                    value={formData.clientAddress.postCode}
                    onChange={(e) => handleAddressChange(e, "clientAddress")}
                    placeholder="Post Code"
                    id="postCode"
                  />
                </label>
              </div>
              <div>
                <label htmlFor="country">
                  Country
                  <input
                    name="country"
                    value={formData.clientAddress.country}
                    onChange={(e) => handleAddressChange(e, "clientAddress")}
                    placeholder="Country"
                    id="country"
                  />
                </label>
              </div>
            </div>
            <div className="date">
              <div>
                <label htmlFor="InvoiceDate">
                  Invoice Date
                  <DatePicker
                    selected={
                      formData.createdAt ? new Date(formData.createdAt) : null
                    }
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        createdAt: date?.toISOString() || "",
                      }))
                    }
                    dateFormat="dd MMM yyyy"
                    placeholderText="Select invoice date"
                  />
                  <Image
                    src={`/assets/icon-calendar.svg`}
                    width={16}
                    height={16}
                    alt="calendar"
                  />
                </label>
              </div>
              <div>
                <label htmlFor="paymentTerms">
                  Payment Terms
                  <Select
                    options={options}
                    onChange={(option) => {
                      const newPaymentTerms = option?.value ?? 0;
                      const newPaymentDue = new Date(
                        new Date().setDate(
                          new Date().getDate() + newPaymentTerms
                        )
                      ).toISOString();

                      setFormData((prev) => ({
                        ...prev,
                        paymentTerms: newPaymentTerms,
                        paymentDue: newPaymentDue,
                      }));
                    }}
                    defaultValue={options.find(
                      (o) => o.value === formData.paymentTerms
                    )}
                  />
                </label>
              </div>
            </div>
          </div>
          <label htmlFor="description">
            Description
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              id="description"
            />
          </label>
          <h2>Item List</h2>
          {width > 600 && (
            <ul>
              <li>Item Name</li>
              <li>Qty.</li>
              <li>Price</li>
              <li>Total</li>
            </ul>
          )}{" "}
          {width > 600
            ? formData.items.map((item, index) => (
                <div key={index} className="itemsContainer">
                  <input
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    placeholder="Item Name"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", +e.target.value)
                    }
                    placeholder="Quantity"
                  />
                  <input
                    type="number"
                    value={`${item.price}.00`}
                    onChange={(e) =>
                      handleItemChange(index, "price", +e.target.value)
                    }
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={item.total}
                    onChange={(e) =>
                      handleItemChange(index, "total", +e.target.value)
                    }
                    placeholder="Total"
                  />
                  <Image
                    src={`/assets/icon-delete.svg`}
                    width={14}
                    height={18}
                    alt="delete"
                    onClick={() => handleRemoveItem(index)}
                  />
                </div>
              ))
            : formData.items.map((item, index) => (
                <div key={index} className="itemsContainer">
                  <div>
                    <label htmlFor="itemName">
                      <p>Item Name</p>
                      <input
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        placeholder="Item Name"
                        id="itemName"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="Quantity">
                      <p>Qty.</p>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", +e.target.value)
                        }
                        placeholder="Quantity"
                        id="Quantity"
                      />
                    </label>
                    <label htmlFor="Price">
                      <p>Price</p>
                      <input
                        type="number"
                        value={`${item.price}.00`}
                        onChange={(e) =>
                          handleItemChange(index, "price", +e.target.value)
                        }
                        placeholder="Price"
                        id="Price"
                      />
                    </label>
                    <label htmlFor="Total">
                      <p>Total</p>
                      <input
                        type="number"
                        value={item.total}
                        onChange={(e) =>
                          handleItemChange(index, "total", +e.target.value)
                        }
                        placeholder="Total"
                        id="Total"
                      />
                    </label>

                    <Image
                      src={`/assets/icon-delete.svg`}
                      width={14}
                      height={18}
                      alt="delete"
                      onClick={() => handleRemoveItem(index)}
                    />
                  </div>
                </div>
              ))}
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                items: [
                  ...prev.items,
                  { name: "", quantity: 1, price: 0, total: 0 },
                ],
              }))
            }
            className="addBtn"
          >
            + Add New Item
          </button>
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
                Save changes successful.
              </motion.div>
            )}{" "}
          </AnimatePresence>
        </form>{" "}
        <div className="createBtns">
          <div>
            <button onClick={() => dispatch(resetModal())} className="discard">
              Discard
            </button>
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("draft")}
              >
                {loading ? (
                  <motion.span
                    key="loading"
                    className="loading"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Saving...
                  </motion.span>
                ) : (
                  "Save as Draft"
                )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("pending")}
              >
                {loading ? (
                  <motion.span
                    key="loading"
                    className="loading"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Saving...
                  </motion.span>
                ) : (
                  "Save & Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
