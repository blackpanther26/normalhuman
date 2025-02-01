import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { emailAddressSchema } from "@/lib/types";
import { Account } from "@/lib/account";

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      accessToken: true,
    },
  });
  if (!account) {
    throw new Error("Account not found");
  }
  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth?.userId,
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
      },
    });
  }),

  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth?.userId,
      );
      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "drafts") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }

      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
    }),

  getThread: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth?.userId,
      );

      const acc = new Account(account.accessToken);
      acc.syncEmails().catch(console.error);

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "drafts") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 30,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),

  getSuggestions: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth?.userId,
      );
      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          address: true,
          name: true,
        },
      });
    }),

  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth?.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });
      if (!thread || thread.emails.length === 0) {
        throw new Error("Thread not found");
      }
      const lastExternalEmail = thread.emails.reverse().find((email) => {
        return email.from?.address !== account.emailAddress;
      });
      if (!lastExternalEmail) {
        throw new Error("No external emails found");
      }
      return {
        to: [
          lastExternalEmail.from,
          ...lastExternalEmail.to.filter(
            (t) => t.address !== account.emailAddress,
          ),
        ],
        cc: lastExternalEmail.cc.filter(
          (t) => t.address !== account.emailAddress,
        ),
        from: { name: account.name, address: account.emailAddress },
        subject: lastExternalEmail.subject,
        id: lastExternalEmail.internetMessageId,
      };
    }),

  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema),
        threadId: z.string(),
        inReplyTo: z.string().optional(),
        replyTo: emailAddressSchema.optional(),
        references: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth?.userId,
      );
      const acc = new Account(account.accessToken);

      await acc.sendEmail({
        from: input.from,
        subject: input.subject,
        body: input.body,
        inReplyTo: input.inReplyTo,
        threadId: input.threadId,
        references: input.threadId,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        replyTo: input.replyTo,
      });
    }),
});
