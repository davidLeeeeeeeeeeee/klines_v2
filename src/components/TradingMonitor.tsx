import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface TradingMonitorProps {
  type?: 'strategy' | 'account';
}

export function TradingMonitor({ type = 'strategy' }: TradingMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const title = type === 'strategy' ? '策略监控' : '账户监控';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">{title}内容即将到来...</p>
      </div>
    </div>
  );
}