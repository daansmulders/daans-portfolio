import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Navigation } from './components/Navigation'
import { OfflineIndicator } from './components/OfflineIndicator'
import { LoginScreen } from './features/auth/LoginScreen'

// Patient schermen
import { PatientDashboard } from './features/patient/dashboard/PatientDashboard'
import { LogEntryForm } from './features/patient/dashboard/LogEntryForm'
import { MedicationScreen } from './features/patient/medication/MedicationScreen'
import { ConcernScreen } from './features/patient/concerns/ConcernScreen'
import { ContentScreen } from './features/patient/content/ContentScreen'

// Dokter schermen
import { DoctorOverview } from './features/doctor/overview/DoctorOverview'
import { PatientProfile } from './features/doctor/patient/PatientProfile'
import { ScheduleEditor } from './features/doctor/schedule/ScheduleEditor'
import { AppointmentForm } from './features/doctor/appointments/AppointmentForm'

import './index.css'

function AppRoutes() {
  const { role, loading } = useAuth()

  if (loading) return null

  return (
    <>
      <OfflineIndicator />
      {role && <Navigation />}
      <Routes>
        {/* Publiek */}
        <Route path="/" element={<LoginScreen />} />

        {/* Patiënt */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/log" element={
          <ProtectedRoute requiredRole="patient"><LogEntryForm /></ProtectedRoute>
        } />
        <Route path="/patient/medicatie" element={
          <ProtectedRoute requiredRole="patient"><MedicationScreen /></ProtectedRoute>
        } />
        <Route path="/patient/meldingen" element={
          <ProtectedRoute requiredRole="patient"><ConcernScreen /></ProtectedRoute>
        } />
        <Route path="/patient/inhoud" element={
          <ProtectedRoute requiredRole="patient"><ContentScreen /></ProtectedRoute>
        } />

        {/* Dokter */}
        <Route path="/dokter/overzicht" element={
          <ProtectedRoute requiredRole="doctor"><DoctorOverview /></ProtectedRoute>
        } />
        <Route path="/dokter/patient/:id" element={
          <ProtectedRoute requiredRole="doctor"><PatientProfile /></ProtectedRoute>
        } />
        <Route path="/dokter/patient/:id/schema" element={
          <ProtectedRoute requiredRole="doctor"><ScheduleEditor /></ProtectedRoute>
        } />
        <Route path="/dokter/patient/:id/afspraak" element={
          <ProtectedRoute requiredRole="doctor"><AppointmentForm /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
