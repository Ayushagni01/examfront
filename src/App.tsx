import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import ExploreExams from './pages/ExploreExams'
import TestSeriesPage from './pages/TestSeriesPage'
import CurrentAffairsPage from './pages/CurrentAffairsPage'
import NewsPage from './pages/NewsPage'
import LoginPage from './pages/LoginPage'
import TestDetailPage from './pages/TestDetailPage'
import TestInterface from './pages/TestInterface'
import TestResultPage from './pages/TestResultPage'
import ExamDetailPage from './pages/ExamDetailPage'

// Admin Panel Components
import AdminRoute from './components/AdminRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCategories from './pages/admin/ManageCategories'
import ManageExams from './pages/admin/ManageExams'
import ManageTestSeries from './pages/admin/ManageTestSeries'
import ManageQuestions from './pages/admin/ManageQuestions'
import ManageCurrentAffairs from './pages/admin/ManageCurrentAffairs'
import ManageNews from './pages/admin/ManageNews'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="exams" element={<ExploreExams />} />
          <Route path="exams/:slug" element={<ExamDetailPage />} />
          <Route path="test-series" element={<TestSeriesPage />} />
          <Route path="test-series/:id" element={<TestDetailPage />} />
          <Route path="current-affairs" element={<CurrentAffairsPage />} />
          <Route path="news" element={<NewsPage />} />
        </Route>

        {/* Full-screen pages (no navbar/footer) */}
        <Route path="/dashboard" element={<LoginPage />} />
        <Route path="/test/:testSeriesId/attempt/:attemptId" element={<TestInterface />} />
        <Route path="/test-result/:attemptId" element={<TestResultPage />} />

        {/* Admin Panel Panel Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="test-series" element={<ManageTestSeries />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="current-affairs" element={<ManageCurrentAffairs />} />
          <Route path="news" element={<ManageNews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

