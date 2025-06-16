import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
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
    if (message.includes('invalid login credentials')) {
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
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (mode === 'signup') {
        const { data, error } = await authHelpers.signUp(
          formData.email.trim(),
          formData.password,
          formData.name.trim()
        );

        if (error) {
          throw error;
        }

        if (data.user) {
          showToast('Account created successfully! Please check your email to verify your account.', 'success');
          // Close modal after a short delay to show the success message
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        const { data, error } = await authHelpers.signIn(
          formData.email.trim(),
          formData.password
        );

        if (error) {
          throw error;
        }

        if (data.user) {
          showToast('Welcome back! You have been signed in successfully.', 'success');
          onClose();
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
        }, 1000);
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

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative bg-dark-secondary rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-tertiary">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                {mode === 'login' 
                  ? 'Sign in to access your courses and AI chat sessions'
                  : 'Join BrevEdu to start your learning journey'
                }
              </p>

              {errors.general && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                  <p>{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full bg-dark-tertiary border ${
                          errors.name ? 'border-red-500' : 'border-dark-accent'
                        } rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full bg-dark-tertiary border ${
                        errors.email ? 'border-red-500' : 'border-dark-accent'
                      } rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full bg-dark-tertiary border ${
                        errors.password ? 'border-red-500' : 'border-dark-accent'
                      } rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full bg-dark-tertiary border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-dark-accent'
                        } rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-primary hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={onToggleMode}
                    disabled={isLoading}
                    className="text-purple-primary hover:text-purple-light font-medium transition-colors disabled:opacity-50"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {mode === 'login' && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors disabled:opacity-50"
                    disabled={isLoading}
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