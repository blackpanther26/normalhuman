"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "./action";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/use-threads";
import { turndown } from "@/lib/turndown";
import { Card } from "@/components/ui/card";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AiComposeButton = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((thread) => thread.id === threadId);

  const aiGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
      setOpen(false);
      setPrompt("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="transition-colors hover:bg-primary/10"
        >
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Smart Compose
          </DialogTitle>
          <DialogDescription>
            Let AI help you craft the perfect email response. Just describe what
            you want to say.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/50 p-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Write a professional response accepting their meeting invitation for next week"
            className="min-h-32 resize-none bg-background"
            disabled={isLoading}
          />
        </Card>

        <DialogFooter className="sm:justify-start">
          <div className="flex w-full gap-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={aiGenerate}
              className="flex-1"
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiComposeButton;
