"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useThreads from "@/hooks/use-threads";
import { Separator } from "@/components/ui/separator";
import {
  Archive,
  ArchiveX,
  Clock,
  MoreVertical,
  Trash2,
  Inbox,
} from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";
import { useAtom } from "jotai";
import { isSearchingAtom } from "./search-bar";
import SearchDisplay from "./search-display";

const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Trash2 className="size-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className="ml-2" />
        <Button variant={"ghost"} size={"icon"} disabled={!thread}>
          <Clock className="size-4" />
        </Button>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star Thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {isSearching ? (
        <SearchDisplay />
      ) : (
        <>
          {thread ? (
            <>
              <div className="flex flex-1 flex-col overflow-scroll">
                <div className="flex items-center p-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Avatar>
                      <AvatarImage alt="avatar" />
                      <AvatarFallback>
                        {thread.emails[0]?.from?.name
                          ? thread.emails[0].from.name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-semibold">
                        {thread.emails[0]?.from?.name || "Unknown"}
                        <div className="line-clamp-1 text-xs">
                          {thread.emails[0]?.subject || "No subject"}
                        </div>
                        <div className="line-clamp-1 text-xs">
                          <span className="font-medium">Reply-To:</span>
                          {thread.emails[0]?.from?.address || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {thread.emails[0]?.sentAt && (
                    <div className="ml-auto text-xs text-muted-foreground">
                      {format(new Date(thread.emails[0].sentAt), "PPpp")}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll">
                  <div className="flex flex-col gap-4 p-6">
                    {thread.emails.map((email) => {
                      return <EmailDisplay email={email} key={email.id} />;
                    })}
                  </div>
                </div>
                <div className="flex-1"></div>
                <Separator className="mt-auto" />
                <ReplyBox />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
              <div className="rounded-full bg-muted p-4">
                <Inbox className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">No message selected</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a message from the list to view its contents
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
