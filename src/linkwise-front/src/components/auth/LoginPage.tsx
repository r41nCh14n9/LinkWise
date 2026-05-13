import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // 前端無驗證邏輯 - 由後端驗證 token
    const success = await login(email, password);
    if (!success) {
      setLocalError('Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLocalError(null);
    const success = await login(demoEmail, demoPassword);
    if (!success) {
      setLocalError('Demo login failed');
    } else {
      setEmail(demoEmail);
      setPassword(demoPassword);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-center mb-2">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">LinkWise RBAC</h1>
            <p className="text-blue-100 text-center text-sm mt-1">Account & Permission Management</p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            {/* Error Message */}
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error || localError}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@linkwise.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts Section */}
            <div className="mt-8 border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Demo Accounts (for testing):</p>
              <div className="space-y-2">
                {/* Admin Demo */}
                <button
                  onClick={() => handleDemoLogin('admin@linkwise.com', 'AdminPass@2024')}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 rounded-lg border border-blue-200 hover:border-blue-400 transition"
                >
                  <div className="font-medium text-blue-900">👤 Admin Account</div>
                  <div className="text-xs text-blue-700 mt-1">admin@linkwise.com</div>
                  <div className="text-xs text-blue-600">All permissions</div>
                </button>

                {/* Approver Demo */}
                <button
                  onClick={() => handleDemoLogin('approver@linkwise.com', 'AdminPass@2024')}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 disabled:bg-gray-100 rounded-lg border border-orange-200 hover:border-orange-400 transition"
                >
                  <div className="font-medium text-orange-900">✓ Approver Account</div>
                  <div className="text-xs text-orange-700 mt-1">approver@linkwise.com</div>
                  <div className="text-xs text-orange-600">PR approval permissions</div>
                </button>

                {/* Buyer Demo */}
                <button
                  onClick={() => handleDemoLogin('buyer@linkwise.com', 'AdminPass@2024')}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 rounded-lg border border-green-200 hover:border-green-400 transition"
                >
                  <div className="font-medium text-green-900">🛒 Buyer Account</div>
                  <div className="text-xs text-green-700 mt-1">buyer@linkwise.com</div>
                  <div className="text-xs text-green-600">Vendor & PR management</div>
                </button>

                {/* Requester Demo */}
                <button
                  onClick={() => handleDemoLogin('requester@linkwise.com', 'AdminPass@2024')}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 rounded-lg border border-purple-200 hover:border-purple-400 transition"
                >
                  <div className="font-medium text-purple-900">📝 Requester Account</div>
                  <div className="text-xs text-purple-700 mt-1">requester@linkwise.com</div>
                  <div className="text-xs text-purple-600">Basic PR creation</div>
                </button>
              </div>
            </div>

            {/* Info Message */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <span className="font-medium">For Development:</span> All demo accounts use password <code className="bg-blue-100 px-1 rounded">AdminPass@2024</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-blue-100">
          <p className="text-xs">FR-R Account & Permission Management System</p>
          <p className="text-xs mt-1">© 2024 LinkWise. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};
