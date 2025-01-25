"use client";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the Mail component
const Mail = dynamic(() => import("./mail"), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <p>Loading...</p>, // Optional: Add a loading fallback
});

const MailDashboard = () => {
  return (
    <div>
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultNavCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
};

export default MailDashboard;
