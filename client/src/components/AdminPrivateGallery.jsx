import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/admin-private-gallery.css";

const API = import.meta.env.VITE_BACKEND_URL;
const imgSrc = (url) =>
  !url ? "" : url.startsWith("http") ? url : `${API}${url}`;

export default function AdminPrivateGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(new Set()); // selected IDs for bulk delete
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/gallery");
      setImages(res.data);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Upload
  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setProgress(0);
    setMsg({ type: "", text: "" });
    try {
      const data = new FormData();
      Array.from(files).forEach((f) => data.append("images", f));
      const res = await axios.post("/api/gallery/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setImages((prev) => [...res.data, ...prev]);
      setMsg({
        type: "success",
        text: `✓ ${res.data.length} image${res.data.length > 1 ? "s" : ""} uploaded.`,
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  // Single delete
  const deleteOne = async (id) => {
    if (!window.confirm("Delete this image permanently?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/gallery/${id}`);
      setImages((prev) => prev.filter((i) => i._id !== id));
      setSelected((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      setMsg({ type: "success", text: "✓ Image deleted." });
    } catch {
      setMsg({ type: "error", text: "Could not delete." });
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (!selected.size) return;
    if (
      !window.confirm(
        `Delete ${selected.size} image${selected.size > 1 ? "s" : ""} permanently?`,
      )
    )
      return;
    setBulkDeleting(true);
    try {
      await axios.post("/api/gallery/bulk-delete", { ids: [...selected] });
      setImages((prev) => prev.filter((i) => !selected.has(i._id)));
      setSelected(new Set());
      setMsg({ type: "success", text: `✓ ${selected.size} images deleted.` });
    } catch {
      setMsg({ type: "error", text: "Bulk delete failed." });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };
  const selectAll = () => setSelected(new Set(images.map((i) => i._id)));
  const deselectAll = () => setSelected(new Set());

  // Caption
  const saveCaption = async (id) => {
    try {
      const res = await axios.patch(`/api/gallery/${id}`, {
        caption: captionDraft,
      });
      setImages((prev) => prev.map((i) => (i._id === id ? res.data : i)));
      setEditingId(null);
      setMsg({ type: "success", text: "✓ Caption saved." });
    } catch {
      setMsg({ type: "error", text: "Could not save caption." });
    }
  };

  return (
    <div className="apg-wrap">
      {/* Header */}
      <div className="apg-header">
        <div>
          <h3 className="apg-title">Private Member Gallery</h3>
          <p className="apg-sub">
            {images.length} images · visible to logged-in members only · no
            captions shown to members
          </p>
        </div>
        {selected.size > 0 && (
          <button
            className="apg-bulk-delete-btn"
            onClick={bulkDelete}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? "Deleting..." : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>

      {/* Upload zone */}
      <div
        className={`apg-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
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
          onChange={(e) => uploadFiles(e.target.files)}
        />

        {uploading ? (
          <div className="apg-upload-progress">
            <div className="apg-progress-bar">
              <div
                className="apg-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <svg
              className="apg-upload-icon"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M8 32v6a2 2 0 002 2h28a2 2 0 002-2v-6" />
              <path d="M24 30V10" />
              <path d="M16 18l8-8 8 8" />
            </svg>
            <p className="apg-dz-title">Drop images here or click to browse</p>
            <p className="apg-dz-hint">
              jpg, png, webp, gif · max 15 MB · up to 20 at once
            </p>
          </>
        )}
      </div>

      {/* Status message */}
      {msg.text && (
        <div className={`apg-msg apg-msg--${msg.type}`}>{msg.text}</div>
      )}

      {/* Toolbar */}
      {images.length > 0 && (
        <div className="apg-toolbar">
          <div className="apg-toolbar-left">
            <button className="apg-sel-btn" onClick={selectAll}>
              Select all
            </button>
            {selected.size > 0 && (
              <button className="apg-sel-btn" onClick={deselectAll}>
                Deselect all
              </button>
            )}
            {selected.size > 0 && (
              <span className="apg-sel-count">{selected.size} selected</span>
            )}
          </div>
          <span className="apg-toolbar-hint">
            Click image to select · Click caption area to edit
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="apg-loading">Loading...</div>
      ) : (
        <div className="apg-grid">
          {images.map((img) => (
            <div
              key={img._id}
              className={`apg-item ${selected.has(img._id) ? "selected" : ""}`}
            >
              {/* Image */}
              <div
                className="apg-item-img"
                onClick={() => toggleSelect(img._id)}
              >
                <img
                  src={imgSrc(img.url)}
                  alt={img.caption || ""}
                  loading="lazy"
                />

                {/* Selection checkbox */}
                <div
                  className={`apg-checkbox ${selected.has(img._id) ? "checked" : ""}`}
                >
                  {selected.has(img._id) && "✓"}
                </div>

                {/* Delete button */}
                <button
                  className="apg-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOne(img._id);
                  }}
                  disabled={deletingId === img._id}
                  title="Delete"
                >
                  {deletingId === img._id ? "…" : "✕"}
                </button>

                {/* Selected overlay */}
                {selected.has(img._id) && (
                  <div className="apg-selected-overlay" />
                )}
              </div>

              {/* Caption — optional, internal use only */}
              {editingId === img._id ? (
                <div className="apg-caption-edit">
                  <input
                    className="apg-caption-input"
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    placeholder="Internal note (optional)..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCaption(img._id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="apg-caption-btns">
                    <button
                      className="apg-cap-save"
                      onClick={() => saveCaption(img._id)}
                    >
                      Save
                    </button>
                    <button
                      className="apg-cap-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="apg-caption-display"
                  onClick={() => {
                    setEditingId(img._id);
                    setCaptionDraft(img.caption || "");
                  }}
                >
                  {img.caption ? (
                    <span className="apg-cap-text">{img.caption}</span>
                  ) : (
                    <span className="apg-cap-empty">+ Add note</span>
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
