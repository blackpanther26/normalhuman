export const POST = async (req: Request) => {
    const body = await req.json();
    console.log("Webhook data received:", body);

    return new Response(
        JSON.stringify({
            message: "Webhook received!",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};
