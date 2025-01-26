"use client";
import ThemeToggle from "@/components/theme-toggle";
import dynamic from "next/dynamic";
import React from "react";

const Mail = dynamic(() => import("./mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const MailDashboard = () => {
  return (
    <>
    <div className="absolute bottom-4 left-4">
      <ThemeToggle />
    </div>
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultNavCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default MailDashboard;
