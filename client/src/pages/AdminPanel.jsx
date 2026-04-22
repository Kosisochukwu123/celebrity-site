import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminChat from '../components/AdminChat';
import '../styles/admin.css';

const SECTIONS = [
  { id: 'hero',    label: 'Hero Section',              fields: ['heading','subheading','body'] },
  { id: 'cause_1', label: 'Cause 1 — Equal Rights',    fields: ['heading','body'], hasImage: true },
  { id: 'cause_2', label: 'Cause 2 — Child Protection', fields: ['heading','body'], hasImage: true },
  { id: 'cause_3', label: 'Cause 3 — Planet',           fields: ['heading','body'], hasImage: true },
  { id: 'about',   label: 'About / Documentary',        fields: ['heading','body'], hasImage: true },
  { id: 'quote',   label: 'Quote Section',              fields: ['body','subheading'] },
];



export default function AdminPanel() {
  const [tab, setTab] = useState('content');
  const [section, setSection] = useState(SECTIONS[0].id);
  const [form, setForm] = useState({ heading: '', subheading: '', body: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [codes, setCodes] = useState([]);
  const [codeCount, setCodeCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_BACKEND_URL;

  const currentSection = SECTIONS.find(s => s.id === section);

  useEffect(() => {
    setMsg({ type: '', text: '' });
    setImage(null); setPreview(null);
    axios.get(`${API}/api/content/${section}`).then(res => {
      setForm({ heading: res.data.heading || '', subheading: res.data.subheading || '', body: res.data.body || '' });
      if (res.data.imageUrl) setPreview(res.data.imageUrl);
    }).catch(() => setForm({ heading: '', subheading: '', body: '' }));
  }, [section]);

  useEffect(() => {
    if (tab === 'codes') {
      axios.get(`${API}/api/admin/codes`).then(res => setCodes(res.data)).catch(() => {});
    }
  }, [tab]);

  const saveContent = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await axios.put(`${API}/api/admin/content/${section}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg({ type: 'success', text: 'Changes saved successfully.' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally { setSaving(false); }
  };

  const generateCodes = async () => {
    setGenerating(true);
    try {
      await axios.post(`${API}/api/admin/codes`, { count: codeCount });
      const res = await axios.get(`${API}/api/admin/codes`);
      setCodes(res.data);
    } finally { setGenerating(false); }
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <span className="admin-eyebrow">Administrator</span>
        <h1 className="admin-title">Admin Panel</h1>
        <div className="admin-tabs">
          {['content','codes','chat'].map(t => (
            <button
              key={t}
              className={`admin-tab admin-tab--${tab === t ? 'active' : 'inactive'}`}
              onClick={() => setTab(t)}
            >
              {t === 'content' ? 'Content Editor' : t === 'codes' ? 'Membership Codes' : 'Live Chat'}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-body">

        {/* ── CONTENT EDITOR ── */}
        {tab === 'content' && (
          <div className="admin-editor">
            <div>
              <span className="admin-sidebar-label">Page Sections</span>
              <div className="admin-section-list">
                {SECTIONS.map(s => (
                  <button key={s.id} className={`admin-section-btn ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-form-panel">
              <h2 className="admin-form-heading">{currentSection?.label}</h2>
              <form onSubmit={saveContent}>
                {currentSection?.fields.includes('heading') && (
                  <div className="admin-field">
                    <label className="admin-label">Heading</label>
                    <input className="admin-input" value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} placeholder="Main heading text" />
                  </div>
                )}
                {currentSection?.fields.includes('subheading') && (
                  <div className="admin-field">
                    <label className="admin-label">Subheading</label>
                    <input className="admin-input" value={form.subheading} onChange={e => setForm({ ...form, subheading: e.target.value })} placeholder="Subheading or attribution" />
                  </div>
                )}
                {currentSection?.fields.includes('body') && (
                  <div className="admin-field">
                    <label className="admin-label">Body Text</label>
                    <textarea className="admin-textarea" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Body content..." />
                  </div>
                )}
                {currentSection?.hasImage && (
                  <div className="admin-field">
                    <label className="admin-label">Section Image</label>
                    {preview && (
                      <div className="admin-image-preview">
                        <img src={preview} alt="" />
                      </div>
                    )}
                    <input className="admin-file-input" type="file" accept="image/*" onChange={onImageChange} />
                  </div>
                )}
                <div className="admin-form-actions">
                  <button className="admin-save-btn" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {msg.text && (
                    <span className={msg.type === 'success' ? 'admin-save-success' : 'admin-save-error'}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MEMBERSHIP CODES ── */}
        {tab === 'codes' && (
          <div>
            <div className="admin-codes-header">
              <div className="admin-codes-header-text">
                <span className="admin-codes-header-tag">Generate New Codes</span>
                <div className="admin-codes-count-wrap">
                  <input className="admin-codes-count-input" type="number" min={1} max={100} value={codeCount} onChange={e => setCodeCount(Number(e.target.value))} />
                  <span className="admin-codes-count-label">codes to generate</span>
                </div>
              </div>
              <button className="admin-codes-generate-btn" onClick={generateCodes} disabled={generating}>
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th><th>Status</th><th>Used By</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 && (
                    <tr><td colSpan={4} className="admin-table-empty">No codes yet. Generate some above.</td></tr>
                  )}
                  {codes.map(code => (
                    <tr key={code._id}>
                      <td>{code.code}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${code.used ? 'used' : 'available'}`}>
                          {code.used ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td>{code.usedBy?.name || '—'}</td>
                      <td>{new Date(code.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LIVE CHAT ── */}
        {tab === 'chat' && <AdminChat />}
      </div>
    </div>
  );
}
