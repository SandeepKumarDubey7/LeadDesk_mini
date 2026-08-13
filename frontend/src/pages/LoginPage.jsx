/**
 * Login Page — Admin authentication form.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icon.jpg" alt="LeadDesk Logo" className="w-16 h-16 mx-auto rounded-2xl object-cover mb-4 shadow-lg" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Welcome Back
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-8 border border-border dark:border-border-dark shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@leaddesk.com"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? 'border-danger' : 'border-border dark:border-border-dark'
                } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.password ? 'border-danger' : 'border-border dark:border-border-dark'
                } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test Credentials Hint */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Test Credentials</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Email: <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">admin@leaddesk.com</code>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Password: <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Admin@123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary dark:text-text-dark-secondary mt-6">
          Built for{' '}
          <span className="text-primary font-medium">
            GALLANTT ISPAT LIMITED
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
