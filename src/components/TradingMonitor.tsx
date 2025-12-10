interface TradingMonitorProps {
  type?: 'strategy' | 'account';
}

export function TradingMonitor({ type = 'strategy' }: TradingMonitorProps) {
  const title = type === 'strategy' ? '策略监控' : '账户监控';
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">{title}内容即将到来...</p>
      </div>
    </div>
  );
}