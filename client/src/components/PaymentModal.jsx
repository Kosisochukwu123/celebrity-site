import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/payment-modal.css";

/* ── QR Code via Google Charts API (no extra package needed) */
const qrUrl = (text) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(text)}&bgcolor=1E1A14&color=E8C97A&margin=10`;

const COINS = [
  {
    id: "btc",
    label: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    settingKey: "wallet_btc",
  },
  {
    id: "eth",
    label: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    settingKey: "wallet_eth",
  },
  {
    id: "usdt",
    label: "USDT",
    symbol: "USDT",
    icon: "₮",
    settingKey: "wallet_usdt",
  },
];

const API = import.meta.env.VITE_BACKEND_URL;

const GIFT_BRANDS = [
  "Amazon",
  "Apple",
  "Google Play",
  "Steam",
  "Walmart",
  "Target",
  "eBay",
  "Other",
];

const STEPS = ["Method", "Details", "Confirm"];

export default function PaymentModal({ tier, onClose }) {
  const [step, setStep] = useState(0); // 0=method, 1=details, 2=confirm/success
  const [method, setMethod] = useState(null); // 'crypto' | 'giftcard'
  const [coin, setCoin] = useState("btc");
  const [wallets, setWallets] = useState({});
  const [txHash, setTxHash] = useState("");
  const [giftBrand, setGiftBrand] = useState("Amazon");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftImage, setGiftImage] = useState(null);
  const [giftPreview, setGiftPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  // Load wallet addresses from admin settings
  useEffect(() => {
    axios
      .get(`${API}/api/payments/settings`)
      .then((res) => setWallets(res.data))
      .catch(() => {});
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const selectedCoin = COINS.find((c) => c.id === coin);
  const walletAddress = wallets[selectedCoin?.settingKey] || "";
  const usdtNetwork = wallets["wallet_usdt_network"] || "TRC-20";

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const onGiftImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGiftImage(file);
    setGiftPreview(URL.createObjectURL(file));
  };

  const canProceedStep1 = method !== null;

  const canProceedStep2 = () => {
    if (method === "crypto") return txHash.trim().length > 8;
    if (method === "giftcard")
      return giftImage !== null && giftAmount.trim() !== "";
    return false;
  };

  const submit = async () => {
    if (!canProceedStep2()) return;
    setSubmitting(true);
    setError("");
    try {
      const data = new FormData();
      data.append("tier", tier.id); // e.g. 'silver', 'gold', 'black'
      data.append("tierLabel", tier.name); // e.g. 'Silver', 'Gold', 'Elite'
      data.append("tierPrice", tier.price);
      data.append("method", method);
      if (method === "crypto") {
        data.append("cryptoCoin", selectedCoin.symbol);
        data.append("txHash", txHash.trim());
      } else {
        data.append("giftCardBrand", giftBrand);
        data.append("giftCardAmount", giftAmount);
        if (giftImage) data.append("giftCardImage", giftImage);
      }
      await axios.post(`${API}/api/payments/submit`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pm-backdrop" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="pm-close" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-tier">
            <span className="pm-tier-badge">{tier.name}</span>
            <span className="pm-tier-price">
              {tier.price}
              <span>/yr</span>
            </span>
          </div>
          <p className="pm-header-sub">Complete your membership payment</p>

          {/* Progress bar */}
          {!submitted && (
            <div className="pm-steps">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`pm-step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}
                >
                  <div className="pm-step-dot">{i < step ? "✓" : i + 1}</div>
                  <span className="pm-step-label">{s}</span>
                  {i < STEPS.length - 1 && <div className="pm-step-line" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pm-body">
          {/* ── STEP 0: Choose method ──────────────────── */}
          {step === 0 && (
            <div className="pm-section">
              <h3 className="pm-section-title">How would you like to pay?</h3>
              <p className="pm-section-sub">
                Choose your preferred payment method. Both are manually verified
                within 24–48 hours.
              </p>

              <div className="pm-method-grid">
                <button
                  className={`pm-method-card ${method === "crypto" ? "selected" : ""}`}
                  onClick={() => setMethod("crypto")}
                >
                  <div className="pm-method-icon pm-method-icon--crypto">
                    <svg viewBox="0 0 40 40" fill="none">
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M14 13h7a4 4 0 010 8h-7v-8zM14 21h8a4 4 0 010 8h-8v-8z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="18"
                        y1="11"
                        x2="18"
                        y2="13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="22"
                        y1="11"
                        x2="22"
                        y2="13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="18"
                        y1="29"
                        x2="18"
                        y2="31"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="22"
                        y1="29"
                        x2="22"
                        y2="31"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="pm-method-text">
                    <strong>Cryptocurrency</strong>
                    <span>Bitcoin, Ethereum, USDT</span>
                  </div>
                  <div className="pm-method-check">
                    {method === "crypto" ? "✓" : ""}
                  </div>
                </button>

                <button
                  className={`pm-method-card ${method === "giftcard" ? "selected" : ""}`}
                  onClick={() => setMethod("giftcard")}
                >
                  <div className="pm-method-icon pm-method-icon--gift">
                    <svg viewBox="0 0 40 40" fill="none">
                      <rect
                        x="6"
                        y="16"
                        width="28"
                        height="20"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M6 22h28"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 16V36"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 16c0 0-3-7 0-7s3 7 0 7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 16c0 0 3-7 0-7s-3 7 0 7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div className="pm-method-text">
                    <strong>Gift Card</strong>
                    <span>Amazon, Apple, Google Play & more</span>
                  </div>
                  <div className="pm-method-check">
                    {method === "giftcard" ? "✓" : ""}
                  </div>
                </button>
              </div>

              <div className="pm-security-note">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  width="14"
                  height="14"
                >
                  <path d="M10 2L3 5v5c0 4.4 3 8.1 7 9 4-0.9 7-4.6 7-9V5l-7-3z" />
                </svg>
                Payments are reviewed manually. Your membership activates within
                24–48 hours of approval.
              </div>

              <button
                className="pm-next-btn"
                disabled={!canProceedStep1}
                onClick={() => setStep(1)}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 1: Payment details ────────────────── */}
          {step === 1 && !submitted && (
            <div className="pm-section">
              {method === "crypto" && (
                <>
                  <h3 className="pm-section-title">Send Cryptocurrency</h3>
                  <p className="pm-section-sub">
                    Select a coin, send the exact amount to the address below,
                    then paste your transaction hash.
                  </p>

                  {/* Coin selector */}
                  <div className="pm-coin-tabs">
                    {COINS.map((c) => (
                      <button
                        key={c.id}
                        className={`pm-coin-tab ${coin === c.id ? "active" : ""}`}
                        onClick={() => setCoin(c.id)}
                      >
                        <span className="pm-coin-icon">{c.icon}</span>
                        {c.symbol}
                      </button>
                    ))}
                  </div>

                  {/* Amount reminder */}
                  <div className="pm-amount-row">
                    <span className="pm-amount-label">Amount to send</span>
                    <span className="pm-amount-value">
                      {tier.price} USD equivalent in {selectedCoin.symbol}
                    </span>
                  </div>

                  {/* Wallet card */}
                  <div className="pm-wallet-card">
                    <div className="pm-wallet-left">
                      <p className="pm-wallet-network">
                        {coin === "usdt"
                          ? `Network: ${usdtNetwork}`
                          : `${selectedCoin.label} (${selectedCoin.symbol})`}
                      </p>
                      {walletAddress ? (
                        <>
                          <p className="pm-wallet-label">
                            Send to this address:
                          </p>
                          <p className="pm-wallet-address">{walletAddress}</p>
                          <button
                            className={`pm-copy-btn ${copied ? "copied" : ""}`}
                            onClick={copyAddress}
                          >
                            {copied ? "✓ Copied!" : "Copy Address"}
                          </button>
                        </>
                      ) : (
                        <p className="pm-wallet-unavailable">
                          Wallet address not configured yet. Contact support.
                        </p>
                      )}
                    </div>
                    {walletAddress && (
                      <div className="pm-wallet-qr">
                        <img src={qrUrl(walletAddress)} alt="QR Code" />
                        <span>Scan QR</span>
                      </div>
                    )}
                  </div>

                  <div className="pm-warning">
                    ⚠️ Send only <strong>{selectedCoin.symbol}</strong> to this
                    address.
                    {coin === "usdt" && (
                      <>
                        {" "}
                        Use <strong>{usdtNetwork}</strong> network only.
                      </>
                    )}{" "}
                    Sending the wrong coin will result in permanent loss.
                  </div>

                  {/* TX Hash */}
                  <div className="pm-field">
                    <label className="pm-label">Transaction Hash / ID *</label>
                    <input
                      className="pm-input pm-input--hash"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste your transaction hash here after sending..."
                    />
                    <span className="pm-hint">
                      Found in your wallet app after the transaction is sent.
                    </span>
                  </div>
                </>
              )}

              {method === "giftcard" && (
                <>
                  <h3 className="pm-section-title">Submit a Gift Card</h3>
                  <p className="pm-section-sub">
                    Upload a clear photo of your gift card showing the code and
                    amount. Our team verifies within 24–48 hours.
                  </p>

                  <div className="pm-gift-grid">
                    <div className="pm-field">
                      <label className="pm-label">Gift Card Brand *</label>
                      <select
                        className="pm-input pm-select"
                        value={giftBrand}
                        onChange={(e) => setGiftBrand(e.target.value)}
                      >
                        {GIFT_BRANDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pm-field">
                      <label className="pm-label">Card Value *</label>
                      <input
                        className="pm-input"
                        value={giftAmount}
                        onChange={(e) => setGiftAmount(e.target.value)}
                        placeholder="e.g. $50, $100, $200"
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="pm-field">
                    <label className="pm-label">
                      Card Photo *{" "}
                      <span className="pm-label-hint">
                        (show front + scratch code clearly)
                      </span>
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={onGiftImageChange}
                    />

                    {giftPreview ? (
                      <div className="pm-gift-preview">
                        <img src={giftPreview} alt="Gift card" />
                        <button
                          type="button"
                          className="pm-gift-reupload"
                          onClick={() => fileRef.current?.click()}
                        >
                          Change photo
                        </button>
                      </div>
                    ) : (
                      <div
                        className="pm-gift-dropzone"
                        onClick={() => fileRef.current?.click()}
                      >
                        <svg
                          viewBox="0 0 40 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          width="36"
                          height="36"
                        >
                          <rect x="4" y="8" width="32" height="24" rx="3" />
                          <circle cx="14" cy="17" r="3" />
                          <path d="M4 28l8-8 5 5 4-4 11 11" />
                        </svg>
                        <p>Tap to upload gift card photo</p>
                        <span>jpg, png, webp · max 10 MB</span>
                      </div>
                    )}
                  </div>

                  <div className="pm-gift-tips">
                    <p className="pm-gift-tips-title">
                      Tips for a successful submission:
                    </p>
                    <ul>
                      <li>
                        Make sure the card code and PIN are clearly visible
                      </li>
                      <li>Scratch the PIN area before photographing</li>
                      <li>Take the photo in good lighting, no blur</li>
                      <li>Do not redeem the card before approval</li>
                    </ul>
                  </div>
                </>
              )}

              {error && <div className="pm-error">{error}</div>}

              <div className="pm-btn-row">
                <button className="pm-back-btn" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button
                  className="pm-submit-btn"
                  disabled={!canProceedStep2() || submitting}
                  onClick={submit}
                >
                  {submitting ? "Submitting..." : "Submit Payment →"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Success ────────────────────────── */}
          {step === 2 && submitted && (
            <div className="pm-success">
              <div className="pm-success-icon">
                <svg viewBox="0 0 60 60" fill="none">
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    stroke="#1D9E75"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 30l9 9 15-15"
                    stroke="#1D9E75"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="pm-success-title">Payment Submitted!</h3>
              <p className="pm-success-body">
                Your <strong>{tier.name} membership</strong> payment has been
                received and is now under review.
              </p>

              <div className="pm-success-timeline">
                <div className="pm-timeline-item pm-timeline-item--done">
                  <div className="pm-timeline-dot" />
                  <div>
                    <strong>Submission received</strong>
                    <span>Just now</span>
                  </div>
                </div>
                <div className="pm-timeline-item">
                  <div className="pm-timeline-dot pm-timeline-dot--pending" />
                  <div>
                    <strong>Manual verification</strong>
                    <span>
                      Our team reviews your payment — typically within 24 hours
                    </span>
                  </div>
                </div>
                <div className="pm-timeline-item">
                  <div className="pm-timeline-dot pm-timeline-dot--pending" />
                  <div>
                    <strong>Membership activated</strong>
                    <span>
                      You receive full access within 24–48 hours of approval
                    </span>
                  </div>
                </div>
              </div>

              <div className="pm-success-note">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  width="14"
                  height="14"
                >
                  <circle cx="10" cy="10" r="8" />
                  <line x1="10" y1="7" x2="10" y2="10" />
                  <line x1="10" y1="13" x2="10" y2="13.5" />
                </svg>
                If you have questions, use the live chat at the bottom right of
                the screen. Reference your payment method:{" "}
                <strong>
                  {method === "crypto"
                    ? `${selectedCoin?.symbol} · ${txHash.slice(0, 12)}...`
                    : `${giftBrand} Gift Card`}
                </strong>
              </div>

              <button className="pm-done-btn" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
