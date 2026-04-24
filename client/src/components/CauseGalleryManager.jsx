import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/gallery-manager.css";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000" || "";
const imgSrc = (url) =>
  !url ? "" : url.startsWith("http") ? url : `${API}${url}`;

const CAUSES = [
  { id: "cause_1", label: "Cause 1 — Equal Rights" },
  { id: "cause_2", label: "Cause 2 — Child Protection" },
  { id: "cause_3", label: "Cause 3 — Planet" },
];

export default function CauseGalleryManager() {
  const [activeCause, setActiveCause] = useState("cause_1");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const loadImages = async (section) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.get(`${API}/api/content/${section}`);
      setImages(res.data?.images || []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages(activeCause);
  }, [activeCause]);

  // Upload files
  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setMsg({ type: "", text: "" });
    try {
      const data = new FormData();
      Array.from(files).forEach((f) => data.append("images", f));
      const res = await axios.post(
        `${API}/api/admin/content/${activeCause}/gallery`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setImages(res.data?.images || []);
      setMsg({
        type: "success",
        text: `✓ ${files.length} image${files.length > 1 ? "s" : ""} uploaded.`,
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFileChange = (e) => uploadFiles(e.target.files);

  // Drag-and-drop
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  // Delete single image
  const deleteImage = async (imageId) => {
    if (!window.confirm("Delete this image permanently?")) return;
    setDeletingId(imageId);
    try {
      await axios.delete(
        `${API}/api/admin/content/${activeCause}/gallery/${imageId}`,
      );
      setImages((prev) => prev.filter((img) => img._id !== imageId));
      setMsg({ type: "success", text: "✓ Image deleted." });
    } catch {
      setMsg({ type: "error", text: "Could not delete image." });
    } finally {
      setDeletingId(null);
    }
  };

  // Save caption
  const saveCaption = async (imageId) => {
    try {
      const res = await axios.patch(
        `${API}/api/admin/content/${activeCause}/gallery/${imageId}`,
        { caption: captionDraft },
      );
      setImages(res.data?.images || []);
      setEditingId(null);
      setMsg({ type: "success", text: "✓ Caption saved." });
    } catch {
      setMsg({ type: "error", text: "Could not save caption." });
    }
  };

  const startEdit = (img) => {
    setEditingId(img._id);
    setCaptionDraft(img.caption || "");
  };

  return (
    <div className="gm-wrap">
      {/* Cause selector */}
      <div className="gm-cause-tabs">
        {CAUSES.map((c) => (
          <button
            key={c.id}
            className={`gm-cause-tab ${activeCause === c.id ? "active" : ""}`}
            onClick={() => setActiveCause(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        className={`gm-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        <div className="gm-dropzone-icon">
          {uploading ? (
            <div className="gm-spinner" />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <p className="gm-dropzone-title">
          {uploading ? "Uploading..." : "Drop images here or click to browse"}
        </p>
        <p className="gm-dropzone-hint">
          jpg, png, webp, gif · max 8 MB per file · up to 10 at once
        </p>
      </div>

      {/* Status message */}
      {msg.text && (
        <div className={`gm-msg gm-msg--${msg.type}`}>{msg.text}</div>
      )}

      {/* Count */}
      {!loading && (
        <div className="gm-count">
          {images.length === 0
            ? "No images yet — upload some above."
            : `${images.length} image${images.length > 1 ? "s" : ""} in this cause`}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="gm-loading">Loading...</div>
      ) : (
        <div className="gm-grid">
          {images.map((img) => (
            <div key={img._id} className="gm-item">
              <div className="gm-item-img-wrap">
                <img
                  src={imgSrc(img.url)}
                  alt={img.caption || "Gallery image"}
                />
                <button
                  className="gm-item-delete"
                  onClick={() => deleteImage(img._id)}
                  disabled={deletingId === img._id}
                  title="Delete image"
                >
                  {deletingId === img._id ? "..." : "✕"}
                </button>
              </div>

              {/* Caption editor */}
              {editingId === img._id ? (
                <div className="gm-caption-edit">
                  <input
                    className="gm-caption-input"
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    placeholder="Add a caption..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCaption(img._id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="gm-caption-actions">
                    <button
                      className="gm-caption-save"
                      onClick={() => saveCaption(img._id)}
                    >
                      Save
                    </button>
                    <button
                      className="gm-caption-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="gm-caption-display"
                  onClick={() => startEdit(img)}
                >
                  {img.caption ? (
                    <span className="gm-caption-text">{img.caption}</span>
                  ) : (
                    <span className="gm-caption-empty">+ Add caption</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
