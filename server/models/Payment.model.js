const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    tier: { type: String, enum: ["silver", "gold", "black"], required: true },
    tierLabel: { type: String, default: "" }, // human label e.g. "Elite"
    tierPrice: { type: String, required: true },
    method: { type: String, enum: ["crypto", "giftcard"], required: true },

    // Crypto fields
    cryptoCoin: { type: String, default: "" }, // BTC / ETH / USDT
    txHash: { type: String, default: "" }, // transaction hash user submits

    // Gift card fields
    giftCardBrand: { type: String, default: "" },
    giftCardAmount: { type: String, default: "" },
    giftCardImage: { type: String, default: "" }, // /uploads/filename
    giftCardImageMime: { type: String, default: "" }, // e.g. "image/jpeg"

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
