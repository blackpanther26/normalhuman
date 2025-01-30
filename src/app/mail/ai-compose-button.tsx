"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "./action";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/use-threads";
import { turndown } from "@/lib/turndown";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AiComposeButton = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const { threads, threadId,account } = useThreads();
  const thread = threads?.find((thread) => thread.id === threadId);

  const aiGenerate = async () => {
    let context = "";
    if (!props.isComposing) {
      for (const email of thread?.emails ?? []) {
        const content = `
            Subject: ${email.subject}
            From: ${email.from}
            Sent: ${new Date(email.sentAt).toLocaleString()}
            Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
            `;
        context += content;
      }
    }
    context += `My name is ${account?.name} and my email is ${account?.emailAddress}`;
    
    const { output } = await generateEmail(prompt, context);
    for await (const token of readStreamableValue(output)) {
      if (token) {
        props.onGenerate(token);
      }
    }
  };
  return (
    <Dialog open={open}>
      <DialogTrigger>
        <Button size="icon" variant={"outline"} onClick={() => setOpen(true)}>
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            AI will help you compose your email. Are you ready?
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your prompt here..."
          />
          <div className="h-2"></div>
          <Button
            onClick={() => {
              aiGenerate();
              setOpen(false);
              setPrompt("");
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AiComposeButton;
