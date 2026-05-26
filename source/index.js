const ZOOM1_URL = "https://us06web.zoom.us/j/88270396709?pwd=byNs89aKTTbzJPeKAQgaSUMaPjaYye.1";
const ZOOM2_URL = "https://us06web.zoom.us/j/7362170193?pwd=Nf6gXcbZRFZ28V8nwc0ibNQ2hef1y9.1";


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
  return replyFlex(env, event.replyToken, createMenuFlex());
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
    `ZOOM2 = ลิงก์ Zoom ห้องสอง\n\n` +
    `บอทจะตอบเฉพาะคำสั่งที่รู้จักเท่านั้นค่ะ`
  );
}

if (text === "OTP") {
  const otp = generateDailyOtp();
  return replyFlex(env, event.replyToken, createOtpFlex(otp));
}

if (text === "ZOOM1") {
  return replyZoom(
    env,
    event.replyToken,
    {
      title: "🎥 Zoom ห้อง 1",
      description: "ใช้สำหรับเข้าห้อง Zoom หลัก",
      buttonLabel: "เข้าห้อง Zoom 1",
      url: ZOOM1_URL,
      meetingId: "882 7039 6709",
      passcode: "NxLife",
    }
  );
}
if (text === "ZOOM2") {
  return replyZoom(
    env,
    event.replyToken,
    {
      title: "🎥 Zoom ห้อง 2",
      description: "ใช้สำหรับเข้าห้อง Zoom สอง / ห้องเรียน",
      buttonLabel: "เข้าห้อง Zoom 2",
      url: ZOOM2_URL,
      meetingId: "853 5427 1817",
      passcode: "NxLife",
    }
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

async function replyFlex(env, replyToken, flexMessage) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "flex",
          altText: flexMessage.altText,
          contents: flexMessage.contents,
        },
      ],
    }),
  });

  const result = await res.text();
  console.log("LINE flex reply:", res.status, result);
}

function createOtpFlex(otp) {
  return {
    altText: `รหัส OTP สำหรับสร้าง PIN ใหม่คือ ${otp}`,
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        backgroundColor: "#FFF7ED",
        contents: [
          {
            type: "text",
            text: "🔐 OTP \n สำหรับสร้าง PIN ใหม่",
            weight: "bold",
            size: "xl",
            color: "#C06428",
            wrap: true,
          },
          {
            type: "text",
            text: "ใช้รหัสนี้เพื่อตั้งค่า PIN ใหม่ของคุณ",
            size: "sm",
            color: "#64748B",
            wrap: true,
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FFFFFF",
            cornerRadius: "18px",
            paddingAll: "20px",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: otp,
                weight: "bold",
                size: "5xl",
                align: "center",
                color: "#0F172A",
              },
              {
                type: "text",
                text: "ใช้ได้ภายในวันนี้เท่านั้น",
                size: "sm",
                align: "center",
                color: "#64748B",
                margin: "sm",
              },
            ],
          },
          {
            type: "text",
            text: "⏰ รหัสนี้จะหมดอายุเมื่อสิ้นสุดวัน",
            size: "xs",
            color: "#94A3B8",
            wrap: true,
            margin: "md",
          },
        ],
      },
    },
  };
}

function createMenuFlex() {
  return {
    altText: "NexyGirl Command Menu",
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        backgroundColor: "#F8FAFC",
        contents: [
          {
            type: "text",
            text: "📋 NexyGirl Menu",
            weight: "bold",
            size: "xl",
            color: "#0F172A",
            wrap: true,
          },
          {
            type: "text",
            text: "แตะปุ่ม หรือพิมพ์คำสั่งที่ต้องการได้เลยค่ะ",
            size: "sm",
            color: "#64748B",
            wrap: true,
          },
          createCommandButton("🔐 ขอ OTP", "OTP"),
          createCommandButton("🎥 Zoom ห้อง 1", "ZOOM1"),
          createCommandButton("🎥 Zoom ห้อง 2", "ZOOM2"),
          createCommandButton("❓ วิธีใช้งาน", "HELP"),
        ],
      },
    },
  };
}

function createCommandButton(label, commandText) {
  return {
    type: "button",
    style: "secondary",
    height: "sm",
    margin: "md",
    action: {
      type: "message",
      label: label,
      text: commandText,
    },
  };
}

function createZoomFlex({ title, description, buttonLabel, url }) {
  return {
    altText: title,
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        backgroundColor: "#EFF6FF",
        contents: [
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "xl",
            color: "#1D4ED8",
            wrap: true,
          },
          {
            type: "text",
            text: description,
            size: "sm",
            color: "#475569",
            wrap: true,
          },
          {
            type: "button",
            style: "primary",
            color: "#2563EB",
            margin: "lg",
            action: {
              type: "uri",
              label: buttonLabel,
              uri: url,
            },
          },
          {
            type: "text",
            text: "แตะปุ่มเพื่อเปิดลิงก์ Zoom",
            size: "xs",
            color: "#94A3B8",
            wrap: true,
            margin: "md",
          },
        ],
      },
    },
  };
}

async function replyZoom(env, replyToken, zoom) {
  const flexMessage = createZoomFlex({
    title: zoom.title,
    description: zoom.description,
    buttonLabel: zoom.buttonLabel,
    url: zoom.url,
  });

  const fallbackText =
    `${zoom.title}\n\n` +
    `หากกดปุ่มเข้า Zoom ไม่ได้ ให้ใช้ข้อมูลด้านล่างนี้แทน\n\n` +
    `🔗 Link:\n${zoom.url}\n\n` +
    `🆔 Meeting ID:\n${zoom.meetingId}\n\n` +
    `🔐Passcode:\n${zoom.passcode}`;

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "flex",
          altText: zoom.title,
          contents: flexMessage.contents,
        },
        {
          type: "text",
          text: fallbackText,
        },
      ],
    }),
  });

  const result = await res.text();
  console.log("LINE zoom reply:", res.status, result);
}