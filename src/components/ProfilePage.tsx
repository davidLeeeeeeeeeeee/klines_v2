import { useState } from 'react';
import { ChevronLeft, User, Edit, UserCircle } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  userData?: {
    username: string;
    email: string;
    phone: string;
    role: string;
    bio: string;
  };
  onSave?: (data: any) => void;
}

export function ProfilePage({ onBack, userData, onSave }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    username: userData?.username || '张三',
    email: userData?.email || 'user@example.com',
    phone: userData?.phone || '13800138000',
    role: userData?.role || '管理员',
    bio: userData?.bio || '专注于量化交易策略研发和优化'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    } else {
      alert('个人资料已更新');
    }
    onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">个人资料</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">基本信息</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    用户名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    手机号码
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    角色
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={(e) => {
                const form = document.querySelector('form');
                if (form && form.checkValidity()) {
                  handleSubmit(e as any);
                } else {
                  form?.reportValidity();
                }
              }}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}