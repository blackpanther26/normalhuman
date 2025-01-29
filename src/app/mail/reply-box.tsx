"use client";

import React from "react";
import EmailEditor from "./email-editor";
import { api, RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";

const ReplyBox = () => {
  const { threadId, accountId } = useThreads();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    accountId,
    threadId: threadId ?? "",
  });
  if (!replyDetails) {
    return null;
  }
  return <Component replyDetails={replyDetails} />;
};

const Component = ({
  replyDetails,
}: {
  replyDetails: RouterOutputs["account"]["getReplyDetails"];
}) => {
  const { threadId, accountId } = useThreads();
  const [subject, setSubject] = React.useState<string>(
    replyDetails.subject.startsWith("Re: ")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );
  const [toValue, setToValue] = React.useState<
    { label: string; value: string }[]
  >(replyDetails.to.map((to) => ({ label: to.address, value: to.address })));
  const [ccValue, setCcValue] = React.useState<
    { label: string; value: string }[]
  >(replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })));
  const [to] = React.useState<string[]>(
    replyDetails.to.map((to) => to.address),
  );
  React.useEffect(() => {
    if (!replyDetails || !threadId) {
      return;
    }
    if (!replyDetails.subject.startsWith("Re: ")) {
      setSubject(`Re: ${replyDetails.subject}`);
    } else {
      setSubject(replyDetails.subject);
    }

    setToValue(
      replyDetails.to.map((to) => ({ label: to.address, value: to.address })),
    );
    setCcValue(
      replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })),
    );
  }, [replyDetails, threadId]);

  const handleSend = async (value: string) => {
    console.log(value);
  };

  return (
    <EmailEditor
      subject={subject}
      setSubject={setSubject}
      toValue={toValue}
      setToValue={setToValue}
      ccValue={ccValue}
      setCcValue={setCcValue}
      to={to}
      handleSend={handleSend}
      isSending={false}
    />
  );
};
export default ReplyBox;
