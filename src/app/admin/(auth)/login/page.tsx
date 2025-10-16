"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AdminLoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Bạn không có quyền truy cập trang Admin');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('Email hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();
      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Không thể xác thực tài khoản');
        setLoading(false);
        return;
      }
      if (!['admin', 'super_admin'].includes(profile.role)) {
        await supabase.auth.signOut();
        setError('Bạn không có quyền truy cập trang Admin');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError('Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xs mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập Admin</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input className="input w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Mật khẩu</label>
          <input className="input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Chỉ dành cho Admin và Super Admin</p>
      </div>
      <div className="text-center mt-6">
        <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">← Về trang chủ</a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginPageContent />
    </Suspense>
  );
}
