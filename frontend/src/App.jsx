import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Features from './pages/Features';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentOverview from './pages/Student/StudentOverview';
import StudentNavbar from './components/StudentNavbar';
import TeacherOverview from './pages/Teacher/TeacherOverview';
import TeacherNavbar from './components/TeacherNavbar';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateUser from './pages/Admin/CreateUser';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminExams from './pages/Admin/AdminExams';
import AdminExamResults from './pages/Admin/AdminExamResults';
import AuditLog from './pages/Admin/AuditLog';
import AdminQuestionBank from './pages/Admin/AdminQuestionBank';
import AdminCreateQuestion from './pages/Admin/AdminCreateQuestion';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherCreateSelection from './pages/Teacher/TeacherCreateSelection';
import CreateQuestion from './pages/Teacher/CreateQuestion';
import CreateExamFromBank from './pages/Teacher/CreateExamFromBank';
import ImportQuestions from './pages/Teacher/ImportQuestions';
import TeacherOrganizeSelection from './pages/Teacher/TeacherOrganizeSelection';
import TeacherExamHistory from './pages/Teacher/TeacherExamHistory';
import StudentExams from './pages/Student/StudentExams';
import ExamInstruction from './pages/Student/ExamInstruction';
import TakeExam from './pages/Student/TakeExam';
import StudentHistory from './pages/Student/StudentHistory';
import ReviewExam from './pages/Student/ReviewExam';
import ProfileEdit from './pages/ProfileEdit';
import ManageClasses from './pages/Teacher/ManageClasses';
import ClassDetail from './pages/Teacher/ClassDetail';

import './App.css';

const StudentPlaceholder = ({ title }) => (
  <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
    <StudentNavbar />
    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
      <h2>{title}</h2>
      <p>Tính năng đang phát triển.</p>
    </div>
  </div>
);

const TeacherPlaceholder = ({ title }) => (
  <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
    <TeacherNavbar />
    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
      <h2>{title}</h2>
      <p>Tính năng đang phát triển.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/features" element={<><Navbar /><Features /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />

        <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentOverview /></ProtectedRoute>} />
        <Route path="/student/join" element={<ProtectedRoute allowedRole="student"><StudentExams /></ProtectedRoute>} />
        <Route path="/student/history" element={<ProtectedRoute allowedRole="student"><StudentHistory /></ProtectedRoute>} />
        
        {/* ĐÃ SỬA: Khớp với navigate('/student/exam-detail/...') */}
        <Route path="/student/exam-detail/:id" element={<ProtectedRoute allowedRole="student"><ExamInstruction /></ProtectedRoute>} />
        
        {/* Route dự phòng cho trang làm bài */}
        <Route path="/student/take-exam/:id" element={<ProtectedRoute allowedRole="student"><TakeExam /></ProtectedRoute>} />
        <Route path="/student/review/:id" element={<ProtectedRoute allowedRole="student"><ReviewExam /></ProtectedRoute>} />

        <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherOverview /></ProtectedRoute>} />
        <Route path="/teacher/organize" element={<ProtectedRoute allowedRole="teacher"><TeacherOrganizeSelection /></ProtectedRoute>} />
        <Route path="/teacher/organize/bank" element={<ProtectedRoute allowedRole="teacher"><CreateExamFromBank /></ProtectedRoute>} />
        <Route path="/teacher/import" element={<ProtectedRoute allowedRole="teacher"><ImportQuestions /></ProtectedRoute>} />
        <Route path="/teacher/create" element={<ProtectedRoute allowedRole="teacher"><TeacherCreateSelection /></ProtectedRoute>} />
        <Route path="/teacher/create-question" element={<ProtectedRoute allowedRole="teacher"><CreateQuestion /></ProtectedRoute>} />
        <Route path="/teacher/create-exam" element={<ProtectedRoute allowedRole="teacher"><TeacherPlaceholder title="Tạo Bài Thi" /></ProtectedRoute>} />
        <Route path="/teacher/history" element={<ProtectedRoute allowedRole="teacher"><TeacherExamHistory /></ProtectedRoute>} />
        <Route path="/teacher/profile-edit" element={<ProtectedRoute allowedRole="teacher"><ProfileEdit /></ProtectedRoute>} />
        
        {/* TÍNH NĂNG MỚI: Route dẫn đến trang Quản lý Lớp học */}
        <Route path="/teacher/classes" element={<ProtectedRoute allowedRole="teacher"><ManageClasses /></ProtectedRoute>} />
        <Route path="/teacher/class/:id" element={<ProtectedRoute allowedRole="teacher"><ClassDetail /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/student/profile-edit" element={<ProtectedRoute allowedRole="student"><ProfileEdit /></ProtectedRoute>} />
        <Route path="/admin/create-user" element={<ProtectedRoute allowedRole="admin"><CreateUser /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute allowedRole="admin"><AdminExams /></ProtectedRoute>} />
        <Route path="/admin/exams/:id/results" element={<ProtectedRoute allowedRole="admin"><AdminExamResults /></ProtectedRoute>} />
        <Route path="/admin/audit-log" element={<ProtectedRoute allowedRole="admin"><AuditLog /></ProtectedRoute>} />
        <Route path="/admin/question-bank" element={<ProtectedRoute allowedRole="admin"><AdminQuestionBank /></ProtectedRoute>} />
        <Route path="/admin/create-question" element={<ProtectedRoute allowedRole="admin"><AdminCreateQuestion /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;