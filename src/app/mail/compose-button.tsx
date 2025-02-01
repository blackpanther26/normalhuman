"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import EmailEditor from "./email-editor";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { toast } from "sonner";

const ComposeButton = () => {
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [subject, setSubject] = React.useState<string>("");

  const { account } = useThreads();
  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    if (!account) return;
    sendEmail.mutate(
      {
        accountId: account.id,
        body: value,
        subject,
        from: { name: account?.name ?? "Me", address: account.emailAddress },
        to: toValues.map((v) => ({
          name: typeof v.label === "string" ? v.label : v.value, 
          address: v.value,
        })),
        cc: ccValues.map((v) => ({
          name: typeof v.label === "string" ? v.label : v.value,
          address: v.value,
        })),
        threadId: "",
        replyTo: { name: account.name, address: account.emailAddress },
        inReplyTo: "",
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to send email");
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Pencil className="mr-1 size-4" />
            Compose
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>New Message</SheetTitle>
            <SheetDescription>
              Fill in the form below to send an email.
            </SheetDescription>
          </SheetHeader>
          <EmailEditor
            toValue={toValues}
            setToValue={setToValues}
            ccValue={ccValues}
            setCcValue={setCcValues}
            subject={subject}
            setSubject={setSubject}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
            to={toValues.map((v) => v.value)}
            defaultToolbarExpanded={true}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ComposeButton;
