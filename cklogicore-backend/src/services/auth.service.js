import RefreshToken from "../models/refreshToken.model.js";

// 🔹 NEW: Logout service
export const logoutService = async (refreshToken) => {
  if (!refreshToken) return;

  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { isRevoked: true }
  );
};

// 🔹 Forgot password
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const token = generateResetToken();

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  return token;
};

// 🔹 Reset password
export const resetPasswordService = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired token");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
};


