import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/admin-payments.css";

const API = import.meta.env.VITE_BACKEND_URL;

// Gift card images are stored as base64 in MongoDB
// Build a data URI so they display directly without a file URL
const imgSrc = (payment) => {
  if (!payment?.giftCardImage) return null;
  // Already a data URI
  if (payment.giftCardImage.startsWith("data:")) return payment.giftCardImage;
  // Raw base64 — build data URI
  const mime = payment.giftCardImageMime || "image/jpeg";
  return `data:${mime};base64,${payment.giftCardImage}`;
};

const STATUS_COLOR = {
  pending: "#C9A84C",
  approved: "#1D9E75",
  rejected: "#E24B4A",
};
const COINS = ["wallet_btc", "wallet_eth", "wallet_usdt"];
const COIN_LABELS = {
  wallet_btc: "Bitcoin (BTC)",
  wallet_eth: "Ethereum (ETH)",
  wallet_usdt: "USDT",
};

export default function AdminPayments() {
  const [tab, setTab] = useState("submissions"); // 'submissions' | 'wallets'
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [wallets, setWallets] = useState({
    wallet_btc: "",
    wallet_eth: "",
    wallet_usdt: "",
    wallet_usdt_network: "TRC-20",
  });
  const [savingWallets, setSavingWallets] = useState(false);
  const [walletMsg, setWalletMsg] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [userAddress, setUserAddress] = useState(null); // delivery address for selected payment

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/payments/all?status=${filter}`);
      setPayments(res.data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWallets = async () => {
    try {
      const res = await axios.get(`${API}/api/payments/admin/settings`);
      setWallets((prev) => ({ ...prev, ...res.data }));
    } catch {}
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);
  useEffect(() => {
    loadWallets();
  }, []);

  const review = async (status) => {
    if (!selected) return;
    setReviewing(true);
    try {
      const res = await axios.put(
        `${API}/api/payments/${selected._id}/review`,
        { status, adminNote: note },
      );
      setPayments((prev) =>
        prev.map((p) => (p._id === selected._id ? res.data : p)),
      );
      setSelected(res.data);
      setNote("");
    } catch (e) {
      alert(e.response?.data?.message || "Review failed");
    } finally {
      setReviewing(false);
    }
  };

  const saveWallets = async () => {
    setSavingWallets(true);
    setWalletMsg("");
    try {
      await axios.put(`${API}/api/payments/admin/settings`, wallets);
      setWalletMsg("✓ Wallet addresses saved.");
    } catch {
      setWalletMsg("Failed to save.");
    } finally {
      setSavingWallets(false);
    }
  };

  const tabStyle = (t) =>
    `ap-tab ${tab === t ? "ap-tab--active" : "ap-tab--inactive"}`;
  const filterStyle = (f) => `ap-filter-btn ${filter === f ? "active" : ""}`;

  return (
    <div className="ap-wrap">
      {/* Main tabs */}
      <div className="ap-tabs">
        <button
          className={tabStyle("submissions")}
          onClick={() => setTab("submissions")}
        >
          Payment Submissions
          {payments.filter((p) => p.status === "pending").length > 0 &&
            tab !== "submissions" && (
              <span className="ap-tab-badge">
                {payments.filter((p) => p.status === "pending").length}
              </span>
            )}
        </button>
        <button
          className={tabStyle("wallets")}
          onClick={() => setTab("wallets")}
        >
          Wallet Addresses
        </button>
      </div>

      {/* ── SUBMISSIONS ─────────────────────────────── */}
      {tab === "submissions" && (
        <div className="ap-submissions">
          {/* Filter row */}
          <div className="ap-filters">
            {["pending", "approved", "rejected", "all"].map((f) => (
              <button
                key={f}
                className={filterStyle(f)}
                onClick={() => setFilter(f)}
                style={
                  filter === f && f !== "all"
                    ? { color: STATUS_COLOR[f], borderColor: STATUS_COLOR[f] }
                    : {}
                }
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <button
              className="ap-refresh-btn"
              onClick={loadPayments}
              title="Refresh"
            >
              ↺
            </button>
          </div>

          <div className="ap-split">
            {/* List */}
            <div className="ap-list">
              {loading && <p className="ap-loading">Loading...</p>}
              {!loading && payments.length === 0 && (
                <p className="ap-empty">
                  No {filter !== "all" ? filter : ""} payments.
                </p>
              )}
              {payments.map((p) => (
                <div
                  key={p._id}
                  className={`ap-payment-row ${selected?._id === p._id ? "active" : ""}`}
                  onClick={async () => {
                    setNote(p.adminNote || "");
                    setUserAddress(null);
                    // Load full payment data (includes base64 gift card image)
                    try {
                      const full = await axios.get(
                        `${API}/api/payments/${p._id}`,
                      );
                      setSelected(full.data);
                      // Load user's delivery address in parallel
                      axios
                        .get(
                          `${API}/api/auth/users/${p.userId || full.data.userId}/address`,
                        )
                        .then((r) => setUserAddress(r.data))
                        .catch(() => setUserAddress(null));
                    } catch {
                      setSelected(p);
                    }
                  }}
                >
                  <div className="ap-payment-row-left">
                    <div className="ap-payment-method-icon">
                      {p.method === "crypto" ? "₿" : "🎁"}
                    </div>
                    <div>
                      <p className="ap-payment-name">{p.userName}</p>
                      <p className="ap-payment-meta">
                        {p.tier.charAt(0).toUpperCase() + p.tier.slice(1)} ·{" "}
                        {p.tierPrice} ·{" "}
                        {p.method === "crypto"
                          ? p.cryptoCoin
                          : `${p.giftCardBrand} Gift Card`}
                      </p>
                      <p className="ap-payment-time">
                        {new Date(p.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="ap-status-dot"
                    style={{ background: STATUS_COLOR[p.status] }}
                    title={p.status}
                  />
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="ap-detail">
              {!selected ? (
                <div className="ap-detail-empty">
                  Select a payment to review
                </div>
              ) : (
                <div className="ap-detail-content">
                  <div className="ap-detail-header">
                    <h4 className="ap-detail-name">{selected.userName}</h4>
                    <span
                      className="ap-detail-status"
                      style={{
                        color: STATUS_COLOR[selected.status],
                        borderColor: STATUS_COLOR[selected.status],
                      }}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <p className="ap-detail-email">{selected.userEmail}</p>

                  {/* Info rows */}
                  <div className="ap-info-grid">
                    <div className="ap-info-item">
                      <span>Tier</span>
                      <strong>
                        {selected.tier.charAt(0).toUpperCase() +
                          selected.tier.slice(1)}
                      </strong>
                    </div>
                    <div className="ap-info-item">
                      <span>Price</span>
                      <strong>{selected.tierPrice}</strong>
                    </div>
                    <div className="ap-info-item">
                      <span>Method</span>
                      <strong>
                        {selected.method === "crypto"
                          ? "Cryptocurrency"
                          : "Gift Card"}
                      </strong>
                    </div>
                    <div className="ap-info-item">
                      <span>Submitted</span>
                      <strong>
                        {new Date(selected.createdAt).toLocaleDateString(
                          "en-GB",
                        )}
                      </strong>
                    </div>

                    {selected.method === "crypto" && (
                      <>
                        <div className="ap-info-item ap-info-item--full">
                          <span>Coin</span>
                          <strong>{selected.cryptoCoin}</strong>
                        </div>
                        <div className="ap-info-item ap-info-item--full">
                          <span>Transaction Hash</span>
                          <strong className="ap-hash">
                            {selected.txHash || "—"}
                          </strong>
                        </div>
                      </>
                    )}

                    {selected.method === "giftcard" && (
                      <>
                        <div className="ap-info-item">
                          <span>Brand</span>
                          <strong>{selected.giftCardBrand}</strong>
                        </div>
                        <div className="ap-info-item">
                          <span>Value</span>
                          <strong>{selected.giftCardAmount}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gift card image */}
                  {selected.method === "giftcard" && selected.giftCardImage && (
                    <div
                      className="ap-gift-img-wrap"
                      onClick={() => setLightbox(imgSrc(selected))}
                    >
                      <img src={imgSrc(selected)} alt="Gift card" />
                      <div className="ap-gift-img-overlay">🔍 View full</div>
                    </div>
                  )}

                  {/* Delivery address */}
                  {userAddress && (
                    <div className="ap-address-block">
                      <p className="ap-address-label">Delivery Address</p>
                      {!userAddress.address?.line1 &&
                      !userAddress.address?.city ? (
                        <p className="ap-address-empty">
                          ⚠️ Member has not filled in their delivery address
                          yet.
                        </p>
                      ) : (
                        <div className="ap-address-card">
                          <p className="ap-address-name">
                            {userAddress.address?.fullName || userAddress.name}
                          </p>
                          {userAddress.address?.phone && (
                            <p>{userAddress.address.phone}</p>
                          )}
                          {userAddress.address?.line1 && (
                            <p>{userAddress.address.line1}</p>
                          )}
                          {userAddress.address?.line2 && (
                            <p>{userAddress.address.line2}</p>
                          )}
                          {(userAddress.address?.city ||
                            userAddress.address?.state ||
                            userAddress.address?.postalCode) && (
                            <p>
                              {[
                                userAddress.address?.city,
                                userAddress.address?.state,
                                userAddress.address?.postalCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {userAddress.address?.country && (
                            <p>{userAddress.address.country}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin note */}
                  <div className="ap-note-field">
                    <label className="ap-note-label">
                      Admin note (sent with decision)
                    </label>
                    <textarea
                      className="ap-note-input"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional message to the member..."
                      rows={3}
                      disabled={selected.status !== "pending"}
                    />
                  </div>

                  {/* Review buttons */}
                  {selected.status === "pending" && (
                    <div className="ap-review-actions">
                      <button
                        className="ap-approve-btn"
                        onClick={() => review("approved")}
                        disabled={reviewing}
                      >
                        {reviewing ? "..." : "✓ Approve & Activate"}
                      </button>
                      <button
                        className="ap-reject-btn"
                        onClick={() => review("rejected")}
                        disabled={reviewing}
                      >
                        {reviewing ? "..." : "✕ Reject"}
                      </button>
                    </div>
                  )}

                  {selected.status !== "pending" && (
                    <div className="ap-reviewed-note">
                      Reviewed on{" "}
                      {selected.reviewedAt
                        ? new Date(selected.reviewedAt).toLocaleDateString(
                            "en-GB",
                          )
                        : "—"}
                      {selected.adminNote && (
                        <>
                          <br />
                          <em>"{selected.adminNote}"</em>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WALLET ADDRESSES ────────────────────────── */}
      {tab === "wallets" && (
        <div className="ap-wallets">
          <p className="ap-wallets-desc">
            These addresses are shown to members during checkout. Update them
            whenever needed.
          </p>

          {COINS.map((key) => (
            <div key={key} className="ap-wallet-field">
              <label className="ap-wallet-label">{COIN_LABELS[key]}</label>
              <input
                className="ap-wallet-input"
                value={wallets[key] || ""}
                onChange={(e) =>
                  setWallets((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={`Enter ${COIN_LABELS[key]} wallet address`}
                spellCheck={false}
              />
            </div>
          ))}

          <div className="ap-wallet-field">
            <label className="ap-wallet-label">USDT Network</label>
            <select
              className="ap-wallet-input ap-wallet-select"
              value={wallets.wallet_usdt_network || "TRC-20"}
              onChange={(e) =>
                setWallets((prev) => ({
                  ...prev,
                  wallet_usdt_network: e.target.value,
                }))
              }
            >
              <option>TRC-20</option>
              <option>ERC-20</option>
              <option>BEP-20</option>
            </select>
          </div>

          <div className="ap-wallet-actions">
            <button
              className="ap-save-wallets-btn"
              onClick={saveWallets}
              disabled={savingWallets}
            >
              {savingWallets ? "Saving..." : "Save Wallet Addresses"}
            </button>
            {walletMsg && (
              <span
                className={
                  walletMsg.startsWith("✓")
                    ? "ap-wallet-success"
                    : "ap-wallet-error"
                }
              >
                {walletMsg}
              </span>
            )}
          </div>

          <div className="ap-wallet-warning">
            ⚠️ Double-check addresses before saving. Members will send real
            funds to these addresses.
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {lightbox && (
        <div className="ap-lightbox" onClick={() => setLightbox(null)}>
          <img
            src={lightbox}
            alt="Gift card"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="ap-lightbox-close"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
