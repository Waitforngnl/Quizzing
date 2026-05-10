import React, { useEffect, useState, useMemo } from 'react'; // Thêm useMemo
import AdminNavbar from '../../components/AdminNavbar';
import './AdminQuestionBank.css';

function AdminQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- THÊM STATE CHO SẮP XẾP ---
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const difficultyMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  // Để sắp xếp độ khó chuẩn, ta cần gán trọng số
  const difficultyWeight = { easy: 1, medium: 2, hard: 3 };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch questions error', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // --- LOGIC SẮP XẾP ---
  const sortedQuestions = useMemo(() => {
    let sortableItems = [...questions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Xử lý riêng cho độ khó (dựa trên trọng số)
        if (sortConfig.key === 'difficulty') {
          aValue = difficultyWeight[a.difficulty] || 0;
          bValue = difficultyWeight[b.difficulty] || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [questions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Xóa thất bại');
      setQuestions(qs => qs.filter(q => q._id !== id));
    } catch (err) {
      alert('Không thể xóa câu hỏi');
    }
  };

  return (
    <div className="admin-bg">
      <AdminNavbar />
      <div className="admin-container">
        <div className="table-card">
          <div className="table-card-header">
            <h2>Danh sách câu hỏi</h2>
            <button className="btn-create" onClick={() => window.location.href = '/admin/create-question'}>Thêm câu hỏi</button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Đang tải ...</p>
          ) : (
            <table className="questions-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort(null)} className="sortable">STT {getSortIcon(null)}</th>
                  <th onClick={() => requestSort('subject')} className="sortable">Môn {getSortIcon('subject')}</th>
                  <th onClick={() => requestSort('grade')} className="sortable">Khối {getSortIcon('grade')}</th>
                  <th onClick={() => requestSort('difficulty')} className="sortable">Độ khó {getSortIcon('difficulty')}</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuestions.map((q, idx) => (
                  <tr key={q._id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{q.subject}</td>
                    <td>{q.grade}</td>
                    <td>{difficultyMap[q.difficulty] || q.difficulty}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action" onClick={() => window.location.href = `/admin/create-question?id=${q._id}`}>Sửa</button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(q._id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminQuestionBank;