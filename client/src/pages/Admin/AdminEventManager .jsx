import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../styles/admin-events.css";

const API = import.meta.env.VITE_BACKEND_URL;
const imgSrc = (url) =>
  !url ? null : url.startsWith("http") ? url : `${API}${url}`;

const CATEGORIES = [
  "gala",
  "forum",
  "summit",
  "screening",
  "fundraiser",
  "other",
];
const STATUSES = ["upcoming", "live", "past", "cancelled"];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  date: "",
  timezone: "WAT (UTC+1, Lagos/Abuja)",
  venue: "",
  city: "",
  country: "",
  mapUrl: "",
  category: "other",
  ticketUrl: "",
  ticketPrice: "Free for members",
  capacity: "",
  featured: false,
  status: "upcoming",
  highlights: [""],
};

export default function AdminEventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editing, setEditing] = useState(null); // null = create new
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fileRef = useRef();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/events/all`);
      setEvents(res.data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setMsg({ type: "", text: "" });
    setView("form");
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title || "",
      subtitle: event.subtitle || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
      timezone: event.timezone || "WAT (UTC+1, Lagos/Abuja)",
      venue: event.venue || "",
      city: event.city || "",
      country: event.country || "",
      mapUrl: event.mapUrl || "",
      category: event.category || "other",
      ticketUrl: event.ticketUrl || "",
      ticketPrice: event.ticketPrice || "",
      capacity: event.capacity || "",
      featured: event.featured || false,
      status: event.status || "upcoming",
      highlights: event.highlights?.length ? event.highlights : [""],
    });
    setImageFile(null);
    setImagePreview(event.coverImage ? imgSrc(event.coverImage) : null);
    setMsg({ type: "", text: "" });
    setView("form");
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setMsg({ type: "success", text: "✓ Event deleted." });
    } catch {
      setMsg({ type: "error", text: "Could not delete event." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const setHighlight = (i, val) => {
    const hl = [...form.highlights];
    hl[i] = val;
    setForm({ ...form, highlights: hl });
  };

  const addHighlight = () =>
    setForm({ ...form, highlights: [...form.highlights, ""] });
  const removeHighlight = (i) =>
    setForm({ ...form, highlights: form.highlights.filter((_, j) => j !== i) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "highlights") {
          data.append(k, JSON.stringify(v.filter((h) => h.trim())));
        } else if (k === "featured") {
          data.append(k, v ? "true" : "false");
        } else {
          data.append(k, v);
        }
      });
      if (imageFile) data.append("coverImage", imageFile);

      if (editing) {
        const res = await axios.put(`${API}/api/events/${editing._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEvents((prev) =>
          prev.map((e) => (e._id === editing._id ? res.data : e)),
        );
        setMsg({ type: "success", text: "✓ Event updated." });
        setEditing(res.data);
      } else {
        const res = await axios.post(`${API}/api/events`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEvents((prev) => [res.data, ...prev]);
        setMsg({ type: "success", text: "✓ Event created." });
        setEditing(res.data);
      }
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
    upcoming: "#C9A84C",
    live: "#1D9E75",
    past: "rgba(245,240,232,0.3)",
    cancelled: "#E24B4A",
  };
  const inp = "aem-input";
  const lbl = "aem-label";
  const field = "aem-field";

  if (view === "form")
    return (
      <div className="aem-wrap">
        <div className="aem-form-header">
          <button className="aem-back-btn" onClick={() => setView("list")}>
            ← Back to Events
          </button>
          <h3 className="aem-form-title">
            {editing ? "Edit Event" : "Create New Event"}
          </h3>
        </div>

        {msg.text && (
          <div className={`aem-msg aem-msg--${msg.type}`}>{msg.text}</div>
        )}

        <form className="aem-form" onSubmit={submit}>
          {/* Cover image */}
          <div className="aem-field aem-field--full">
            <label className="aem-label">Cover Image</label>
            {imagePreview && (
              <div className="aem-img-preview">
                <img src={imagePreview} alt="" />
                <span
                  className={
                    imageFile
                      ? "aem-img-tag aem-img-tag--new"
                      : "aem-img-tag aem-img-tag--saved"
                  }
                >
                  {imageFile ? "New — not yet saved" : "✓ Current image"}
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="aem-upload-btn"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? "Change image" : "Upload cover image"}
            </button>
            <span className="aem-hint">Recommended: 1280×640px · max 8 MB</span>
          </div>

          {/* Title + Subtitle */}
          <div className={field}>
            <label className={lbl}>Event Title *</label>
            <input
              className={inp}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Global Forum 2025"
              required
            />
          </div>
          <div className={field}>
            <label className={lbl}>Subtitle</label>
            <input
              className={inp}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="A short descriptive tagline"
            />
          </div>

          {/* Date + Timezone */}
          <div className={field}>
            <label className={lbl}>Date & Time *</label>
            <input
              className={inp}
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className={field}>
            <label className={lbl}>Timezone Label</label>
            <input
              className={inp}
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="e.g. WAT (UTC+1, Lagos/Abuja)"
            />
          </div>

          {/* Category + Status */}
          <div className={field}>
            <label className={lbl}>Category</label>
            <select
              className={inp}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className={field}>
            <label className={lbl}>Status</label>
            <select
              className={inp}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div className={field}>
            <label className={lbl}>Venue Name</label>
            <input
              className={inp}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Eko Convention Centre"
            />
          </div>
          <div className={field}>
            <label className={lbl}>City</label>
            <input
              className={inp}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Lagos"
            />
          </div>
          <div className={field}>
            <label className={lbl}>Country</label>
            <input
              className={inp}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. Nigeria"
            />
          </div>
          <div className={field}>
            <label className={lbl}>Google Maps URL</label>
            <input
              className={inp}
              value={form.mapUrl}
              onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Tickets */}
          <div className={field}>
            <label className={lbl}>Ticket Price / Access</label>
            <input
              className={inp}
              value={form.ticketPrice}
              onChange={(e) =>
                setForm({ ...form, ticketPrice: e.target.value })
              }
              placeholder="e.g. Free for members · $250 public"
            />
          </div>
          <div className={field}>
            <label className={lbl}>Ticket / Register URL</label>
            <input
              className={inp}
              value={form.ticketUrl}
              onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className={field}>
            <label className={lbl}>Capacity</label>
            <input
              className={inp}
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="0 = unlimited"
            />
          </div>

          {/* Featured toggle */}
          <div className="aem-field aem-field--check">
            <label className="aem-check-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              <span className="aem-check-box" />
              <span>
                Feature as hero event (shown at top with large countdown)
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="aem-field aem-field--full">
            <label className={lbl}>Description</label>
            <textarea
              className={`${inp} aem-textarea`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Full event description shown in the detail modal..."
            />
          </div>

          {/* Highlights */}
          <div className="aem-field aem-field--full">
            <label className={lbl}>What to Expect (highlights)</label>
            <div className="aem-highlights">
              {form.highlights.map((h, i) => (
                <div key={i} className="aem-highlight-row">
                  <input
                    className={inp}
                    value={h}
                    onChange={(e) => setHighlight(i, e.target.value)}
                    placeholder={`Highlight ${i + 1}`}
                  />
                  {form.highlights.length > 1 && (
                    <button
                      type="button"
                      className="aem-hl-remove"
                      onClick={() => removeHighlight(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="aem-hl-add"
                onClick={addHighlight}
              >
                + Add highlight
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="aem-field aem-field--full aem-form-actions">
            <button type="submit" className="aem-save-btn" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
            </button>
            <button
              type="button"
              className="aem-cancel-btn"
              onClick={() => setView("list")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );

  // LIST VIEW
  return (
    <div className="aem-wrap">
      <div className="aem-list-header">
        <div>
          <h3 className="aem-list-title">Events</h3>
          <p className="aem-list-sub">
            {events.length} total · members see upcoming & live only
          </p>
        </div>
        <button className="aem-create-btn" onClick={openCreate}>
          + Create Event
        </button>
      </div>

      {msg.text && (
        <div className={`aem-msg aem-msg--${msg.type}`}>{msg.text}</div>
      )}

      {loading ? (
        <div className="aem-loading">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="aem-empty">No events yet. Create one above.</div>
      ) : (
        <div className="aem-event-list">
          {events.map((event) => (
            <div key={event._id} className="aem-event-row">
              <div className="aem-event-row-img">
                {event.coverImage ? (
                  <img src={imgSrc(event.coverImage)} alt="" />
                ) : (
                  <div className="aem-event-row-img-placeholder" />
                )}
                {event.featured && (
                  <span className="aem-event-featured-tag">★ Featured</span>
                )}
              </div>
              <div className="aem-event-row-info">
                <h4 className="aem-event-row-title">{event.title}</h4>
                <div className="aem-event-row-meta">
                  <span>
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {event.city && (
                    <span>
                      {event.city}
                      {event.country ? `, ${event.country}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="aem-event-row-right">
                <span
                  className="aem-status-pill"
                  style={{
                    color: statusColor[event.status],
                    borderColor: statusColor[event.status],
                  }}
                >
                  {event.status}
                </span>
                <button
                  className="aem-edit-btn"
                  onClick={() => openEdit(event)}
                >
                  Edit
                </button>
                <button
                  className="aem-del-btn"
                  onClick={() => deleteEvent(event._id)}
                  disabled={deletingId === event._id}
                >
                  {deletingId === event._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
