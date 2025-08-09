import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log("🟢 Webhook received:", req.url);

    // Validate webhook secret
    if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      console.error("❌ LEMON_SQUEEZY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("❌ Invalid JSON in webhook");
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    // Verify webhook signature
    const hmac = crypto.createHmac(
      "sha256",
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
    );

    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "hex");
    const signatureHeader = req.headers.get("X-Signature") || "";
    const signature = Buffer.from(signatureHeader, "hex");

    if (
      signature.length !== digest.length ||
      !crypto.timingSafeEqual(digest, signature)
    ) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { message: "Invalid signature." },
        { status: 401 }
      );
    }

    // Extract user ID from webhook data
    const buyerUserId = body?.meta?.custom_data?.buyerUserId;
    if (!buyerUserId || typeof buyerUserId !== "string") {
      console.error("❌ Invalid buyerUserId in webhook:", buyerUserId);
      return NextResponse.json(
        { message: "Invalid buyerUserId or ID does not exist" },
        { status: 400 }
      );
    }

    // Check if this is a successful order
    const eventName = body?.meta?.event_name;
    if (eventName !== "order_created") {
      console.log("ℹ️ Ignoring webhook event:", eventName);
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    console.log("🟢 Processing subscription for user:", buyerUserId);

    // Update user subscription status
    const buyer = await client.user.update({
      where: { id: buyerUserId },
      data: { subscription: true },
    });

    if (!buyer) {
      console.error("❌ User not found:", buyerUserId);
      return NextResponse.json(
        { message: "Cannot update the subscription" },
        { status: 404 }
      );
    }

    console.log("✅ Subscription updated for user:", buyerUserId);
    return NextResponse.json({ data: buyer }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in webhook handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
