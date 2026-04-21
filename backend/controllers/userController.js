import Users from "../models/Users.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email Sudah Terdaftar"
      });
    }

    const user = new Users({
      email: normalizedEmail,
      password: password
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Register Berhasil!",
      user: userResponse
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({
        message: "Email/username dan password wajib diisi"
      });
    }

    const foundUser = await Users.findOne({
      $or: [
        { email: user },
        { username: user }
      ]
    }).select("+password");

    if (!foundUser) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    const isMatch = await foundUser.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah"
      });
    }

    const userResponse = foundUser.toObject();
    delete userResponse.password;

    res.json({
      message: "Login Berhasil!",
      user: userResponse
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};