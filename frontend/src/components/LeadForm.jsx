/**
 * Lead capture form with React Hook Form validation,
 * file upload (drag-and-drop), loading states, and toast notifications.
 */

import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { submitLeadAPI } from '../services/api';

const BUDGET_OPTIONS = [
  { value: '< ₹25k', label: '< ₹25k' },
  { value: '₹25k - ₹50k', label: '₹25k - ₹50k' },
  { value: '₹50k - ₹1L', label: '₹50k - ₹1L' },
  { value: '₹1L+', label: '₹1L+' },
];

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const validateFile = (file) => {
    if (!file) return true;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`File type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large. Maximum size is 5MB.');
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'png': case 'jpg': case 'jpeg': return '🖼️';
      case 'doc': case 'docx': return '📝';
      default: return '📎';
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('budget', data.budget);
      formData.append('message', data.message);

      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      await submitLeadAPI(formData);
      toast.success('🎉 Thank you! We\'ll get back to you soon.', {
        duration: 5000,
      });
      reset();
      removeFile();
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

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
          Attachment <span className="text-text-secondary dark:text-text-dark-secondary font-normal">(optional)</span>
        </label>

        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
              isDragging
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : fileError
                  ? 'border-danger bg-red-50 dark:bg-red-900/10'
                  : 'border-border dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                PDF, PNG, JPG, DOC, DOCX (max 5MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
            />
          </div>
        ) : (
          <div className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{getFileIcon(selectedFile.name)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-danger transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {fileError && (
          <p className="mt-1 text-sm text-danger">{fileError}</p>
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
