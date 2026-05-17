
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import './AuditLog.css';



function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (actionFilter) params.push(`action=${encodeURIComponent(actionFilter)}`);
      const url = `http://localhost:5001/api/audit-log${params.length ? '?' + params.join('&') : ''}`; // Tránh lỗi định tuyến chéo cổng
      const res = await fetch(url);
      const data = await res.json();
      console.log('[AuditLog] fetch', { url, status: res.status, length: Array.isArray(data) ? data.length : 0 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [search, actionFilter, refreshKey]);

  const actions = Array.from(new Set(logs.map(l => l.action)));
  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <div className="table-card">
          <h2>Lịch sử hoạt động người dùng</h2>
          <div className="form-group" style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
            <input
              type="text"
              className="form-group-input"
              placeholder="Tìm kiếm theo tên người dùng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 2 }}
            />
            <select
              className="form-select"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Tất cả hành động</option>
              {actions.map((a, i) => (
                <option key={i} value={a}>{a}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-refresh"
              onClick={() => setRefreshKey(k => k + 1)}
              title="Làm mới dữ liệu"
            >
              Làm mới
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Người dùng</th>
                  <th style={{ width: '20%' }}>Hành động</th>
                  <th style={{ width: '20%' }}>Thời gian</th>
                  <th style={{ width: '40%' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>Đang tải...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu</td></tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log._id || idx}>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.time).toLocaleString('vi-VN')}</td>
                      <td>{log.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuditLog;
