import { exchangeCodeForToken, getAccountInfo } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect("/sign-in");
    }

    // Extract and validate query parameters
    const params = req.nextUrl.searchParams;
    const status = params.get("status");
    const code = params.get("code");

    if (status !== "success") {
      return NextResponse.json(
        { message: "Failed to link account with Aurinko" },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code not found" },
        { status: 400 },
      );
    }

    // Exchange authorization code for a token
    const token = await exchangeCodeForToken(code);
    if (!token) {
      return NextResponse.json(
        { message: "Failed to exchange authorization code for token" },
        { status: 400 },
      );
    }

    // Fetch account information using the access token
    const accountInfo = await getAccountInfo(token.accessToken);
    if (!accountInfo) {
      return NextResponse.json(
        { message: "Failed to fetch account information" },
        { status: 400 },
      );
    }

    // Upsert account details in the database
    await db.account.upsert({
      where: { id: token.accountId.toString() },
      update: { accessToken: token.accessToken },
      create: {
        id: token.accountId.toString(),
        userId,
        emailAddress: accountInfo.email,
        name: accountInfo.name,
        accessToken: token.accessToken,
      },
    });

    // Redirect the user to the mail page
    return NextResponse.redirect(new URL("/mail", req.url));
  } catch (error) {
    console.error("Error in Aurinko callback handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
