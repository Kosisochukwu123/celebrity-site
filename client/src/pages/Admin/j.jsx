python3 - << 'PYEOF'
with open('/home/claude/celebrity-site/client/src/pages/AdminPanel.jsx', 'r') as f:
    content = f.read()

old = """// Always resolve image URLs to the absolute server origin
function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
}"""

new = """// Resolve image URLs for all storage types
function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;   // base64 data URI — use as-is
  if (url.startsWith('http'))  return url;   // absolute URL — use as-is
  return `${API}${url}`;                     // legacy /uploads/ path
}"""

content = content.replace(old, new)
with open('/home/claude/celebrity-site/client/src/pages/AdminPanel.jsx', 'w') as f:
    f.write(content)
print("fixed:", "data:'" in content)
PYEOF
Output

fixed: True