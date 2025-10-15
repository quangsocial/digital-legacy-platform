'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  notes: string;
  created_at: string;
}

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    loadRecipients();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadRecipients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa người nhận này?')) return;

    try {
      const { error } = await supabase
        .from('recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('✅ Đã xóa người nhận');
      loadRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
      alert('❌ Lỗi khi xóa người nhận');
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    const icons: Record<string, string> = {
      spouse: '💑',
      child: '👶',
      parent: '👪',
      sibling: '👫',
      friend: '👥',
      lawyer: '⚖️',
      accountant: '💼',
      other: '👤'
    };
    return icons[relationship] || '👤';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Người nhận 👥
              </h1>
              <p className="mt-2 text-gray-600">
                Quản lý danh sách người nhận tin nhắn di sản
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
              >
                ← Dashboard
              </Link>
              <Link
                href="/recipients/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                + Thêm người nhận
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recipients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có người nhận nào
            </h3>
            <p className="text-gray-600 mb-6">
              Thêm người nhận để có thể gửi tin nhắn di sản
            </p>
            <Link
              href="/recipients/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Thêm người nhận đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">
                      {getRelationshipIcon(recipient.relationship)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recipient.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {recipient.relationship}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>{recipient.email}</span>
                  </div>
                  {recipient.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📱</span>
                      <span>{recipient.phone}</span>
                    </div>
                  )}
                  {recipient.notes && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Ghi chú:</span> {recipient.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/recipients/${recipient.id}`}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg text-center transition text-sm"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(recipient.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
