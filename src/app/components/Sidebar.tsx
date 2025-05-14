"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTheme } from "../redux/themeSlice";
import Image from "next/image";
import { resetUser } from "../redux/userSlice";
import Uploadimg from "./Uploadimg";
import { resetModal } from "../redux/modalSlice";
/* eslint-disable @next/next/no-img-element */

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <aside className="sideBar">
      <div className="logo">
        <Image src={`/assets/logo.svg`} alt="logo" width={40} height={38} />
        <div></div>
      </div>
      <div className="bottomSec">
        <div>
          {user ? (
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA8klEQVR4nO2WvUoDQBCEr0vhw/kEeQRNYb3T7oog5AHSKdqksAn4C5lpRfvYKPZaahc5NARB8eJ5/pGF7fb244a9uU0ppQTnGULTz6YFlUqiBoKXXAhUVFxzFkvQT0i3UPxKEFw9c142A631Rx249p4fqB6agDa2DlcsdDx3An09KN/EQqfv2o/rHqE7OK/hmiB0nuvNeYDgLjbZLQJZcL/KB1233wMK3hRLB9fJm41cj1m23MyCV1m2XGvOIYIDC22bj1eLQLNhgPOo6TC8GgrnTnPQLCy4jtBF+jcWVBVYfnx/ZmdA63UrL4BVICc/gjwBozdN6aS2RZUAAAAASUVORK5CYII="
              alt="logout"
              className="logoutPic"
              width={20}
              height={20}
              onClick={() => {
                window.location.reload();
                localStorage.removeItem("token");
                dispatch(resetUser());
              }}
            />
          ) : (
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA8klEQVR4nO2WvUoDQBCEr0vhw/kEeQRNYb3T7oog5AHSKdqksAn4C5lpRfvYKPZaahc5NARB8eJ5/pGF7fb244a9uU0ppQTnGULTz6YFlUqiBoKXXAhUVFxzFkvQT0i3UPxKEFw9c142A631Rx249p4fqB6agDa2DlcsdDx3An09KN/EQqfv2o/rHqE7OK/hmiB0nuvNeYDgLjbZLQJZcL/KB1233wMK3hRLB9fJm41cj1m23MyCV1m2XGvOIYIDC22bj1eLQLNhgPOo6TC8GgrnTnPQLCy4jtBF+jcWVBVYfnx/ZmdA63UrL4BVICc/gjwBozdN6aS2RZUAAAAASUVORK5CYII="
              alt="login"
              className="loginPic"
              width={20}
              height={20}
              onClick={() => {
                dispatch(resetModal());
                router.push("/login");
              }}
              style={{ transform: "rotate(180deg)" }}
            />
          )}
        </div>
        <div onClick={() => dispatch(toggleTheme())} className="theme">
          <Image
            width={20}
            height={20}
            alt={`${mode}`}
            src={`/assets/icon-${mode === "dark" ? "moon" : "sun"}.svg`}
          />
        </div>
        <div className="pic">
          <Uploadimg />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
