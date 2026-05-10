import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';
import './CreateQuestion.css';

// ĐÃ THÊM DÒNG NÀY: Import trực tiếp thư viện xlsx lên đầu file
import * as XLSX from 'xlsx';

const REQUIRED_HEADERS = ['grade','class','difficulty','subject','question','a','b','c','d','answer','explanation'];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return { error: 'File trống' };

  const rawHeaders = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const headerIndex = {};
  rawHeaders.forEach((h, i) => headerIndex[h] = i);

  for (const h of REQUIRED_HEADERS) {
    if (!headerIndex.hasOwnProperty(h)) return { error: `Thiếu cột bắt buộc: ${h}` };
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < rawHeaders.length) continue; 
    const row = {};
    for (const [h, idx] of Object.entries(headerIndex)) {
      row[h] = cols[idx] !== undefined ? cols[idx].trim() : '';
    }
    rows.push(row);
  }

  return { headers: rawHeaders, rows };
}

function splitCSVLine(line) {
  const pattern = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  const parts = line.split(pattern).map(s => s.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"'));
  return parts;
}

function buildQuestionObjects(rows) {
  return rows.map((r) => ({
    content: r.question || '',
    options: [
      { text: r.a || '' },
      { text: r.b || '' },
      { text: r.c || '' },
      { text: r.d || '' }
    ],
    correctAnswer: (r.answer || '').toUpperCase(),
    subject: r.subject || '',
    grade: r.grade || '',
    difficulty: r.difficulty || 'easy',
    explanation: r.explanation || ''
  }));
}

function ImportQuestions() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [rows, setRows] = useState(null);
  const [previewCount, setPreviewCount] = useState(10);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFile = (file) => {
    setError('');
    setRows(null);
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setError('Vui lòng chọn file Excel (.xlsx, .xls)');
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // ĐÃ SỬA: Dùng thẳng biến XLSX đã import ở đầu file, không dùng await import nữa
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
        const parsed = parseCSV(csv);
        
        if (parsed.error) { setError(parsed.error); return; }
        if (!parsed.rows.length) { setError('File không có dòng dữ liệu nào'); return; }
        
        const grades = Array.from(new Set(parsed.rows.map(r => r.grade)));
        const classes = Array.from(new Set(parsed.rows.map(r => r.class)));
        const subjects = Array.from(new Set(parsed.rows.map(r => r.subject)));
        if (grades.length > 1) return setError(`Các dòng có nhiều khối khác nhau: ${grades.join(', ')}`);
        if (classes.length > 1) return setError(`Các dòng có nhiều lớp khác nhau: ${classes.join(', ')}`);
        if (subjects.length > 1) return setError(`Các dòng có nhiều môn khác nhau: ${subjects.join(', ')}`);
        
        setRows(parsed.rows);
      } catch (err) {
        console.error('Failed to parse xlsx', err);
        setError('Không thể đọc file Excel. Định dạng dữ liệu có thể không đúng.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    if (!rows || !rows.length) return setError('Không có dữ liệu để import');
    
    setIsImporting(true); 
    const questions = buildQuestionObjects(rows);
    const token = localStorage.getItem('token');

    try {
      const promises = questions.map(q => 
        fetch('http://localhost:5001/api/questions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' 
          },
          body: JSON.stringify(q)
        })
      );

      await Promise.all(promises);

      localStorage.removeItem('importedQuestions');
      localStorage.removeItem('importedMeta');

      alert(`Đã lưu thành công ${questions.length} câu hỏi vào Ngân hàng Database!`);
      navigate('/teacher/organize/bank');
    } catch (err) {
      setError('Lỗi kết nối máy chủ khi đang lưu dữ liệu!');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="teacher-bg">
      <TeacherNavbar />
      <div className="create-exam-container">
        <div className="page-header">
          <h2>Import Câu Hỏi (Excel)</h2>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="form-card">
            <div className="form-group">
              <label>Chọn file dữ liệu</label>
              <input type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} disabled={isImporting} />
            </div>

            {error && <div className="msg-box error">{error}</div>}

            {rows && (
              <div>
                <div className="msg-box success">File hợp lệ: {rows.length} câu (Khối {rows[0].grade}, môn {rows[0].subject})</div>
                <h3>Xem trước các câu hỏi</h3>
                <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #eee', padding: 10 }}>
                  {rows.slice(0, previewCount).map((r, i) => (
                    <div key={i} style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>
                      <div style={{ fontWeight: 700 }}>{i+1}. {r.question}</div>
                      <div style={{ marginTop: 6 }}>
                        <div>A. {r.a}</div>
                        <div>B. {r.b}</div>
                        <div>C. {r.c}</div>
                        <div>D. {r.d}</div>
                        <div style={{ marginTop: 6, color: '#555' }}>Đáp án: {r.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button className="btn-create" onClick={confirmImport} disabled={isImporting}>
                    {isImporting ? 'Đang lưu vào Database...' : 'Xác nhận import'}
                  </button>
                  <button className="btn-create" style={{ backgroundColor: '#eee', color: '#333' }} onClick={() => { setRows(null); setFileName(''); }} disabled={isImporting}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportQuestions;