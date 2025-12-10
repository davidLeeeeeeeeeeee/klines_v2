import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { isLoggedIn as checkIsLoggedIn, clearUserInfo, getToken } from './utils/storage';
import { logout } from './services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 组件挂载时检查登录状态
  useEffect(() => {
    const loggedIn = checkIsLoggedIn();
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        // 调用登出接口
        await logout(token);
      }
    } catch (error) {
      console.error('登出接口调用失败:', error);
      // 即使接口失败，也继续清除本地数据
    } finally {
      // 清除本地存储的用户信息
      clearUserInfo();
      setIsLoggedIn(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <MainLayout onLogout={handleLogout} />;
}
