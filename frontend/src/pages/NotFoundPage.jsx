/**
 * Custom 404 Page — Shown for unknown routes.
 */

import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="text-8xl sm:text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-3">
          Page Not Found
        </h1>

        <p className="text-text-secondary dark:text-text-dark-secondary mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
          >
            ← Back to Home
          </Link>
          <Link
            to="/admin"
            className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
