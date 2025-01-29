"use client";

import {
  Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from "kbar";
import RenderResults from "./render-results";
import { useLocalStorage } from "usehooks-ts";

export default function KBar({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useLocalStorage("normalhuman-tab", "inbox");
  const [done, setDone] = useLocalStorage('normalhuman-done', false)
  const actions: Action[] = [
    {
        id: "inboxAction",
        name: "Inbox",
        shortcut: ["g", 'i'],
        keywords: "inbox",
        section: "Navigation",
        subtitle: "View your inbox",
        perform: () => {
            setTab('inbox')
        },
    },
    {
        id: "draftsAction",
        name: "Drafts",
        shortcut: ['g', 'd'],
        keywords: "drafts",
        subtitle: "View your drafts",
        section: "Navigation",
        perform: () => {
            setTab('drafts')
        },
    },
    {
        id: "sentAction",
        name: "Sent",
        shortcut: ['g', "s"],
        keywords: "sent",
        section: "Navigation",
        subtitle: "View the sent",
        perform: () => {
            setTab('sent')
        },
    },
    
  ];

  return (
    <KBarProvider actions={actions}>
      <ActualComponent>{children}</ActualComponent>
    </KBarProvider>
  );
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-white text-foreground shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <div className="bg-white dark:bg-gray-800">
              <div className="border-x-0 border-b-2 dark:border-gray-700">
                <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 dark:bg-gray-800" />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
