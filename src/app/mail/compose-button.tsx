"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import EmailEditor from "./email-editor";

const ComposeButton = () => {
    const [toValues, setToValues] = React.useState<{label:string,value:string}[]>([]);
    const [ccValues, setCcValues] = React.useState<{label:string,value:string}[]>([]);
    const [subject, setSubject] = React.useState<string>('');
    const [body, setBody] = React.useState<string>('');
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Pencil className="size-4 mr-1"/>
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
            handleSend={(value) => console.log(value)}
            isSending={false}
            to={toValues.map((v) => v.value)}
          />
          {/* <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Send</Button>
            </SheetClose>
          </SheetFooter> */}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ComposeButton;
