import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function publicUser(user) {
  const legacyProfile = user.petProfile?.toObject?.() || user.petProfile;
  const petProfiles = user.petProfiles?.length
    ? user.petProfiles
    : user.petProfile?.breed
      ? [{ ...legacyProfile, _id: "legacy", name: "Your dog" }]
      : [];
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    petProfiles: petProfiles.map((profile) => ({
      id: String(profile._id),
      name: profile.name,
      breed: profile.breed,
      neckGirthCm: profile.neckGirthCm ?? profile.neckCm,
      chestGirthCm: profile.chestGirthCm ?? profile.chestCm,
      backLengthCm: profile.backLengthCm ?? profile.backCm,
    })),
  };
}

function petProfileFrom(body) {
  const { name, breed, neckGirthCm, chestGirthCm, backLengthCm } = body;
  const values = { name: String(name || "").trim(), breed: String(breed || "").trim(), neckGirthCm, chestGirthCm, backLengthCm };
  if (!values.name) throw Object.assign(new Error("A pet name is required"), { statusCode: 400 });
  if (!values.breed) throw Object.assign(new Error("A dog breed is required"), { statusCode: 400 });
  for (const [label, value] of [["neck girth", neckGirthCm], ["chest girth", chestGirthCm], ["back length", backLengthCm]]) {
    if (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 300) {
      throw Object.assign(new Error(`${label} measurement must be between 0 and 300 cm`), { statusCode: 400 });
    }
  }
  return { name: values.name, breed: values.breed, neckGirthCm: Number(neckGirthCm), chestGirthCm: Number(chestGirthCm), backLengthCm: Number(backLengthCm) };
}

function upgradeLegacyProfile(user) {
  if (!user.petProfiles?.length && user.petProfile?.breed) {
    user.petProfiles = [{ name: "Your dog", breed: user.petProfile.breed, neckGirthCm: user.petProfile.neckGirthCm ?? user.petProfile.neckCm, chestGirthCm: user.petProfile.chestGirthCm ?? user.petProfile.chestCm, backLengthCm: user.petProfile.backLengthCm ?? user.petProfile.backCm }];
    user.petProfile = {};
  }
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
    upgradeLegacyProfile(req.user);
    req.user.petProfiles = [petProfileFrom(req.body)];
    req.user.petProfile = {};
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
}

export async function createPetProfile(req, res, next) {
  try {
    upgradeLegacyProfile(req.user);
    if (req.user.petProfiles.length >= 12) return res.status(400).json({ message: "You can save up to 12 pet profiles" });
    req.user.petProfiles.push(petProfileFrom(req.body));
    req.user.petProfile = {};
    await req.user.save();
    res.status(201).json({ user: publicUser(req.user) });
  } catch (error) { next(error); }
}

export async function updatePetProfile(req, res, next) {
  try {
    upgradeLegacyProfile(req.user);
    const profile = req.params.id === "legacy" ? req.user.petProfiles[0] : req.user.petProfiles.id(req.params.id);
    if (!profile) return res.status(404).json({ message: "Pet profile not found" });
    Object.assign(profile, petProfileFrom(req.body));
    req.user.petProfile = {};
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) { next(error); }
}

export async function deletePetProfile(req, res, next) {
  try {
    upgradeLegacyProfile(req.user);
    const profile = req.params.id === "legacy" ? req.user.petProfiles[0] : req.user.petProfiles.id(req.params.id);
    if (!profile) return res.status(404).json({ message: "Pet profile not found" });
    profile.deleteOne();
    req.user.petProfile = {};
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) { next(error); }
}
