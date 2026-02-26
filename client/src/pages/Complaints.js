import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Complaints.css';

const Complaints = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(`/api/complaints?${params.toString()}`);
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await axios.delete(`/api/complaints/${id}`);
        fetchComplaints();
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('Failed to delete complaint');
      }
    }
  };

  const handleStatusUpdate = async (complaint) => {
    const allowedStatuses = ['pending', 'in_progress', 'resolved', 'rejected', 'withdrawn'];
    const statusInput = window.prompt(
      'Enter new status (pending, in_progress, resolved, rejected, withdrawn):',
      complaint.status
    );

    if (statusInput === null) {
      return;
    }

    const status = statusInput.trim().toLowerCase();
    if (!allowedStatuses.includes(status)) {
      alert('Invalid status. Use one of: pending, in_progress, resolved, rejected, withdrawn.');
      return;
    }

    const descriptionInput = window.prompt(
      'Admin description / note (optional):',
      complaint.admin_response || ''
    );

    if (descriptionInput === null) {
      return;
    }

    try {
      await axios.patch(`/api/complaints/${complaint.id}/status`, {
        status,
        admin_response: descriptionInput.trim() || null
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert(error.response?.data?.message || 'Failed to update complaint status');
    }
  };

  const handleWithdraw = async (complaint) => {
    const confirmed = window.confirm('Do you want to withdraw this complaint?');
    if (!confirmed) {
      return;
    }

    try {
      await axios.patch(`/api/complaints/${complaint.id}/withdraw`);
      fetchComplaints();
    } catch (error) {
      console.error('Error withdrawing complaint:', error);
      alert(error.response?.data?.message || 'Failed to withdraw complaint');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'withdrawn': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="complaints-page">
      <header className="page-header">
        <div>
          <h1>Complaints</h1>
          <p>Manage and track your complaints</p>
        </div>
        <div className="header-actions">
          {user?.role === 'student' && (
            <button className="btn-primary" onClick={() => navigate('/complaints/create')}>
              + New Complaint
            </button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="complaints-content">
        <div className="filters-section">
          <h2>Filters</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All</option>
                <option value="Library">Library</option>
                <option value="Transport">Transport</option>
                <option value="Canteen">Canteen</option>
                <option value="Medical">Medical</option>
                <option value="Harrasment">Harrasment</option>
                <option value="Lost-things">Lost-things</option>
                <option value="Parking-issue">Parking-issue</option>
                <option value="Class-issue">Class-issue</option>
                
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              className="btn-clear-filters"
              onClick={() => setFilters({ status: '', category: '', priority: '' })}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found</p>
            {user?.role === 'student' && (
              <button className="btn-primary" onClick={() => navigate('/complaints/create')}>
                Create Your First Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map(complaint => (
              <div key={complaint.id} className="complaint-item">
                <div className="complaint-item-header">
                  <h3>{complaint.title}</h3>
                  <div className="badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(complaint.status) + '20', color: getStatusColor(complaint.status) }}
                    >
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(complaint.priority) + '20', color: getPriorityColor(complaint.priority) }}
                    >
                      {complaint.priority}
                    </span>
                  </div>
                </div>

                <p className="complaint-description">{complaint.description}</p>

                {complaint.category && (
                  <div className="complaint-category">
                    <strong>Category:</strong> {complaint.category}
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="complaint-user">
                    <strong>Submitted by:</strong> {complaint.user_name} ({complaint.user_email})
                  </div>
                )}

                {complaint.admin_response && (
                  <div className="admin-response">
                    <strong>Admin Description:</strong>
                    <p>{complaint.admin_response}</p>
                  </div>
                )}

                <div className="complaint-footer">
                  <span className="complaint-date">
                    {new Date(complaint.created_at).toLocaleString()}
                  </span>
                  <div className="complaint-actions">
                    {user?.role === 'admin' && (
                      <button
                        className="btn-update"
                        onClick={() => handleStatusUpdate(complaint)}
                      >
                        Update Status
                      </button>
                    )}
                    {user?.role === 'student' && complaint.user_id === user?.id && complaint.status !== 'withdrawn' && (
                      <button
                        className="btn-withdraw"
                        onClick={() => handleWithdraw(complaint)}
                      >
                        Withdraw
                      </button>
                    )}
                    {(user?.role === 'admin' || complaint.user_id === user?.id) && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(complaint.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
