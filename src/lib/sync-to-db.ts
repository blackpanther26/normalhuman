import { db } from "@/server/db";
import { EmailAddress, EmailAttachment, EmailMessage } from "./types";
import pLimit from "p-limit";
import { Prisma } from "@prisma/client";
import { OramaClient } from "./orama";
import { turndown } from "./turndown";
import { getEmbeddings } from "./embedding";

async function syncToDb(emails: EmailMessage[], accountId: string) {
  const limit = pLimit(10);

  const orama = new OramaClient(accountId);
  await orama.initialize();
  try {
    for (const email of emails) {
      const body = turndown.turndown(email.body ?? email.bodySnippet ?? "");
      const embeddings = await getEmbeddings(body);
      console.log(embeddings.values.length);
      await orama.insert({
        subject: email.subject,
        body: body,
        from: email.from.address,
        rawBody: email.bodySnippet ?? "",
        to: email.to.map((a) => a.address),
        sentAt: email.sentAt,
        threadId: email.threadId,
        embeddings,
      });
      await limit(() => upsertEmail(email, accountId));
    }
  } catch (error) {
    console.error("Error syncing emails to the database:", error);
  }
}

async function upsertEmail(email: EmailMessage, accountId: string) {
  try {
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";
    if (email.sysLabels.includes("sent")) {
      emailLabelType = "sent";
    } else if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    }

    // Upsert email addresses
    const addressToUpsert = new Map();
    for (const address of [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ]) {
      addressToUpsert.set(address.address, address);
    }

    const upsertedAddresses: Awaited<ReturnType<typeof upsertEmailAddress>>[] =
      [];
    for (const address of addressToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      if (upsertedAddress) {
        upsertedAddresses.push(upsertedAddress);
      }
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddress = addressMap.get(email.from.address);
    if (!fromAddress) {
      throw new Error("From address not found");
    }

    const toAddresses = email.to
      .map((address) => addressMap.get(address.address))
      .filter(Boolean);
    const ccAddresses = email.cc
      .map((address) => addressMap.get(address.address))
      .filter(Boolean);
    const bccAddresses = email.bcc
      .map((address) => addressMap.get(address.address))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      .map((address) => addressMap.get(address.address))
      .filter(Boolean);

    // Upsert Thread
    const participantIds = [
      ...new Set([
        fromAddress.id,
        ...toAddresses.map((a) => a!.id),
        ...ccAddresses.map((a) => a!.id),
        ...bccAddresses.map((a) => a!.id),
      ]),
    ];

    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds,
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: new Date(email.sentAt),
        participantIds,
      },
    });

    // Upsert Email
    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders: email.internetHeaders as any,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      },
    });

    // Update Thread Folder Status
    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let threadFolderType = "sent";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break;
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft";
      }
    }
    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    // Upsert Attachments
    for (const attachment of email.attachments) {
      if (!attachment.id) {
        console.warn(`Attachment ID missing for email ${email.id}. Skipping.`);
        continue;
      }
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error for email ${email.id}: ${error.message}`);
    } else {
      console.error(`Unknown error for email ${email.id}:`, error);
    }
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    return await db.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: accountId,
          address: address.address ?? "",
        },
      },
      update: {
        name: address.name,
        raw: address.raw,
      },
      create: {
        name: address.name,
        address: address.address ?? "",
        accountId: accountId,
        raw: address.raw,
      },
    });
  } catch (error) {
    console.error("Error upserting email address:", error);
    return null;
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.error(`Failed to upsert attachment for email ${emailId}:`, error);
  }
}

export { syncToDb };
