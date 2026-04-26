import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/settings.css";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Brazil",
  "Other",
];


const API = import.meta.env.VITE_BACKEND_URL;

export default function UserSettings() {
  const { user } = useAuth();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [payments, setPayments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [tab, setTab] = useState("address");

  useEffect(() => {
    // Load existing address
    axios
      .get(`${API}/api/auth/address`)
      .then((res) => {
        if (res.data) setAddress((prev) => ({ ...prev, ...res.data }));
      })
      .catch(() => {})
      .finally(() => setLoadingAddr(false));

    // Load payment history
    axios
      .get(`${API}/api/payments/my`)
      .then((res) => setPayments(res.data))
      .catch(() => {});
  }, []);

  const set = (field, val) => setAddress((prev) => ({ ...prev, [field]: val }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await axios.put(`${API}/api/auth/address`, address);
      setMsg({
        type: "success",
        text: "✓ Address saved. We'll use this for your membership card delivery.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Save failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusColor = {
    pending: "#C9A84C",
    approved: "#1D9E75",
    rejected: "#E24B4A",
  };
  const statusLabel = {
    pending: "Under Review",
    approved: "Approved — Active",
    rejected: "Rejected",
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <span className="settings-eyebrow">Account Settings</span>
        <h1 className="settings-title">Your Profile</h1>
        <p className="settings-sub">{user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${tab === "address" ? "active" : ""}`}
          onClick={() => setTab("address")}
        >
          Delivery Address
        </button>
        <button
          className={`settings-tab ${tab === "payments" ? "active" : ""}`}
          onClick={() => setTab("payments")}
        >
          Payment History
          {payments.filter((p) => p.status === "pending").length > 0 && (
            <span className="settings-tab-badge">
              {payments.filter((p) => p.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      <div className="settings-body">
        {/* ── ADDRESS TAB ─────────────────────────────── */}
        {tab === "address" && (
          <div className="settings-section">
            <div className="settings-section-intro">
              <h2 className="settings-section-title">
                Membership Card Delivery
              </h2>
              <p className="settings-section-desc">
                Your physical membership card will be shipped to this address
                once your payment is approved. Please ensure all details are
                accurate.
              </p>
            </div>

            {loadingAddr ? (
              <div className="settings-loading">Loading...</div>
            ) : (
              <form className="settings-form" onSubmit={save}>
                <div className="settings-field settings-field--full">
                  <label className="settings-label">Full Name on Card *</label>
                  <input
                    className="settings-input"
                    value={address.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="As it should appear on your membership card"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Phone Number</label>
                  <input
                    className="settings-input"
                    value={address.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Country *</label>
                  <select
                    className="settings-input settings-select"
                    value={address.country}
                    onChange={(e) => set("country", e.target.value)}
                    required
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-field settings-field--full">
                  <label className="settings-label">Address Line 1 *</label>
                  <input
                    className="settings-input"
                    value={address.line1}
                    onChange={(e) => set("line1", e.target.value)}
                    placeholder="Street address, P.O. Box, house number"
                    required
                  />
                </div>

                <div className="settings-field settings-field--full">
                  <label className="settings-label">Address Line 2</label>
                  <input
                    className="settings-input"
                    value={address.line2}
                    onChange={(e) => set("line2", e.target.value)}
                    placeholder="Apartment, suite, floor, landmark (optional)"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">City *</label>
                  <input
                    className="settings-input"
                    value={address.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.g. Lagos"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">State / Province</label>
                  <input
                    className="settings-input"
                    value={address.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="e.g. Lagos State"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Postal / ZIP Code</label>
                  <input
                    className="settings-input"
                    value={address.postalCode}
                    onChange={(e) => set("postalCode", e.target.value)}
                    placeholder="e.g. 100001"
                  />
                </div>

                <div className="settings-field settings-field--actions">
                  <button
                    type="submit"
                    className="settings-save-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Delivery Address"}
                  </button>
                  {msg.text && (
                    <span className={`settings-msg settings-msg--${msg.type}`}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ────────────────────────────── */}
        {tab === "payments" && (
          <div className="settings-section">
            <div className="settings-section-intro">
              <h2 className="settings-section-title">Payment History</h2>
              <p className="settings-section-desc">
                All your membership payment submissions. Payments are reviewed
                within 24–48 hours.
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="settings-empty">
                <p>No payment submissions yet.</p>
                <span>
                  When you submit a payment, it will appear here with its review
                  status.
                </span>
              </div>
            ) : (
              <div className="settings-payments">
                {payments.map((p) => (
                  <div
                    key={p._id}
                    className={`settings-payment-row settings-payment-row--${p.status}`}
                  >
                    <div className="settings-payment-row-left">
                      <span className="settings-payment-icon">
                        {p.method === "crypto" ? "₿" : "🎁"}
                      </span>
                      <div>
                        <p className="settings-payment-title">
                          {p.tierLabel || p.tier} Membership — {p.tierPrice}
                        </p>
                        <p className="settings-payment-meta">
                          {p.method === "crypto"
                            ? `${p.cryptoCoin} · TX: ${p.txHash ? p.txHash.slice(0, 20) + "..." : "—"}`
                            : `${p.giftCardBrand} Gift Card · ${p.giftCardAmount}`}
                        </p>
                        <p className="settings-payment-date">
                          Submitted{" "}
                          {new Date(p.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="settings-payment-row-right">
                      <span
                        className="settings-payment-status"
                        style={{
                          color: statusColor[p.status],
                          borderColor: statusColor[p.status],
                        }}
                      >
                        {statusLabel[p.status]}
                      </span>
                      {p.status === "rejected" && p.adminNote && (
                        <p className="settings-payment-note">"{p.adminNote}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
