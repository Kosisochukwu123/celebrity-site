cat /home/claude/celebrity-site/client/src/components/AdminPayments.jsx | head -20
Output

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/admin-payments.css';

import API_BASE from '../config/api.js';
const API = API_BASE;

// Gift card images are stored as base64 in MongoDB
// Build a data URI so they display directly without a file URL
const imgSrc = (payment) => {
  if (!payment?.giftCardImage) return null;
  // Already a data URI
  if (payment.giftCardImage.startsWith('data:')) return payment.giftCardImage;
  // Raw base64 — build data URI
  const mime = payment.giftCardImageMime || 'image/jpeg';
  return `data:${mime};base64,${payment.giftCardImage}`;
};

const STATUS_COLOR = { pending: '#C9A84C', approved: '#1D9E75', rejected: '#E24B4A' };
const COINS = ['wallet_btc','wallet_eth','wallet_usdt'];


grep -n "setSelected\|ap-detail-content\|ap-reviewed-note\|ap-review-actions\|ap-info-grid" /home/claude/celebrity-site/client/src/components/AdminPayments.jsx | head -20
Output

28:  const [selected, setSelected]   = useState(null);
61:      setSelected(res.data);
125:                      setSelected(full.data);
127:                      setSelected(p); // fallback to list data
154:                  <div className="ap-detail-content">
164:                    <div className="ap-info-grid">
213:                      <div className="ap-review-actions">
224:                      <div className="ap-reviewed-note"></div>



python3 - << 'PYEOF'
with open('/home/claude/celebrity-site/client/src/components/AdminPayments.jsx', 'r') as f:
    content = f.read()

# 1. Add userAddress state
old_state = "  const [lightbox, setLightbox]   = useState(null);"
new_state = """  const [lightbox, setLightbox]   = useState(null);
  const [userAddress, setUserAddress] = useState(null); // delivery address for selected payment"""
content = content.replace(old_state, new_state)

# 2. Load user address when a payment is selected
old_select_click = """                  onClick={async () => {
                    setNote(p.adminNote || '');
                    // Load full payment data (includes base64 gift card image)
                    try {
                      const full = await axios.get(`/api/payments/${p._id}`);
                      setSelected(full.data);
                    } catch {
                      setSelected(p); // fallback to list data
                    }
                  }}"""
new_select_click = """                  onClick={async () => {
                    setNote(p.adminNote || '');
                    setUserAddress(null);
                    // Load full payment data (includes base64 gift card image)
                    try {
                      const full = await axios.get(`/api/payments/${p._id}`);
                      setSelected(full.data);
                      // Load user's delivery address in parallel
                      axios.get(`/api/auth/users/${p.userId || full.data.userId}/address`)
                        .then(r => setUserAddress(r.data))
                        .catch(() => setUserAddress(null));
                    } catch {
                      setSelected(p);
                    }
                  }}"""
content = content.replace(old_select_click, new_select_click)

# 3. Add delivery address section inside the detail panel, after the gift card image block
# Insert before the admin note field
old_before_note = """                    {/* Admin note */}
                    <div className="ap-note-field">"""
new_before_note = """                    {/* Delivery address */}
                    {userAddress && (
                      <div className="ap-address-block">
                        <p className="ap-address-label">Delivery Address</p>
                        {(!userAddress.address?.line1 && !userAddress.address?.city) ? (
                          <p className="ap-address-empty">
                            ⚠️ Member has not filled in their delivery address yet.
                          </p>
                        ) : (
                          <div className="ap-address-card">
                            <p className="ap-address-name">{userAddress.address?.fullName || userAddress.name}</p>
                            {userAddress.address?.phone && <p>{userAddress.address.phone}</p>}
                            {userAddress.address?.line1 && <p>{userAddress.address.line1}</p>}
                            {userAddress.address?.line2 && <p>{userAddress.address.line2}</p>}
                            {(userAddress.address?.city || userAddress.address?.state || userAddress.address?.postalCode) && (
                              <p>
                                {[userAddress.address?.city, userAddress.address?.state, userAddress.address?.postalCode]
                                  .filter(Boolean).join(', ')}
                              </p>
                            )}
                            {userAddress.address?.country && <p>{userAddress.address.country}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin note */}
                    <div className="ap-note-field">"""
content = content.replace(old_before_note, new_before_note)

with open('/home/claude/celebrity-site/client/src/components/AdminPayments.jsx', 'w') as f:
    f.write(content)

print("userAddress state:", 'userAddress' in content)
print("address block:", 'ap-address-block' in content)
print("address fetch:", '/api/auth/users/' in content)
PYEOF
Output

userAddress state: True
address block: True
address fetch: True