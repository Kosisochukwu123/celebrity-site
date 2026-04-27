grep -rn "navigate(" /home/claude/celebrity-site/client/src/ | grep -v "node_modules\|\.css" | head -40
Output

/home/claude/celebrity-site/client/src/pages/Login.jsx:19:      navigate(user.role === 'admin' ? '/admin' : '/members');
/home/claude/celebrity-site/client/src/pages/MembershipPage.jsx:186:      navigate('/login');
/home/claude/celebrity-site/client/src/pages/CausePage.jsx:155:        <button onClick={() => navigate('/')}>Back to Home</button>
/home/claude/celebrity-site/client/src/pages/CausePage.jsx:184:          <button className="cause-back-btn" onClick={() => navigate('/#causes')}>
/home/claude/celebrity-site/client/src/pages/CausePage.jsx:274:            <button className="btn btn--primary" onClick={() => navigate('/membership')}>Become a Member</button>
/home/claude/celebrity-site/client/src/pages/CausePage.jsx:275:            <button className="btn btn--outline" onClick={() => navigate('/#causes')}>View All Causes</button>
/home/claude/celebrity-site/client/src/pages/Register.jsx:19:      navigate('/members');
/home/claude/celebrity-site/client/src/pages/Home.jsx:94:            <button className="btn btn--primary" onClick={() => navigate('/register')}>Join the Movement</button>
/home/claude/celebrity-site/client/src/pages/Home.jsx:115:          <button className="btn btn--primary" onClick={() => navigate('/members')}>Watch Full Documentary</button>
/home/claude/celebrity-site/client/src/pages/Home.jsx:118:          <div className="video-frame" onClick={() => navigate('/members')}>
/home/claude/celebrity-site/client/src/pages/Home.jsx:155:                <button className="cause-card-link" onClick={() => navigate(`/cause/${cause.causeIndex}`)}>
/home/claude/celebrity-site/client/src/pages/Home.jsx:197:          <button className="btn btn--primary" onClick={() => navigate('/members')}>View Full Impact Report</button>
/home/claude/celebrity-site/client/src/pages/Home.jsx:211:          Already a member? <span onClick={() => navigate('/login')}>Sign in with your code →</span>
/home/claude/celebrity-site/client/src/pages/Home.jsx:242:              <button className="btn btn--primary" style={{ marginTop: '2rem' }} onClick={() => { closeCause(); navigate('/membership'); }}>
/home/claude/celebrity-site/client/src/components/Navbar.jsx:24:  const handleLogout = () => { logout(); navigate('/'); };
/home/claude/celebrity-site/client/src/components/Navbar.jsx:48:            <button className="navbar-btn navbar-btn--login" onClick={() => navigate('/login')}>Member Login</button>
/home/claude/celebrity-site/client/src/components/Navbar.jsx:68:          <button className="navbar-btn navbar-btn--login" onClick={() => navigate('/login')}>Member Login</button>
/home/claude/celebrity-site/client/src/components/NotificationBar.jsx:100:          <button className="notif-bar-cta" onClick={() => { navigate(n.path); dismiss(n.id); }}></button>