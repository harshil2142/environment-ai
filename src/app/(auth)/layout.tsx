"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Cookies from "universal-cookie";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookies = new Cookies();
  const token = cookies.get("token");

  if (token) {
    redirect("/");
  }

  return (
    <>
      <div>{children}</div>
      <ToastContainer />
    </>
  );
}
