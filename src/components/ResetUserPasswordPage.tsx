import { useState } from 'react';
import { ChevronLeft, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

interface ResetUserPasswordPageProps {
  user: {
    id: string;
    username: string;
    email: string;
  };
  onBack: () => void;
  onSave: (data: any) => void;
}

export function ResetUserPasswordPage({ user, onBack, onSave }: ResetUserPasswordPageProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: '新密码和确认密码不一致' });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setErrors({ ...errors, newPassword: '密码至少需要6个字符' });
      return;
    }
    
    onSave({ newPassword: formData.newPassword });
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
              <h1 className="text-2xl font-semibold text-gray-900">重置密码</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">用户信息</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm text-gray-500">用户名：</span>
                  <span className="text-gray-900">{user.username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm text-gray-500">邮箱：</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">新密码设置</h2>
              </div>
              
              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    新密码 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        setErrors({ ...errors, newPassword: '' });
                      }}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="请输入新密码（至少6个字符）"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    确认新密码 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        setErrors({ ...errors, confirmPassword: '' });
                      }}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="请再次输入新密码"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">密码要求</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>至少6个字符</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>建议包含大小写字母、数字和特殊字符</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>不要使用与个人信息相关的密码</span>
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
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
              重置密码
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}