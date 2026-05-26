export default {
  async fetch(request, env, ctx) {
    if (request.method === "GET") {
      return new Response("NexyGirl Bot is running ✅", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const body = await request.json();
      const events = body.events || [];

      for (const event of events) {
        await handleLineEvent(event, env);
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.log("Webhook error:", error);
      return new Response("OK", { status: 200 });
    }
  },
};

async function handleLineEvent(event, env) {
  if (event.type !== "message") return;
  if (!event.message || event.message.type !== "text") return;
  if (!event.replyToken) return;

  const text = event.message.text.trim().toUpperCase();

if (text === "MENU") {
  return replyText(
    env,
    event.replyToken,
    `📋 NexyGirl Command Menu\n\n` +
    `พิมพ์คำสั่งที่ต้องการได้เลยค่ะ\n\n` +
    `🔐 OTP\n` +
    `ขอรหัสสำหรับสร้าง PIN ใหม่\n\n` +
    `🎥 ZOOM1\n` +
    `รับลิงก์ Zoom ห้องหลัก\n\n` +
    `🎥 ZOOM2\n` +
    `รับลิงก์ Zoom ห้องสำรอง / ห้องเรียน\n\n` +
    `❓ HELP\n` +
    `ดูวิธีใช้งานบอท`
  );
}

if (text === "HELP") {
  return replyText(
    env,
    event.replyToken,
    `❓ วิธีใช้งาน NexyGirl Bot\n\n` +
    `พิมพ์คำสั่งในกลุ่มได้เลย เช่น\n\n` +
    `MENU = ดูเมนูทั้งหมด\n` +
    `OTP = ขอรหัสสร้าง PIN\n` +
    `ZOOM1 = ลิงก์ Zoom ห้องหลัก\n` +
    `ZOOM2 = ลิงก์ Zoom ห้องสำรอง\n\n` +
    `บอทจะตอบเฉพาะคำสั่งที่รู้จักเท่านั้นค่ะ`
  );
}

  if (text === "OTP") {
    const otp = generateDailyOtp();
return replyText(
  env,
  event.replyToken,
  `🔐 รหัส OTP สำหรับสร้าง PIN ใหม่คือ\n\n` +
  `👉 ${otp}\n\n` +
  `⏰ รหัสนี้ใช้ได้ภายในวันนี้เท่านั้นนะคะ`
);
  }

  if (text === "ZOOM1") {
    return replyText(env, event.replyToken,
      "🎥 Zoom ห้องหลัก\n\n" +
      "ลิงก์ Zoom1:\n" +
      "https://us06web.zoom.us/j/88270396709?pwd=byNs89aKTTbzJPeKAQgaSUMaPjaYye.1"
    );
  }

    if (text === "ZOOM2") {
    return replyText(env, event.replyToken,
      "🎥 Zoom ห้อง NexusLife 2\n\n" +
      "ลิงก์ Zoom2:\n" +
      "https://us06web.zoom.us/j/7362170193?pwd=Nf6gXcbZRFZ28V8nwc0ibNQ2hef1y9.1"
    );
  }

  // ถ้าไม่ใช่คำสั่ง ให้เงียบ ไม่ตอบรบกวนในกลุ่ม
}

function generateDailyOtp() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const dd = parts.find((p) => p.type === "day").value;
  const mm = parts.find((p) => p.type === "month").value;

  const ddmm = Number(`${dd}${mm}`);
  const mmdd = Number(`${mm}${dd}`);

  const result = ddmm + mmdd + 1970;

  return String(result).padStart(4, "0").slice(-4);
}

async function replyText(env, replyToken, text) {
  const token = env.LINE_CHANNEL_ACCESS_TOKEN;

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    }),
  });

  const result = await response.text();
  console.log("LINE reply result:", response.status, result);
}