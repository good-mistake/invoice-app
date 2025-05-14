import React from "react";
import ImageModal from "./ImageModal";
import { resetModal } from "../redux/modalSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";
import CreateModal from "./CreateModal";
const Modal = () => {
  const modalType = useSelector((state: RootState) => state.modal.modal);
  const dispatch = useDispatch();
  const renderContent = () => {
    switch (modalType) {
      case "create":
        return <CreateModal />;
      case "edit":
        return <EditModal />;
      case "delete":
        return <DeleteModal />;
      case "img":
        return <ImageModal />;
      default:
        return null;
    }
  };
  if (!modalType) return null;
  return (
    <div className="overlay" onClick={() => dispatch(resetModal())}>
      <div>{renderContent()}</div>
    </div>
  );
};

export default Modal;
