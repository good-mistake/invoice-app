import React from "react";
import { useDispatch } from "react-redux";
import Sidebar from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  setError,
  setLoading,
  setSuccess,
  setPreview,
  setFile,
} from "../redux/modalSlice";
import Image from "next/image";
import { resetModal } from "../redux/modalSlice";
import { RootState } from "../redux/store";
const ImageModal = () => {
  const dispatch = useDispatch();
  const { loading, error, success, file } = useSelector(
    (state: RootState) => state.modal
  );
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        dispatch(
          setError("File size exceeds 1MB. Please choose a smaller image.")
        );
        return;
      }
      dispatch(setFile(selectedFile));
      dispatch(setLoading(false));
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        dispatch(setPreview(base64));
        localStorage.setItem("preview", base64);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadImg = async () => {
    dispatch(setError(""));
    dispatch(setSuccess(false));

    if (!file) return dispatch(setError("Please upload a file first"));

    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setError("Login required to upload in the backend"));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        dispatch(setLoading(true));
        const res = await fetch("/api/img", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ file: reader.result }),
        });
        if (!res.ok) return dispatch(setError("Upload failed"));
        dispatch(setSuccess(true));
        dispatch(setError(""));
        dispatch(setPreview(base64));
        localStorage.setItem("preview", base64);
      } catch (err) {
        console.error("Upload failed", err);
        dispatch(setError("Upload failed"));
        dispatch(setSuccess(false));
      } finally {
        dispatch(setLoading(false));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Sidebar />
      <div className="showModal">
        <input type="file" onChange={handleChange} />
        <AnimatePresence>
          <button onClick={handleUploadImg} disabled={loading}>
            {loading ? (
              <motion.span
                key="loading"
                className="loading"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                Uploading...
              </motion.span>
            ) : (
              "Upload"
            )}
          </button>
          <div onClick={() => dispatch(resetModal())} className="goBackBtn">
            <Image
              width={9}
              height={9}
              src={"/assets/icon-arrow-left.svg"}
              alt="arrow"
            />
            <p>Cancel</p>
          </div>
        </AnimatePresence>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Image uploaded successfully!</p>}
      </div>
    </div>
  );
};

export default ImageModal;
