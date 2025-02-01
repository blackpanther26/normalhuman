"use client";
import ThemeToggle from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import React from "react";

const ComposeButton = dynamic(() => import("./compose-button"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Mail = dynamic(() => import("./mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const MailDashboard = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2">
          <UserButton />
          <ThemeToggle />
          <ComposeButton />
        </div>
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
