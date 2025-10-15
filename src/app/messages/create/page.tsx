'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Recipient {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

export default function CreateMessagePage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text',
    message_text: '',
    image_url: '',
    video_url: '',
    financial_info: {
      type: '',
      account: '',
      notes: ''
    },
    document_url: '',
    scheduled_date: '',
    reminder_days: 30,
    priority: 'normal',
    is_private: false,
    requires_confirmation: false,
    selected_recipients: [] as string[]
  });

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
        .eq('user_id', user.id);

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare message data
      const messageData: any = {
        user_id: user.id,
        title: formData.title,
        content_type: formData.content_type,
        scheduled_date: formData.scheduled_date,
        reminder_days: formData.reminder_days,
        priority: formData.priority,
        is_private: formData.is_private,
        requires_confirmation: formData.requires_confirmation,
        status: 'scheduled'
      };

      // Add content based on type
      switch (formData.content_type) {
        case 'text':
          messageData.message_text = formData.message_text;
          break;
        case 'image':
          messageData.image_url = formData.image_url;
          messageData.message_text = formData.message_text;
          break;
        case 'video':
          messageData.video_url = formData.video_url;
          messageData.message_text = formData.message_text;
          break;
        case 'financial':
          messageData.financial_info = formData.financial_info;
          break;
        case 'document':
          messageData.document_url = formData.document_url;
          messageData.message_text = formData.message_text;
          break;
      }

      // Create message
      const { data: message, error: messageError } = await supabase
        .from('legacy_messages')
        .insert([messageData])
        .select()
        .single();

      if (messageError) throw messageError;

      // Add recipients
      if (formData.selected_recipients.length > 0) {
        const recipientData = formData.selected_recipients.map(recipientId => ({
          message_id: message.id,
          recipient_id: recipientId
        }));

        const { error: recipientError } = await supabase
          .from('message_recipients')
          .insert(recipientData);

        if (recipientError) throw recipientError;
      }

      alert('✅ Tin nhắn đã được tạo thành công!');
      router.push('/messages');
    } catch (error) {
      console.error('Error creating message:', error);
      alert('❌ Lỗi khi tạo tin nhắn: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề tin nhắn *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Thư gửi con gái yêu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại nội dung *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: 'text', icon: '📝', label: 'Văn bản' },
                  { value: 'image', icon: '🖼️', label: 'Hình ảnh' },
                  { value: 'video', icon: '🎥', label: 'Video' },
                  { value: 'financial', icon: '💰', label: 'Tài chính' },
                  { value: 'document', icon: '📄', label: 'Tài liệu' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, content_type: type.value })}
                    className={`p-4 rounded-lg border-2 transition ${
                      formData.content_type === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">⚪ Thấp</option>
                <option value="normal">🔵 Bình thường</option>
                <option value="high">🟠 Cao</option>
                <option value="urgent">🔴 Khẩn cấp</option>
              </select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">🔒 Riêng tư</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_confirmation}
                  onChange={(e) => setFormData({ ...formData, requires_confirmation: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">✅ Yêu cầu xác nhận</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Nội dung tin nhắn</h2>

            {formData.content_type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung *
                </label>
                <textarea
                  required
                  value={formData.message_text}
                  onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Viết tin nhắn của bạn..."
                />
              </div>
            )}

            {formData.content_type === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL hình ảnh *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={formData.message_text}
                    onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về hình ảnh..."
                  />
                </div>
              </>
            )}

            {formData.content_type === 'video' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL video YouTube *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={formData.message_text}
                    onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về video..."
                  />
                </div>
              </>
            )}

            {formData.content_type === 'financial' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tài khoản *
                  </label>
                  <select
                    required
                    value={formData.financial_info.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      financial_info: { ...formData.financial_info, type: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại tài khoản</option>
                    <option value="bank">Ngân hàng</option>
                    <option value="investment">Đầu tư</option>
                    <option value="insurance">Bảo hiểm</option>
                    <option value="crypto">Tiền điện tử</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tài khoản / Thông tin *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.financial_info.account}
                    onChange={(e) => setFormData({
                      ...formData,
                      financial_info: { ...formData.financial_info, account: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập thông tin tài khoản"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.financial_info.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      financial_info: { ...formData.financial_info, notes: e.target.value }
                    })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú thêm..."
                  />
                </div>
              </div>
            )}

            {formData.content_type === 'document' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL tài liệu *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.document_url}
                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={formData.message_text}
                    onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về tài liệu..."
                  />
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Lên lịch gửi</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày gửi *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Tin nhắn sẽ được tự động gửi vào thời điểm này
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhắc nhở trước (ngày)
              </label>
              <input
                type="number"
                value={formData.reminder_days}
                onChange={(e) => setFormData({ ...formData, reminder_days: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="365"
              />
              <p className="mt-2 text-sm text-gray-500">
                Bạn sẽ nhận được email nhắc nhở {formData.reminder_days} ngày trước ngày gửi
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Chọn người nhận</h2>

            {recipients.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 mb-4">
                  Bạn chưa có người nhận nào. Hãy tạo người nhận trước!
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/recipients/create')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Tạo người nhận
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {recipients.map((recipient) => (
                  <label
                    key={recipient.id}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selected_recipients.includes(recipient.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selected_recipients: [...formData.selected_recipients, recipient.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selected_recipients: formData.selected_recipients.filter(id => id !== recipient.id)
                          });
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.email}</div>
                      <div className="text-sm text-gray-500">{recipient.relationship}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo tin nhắn di sản mới 💌
          </h1>
          <p className="text-gray-600">
            Tạo tin nhắn, hình ảnh, hoặc thông tin quan trọng để gửi trong tương lai
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Thông tin' },
              { num: 2, label: 'Nội dung' },
              { num: 3, label: 'Lịch gửi' },
              { num: 4, label: 'Người nhận' }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.num}
                  </div>
                  <div className="text-xs mt-2 font-medium text-gray-600">
                    {s.label}
                  </div>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
                >
                  ← Quay lại
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/messages')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
              >
                Hủy
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : '✓ Hoàn thành'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
