"use client";
import useThreads from "@/hooks/use-threads";
import { format } from "date-fns";
import React from "react";

const ThreadList = () => {
  const { threads } = useThreads();
  const groupedThreads = threads?.reduce(
    (acc, thread) => {
      const date = format(thread.emails[0]?.sentAt ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads>,
  );
  console.log(groupedThreads);
  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
          return <React.Fragment key={date}>
            <div className="text-xs font-medium text-muted-foreground mt-4 first:mt-0">
              {date}
            </div>
          </React.Fragment>;
        })}
      </div>
    </div>
  );
};

export default ThreadList;
