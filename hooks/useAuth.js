/**
 * useAuth Hook
 * Manages authentication state and session data
 */

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await authAPI.getSession();
        
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching session:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const userInitials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const userName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : '';

  const userEmail = user?.email || '';

  return {
    user,
    loading,
    error,
    userInitials,
    userName,
    userEmail,
  };
}

