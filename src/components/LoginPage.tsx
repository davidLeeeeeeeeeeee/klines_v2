import { useState } from 'react';
import { login } from '../services/api';
import { saveUserInfo } from '../utils/storage';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (showForgotPassword) {
      // 处理忘记密码
      alert('重置密码链接已发送到您的邮箱');
      setShowForgotPassword(false);
    } else if (isLogin) {
      // 处理登录 - 调用真实接口
      setIsLoading(true);
      try {
        const response = await login({
          username,
          password,
        });

        // 保存用户信息到localStorage
        saveUserInfo(response);

        // 登录成功，调用回调
        onLogin();
      } catch (err: any) {
        setError(err.message || '登录失败，请检查用户名和密码');
        console.error('登录错误:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 处理注册
      if (password === confirmPassword) {
        // 注册功能暂未实现
        alert('注册功能暂未开放，请联系管理员');
      } else {
        setError('两次密码输入不一致');
      }
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-3">
            {/* ALPHA NOW LOGO - Horizontal Layout */}
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Gradient background circle */}
              <circle cx="30" cy="30" r="28" fill="url(#logoGradient)"/>
              
              {/* Simplified "A" with upward trend arrow */}
              <path 
                d="M30 16L40 44M20 44L30 16" 
                stroke="white" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {/* Crossbar with upward arrow */}
              <path 
                d="M23 32L30 32L37 26M37 26L34 29M37 26L40 29" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              
              <defs>
                <linearGradient id="logoGradient" x1="2" y1="2" x2="58" y2="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Text Part */}
            <div className="flex flex-col items-start">
              <span 
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" 
                style={{ 
                  fontSize: '28px', 
                  fontWeight: 800, 
                  lineHeight: '1.2',
                  letterSpacing: '0.02em',
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
                }}
              >
                ALPHA
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white leading-tight">NOW</span>
            </div>
          </div>
          <p className="text-gray-600">智能策略 · 实时监控 · 精准决策</p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">
              {showForgotPassword ? '重置密码' : isLogin ? '欢迎回来' : '创建账户'}
            </h2>
            {showForgotPassword && (
              <p className="text-gray-600">请输入您的邮箱地址</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!showForgotPassword && (
              <div>
                <label htmlFor="username" className="block text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="请输入用户名"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {(showForgotPassword || !isLogin) && (
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            )}

            {!showForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {!isLogin && !showForgotPassword && (
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            )}

            {isLogin && !showForgotPassword && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 border-2 border-gray-300 rounded bg-transparent checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  />
                  <span className="ml-2 text-gray-700">记住我</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    resetForm();
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  忘记密码？
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </>
              ) : (
                showForgotPassword ? '发送重置链接' : isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? '没有账户？' : '已有账户？'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700"
                >
                  {isLogin ? '立即注册' : '立即登录'}
                </button>
              </p>
            </div>
          )}

          {showForgotPassword && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                返回登录
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 mt-8">
          © 2025 ALPHA NOW. 保留所有权利.
        </p>
      </div>
    </div>
  );
}