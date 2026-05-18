import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Import thư viện Excel
import TeacherNavbar from '../../components/TeacherNavbar';
import './TeacherExamHistory.css';

function TeacherExamHistory() {
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(location.state?.selectedExamId || '');
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchTeacherExams();
  }, []);

  useEffect(() => {
    if (location.state?.selectedExamId && exams.find(e => e._id === location.state.selectedExamId)) {
      setSelectedExamId(location.state.selectedExamId);
    }
  }, [location.state, exams]);

  const fetchTeacherExams = async () => {
    setLoadingExams(true);
    try {
      const stored = localStorage.getItem('currentUser');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) {
        setExams([]);
        setLoadingExams(false);
        return;
      }

      const res = await fetch(`http://localhost:5001/api/exams?creator=${user.id || user._id}`);
      const data = await res.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bài thi của giáo viên', err);
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) fetchResults(selectedExamId);
    else setResults([]);
  }, [selectedExamId]);

  const fetchResults = async (examId) => {
    setLoadingResults(true);
    try {
      const res = await fetch(`http://localhost:5001/api/results/exam/${examId}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Lỗi khi lấy kết quả', err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // ==========================================
  // 1. TÍNH NĂNG XUẤT EXCEL BẢNG ĐIỂM
  // ==========================================
  const handleExportExcelScores = () => {
    if (!results || results.length === 0) {
      return alert("Không có dữ liệu điểm số để xuất file!");
    }

    // Lấy tên bài thi đang được chọn
    const selectedExam = exams.find(e => e._id === selectedExamId);
    const examTitle = selectedExam ? selectedExam.title : 'Bai_Thi';

    const worksheetData = results.map((row, index) => ({
      "STT": index + 1,
      "Họ và tên": row.student?.name || row.student?.fullName || row.student?.email || "Chưa cập nhật",
      "Email": row.student?.email || "Trống",
      "Số câu đúng": row.correctCount,
      "Tổng số câu": row.totalQuestions,
      "Điểm số (Thang 10)": row.score,
      "Thời gian nộp": row.completedAt ? new Date(row.completedAt).toLocaleString('vi-VN') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng Điểm");

    const cleanTitle = examTitle.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `Bang_diem_${cleanTitle}.xlsx`);
  };

  // ==========================================
  // 2. TÍNH NĂNG XUẤT ĐỀ THI RA PDF
  // ==========================================
  const handleExportExamPDF = async () => {
    if (!selectedExamId) return alert("Vui lòng chọn bài thi!");
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/exams/${selectedExamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể lấy dữ liệu đề thi");
      const exam = await res.json();

      const printWindow = window.open('', '_blank');
      
      let questionsHtml = '';
      exam.questions.forEach((q, index) => {
        questionsHtml += `
          <div class="question-block">
            <p class="question-text"><strong>Câu ${index + 1}:</strong> ${q.questionText}</p>
            <div class="options-grid">
              <div>A. ${q.options[0]}</div>
              <div>B. ${q.options[1]}</div>
              <div>C. ${q.options[2]}</div>
              <div>D. ${q.options[3]}</div>
            </div>
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Đề thi: ${exam.title}</title>
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 30px; line-height: 1.6; color: #000; font-size: 14px; }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
              .header-table td { border: none; padding: 0; text-align: center; vertical-align: top; }
              .title-section { text-align: center; margin: 30px 0; }
              .title-section h2 { margin: 0; text-transform: uppercase; font-size: 16px; font-weight: bold; }
              .title-section p { margin: 6px 0 0 0; font-style: italic; }
              .code-box { border: 1px solid #000; padding: 5px 15px; display: inline-block; font-weight: bold; margin-top: 10px; font-size: 15px; }
              .question-block { margin-bottom: 22px; page-break-inside: avoid; }
              .question-text { margin: 0 0 8px 0; text-align: justify; }
              .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-left: 20px; }
              @media print {
                @page { size: A4; margin: 20mm 15mm; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td style="width: 45%; font-weight: bold;">
                  TRƯỜNG ĐẠI HỌC SƯ PHẠM TP.HCM<br>
                  <span style="font-weight: normal; font-style: italic; font-size: 13px;">KHOA CÔNG NGHỆ THÔNG TIN</span>
                </td>
                <td style="width: 55%; font-weight: bold;">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
                  <span style="font-weight: normal; font-style: italic; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</span>
                </td>
              </tr>
            </table>

            <div class="title-section">
              <h2>KỲ THI: ${exam.title.toUpperCase()}</h2>
              <p>Môn kiểm tra: <strong>${exam.subject || 'Trắc nghiệm chung'}</strong> — Khối: ${exam.grade || 'Tự do'}</p>
              <p>Thời gian làm bài: <strong>${exam.durationMinutes || 45} phút</strong> (Không kể thời gian phát đề)</p>
              <div class="code-box">MÃ ĐỀ THI: ${exam._id.toString().substring(18).toUpperCase()}</div>
            </div>

            <div style="border-top: 1px dashed #000; margin-bottom: 25px;"></div>

            <div class="questions-container">
              ${questionsHtml}
            </div>

            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  return (
    <div>
      <TeacherNavbar />
      <div className="teacher-results-container">
        <h2>Lịch sử bài thi</h2>

        {loadingExams ? (
          <p>Đang tải danh sách bài thi...</p>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="form-control" style={{ maxWidth: 420 }}>
              <option value="">-- Chọn bài thi --</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>{ex.title} ({new Date(ex.startTime).toLocaleDateString('vi-VN')})</option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn-refresh" onClick={() => fetchResults(selectedExamId)} disabled={!selectedExamId}>
                Làm mới
              </button>
              
              <button 
                onClick={handleExportExcelScores} 
                disabled={!results.length}
                style={{ backgroundColor: '#27ae60', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: results.length ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
              >
                Xuất Excel Bảng Điểm
              </button>

              <button 
                onClick={handleExportExamPDF} 
                disabled={!selectedExamId}
                style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: selectedExamId ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
              >
                Xuất Đề PDF
              </button>
            </div>
          </div>
        )}

        {loadingResults ? <p>Đang tải kết quả...</p> : (
          <table className="results-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Học sinh</th>
                <th>Điểm</th>
                <th>Số câu đúng</th>
                <th>Tổng câu</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r._id}>
                  <td>{idx + 1}</td>
                  <td>{r.student?.name || r.student?.fullName || r.student?.username || r.student?.email}</td>
                  <td>{r.score}</td>
                  <td>{r.correctCount}</td>
                  <td>{r.totalQuestions}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Không có kết quả.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TeacherExamHistory;