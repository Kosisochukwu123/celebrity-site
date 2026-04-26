const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    membershipCode: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    membershipActive: { type: Boolean, default: false },
    // Delivery address for physical membership card
    address: {
      fullName:   { type: String, default: '' },
      phone:      { type: String, default: '' },
      line1:      { type: String, default: '' },
      line2:      { type: String, default: '' },
      city:       { type: String, default: '' },
      state:      { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country:    { type: String, default: '' },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);