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
import { readStreamableValue } from "ai/rsc";
import { Loader2 } from "lucide-react";

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

const LoadingOverlay = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px]">
    <div className="flex flex-col items-center space-y-4 rounded-xl bg-white/90 p-6 shadow-lg">
      <div className="relative h-12 w-12">
        <Loader2 className="absolute animate-spin text-gray-900" size={48} />
        <div className="absolute h-12 w-12 animate-pulse rounded-full bg-green-100/50" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-gray-900">Generating Content</p>
        <p className="text-xs text-gray-500">Using AI to compose your email...</p>
      </div>
    </div>
  </div>
);

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
  defaultToolbarExpanded = false,
}: Props) => {
  const [value, setValue] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState(defaultToolbarExpanded);
  const [token, setToken] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const aiGenerate = async () => {
    try {
      setIsGenerating(true);
      const { output } = await generateEmailAutocomplete(value);
      for await (const token of readStreamableValue(output)) {
        if (token) {
          setToken(token);
          editor?.commands?.insertContent(token);
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
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

  React.useEffect(() => {
    if (token) {
      editor?.commands?.insertContent(token);
    }
  }, [token, editor]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Initializing editor...</p>
        </div>
      </div>
    );
  }

  const onGenerate = (token: string) => {
    editor.chain().focus().insertContent(token).run();
  };

  return (
    <div className="relative">
      {isGenerating && <LoadingOverlay />}
      
      <div className="flex border-b p-4 py-2">
        <EditorMenuBar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To"
              onChange={setToValue}
              placeholder="Add Recipients"
              value={toValue}
            />
            <TagInput
              label="Cc"
              onChange={setCcValue}
              placeholder="Add Recipients"
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
          disabled={isSending || isGenerating}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;