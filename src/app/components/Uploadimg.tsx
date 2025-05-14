import React from "react";
import { setModal } from "../redux/modalSlice";
import { resetModal } from "../redux/modalSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect } from "react";
import { setPreview } from "../redux/modalSlice";
/* eslint-disable @next/next/no-img-element */

const Uploadimg: React.FC = () => {
  const preview = useSelector((state: RootState) => state.modal.preview);
  const modal = useSelector((state: RootState) => state.modal.modal);

  const dispatch = useDispatch();
  useEffect(() => {
    const stored = localStorage.getItem("preview");
    if (stored) {
      dispatch(setPreview(stored));
    }
  }, [dispatch]);
  const handleToggleModal = () => {
    if (modal === "img") {
      dispatch(resetModal());
    } else {
      dispatch(setModal("img"));
    }
  };
  return (
    <div>
      <img
        src={preview ? preview : "/assets/image-avatar.jpg"}
        width={40}
        height={40}
        alt="avatar"
        onClick={handleToggleModal}
      />
    </div>
  );
};

export default Uploadimg;
