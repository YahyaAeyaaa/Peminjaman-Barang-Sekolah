import { prisma } from './prisma';

/**
 * Helper function untuk logging aktivitas user
 * @param {Object} params
 * @param {string} params.userId - ID user yang melakukan aksi
 * @param {string} params.action - Aksi yang dilakukan (CREATE, UPDATE, DELETE, LOGIN, APPROVE, REJECT, CONFIRM, dll)
 * @param {string} params.tableName - Nama tabel yang diubah (users, equipment, loans, returns, dll)
 * @param {string} params.recordId - ID record yang diubah
 * @param {Object} params.oldData - Data sebelum perubahan (optional)
 * @param {Object} params.newData - Data setelah perubahan (optional)
 * @param {string} params.ipAddress - IP address (optional)
 * @param {string} params.userAgent - User agent (optional)
 */
export async function logActivity({
  userId,
  action,
  tableName,
  recordId,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  } catch (error) {
    // Jangan throw error, karena logging tidak boleh mengganggu operasi utama
    console.error('Error logging activity:', error);
  }
}

/**
 * Helper untuk mendapatkan IP address dari request
 */
export function getIpAddress(request) {
  if (!request) return null;
  
  // Check headers untuk IP (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  
  return null;
}

/**
 * Helper untuk mendapatkan user agent dari request
 */
export function getUserAgent(request) {
  if (!request) return null;
  return request.headers.get('user-agent') || null;
}


