const API_BASE = '/api/notifications';

export const notificationsAPI = {
  // Get all notifications
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.unread_only) queryParams.append('unread_only', 'true');
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to fetch notifications' }));
      throw new Error(error.error || error.message || 'Failed to fetch notifications');
    }

    return res.json();
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to mark notification as read' }));
      throw new Error(error.error || error.message || 'Failed to mark notification as read');
    }

    return res.json();
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all_read: true }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to mark all notifications as read' }));
      throw new Error(error.error || error.message || 'Failed to mark all notifications as read');
    }

    return res.json();
  },
};

