// api/initial-sync
import { Account } from "@/lib/account";
import { syncToDb } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }
  const dbAccount = await db.account.findUnique({
    where: { id: accountId, userId },
  });
  if (!dbAccount) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  const account = new Account(dbAccount.accessToken);
  const response = await account.performInitialSync();
  if (!response) {
    return NextResponse.json(
      { message: "Failed to sync emails" },
      { status: 500 },
    );
  }
  const { emails, deltaToken } = response;

  await db.account.update({
    where: { id: accountId },
    data: { nextDeltaToken: deltaToken },
  });

  await syncToDb(emails, accountId);
  console.log('sync complete',deltaToken);
  return NextResponse.json({ emails, deltaToken });
};
