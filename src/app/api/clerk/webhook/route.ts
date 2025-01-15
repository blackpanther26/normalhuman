import { db } from "@/server/db";

export const POST = async (req: Request) => {
  try {
    // Parse the JSON payload
    const { data } = await req.json();

    if (!data || !data.id || !data.email_addresses?.length) {
      return new Response(
        JSON.stringify({ error: "Invalid payload structure" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailAddress = data.email_addresses[0].email_address;
    const firstName = data.first_name || null; // Handle potential empty fields
    const lastName = data.last_name || null;
    const id = data.id;
    const imageUrl = data.image_url || null;

    // Check if a user with the same ID already exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new user
    await db.user.create({
      data: {
        id,
        emailAddress,
        firstName,
        lastName,
        imageUrl,
      },
    });

    return new Response(
      JSON.stringify({ message: "User created successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
