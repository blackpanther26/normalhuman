import { db } from "@/server/db";

export const POST = async (req: Request) => {
  try {
    const { data } = await req.json();

    console.log("Webhook payload:", data);

    if (!data || !data.id || !data.email_addresses?.length) {
      console.error("Invalid payload structure:", data);
      return new Response(
        JSON.stringify({ error: "Invalid payload structure" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailAddress = data.email_addresses[0].email_address;
    const firstName = data.first_name || null;
    const lastName = data.last_name || null;
    const id = data.id;
    const imageUrl = data.image_url || null;

    console.log("Checking for existing user in Neon DB...");
    const existingUser = await db.user.findUnique({ where: { id } });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Creating new user in Neon DB...");
    await db.user.create({
      data: {
        id,
        emailAddress,
        firstName,
        lastName,
        imageUrl,
      },
    });

    console.log("User created successfully!");
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
