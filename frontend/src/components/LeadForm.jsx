/**
 * Lead capture form with React Hook Form validation,
 * loading states, and toast notifications.
 */

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitLeadAPI } from '../services/api';

const BUDGET_OPTIONS = [
  { value: '< ₹25k', label: '< ₹25k' },
  { value: '₹25k - ₹50k', label: '₹25k - ₹50k' },
  { value: '₹50k - ₹1L', label: '₹50k - ₹1L' },
  { value: '₹1L+', label: '₹1L+' },
];

function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      budget: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitLeadAPI(data);
      toast.success('🎉 Thank you! We\'ll get back to you soon.', {
        duration: 5000,
      });
      reset();
    } catch (error) {
      const message = error.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(message, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg mx-auto space-y-5"
      noValidate
    >
      {/* Name */}
      <div>
        <label htmlFor="lead-name" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
          Full Name <span className="text-danger">*</span>
        </label>
        <input
          id="lead-name"
          type="text"
          placeholder="Enter your full name"
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.name ? 'border-danger' : 'border-border dark:border-border-dark'
          } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 100, message: 'Name must be less than 100 characters' },
          })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="lead-email" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          id="lead-email"
          type="email"
          placeholder="your@email.com"
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.email ? 'border-danger' : 'border-border dark:border-border-dark'
          } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="lead-budget" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
          Budget Range <span className="text-danger">*</span>
        </label>
        <select
          id="lead-budget"
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.budget ? 'border-danger' : 'border-border dark:border-border-dark'
          } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer`}
          {...register('budget', {
            required: 'Please select a budget range',
          })}
        >
          <option value="">Select your budget</option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.budget && (
          <p className="mt-1 text-sm text-danger">{errors.budget.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="lead-message" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
          Your Message <span className="text-danger">*</span>
        </label>
        <textarea
          id="lead-message"
          rows={4}
          placeholder="Tell us about your project or requirements..."
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.message ? 'border-danger' : 'border-border dark:border-border-dark'
          } bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none`}
          {...register('message', {
            required: 'Message is required',
            minLength: { value: 10, message: 'Message must be at least 10 characters' },
            maxLength: { value: 1000, message: 'Message must be less than 1000 characters' },
          })}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-danger">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Inquiry →'
        )}
      </button>
    </form>
  );
}

export default LeadForm;
