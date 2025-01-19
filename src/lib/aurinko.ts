"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const AURINKO_API_BASE = "https://api.aurinko.io/v1";

/**
 * Generates the Aurinko authorization URL for the specified service type.
 * @param serviceType - The email service type (Google, Office365, iCloud).
 * @returns The URL to start the Aurinko authentication process.
 */
export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365" | "iCloud",
): Promise<string> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID || "",
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/aurinko/callback`,
  });

  return `${AURINKO_API_BASE}/auth/authorize?${params.toString()}`;
};

/**
 * Exchanges an authorization code for an access token.
 * @param code - The authorization code received from Aurinko.
 * @returns An object containing the account ID and access token.
 */
export const exchangeCodeForToken = async (
  code: string,
): Promise<{ accountId: number; accessToken: string } | null> => {
  try {
    console.log("Exchanging code for token:", code);

    const response = await axios.post(
      `${AURINKO_API_BASE}/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID || "",
          password: process.env.AURINKO_CLIENT_SECRET || "",
        },
      },
    );

    console.log("Token exchange successful:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error during token exchange");
    return null;
  }
};

/**
 * Retrieves account information using the provided access token.
 * @param token - The access token for the Aurinko API.
 * @returns An object containing the user's email and name.
 */
export const getAccountInfo = async (
  token: string,
): Promise<{ email: string; name: string } | null> => {
  try {
    const response = await axios.get(`${AURINKO_API_BASE}/account`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching account information");
    return null;
  }
};

/**
 * Handles and logs Axios errors with a custom message.
 * @param error - The Axios error object.
 * @param contextMessage - A message providing context for the error.
 */
const handleAxiosError = (error: unknown, contextMessage: string): void => {
  console.error(contextMessage);

  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
  } else {
    console.error("Unexpected error:", error);
  }
};
