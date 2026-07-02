import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../../../core/store/authStore.js';
import { toast } from 'sonner';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      setAuth(user);
      queryClient.setQueryData(['auth', 'me'], user);
      navigate('/dashboard');
      toast.success(`Welcome back, ${user.name}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'Login failed');
    },
  });
}

export function useSignup() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (user) => {
      setAuth(user);
      navigate('/dashboard');
      toast.success('Account created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'Signup failed');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // Force logout even if API call fails
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Check your email for a reset link');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? 'Something went wrong',
      );
    },
  });
}
