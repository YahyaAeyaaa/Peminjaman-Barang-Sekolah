import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Nama depan wajib diisi')
    .min(2, 'Nama depan minimal 2 karakter'),
  
  last_name: z
    .string()
    .min(1, 'Nama belakang wajib diisi')
    .min(2, 'Nama belakang minimal 2 karakter'),
  
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
  
  confirm_password: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
});

