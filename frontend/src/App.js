import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardOverview from './components/DashboardOverview';
import LanguagePractice from './components/LanguagePractice';
import LanguageTopics from './components/LanguageTopics';
import TopicQuestions from './components/TopicQuestions';
import QuestionDetail from './components/QuestionDetail';
import Landing from './pages/Landing';
import NotesList from './components/NotesList';
import NotesViewer from './components/NotesViewer';
import ContentManagerLayout from './components/ContentManagerLayout'; // Import Layout

import TrainingExamList from './pages/TrainingExamList';
import TrainingExamIntro from './pages/TrainingExamIntro';
import TrainingExamSession from './pages/TrainingExamSession';
import TrainingExamSummary from './pages/TrainingExamSummary';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import PlacementPreparation from './pages/PlacementPreparation';
import CompanyPractice from './pages/CompanyPractice';
import CompanyDetail from './pages/CompanyDetail';
import CompanyRound from './pages/CompanyRound';
import ContentManagerLogin from './pages/ContentManagerLogin';
import ContentManagerDashboard from './pages/ContentManagerDashboard';
import ManageLanguages from './pages/ManageLanguages';
import ManageSubtopics from './pages/ManageSubtopics';
import Unauthorized from './pages/Unauthorized';
import SuspendedPage from './pages/SuspendedPage';
import { TransitionProvider } from './context/TransitionContext';
import PageTransition from './components/PageTransition';
import AIAssistant from './components/AIAssistant';
import RecentlySolved from './components/RecentlySolved';
import PageTitleUpdater from './components/PageTitleUpdater';
import './App.css';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard
import ExamInspectionPage from './pages/ExamInspectionPage';
import AdminPlacementPrepMonitor from './pages/AdminPlacementPrepMonitor';

const ManageTopics = React.lazy(() => import('./pages/ManageTopics'));
const QuestionBank = React.lazy(() => import('./pages/QuestionBank'));
const QuestionEditor = React.lazy(() => import('./pages/QuestionEditor'));
const ExamList = React.lazy(() => import('./pages/ExamList'));
const ExamEditor = React.lazy(() => import('./pages/ExamEditor'));
const TrainingExamEditor = React.lazy(() => import('./pages/TrainingExamEditor'));
const ManageNotes = React.lazy(() => import('./pages/ManageNotes'));
const ContentManagerReportIssue = React.lazy(() => import('./pages/ContentManagerReportIssue'));
const PlacementPrepManager = React.lazy(() => import('./pages/PlacementPrepManager'));
const PrepCompaniesList = React.lazy(() => import('./pages/PrepCompaniesList'));
const PrepCompanyModules = React.lazy(() => import('./pages/PrepCompanyModules'));
const PrepQuestionsList = React.lazy(() => import('./pages/PrepQuestionsList'));
const PlacementPrepActivity = React.lazy(() => import('./pages/PlacementPrepActivity'));

// Setup Axios Interceptor for Handling 403 Suspended
axios.interceptors.response.use(
  respons => respons,
  error => {
    if (error.response && error.response.status === 403 && error.response.data.message === 'Account suspended') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/suspended';
    }
    return Promise.reject(error);
  }
);

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect based on their actua role to prevent infinite loops if they try to access unauthorized page
    if (user.role === 'content_manager') return <Navigate to="/content-dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};


// Wrapper to allow using useNavigate in TransitionProvider
const AppRoutes = () => {
  return (
    <TransitionProvider>
      <PageTitleUpdater />
      <PageTransition />
      <AIAssistant />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/content-login" element={<ContentManagerLogin />} />

        <Route
          path="/placement-preparation"
          element={
            <RoleProtectedRoute allowedRoles={['student', 'admin']}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<PlacementPreparation />} />
          <Route path="company-practice" element={<CompanyPractice />} />
          <Route path="company-practice/:companyId" element={<CompanyDetail />} />
          <Route path="company-practice/:companyId/:roundId" element={<CompanyRound />} />
        </Route>

        <Route
          path="/admin-dashboard/exams/:examId/inspect"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ExamInspectionPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/:tab?"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/:tab/:id"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/content-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['content_manager', 'admin']}>
              <ContentManagerLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<ContentManagerDashboard />} />
          <Route path="languages" element={<ManageLanguages />} />
          <Route path="languages/:languageId/topics" element={<ManageTopics />} />
          <Route path="topics/:topicId/subtopics" element={<ManageSubtopics />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="questions/create" element={<QuestionEditor />} />
          <Route path="questions/edit/:id" element={<QuestionEditor />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/create" element={<ExamEditor />} />
          <Route path="exams/edit/:id" element={<ExamEditor />} />
          {/* Training Exam Routes */}
          <Route path="training-exam/new" element={<TrainingExamEditor />} />
          <Route path="training-exam/:id/edit" element={<TrainingExamEditor />} />
          <Route path="notes" element={<ManageNotes />} />
          <Route path="report-issue" element={<ContentManagerReportIssue />} />

          {/* Placement Prep Manager Routes */}
          <Route path="placement-prep">
            <Route index element={<PlacementPrepManager />} />
            <Route path="activity" element={<PlacementPrepActivity />} />
            <Route path="companies" element={<PrepCompaniesList />} />
            <Route path="companies/:companyId" element={<PrepCompanyModules />} />
            <Route path="companies/:companyId/modules/:moduleId" element={<PrepQuestionsList />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['student', 'admin']}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="language-practice" element={<LanguagePractice />} />
          <Route path="language-practice/:language" element={<LanguageTopics />} />
          <Route path="language-practice/:language/:topicSlug" element={<TopicQuestions />} />
          <Route path="language-practice/:language/:topicSlug/subtopic/:subtopicId" element={<TopicQuestions />} />
          <Route path="notes" element={<NotesList />} />
          <Route path="notes/:noteId" element={<NotesViewer />} />
          {/* Question routes moved to dedicated workspace below */}
          <Route path="recently-solved" element={<RecentlySolved />} />
          <Route path="recently-solved" element={<RecentlySolved />} />

        </Route>

        <Route path="/suspended" element={<SuspendedPage />} />

        {/* Dedicated Workspace Routes (Full Screen) */}
        <Route
          path="/practice/:language/:topicSlug/questions/:questionId"
          element={
            <ProtectedRoute>
              <QuestionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:language/:topicSlug/subtopic/:subtopicId/questions/:questionId"
          element={
            <ProtectedRoute>
              <QuestionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:language/:topicSlug/subtopic/:subtopicId/questions/:questionId"
          element={
            <ProtectedRoute>
              <QuestionDetail />
            </ProtectedRoute>
          }
        />
        {/* Training Exams Module */}
        <Route
          path="/training-exams"
          element={
            <ProtectedRoute>
              <TrainingExamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-exams/:id/intro"
          element={
            <ProtectedRoute>
              <TrainingExamIntro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-exams/:id/session"
          element={
            <ProtectedRoute>
              <TrainingExamSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-exams/:id/summary"
          element={
            <ProtectedRoute>
              <TrainingExamSummary />
            </ProtectedRoute>
          }
        />
      </Routes>
    </TransitionProvider>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AppRoutes />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
