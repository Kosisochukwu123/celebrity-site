

  const navigate = useNavigate();
  const openCause = (cause) => {
            <button className="btn btn--primary" onClick={() => navigate('/register')}>Join the Movement</button>
          <button className="btn btn--primary" onClick={() => navigate('/members')}>Watch Full Documentary</button>
          <div className="video-frame" onClick={() => navigate('/members')}>
                <button className="cause-card-link" onClick={() => openCause(cause)}>
                  Learn more →
          <button className="btn btn--primary" onClick={() => navigate('/members')}>View Full Impact Report</button>
          Already a member? <span onClick={() => navigate('/login')}>Sign in with your code →</span>
              <button className="btn btn--primary" style={{ marginTop: '2rem' }} onClick={() => { closeCause(); navigate('/membership'); }}>
                }



                grep -n "DEFAULT_CAUSES\|num.*01\|num.*02\|num.*03\|causeIndex" /home/claude/celebrity-site/client/src/pages/Home.jsx | head -20
Output

16:const DEFAULT_CAUSES = [
18:    num: '01', id: 'cause_1',
24:    num: '02', id: 'cause_2',
30:    num: '03', id: 'cause_3',
62:  const causes = DEFAULT_CAUSES.map(cause => ({
158:                <button className="cause-card-link" onClick={() => navigate(`/cause/${cause.causeIndex}`)}></button>



sed -i "s/{ num: '01', id: 'cause_1',/{ num: '01', id: 'cause_1', causeIndex: '1',/" /home/claude/celebrity-site/client/src/pages/Home.jsx
sed -i "s/{ num: '02', id: 'cause_2',/{ num: '02', id: 'cause_2', causeIndex: '2',/" /home/claude/celebrity-site/client/src/pages/Home.jsx
sed -i "s/{ num: '03', id: 'cause_3',/{ num: '03', id: 'cause_3', causeIndex: '3',/" /home/claude/celebrity-site/client/src/pages/Home.jsx

echo "checking..."
grep -n "causeIndex" /home/claude/celebrity-site/client/src/pages/Home.jsx



grep -n "cause_1\|causeIndex\|01" /home/claude/celebrity-site/client/src/pages/Home.jsx | head -10
Output

18:    num: '01', id: 'cause_1',
27:    detail: 'Our Child Safety Initiative operates in 28 countries, funding emergency shelters, legal representation for abuse survivors, school-building programs in conflict zones, and training for local child-protection officers. Over 140,000 children have been directly supported since 2010.',
158:                <button className="cause-card-link" onClick={() => navigate(`/cause/${cause.causeIndex}`)}></button>