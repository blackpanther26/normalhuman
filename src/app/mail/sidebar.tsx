"use client";

import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { Nav } from "./nav";
import { File, Inbox, Send } from "lucide-react";
import { api } from "@/trpc/react";

type Props = { isCollapsed: boolean };

const Sidebar = (props: Props) => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "normalhuman-tab",
    "inbox",
  );
  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "inbox",
  });
  const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "sent",
  });
  const { data: draftThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "drafts",
  });

  return (
    <Nav
      isCollapsed={props.isCollapsed}
      links={[
        {
          title: "Inbox",
          label: inboxThreads?.toString() ?? "0",
          icon: Inbox,
          variant: tab === "inbox" ? "default" : "ghost",
        },
        {
          title: "Sent",
          label: sentThreads?.toString() ?? "0",
          icon: Send,
          variant: tab === "sent" ? "default" : "ghost",
        },
        {
          title: "Drafts",
          label: draftThreads?.toString() ?? "0",
          icon: File,
          variant: tab === "drafts" ? "default" : "ghost",
        },
      ]}
    />
  );
};

export default Sidebar;
