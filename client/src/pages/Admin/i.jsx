cat > /home/claude/celebrity-site/server/.env.example << 'ENDFILE'
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/celebrity-site
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRES_IN=7d

# Your Vercel frontend URL — no trailing slash
CLIENT_URL=https://your-vercel-app.vercel.app

# ── Email (Nodemailer) ─────────────────────────────────────
# Gmail setup:
#   1. Enable 2-Step Verification on your Google account
#   2. Go to Google Account → Security → App Passwords
#   3. Generate an app password for "Mail"
#   4. Use that 16-char password as EMAIL_PASS

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="Alex Sterling Foundation <yourname@gmail.com>"
ENDFILE
echo "done"
Output

done