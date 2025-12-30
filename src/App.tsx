import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { OperationInstance } from './components/OperationInstance';
import { StrategyDetail } from './components/StrategyDetail';
import { ProfilePage } from './components/ProfilePage';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { CreateUserPage } from './components/CreateUserPage';
import { CreateTradingAccountPage } from './components/CreateTradingAccountPage';
import { InitAccountPage } from './components/InitAccountPage';
import { EditTradingAccountPage } from './components/EditTradingAccountPage';
import { FundTransfer } from './components/FundTransfer';
import { isLoggedIn as checkIsLoggedIn, clearUserInfo, getToken } from './utils/storage';
import { logout } from './services/api';

// 解析 URL 参数
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    page: params.get('page'),
    // 实例页面参数
    id: params.get('id'),
    strategyType: params.get('strategyType'),
    exchange: params.get('exchange'),
    accountName: params.get('accountName'),
    side: params.get('side'),
    symbol: params.get('symbol'),
    // 策略表现页面参数
    strategyName: params.get('strategyName'),
    aiModel: params.get('aiModel'),
    runDays: params.get('runDays'),
    description: params.get('description'),
    // 账户相关页面参数
    accountId: params.get('accountId'),
    uid: params.get('uid'),
    netValue: params.get('netValue'),
    initStatus: params.get('initStatus'),
    accountType: params.get('accountType'),
    subAccountCount: params.get('subAccountCount'),
    apiKey: params.get('apiKey'),
    apiSecret: params.get('apiSecret'),
    // 划转页面的主账户参数
    mainAccId: params.get('mainAccId'),
    mainAccName: params.get('mainAccName'),
    mainAccUid: params.get('mainAccUid'),
    mainNetValue: params.get('mainNetValue'),
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [urlParams] = useState(getUrlParams);

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

  // 独立标签页模式 - 根据 URL 参数渲染对应页面
  const renderStandalonePage = () => {
    switch (urlParams.page) {
      // 实例页面
      case 'instance':
        // 支持两种模式：历史仓位（传id）或当前仓位（传accountId,side,symbol,strategyType）
        if (urlParams.id || urlParams.accountId) {
          return (
            <OperationInstance
              onBack={() => window.close()}
              tradeData={{
                id: urlParams.id ? parseInt(urlParams.id, 10) : undefined,
                accountId: urlParams.accountId ? parseInt(urlParams.accountId, 10) : undefined,
                side: urlParams.side || undefined,
                symbol: urlParams.symbol || undefined,
                strategyType: urlParams.strategyType || '-',
                exchange: urlParams.exchange || '-',
                accountName: urlParams.accountName || '-',
              }}
            />
          );
        }
        break;

      // 策略表现页面
      case 'strategy-detail':
        return (
          <StrategyDetail
            strategyName={urlParams.strategyName}
            aiModel={urlParams.aiModel || undefined}
            runDays={urlParams.runDays ? parseInt(urlParams.runDays, 10) : undefined}
            description={urlParams.description || undefined}
            onBack={() => window.close()}
          />
        );

      // 个人资料页面
      case 'profile':
        return <ProfilePage onBack={() => window.close()} />;

      // 修改密码页面
      case 'change-password':
        return <ChangePasswordPage onBack={() => window.close()} />;

      // 创建用户页面
      case 'user-create':
        return <CreateUserPage onBack={() => window.close()} />;

      // 绑定账户页面
      case 'trading-account-create':
        return <CreateTradingAccountPage onBack={() => window.close()} />;

      // 子账户/初始化页面
      case 'trading-account-init':
        if (urlParams.accountId) {
          return (
            <InitAccountPage
              account={{
                id: urlParams.accountId,
                exchange: urlParams.exchange || '',
                accountName: urlParams.accountName || '',
                uid: urlParams.uid || '',
                netValue: urlParams.netValue || '0.00',
              }}
              subAccountCount={urlParams.subAccountCount ? parseInt(urlParams.subAccountCount, 10) : 0}
              onBack={() => window.close()}
            />
          );
        }
        break;

      // 编辑账户页面
      case 'trading-account-edit':
        if (urlParams.accountId) {
          return (
            <EditTradingAccountPage
              account={{
                id: urlParams.accountId,
                exchange: urlParams.exchange || '',
                uid: urlParams.uid || '',
                accountName: urlParams.accountName || '',
                apiKey: urlParams.apiKey || '',
                apiSecret: urlParams.apiSecret || '',
                initStatus: (urlParams.initStatus as '已初始化' | '未初始化' | '初始化失败') || '未初始化',
                accountType: (urlParams.accountType as '主账户' | '子账户') || '主账户',
              }}
              onBack={() => window.close()}
            />
          );
        }
        break;

      // 划转页面
      case 'fund-transfer':
        if (urlParams.accountId) {
          const account = {
            id: urlParams.accountId,
            exchange: urlParams.exchange || '',
            uid: urlParams.uid || '',
            accountName: urlParams.accountName || '',
            apiKey: '',
            apiSecret: '',
            initStatus: '已初始化' as const,
            netValue: urlParams.netValue || '0.00',
            initialNetValue: '0.00',
            createdAt: '',
            username: '',
            accountType: '子账户' as const,
            mainAccId: urlParams.mainAccId || undefined,
            mainAccName: urlParams.mainAccName || undefined,
            mainAccUid: urlParams.mainAccUid || undefined,
          };
          const parentAccount = urlParams.mainAccId ? {
            id: urlParams.mainAccId,
            exchange: urlParams.exchange || '',
            uid: urlParams.mainAccUid || '',
            accountName: urlParams.mainAccName || '',
            apiKey: '',
            apiSecret: '',
            initStatus: '已初始化' as const,
            netValue: urlParams.mainNetValue || '0.00',
            initialNetValue: '0.00',
            createdAt: '',
            username: '',
            accountType: '主账户' as const,
          } : null;
          return (
            <FundTransfer
              account={account}
              parentAccount={parentAccount}
              onBack={() => window.close()}
            />
          );
        }
        break;
    }
    return null;
  };

  // 检查是否需要渲染独立页面
  if (urlParams.page) {
    const standalonePage = renderStandalonePage();
    if (standalonePage) {
      return (
        <div className="min-h-screen bg-gray-50">
          {standalonePage}
        </div>
      );
    }
  }

  return <MainLayout onLogout={handleLogout} />;
}
