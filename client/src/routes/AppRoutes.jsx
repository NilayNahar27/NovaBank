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
import Accounts from '../pages/Accounts.jsx'
import Transfer from '../pages/Transfer.jsx'
import Beneficiaries from '../pages/Beneficiaries.jsx'
import Transactions from '../pages/Transactions.jsx'
import Statement from '../pages/Statement.jsx'
import Cards from '../pages/Cards.jsx'
import Profile from '../pages/Profile.jsx'
import Security from '../pages/Security.jsx'
import TransferReceipt from '../pages/TransferReceipt.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupWizard />} />

      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/fast-cash" element={<FastCash />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/mini-statement" element={<Navigate to="/statement" replace />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/change-pin" element={<ChangePin />} />
          <Route path="/transfers/:id/receipt" element={<TransferReceipt />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
