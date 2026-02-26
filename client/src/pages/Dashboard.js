import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import AppShell from '../components/AppShell';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes] = await Promise.all([
        axios.get('/api/complaints')
      ]);

      const all = complaintsRes.data;
      setComplaints(all);
      setRecentComplaints(all.slice(0, 5));

      const statsData = {
        total: all.length,
        pending: all.filter(c => c.status === 'pending').length,
        inProgress: all.filter(c => c.status === 'in_progress').length,
        resolved: all.filter(c => c.status === 'resolved').length
      };

      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const categoryStats = useMemo(() => {
    const buckets = new Map();
    for (const c of complaints) {
      const key = (c.category || 'other').toString();
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const order = ['library', 'facilities', 'canteen', 'transport', 'academic', 'administrative', 'other'];
    const normalized = Array.from(buckets.entries()).map(([k, v]) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      value: v
    }));
    normalized.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    return normalized.length ? normalized.slice(0, 5) : [
      { key: 'library', label: 'Library', value: 1 },
      { key: 'facilities', label: 'Facilities', value: 1 },
      { key: 'canteen', label: 'Canteen', value: 1 },
      { key: 'transport', label: 'Transport', value: 1 },
      { key: 'academic', label: 'Academic', value: 1 }
    ];
  }, [complaints]);

  const statusDistribution = useMemo(() => {
    const total = Math.max(stats.total, 1);
    return [
      { key: 'pending', label: 'Pending', pct: Math.round((stats.pending / total) * 100), color: '#f59e0b' },
      { key: 'in_progress', label: 'In Progress', pct: Math.round((stats.inProgress / total) * 100), color: '#3b82f6' },
      { key: 'resolved', label: 'Resolved', pct: Math.round((stats.resolved / total) * 100), color: '#10b981' }
    ];
  }, [stats]);

  if (loading) {
    return (
      <AppShell active="dashboard">
        <div className="ud-loading">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell active="dashboard">
      <section className="ud-hero">
        <div className="ud-heroInner">
          <div className="ud-heroLeft">
            <h1 className="ud-heroTitle">
              Welcome back, {user?.name || 'User'}! <span className="ud-wave" aria-hidden="true">👋</span>
            </h1>
            <p className="ud-heroSub">Here's an overview of all university complaints</p>
          </div>
          <div className="ud-heroRight">
            <div className="ud-photo" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="ud-grid">
        <section className="ud-stats">
          <div className="ud-statCard">
            <div className="ud-statIcon is-blue" aria-hidden="true">▢</div>
            <div className="ud-statMeta">
              <div className="ud-statNumber">{stats.total}</div>
              <div className="ud-statLabel">Total Complaints</div>
              <button className="ud-inlineLink" type="button" onClick={() => navigate('/complaints')}>View all</button>
            </div>
          </div>

          <div className="ud-statCard">
            <div className="ud-statIcon is-orange" aria-hidden="true">◔</div>
            <div className="ud-statMeta">
              <div className="ud-statNumber">{stats.pending}</div>
              <div className="ud-statLabel">Pending Review</div>
              <div className="ud-miniRow">
                <span className="ud-miniHint">Awaiting</span>
                <span className="ud-miniBar"><span style={{ width: `${Math.min(100, stats.pending * 18)}%` }} /></span>
              </div>
            </div>
          </div>

          <div className="ud-statCard">
            <div className="ud-statIcon is-cyan" aria-hidden="true">◑</div>
            <div className="ud-statMeta">
              <div className="ud-statNumber">{stats.inProgress}</div>
              <div className="ud-statLabel">In Progress</div>
              <div className="ud-miniRow">
                <span className="ud-miniHint">Active</span>
                <span className="ud-miniBar is-blue"><span style={{ width: `${Math.min(100, stats.inProgress * 22)}%` }} /></span>
              </div>
            </div>
          </div>

          <div className="ud-statCard">
            <div className="ud-statIcon is-green" aria-hidden="true">✓</div>
            <div className="ud-statMeta">
              <div className="ud-statNumber">{stats.resolved}</div>
              <div className="ud-statLabel">Resolved</div>
              <div className="ud-miniRow">
                <span className="ud-miniHint">Done</span>
                <span className="ud-miniPill">↑ {Math.max(0, Math.round((stats.resolved / Math.max(stats.total, 1)) * 100))}% resolution rate</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ud-actionsRow">
          <button
            type="button"
            className="ud-actionCard is-primary"
            onClick={() => navigate('/complaints/create')}
          >
            <div className="ud-actionIcon" aria-hidden="true">＋</div>
            <div className="ud-actionText">
              <div className="ud-actionTitle">Submit New Complaint</div>
              <div className="ud-actionSub">Have an issue? Let us know and we'll help resolve it</div>
            </div>
            <div className="ud-actionArrow" aria-hidden="true">→</div>
          </button>

          <button type="button" className="ud-actionCard" onClick={() => navigate('/complaints')}>
            <div className="ud-actionIcon is-soft" aria-hidden="true">▢</div>
            <div className="ud-actionText">
              <div className="ud-actionTitle">View All Complaints</div>
              <div className="ud-actionSub">Browse and track all your submitted complaints</div>
            </div>
            <div className="ud-actionArrow" aria-hidden="true">→</div>
          </button>
        </section>

        <section className="ud-panels">
          <div className="ud-panel">
            <div className="ud-panelHead">
              <span className="ud-accentBar" aria-hidden="true" />
              <div className="ud-panelTitle">Complaints by Category</div>
            </div>
            <div className="ud-bars">
              {categoryStats.map((c) => (
                <div className="ud-barCol" key={c.key}>
                  <div className="ud-bar" style={{ height: `${18 + c.value * 16}px` }} />
                  <div className="ud-barLabel">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ud-panel">
            <div className="ud-panelHead">
              <span className="ud-accentBar" aria-hidden="true" />
              <div className="ud-panelTitle">Status Distribution</div>
            </div>
            <div className="ud-pieWrap">
              <svg className="ud-pie" viewBox="0 0 120 120" role="img" aria-label="Status distribution chart">
                {(() => {
                  let start = 0;
                  const cx = 60, cy = 60, r = 44;
                  const arcs = [];
                  for (const s of statusDistribution) {
                    const angle = (Math.max(0, s.pct) / 100) * Math.PI * 2;
                    const end = start + angle;
                    const x1 = cx + r * Math.cos(start - Math.PI / 2);
                    const y1 = cy + r * Math.sin(start - Math.PI / 2);
                    const x2 = cx + r * Math.cos(end - Math.PI / 2);
                    const y2 = cy + r * Math.sin(end - Math.PI / 2);
                    const large = angle > Math.PI ? 1 : 0;
                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                    arcs.push(<path key={s.key} d={d} fill={s.color} opacity="0.95" />);
                    start = end;
                  }
                  return arcs;
                })()}
              </svg>
              <div className="ud-pieLegend">
                {statusDistribution.map((s) => (
                  <div className="ud-legItem" key={s.key} style={{ color: s.color }}>
                    {s.label} {s.pct}%
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ud-panel is-wide">
            <div className="ud-panelHead">
              <span className="ud-accentBar" aria-hidden="true" />
              <div className="ud-panelTitle">Recent Activity</div>
            </div>
            <div className="ud-activity">
              {(recentComplaints.length ? recentComplaints : []).slice(0, 5).map((c) => (
                <div className="ud-activityRow" key={c.id}>
                  <div className="ud-activityDot" style={{ background: getStatusColor(c.status) }} aria-hidden="true" />
                  <div className="ud-activityMain">
                    <div className="ud-activityTitle">{c.title}</div>
                    <div className="ud-activitySub">
                      {c.user_name || user?.name || 'User'} • {(c.category || 'Other').toString()} • {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="ud-activityBadge" style={{ background: getStatusColor(c.status) + '1F', color: getStatusColor(c.status) }}>
                    {c.status.replace('_', '-')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Dashboard;
