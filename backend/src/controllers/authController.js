import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function publicUser(user) {
  const petProfile = user.petProfile?.breed ? user.petProfile : null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    petProfile,
  };
}

function petProfileFrom(body) {
  const { breed, neckCm, chestCm, backCm } = body;
  const values = { breed: String(breed || "").trim(), neckCm, chestCm, backCm };
  const hasAnyValue = values.breed || [neckCm, chestCm, backCm].some((value) => value !== undefined && value !== "");
  if (!hasAnyValue) return {};
  if (!values.breed) throw Object.assign(new Error("A dog breed is required"), { statusCode: 400 });
  for (const [label, value] of [["neck", neckCm], ["chest", chestCm], ["back", backCm]]) {
    if (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 300) {
      throw Object.assign(new Error(`${label} measurement must be between 0 and 300 cm`), { statusCode: 400 });
    }
  }
  return { breed: values.breed, neckCm: Number(neckCm), chestCm: Number(chestCm), backCm: Number(backCm) };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      phone,
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.clearCookie("pawfit_session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(204).end();
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    const user = email
      ? await User.findOne({
          email: email.trim().toLowerCase(),
        }).select("+passwordResetToken +passwordResetTokenExpires")
      : null;

    if (user) {
      const crypto = await import("crypto");
      const { sendAccountEmail } = await import("../utils/emailService.js");

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      await user.save();

      await sendAccountEmail({
        to: user.email,
        kind: "reset",
        token: rawToken,
      });
    }

    res.json({
      message: "If that email exists, a password-reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
      });
    }

    const crypto = await import("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetTokenExpires");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password-reset link",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    next(error);
  }
}

export function getMe(req, res) {
  res.json({
    user: publicUser(req.user),
  });
}

export async function updateProfile(req, res, next) {
  try {
    req.user.petProfile = petProfileFrom(req.body);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
}
