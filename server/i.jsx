python3 - << 'PYEOF'
with open('/home/claude/celebrity-site/server/routes/auth.routes.js', 'r') as f:
    content = f.read()

old = "module.exports = router;"
new = """// GET /api/auth/users — admin: list all users with address + membership info
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role membershipActive address createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/users/:id/address — admin: get one user's delivery address
router.get('/users/:id/address', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email address membershipActive');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;"""

content = content.replace(old, new)
with open('/home/claude/celebrity-site/server/routes/auth.routes.js', 'w') as f:
    f.write(content)

# Also need to import adminOnly
if "adminOnly" not in content:
    content = content.replace(
        "const { protect } = require('../middleware/auth.middleware');",
        "const { protect } = require('../middleware/auth.middleware');\nconst { adminOnly } = require('../middleware/admin.middleware');"
    )
    with open('/home/claude/celebrity-site/server/routes/auth.routes.js', 'w') as f:
        f.write(content)

print("routes added:", '/users' in content)
print("adminOnly present:", 'adminOnly' in content)
PYEOF
Output

routes added: True
adminOnly present: True