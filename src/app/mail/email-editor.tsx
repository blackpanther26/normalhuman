"use client";

import React from "react";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TagInput from "./tag-input";
import { Input } from "@/components/ui/input";
import AiComposeButton from "./ai-compose-button";
import { generateEmailAutocomplete } from "./action";
import { turndown } from "@/lib/turndown";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/use-threads";

type Props = {
  subject: string;
  setSubject: (value: string) => void;
  toValue: { label: string; value: string }[];
  setToValue: (value: { label: string; value: string }[]) => void;
  ccValue: { label: string; value: string }[];
  setCcValue: (value: { label: string; value: string }[]) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;
  defaultToolbarExpanded?: boolean;
};

const EmailEditor = ({
  subject,
  setSubject,
  toValue,
  setToValue,
  ccValue,
  setCcValue,
  to,
  handleSend,
  isSending,
  defaultToolbarExpanded,
}: Props) => {
  if (!defaultToolbarExpanded) {
    defaultToolbarExpanded = false;
  }

  const [value, setValue] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState(defaultToolbarExpanded);
  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((thread) => thread.id === threadId);

  let context = "";
  for (const email of thread?.emails ?? []) {
    context += `
      Subject: ${email.subject}
      From: ${email.from}
      Sent: ${new Date(email.sentAt).toLocaleString()}
      Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
    `;
  }
  context += `My name is ${account?.name} and my email is ${account?.emailAddress}`;
  const aiGenerate = async () => {
    const { output } = await generateEmailAutocomplete(context, value);
    
    let generatedText = "";
    for await (const token of readStreamableValue(output)) {
      generatedText += token;
    }

    if (generatedText) {
      editor?.chain().focus().insertContent(generatedText).run();
    }
  };

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Mod-j": () => {
          aiGenerate();
          return true;
        },
      };
    },
  });
  
  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const onGenerate = (token: string) => {
    editor.chain().focus().insertContent(token).run();
  };

  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenuBar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To"
              onChange={setToValue}
              placeholder="Add Recepients"
              value={toValue}
            />
            <TagInput
              label="Cc"
              onChange={setCcValue}
              placeholder="Add Recepients"
              value={ccValue}
            />
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="font-medium text-green-600">Draft </span>
            <span>to {(to ?? []).join(", ")}</span>
          </div>
          <AiComposeButton
            isComposing={defaultToolbarExpanded}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent editor={editor} value={value} />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            await handleSend(value);
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
