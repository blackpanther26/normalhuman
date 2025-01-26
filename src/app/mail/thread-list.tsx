"use client";
import { Badge } from "@/components/ui/badge";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import React from "react";

const ThreadList = () => {
  const { threads, threadId, setThreadId } = useThreads();
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

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
          return (
            <React.Fragment key={date}>
              <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
                {format(new Date(date), "MMMM d, yyyy")}
              </div>
              {threads.map((thread) => {
                return (
                  <button
                    onClick={() => setThreadId(thread.id)}
                    key={thread.id}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                      thread.id === threadId && "bg-accent",
                    )}
                  >
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">
                            {thread.emails.at(-1)?.from.name ||
                              thread.emails.at(-1)?.from.address ||
                              "Unknown"}
                          </div>
                        </div>
                        <div className={cn("ml-auto text-xs")}>
                          {formatDistanceToNow(
                            thread.emails.at(-1)?.sentAt ?? new Date(),
                            { addSuffix: true },
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-medium">
                        {thread.subject}
                      </div>
                    </div>
                    <div
                      className="line-clamp-2 text-xs text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          thread.emails.at(-1)?.bodySnippet ?? "",
                          {
                            USE_PROFILES: { html: true },
                          },
                        ),
                      }}
                    ></div>
                    {thread.emails[0]?.sysLabels.length && (
                      <div className="item-center flex gap-2">
                        {thread.emails[0].sysLabels.map((label) => (
                          <Badge
                            key={label}
                            variant={getBadgeVariantFromLabel(label)}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

function getBadgeVariantFromLabel(
  label: string,
): "default" | "secondary" | "destructive" | "outline" | null | undefined {
  const lowerLabel = label.toLowerCase();

  switch (lowerLabel) {
    case "work":
      return "default";
    case "important":
      return "outline";
    case "urgent":
      return "destructive";
    case "personal":
      return "default";
    case "spam":
      return "destructive";
    default:
      return "secondary";
  }
}

export default ThreadList;
