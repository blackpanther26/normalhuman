"use client";

import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { RouterOutputs } from "@/trpc/react";
import Avatar from "react-avatar";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Letter } from "react-letter";

type Props = {
  email: RouterOutputs["account"]["getThread"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();
  const isMe = account?.emailAddress === email.from?.address;

  return (
    <div
      className={cn(
        "rounded-md border p-4 transition-all hover:translate-x-2",
        { "border-4 border-gray-900": isMe },
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
          <span className="font-medium">
            {isMe ? "Me" : email.from.address}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(email.sentAt ?? new Date(), { addSuffix: true })}
        </p>
      </div>
      <div className="mt-2 max-w-full overflow-hidden break-words">
        <Letter
          html={email?.body ?? ""}
          className="rounded-md bg-white text-black"
        />
      </div>
    </div>
  );
};

export default EmailDisplay;
