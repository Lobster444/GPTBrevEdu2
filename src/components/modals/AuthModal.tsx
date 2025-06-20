import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onToggleMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onToggleMode,
}) => {
  const { isSupabaseReachable, connectionError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
      setIsLoading(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Signup-specific validation
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSupabaseErrorMessage = (error: any) => {
    if (!error) return 'An unexpected error occurred';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('user already registered') || message.includes('user_already_exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('signup is disabled')) {
      return 'Account registration is currently disabled. Please try again later.';
    }
    if (message.includes('password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('email')) {
      return 'Please enter a valid email address.';
    }
    
    return error.message || 'Authentication failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReachable) {
      showToast('Authentication service is currently unavailable. Please try again later.', 'error');
      return;
    }
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (mode === 'signup') {
        console.log('Starting signup process...');
        const { data, error } = await authHelpers.signUp(
          formData.email.trim(),
          formData.password,
          formData.name.trim()
        );

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        console.log('Signup successful:', data);

        if (data.user) {
          showToast('Account created successfully! You are now signed in.', 'success');
          // Close modal after a short delay to show the success message
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        console.log('Starting login process...');
        const { data, error } = await authHelpers.signIn(
          formData.email.trim(),
          formData.password
        );

        if (error) {
          console.error('Login error:', error);
          throw error;
        }

        console.log('Login successful:', data);

        if (data.user) {
          showToast('Welcome back! You have been signed in successfully.', 'success');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Check if it's a "user already exists" error during signup
      const isUserExistsError = error.message?.toLowerCase().includes('user already registered') || 
                               error.message?.toLowerCase().includes('user_already_exists') ||
                               (error.code && error.code === 'user_already_exists');
      
      if (mode === 'signup' && isUserExistsError) {
        // Clear password fields for security
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        // Show informative toast message
        showToast('An account with this email already exists. Switching to sign-in mode.', 'info');
        
        // Automatically switch to login mode
        setTimeout(() => {
          onToggleMode();
        }, 1500);
      } else {
        const errorMessage = getSupabaseErrorMessage(error);
        setErrors({ general: errorMessage });
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormDisabled = !isSupabaseReachable || isLoading;

  return (
    <>
      {/* Modal Portal */}
      <div className="fixed inset-0 z-[9998] overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container - Centered with proper spacing */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          {/* Modal Content */}
          <div className="relative bg-dark-secondary rounded-2xl w-full max-w-md shadow-modal transition-all duration-300 transform scale-100">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 rounded-lg transition-colors bg-black/50 backdrop-blur-sm hover:bg-black/70"
              disabled={isLoading}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6 pr-10">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-base text-gray-text">
                  {mode === 'login' 
                    ? 'Sign in to access your courses and AI chat sessions'
                    : 'Join BrevEdu to start your learning journey'
                  }
                </p>
              </div>

              {/* Connection Error Warning */}
              {!isSupabaseReachable && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Service Unavailable</p>
                    <p className="text-xs mt-1">
                      {connectionError || 'Authentication service is currently unavailable. Please try again later.'}
                    </p>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                  <p className="text-sm">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isFormDisabled}
                        className={`w-full bg-gray-input border-2 ${
                          errors.name ? 'border-red-500' : 'border-transparent focus:border-purple-modal'
                        } rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-placeholder focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`w-full bg-gray-input border-2 ${
                        errors.email ? 'border-red-500' : 'border-transparent focus:border-purple-modal'
                      } rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-placeholder focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`w-full bg-gray-input border-2 ${
                        errors.password ? 'border-red-500' : 'border-transparent focus:border-purple-modal'
                      } rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-placeholder focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormDisabled}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder hover:text-gray-300 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isFormDisabled}
                        className={`w-full bg-gray-input border-2 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-transparent focus:border-purple-modal'
                        } rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-placeholder focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isFormDisabled}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-placeholder hover:text-gray-300 disabled:opacity-50"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isFormDisabled}
                    className="w-full bg-purple-modal hover:bg-purple-modal-hover disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : !isSupabaseReachable ? (
                      'Service Unavailable'
                    ) : (
                      mode === 'login' ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-base text-gray-text">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={onToggleMode}
                    disabled={isFormDisabled}
                    className="text-white font-medium underline hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {mode === 'login' && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-gray-text hover:text-gray-300 text-sm transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default AuthModal;