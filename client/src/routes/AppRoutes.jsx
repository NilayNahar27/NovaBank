import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import SignupWizard from '../pages/SignupWizard.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Deposit from '../pages/Deposit.jsx'
import Withdraw from '../pages/Withdraw.jsx'
import FastCash from '../pages/FastCash.jsx'
import Balance from '../pages/Balance.jsx'
import MiniStatement from '../pages/MiniStatement.jsx'
import ChangePin from '../pages/ChangePin.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupWizard />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="fast-cash" element={<FastCash />} />
          <Route path="balance" element={<Balance />} />
          <Route path="mini-statement" element={<MiniStatement />} />
          <Route path="change-pin" element={<ChangePin />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
