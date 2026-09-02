const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================
// HELPER - GENERATE OTP
// ======================================

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};


// ======================================
// HELPER - CREATE JWT
// ======================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


// ======================================
// REGISTER EMPLOYEE + SEND OTP
// ======================================

router.post("/register", async (req, res) => {
  try {

    const {
      name,
      email,
      profilePhoto
    } = req.body;


    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();

    const trimmedName =
      name.trim();


    if (!trimmedName) {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }


    // -------------------------------
    // CHECK EXISTING USER
    // -------------------------------

    let user = await User.findOne({
      email: normalizedEmail,
    });


    // -------------------------------
    // EXISTING USER
    // -------------------------------

    if (user) {

      // Never allow registration
      // to change an Admin account

      if (user.role === "admin") {
        return res.status(400).json({
          message:
            "This email belongs to an admin account.",
        });
      }


      // Already verified

      if (user.isVerified) {
        return res.status(400).json({
          message:
            "User already exists. Please use Login.",
        });
      }


      // Existing but not verified
      // Generate a new OTP

      user.name = trimmedName;

      if (profilePhoto !== undefined) {
        user.profilePhoto = profilePhoto;
      }

    } else {

      // -------------------------------
      // CREATE NEW EMPLOYEE
      // -------------------------------

      user = new User({
        name: trimmedName,
        email: normalizedEmail,
        role: "employee",
        profilePhoto: profilePhoto || "",
        password: null,
        isVerified: false,
      });

    }


    // -------------------------------
    // GENERATE OTP
    // -------------------------------

    const otp = generateOTP();

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );


    user.otp = otp;
    user.otpExpires = otpExpires;


    await user.save();


    // -------------------------------
    // SEND OTP
    // -------------------------------

    await sendEmail(
      normalizedEmail,
      "Internship Task Tracker - Verify Your Email",
      `Hello ${trimmedName},

Your OTP for Internship Task Tracker registration is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this registration, please ignore this email.

Internship Task Tracker`
    );


    return res.status(200).json({
      message:
        "OTP sent successfully to your email.",
      email: normalizedEmail,
    });


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });

  }
});


// ======================================
// VERIFY REGISTRATION OTP
// ======================================

router.post("/verify-otp", async (req, res) => {
  try {

    const {
      email,
      otp
    } = req.body;


    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // -------------------------------
    // FIND USER
    // -------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    // -------------------------------
    // ADMIN CHECK
    // -------------------------------

    if (user.role === "admin") {
      return res.status(403).json({
        message:
          "Admin account cannot be registered using this route.",
      });
    }


    // -------------------------------
    // OTP CHECK
    // -------------------------------

    if (!user.otp) {
      return res.status(400).json({
        message:
          "No OTP available. Please request a new OTP.",
      });
    }


    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }


    // -------------------------------
    // EXPIRY CHECK
    // -------------------------------

    if (
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }


    // -------------------------------
    // VERIFY USER
    // -------------------------------

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;


    await user.save();


    // -------------------------------
    // CREATE JWT
    // -------------------------------

    const token = createToken(user);


    // -------------------------------
    // RESPONSE
    // -------------------------------

    return res.status(200).json({

      message:
        "Registration successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },

    });


  } catch (error) {

    console.error(
      "OTP verification error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });

  }
});


// ======================================
// SEND LOGIN OTP - EMPLOYEE
// ======================================

router.post(
  "/send-login-otp",
  async (req, res) => {

    try {

      const { email } = req.body;


      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      // -------------------------------
      // FIND USER
      // -------------------------------

      const user = await User.findOne({
        email: normalizedEmail,
      });


      if (!user) {
        return res.status(404).json({
          message:
            "No account found with this email. Please register first.",
        });
      }


      // -------------------------------
      // ADMIN
      // -------------------------------

      if (user.role === "admin") {
        return res.status(400).json({
          message:
            "Admin should use Admin Login.",
        });
      }


      // -------------------------------
      // CHECK VERIFICATION
      // -------------------------------

      if (!user.isVerified) {
        return res.status(403).json({
          message:
            "Please complete registration first.",
        });
      }


      // -------------------------------
      // GENERATE OTP
      // -------------------------------

      const otp = generateOTP();

      const otpExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );


      user.otp = otp;
      user.otpExpires = otpExpires;


      await user.save();


      // -------------------------------
      // SEND EMAIL
      // -------------------------------

      await sendEmail(
        normalizedEmail,
        "Internship Task Tracker - Login OTP",
        `Hello ${user.name},

Your OTP for Internship Task Tracker login is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this login, please ignore this email.

Internship Task Tracker`
      );


      return res.status(200).json({
        message:
          "Login OTP sent successfully.",
        email: normalizedEmail,
      });


    } catch (error) {

      console.error(
        "Send login OTP error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });

    }

  }
);


// ======================================
// VERIFY LOGIN OTP - EMPLOYEE
// ======================================

router.post(
  "/verify-login-otp",
  async (req, res) => {

    try {

      const {
        email,
        otp
      } = req.body;


      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (!email || !otp) {
        return res.status(400).json({
          message:
            "Email and OTP are required",
        });
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      // -------------------------------
      // FIND USER
      // -------------------------------

      const user = await User.findOne({
        email: normalizedEmail,
      });


      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }


      // -------------------------------
      // ADMIN CHECK
      // -------------------------------

      if (user.role === "admin") {
        return res.status(400).json({
          message:
            "Admin should use Admin Login.",
        });
      }


      // -------------------------------
      // OTP CHECK
      // -------------------------------

      if (!user.otp) {
        return res.status(400).json({
          message:
            "No OTP available. Please request a new OTP.",
        });
      }


      if (user.otp !== otp.toString()) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }


      // -------------------------------
      // EXPIRY
      // -------------------------------

      if (
        !user.otpExpires ||
        user.otpExpires < new Date()
      ) {
        return res.status(400).json({
          message: "OTP has expired",
        });
      }


      // -------------------------------
      // CLEAR OTP
      // -------------------------------

      user.otp = null;
      user.otpExpires = null;


      await user.save();


      // -------------------------------
      // CREATE JWT
      // -------------------------------

      const token = createToken(user);


      // -------------------------------
      // RESPONSE
      // -------------------------------

      return res.status(200).json({

        message: "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },

      });


    } catch (error) {

      console.error(
        "Verify login OTP error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });

    }

  }
);


// ======================================
// ADMIN LOGIN
// ======================================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // -------------------------------
    // FIND USER
    // -------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // -------------------------------
    // ONLY ADMIN
    // -------------------------------

    if (user.role !== "admin") {
      return res.status(400).json({
        message:
          "Employees should login using email OTP.",
      });
    }


    // -------------------------------
    // CHECK PASSWORD
    // -------------------------------

    if (!user.password) {
      return res.status(500).json({
        message:
          "Admin password is not configured.",
      });
    }


    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // -------------------------------
    // CHECK VERIFICATION
    // -------------------------------

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please verify your admin account first",
      });
    }


    // -------------------------------
    // CREATE JWT
    // -------------------------------

    const token = createToken(user);


    return res.status(200).json({

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },

    });


  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });

  }

});


// ======================================
// DISABLE PUBLIC ADMIN REGISTRATION
// ======================================

router.post(
  "/register-admin",
  async (req, res) => {

    return res.status(403).json({
      message:
        "Admin registration is disabled. Only the existing admin account can access the admin panel.",
    });

  }
);


// ======================================
// CHANGE PASSWORD
// ADMIN ONLY
// ======================================

router.patch(
  "/change-password",
  authMiddleware,
  async (req, res) => {

    try {

      // -------------------------------
      // ONLY ADMIN
      // -------------------------------

      if (req.user.role !== "admin") {
        return res.status(403).json({
          message:
            "Password change is not available for OTP-based employees.",
        });
      }


      const {
        currentPassword,
        newPassword
      } = req.body;


      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required",
        });
      }


      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must contain at least 6 characters",
        });
      }


      const user = await User.findById(
        req.user.id
      );


      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }


      if (!user.password) {
        return res.status(400).json({
          message:
            "Password is not configured.",
        });
      }


      const isPasswordCorrect =
        await bcrypt.compare(
          currentPassword,
          user.password
        );


      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Current password is incorrect",
        });
      }


      const isSamePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );


      if (isSamePassword) {
        return res.status(400).json({
          message:
            "New password must be different from current password",
        });
      }


      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );


      await user.save();


      return res.status(200).json({
        message:
          "Password changed successfully",
      });


    } catch (error) {

      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });

    }

  }
);


// ======================================
// UPDATE PROFILE
// ======================================

router.patch(
  "/profile",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        name,
        email,
        profilePhoto
      } = req.body;


      // -------------------------------
      // FIND USER
      // -------------------------------

      const user = await User.findById(
        req.user.id
      );


      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }


      // -------------------------------
      // UPDATE NAME
      // -------------------------------

      if (name !== undefined) {

        if (!name.trim()) {
          return res.status(400).json({
            message:
              "Name cannot be empty",
          });
        }

        user.name = name.trim();

      }


      // -------------------------------
      // UPDATE EMAIL
      // -------------------------------

      if (email !== undefined) {

        if (!email.trim()) {
          return res.status(400).json({
            message:
              "Email cannot be empty",
          });
        }


        const normalizedEmail =
          email.trim().toLowerCase();


        const existingUser =
          await User.findOne({
            email: normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });


        if (existingUser) {
          return res.status(400).json({
            message:
              "Email is already in use",
          });
        }


        user.email =
          normalizedEmail;

      }


      // -------------------------------
      // PROFILE PHOTO
      // -------------------------------

      if (profilePhoto !== undefined) {
        user.profilePhoto =
          profilePhoto;
      }


      await user.save();


      return res.status(200).json({

        message:
          "Profile updated successfully",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto:
            user.profilePhoto,
        },

      });


    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });

    }

  }
);


module.exports = router;