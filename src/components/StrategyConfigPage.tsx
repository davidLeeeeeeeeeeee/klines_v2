import { useState } from 'react';
import { ChevronLeft, Sparkles, FileText, Tag, AlertCircle, Eye, X, Play, LineChart } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  systemPrompt?: string;
  userPrompt?: string;
  requestFrequency?: number;
  requestFrequencyUnit?: 'seconds' | 'minutes' | 'hours';
  aiModel?: string;
}

interface StrategyConfigPageProps {
  strategy: Strategy | null;
  onBack: () => void;
  onSave: (strategyData: Partial<Strategy>) => void;
}

export function StrategyConfigPage({ strategy, onBack, onSave }: StrategyConfigPageProps) {
  const [formData, setFormData] = useState({
    name: strategy?.name || '',
    description: strategy?.description || '',
    riskLevel: strategy?.riskLevel || 'medium' as 'low' | 'medium' | 'high',
    tags: strategy?.tags.join(', ') || '',
    systemPrompt: strategy?.systemPrompt || `【角色设定】
示例：你是一名严格执行规则的职业交易员，只交易 M15 周期，使用 EMA20 / EMA60 双均线趋势回踩系统，禁止逆势、禁止震荡区交易。

【核心思想】
这里请用一两句话总结策略的核心思想。

【策略逻辑】
请在这里详细描述策略规则。

【confidence 打分规则（0–1）】
以下是示例：
- 0.9–1.0: 趋势清晰 + 回踩命中 + 入场条件完全满足 + 成交量确认
- 0.7–0.8: 趋势清晰 + 回踩命中 + 入场条件部分满足
- 0.5–0.6: 趋势清晰 + 回踩未完全到位 + 入场条件部分满足
- ≤0.4: 不交易`,
    userPrompt: strategy?.userPrompt || '',
    requestFrequency: strategy?.requestFrequency || 5,
    requestFrequencyUnit: strategy?.requestFrequencyUnit || 'minutes' as 'seconds' | 'minutes' | 'hours',
    aiModel: strategy?.aiModel || 'gpt-3.5-turbo'
  });

  const [timePeriod, setTimePeriod] = useState('15m');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['VOLUME', 'EMA10', 'MACD']);
  const [klineCount] = useState(20); // 固定为20，不可编辑
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSystemPrompt, setExpandedSystemPrompt] = useState(true);
  const [expandedUserPrompt, setExpandedUserPrompt] = useState(true);
  const [expandedAIOutput, setExpandedAIOutput] = useState(true);
  const [aiOutput, setAiOutput] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['15m']);
  const [includePositionData, setIncludePositionData] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['BTCUSDT']);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  // Mock version history data
  const versionHistory = [
    { version: 4, timestamp: '2020/12/12 12:12:12' },
    { version: 3, timestamp: '2020/12/12 12:12:12' },
    { version: 2, timestamp: '2020/12/12 12:12:12' },
    { version: 1, timestamp: '2020/12/12 12:12:12' },
  ];

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
  };

  const handleRunAITest = () => {
    setIsRunningTest(true);
    setExpandedAIOutput(true);
    
    // 模拟AI测试运行
    setTimeout(() => {
      setAiOutput(`📊 AI 测试输出结果

模型: ${formData.aiModel}
时间: ${new Date().toLocaleString('zh-CN')}

===== 策略分析 =====

基于当前配置的提示词和参数，AI 将执行以下策略分析：

K线数量: ${klineCount}
时间周期: ${timePeriod}
技术指标: ${selectedIndicators.join(', ')}

市场分析：
• 当前市场趋势：${Math.random() > 0.5 ? '上涨' : '下跌'}
• 技术指标显示：${Math.random() > 0.5 ? '买入信号' : '观望信号'}
• 风险评估：${formData.riskLevel === 'low' ? '低风险' : formData.riskLevel === 'medium' ? '中等风险' : '高风险'}

交易建议：
✅ 建议操作：${Math.random() > 0.5 ? '开多' : '观望'}
💰 建议仓位：${Math.floor(Math.random() * 50 + 10)}%
🎯 目标价位：待确认
🛡️ 止损价位：待确认

风险提示：
⚠️ 以上内容仅为测试输出，实际交易请谨慎决策
⚠️ 请根据实时市场数据进行综合判断`);
      setIsRunningTest(false);
    }, 2000);
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {strategy ? '策略配置' : '创建策略'}
              </h1>
            </div>
            {/* Version Dropdown - Only show in edit mode */}
            {strategy && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Ver: {currentVersion}
                </button>
                
                {/* Dropdown Menu */}
                {showVersionDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowVersionDropdown(false)}
                    />
                    
                    {/* Dropdown Content */}
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[280px] z-20">
                      {versionHistory.map((version) => (
                        <button
                          key={version.version}
                          type="button"
                          onClick={() => {
                            setCurrentVersion(version.version);
                            setShowVersionDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            currentVersion === version.version ? 'bg-blue-50' : ''
                          }`}
                        >
                          <span className={currentVersion === version.version ? 'text-blue-600' : 'text-gray-700'}>
                            Ver: {version.version}
                          </span>
                          <span className={`text-sm ${currentVersion === version.version ? 'text-blue-600' : 'text-gray-500'}`}>
                            {version.timestamp}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>预览</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900 font-semibold">基本信息</h2>
              </div>
              
              <div className="space-y-4">
                {/* Strategy Name */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    策略名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="输入策略名称"
                    required
                  />
                </div>

                {/* Strategy Description */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    策略描述 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      rows={2}
                      placeholder="简要描述策略的核心逻辑和特点"
                      maxLength={100}
                      required
                    />
                    <span className="absolute bottom-3 right-4 text-gray-400 text-sm pointer-events-none">
                      {formData.description.length}/100
                    </span>
                  </div>
                </div>

                {/* Risk Level and Tags Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Risk Level */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      风险等级 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, riskLevel: 'low' })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.riskLevel === 'low'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        低风险
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, riskLevel: 'medium' })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.riskLevel === 'medium'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        中风险
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, riskLevel: 'high' })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.riskLevel === 'high'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        高风险
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {formData.riskLevel === 'low' && '适合保守型投资者，追求稳定收益'}
                      {formData.riskLevel === 'medium' && '适合平衡型投资者，收益与风险并重'}
                      {formData.riskLevel === 'high' && '适合激进型投资者，追求高收益'}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Tag className="w-4 h-4" />
                      标签
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="多个标签用逗号分隔"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      例如：趋势策略, 网格交易, 套利
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Indicators Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <LineChart className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900 font-semibold">策略指标</h2>
              </div>
              
              <div className="space-y-6">
                {/* Kline Count */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    K线数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={klineCount}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="固定为20"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    K线数量已固定为 20 条
                  </p>
                </div>

                {/* Time Period */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    时间周期(3个以内) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {['3m', '5m', '15m', '30m', '1h', '4h', '6h', '12h', '1D', '1W'].map((period) => {
                      const isSelected = selectedPeriods.includes(period);
                      const canSelect = !isSelected && selectedPeriods.length >= 3;
                      
                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPeriods(selectedPeriods.filter(p => p !== period));
                            } else if (selectedPeriods.length < 3) {
                              setSelectedPeriods([...selectedPeriods, period]);
                            }
                          }}
                          disabled={canSelect}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : canSelect
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {period}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    已选择 {selectedPeriods.length}/3 个周期
                  </p>
                </div>

                {/* Technical Indicators */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    技术指标(10个以内) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['VOLUME', 'MACD', 'RSI', 'ATR', 'KDJ', 'EMA10', 'EMA20', 'EMA30', 'EMA60', 'EMA80', 'EMA100'].map((indicator) => {
                      const isSelected = selectedIndicators.includes(indicator);
                      const canSelect = !isSelected && selectedIndicators.length >= 10;
                      
                      return (
                        <button
                          key={indicator}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
                            } else if (selectedIndicators.length < 10) {
                              setSelectedIndicators([...selectedIndicators, indicator]);
                            }
                          }}
                          disabled={canSelect}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : canSelect
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {indicator}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    已选择 {selectedIndicators.length}/10 个指标
                  </p>
                </div>

                {/* Position Data */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    账号持仓数据 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIncludePositionData(true)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        includePositionData
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      包含
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludePositionData(false)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        !includePositionData
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      不包含
                    </button>
                  </div>
                  <div className="text-gray-500 text-sm mt-3 space-y-1">
                    <div>• 不包含持仓数据的情况，AI只会输出开多，开空，等待三个信号</div>
                    <div>• 包含持仓数据后，AI将同时对每个持仓账号输出以下操作：平多，平空，持有，调整止盈止损</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompts Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-gray-900 font-semibold">AI CHAT 配置</h2>
              </div>
              
              <div className="space-y-6">
                {/* AI Model Selection */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    AI MODEL <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'DEEPSEEK-LOCAL' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'DEEPSEEK-LOCAL'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      DEEPSEEK-LOCAL
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'DEEPSEEK' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'DEEPSEEK'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      DEEPSEEK
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'GPT-3.5-TURBO' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'GPT-3.5-TURBO'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GPT-3.5-TURBO
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'GPT-4' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'GPT-4'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GPT-4
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'GPT-4-TURBO' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'GPT-4-TURBO'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GPT-4-TURBO
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'GPT-5.1' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'GPT-5.1'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GPT-5.1
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'GROK-4' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'GROK-4'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GROK-4
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'CLAUDE-3-OPUS' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'CLAUDE-3-OPUS'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      CLAUDE-3-OPUS
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'CLAUDE-3-SONNET' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'CLAUDE-3-SONNET'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      CLAUDE-3-SONNET
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    选择用于策略分析的 AI 模型
                  </p>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    System 提示词 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono text-sm"
                    rows={16}
                    placeholder="你是一个专业的量化交易分析师，擅长技术分析和市场趋势预测。你的任务是基于实时市场数据，为用户提供精准的交易建议..."
                    onInput={handleTextareaResize}
                    required
                  />
                  <div className="text-gray-500 text-sm mt-2 space-y-1">
                    <div>• System 提示词定义 AI 的角色和基本行为准则</div>
                    <div>• 【数据结构说明】、【时间周期】、【核心指标】、【最终输出格式】由系统自动生成，请不要填写。</div>
                    <div>• User 提示词为相关K线、指标和持仓数据，由系统生成。</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Settings Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-gray-900 font-semibold mb-4 pb-3 border-b border-gray-200">执行设置</h2>
              
              <div className="space-y-4">
                {/* Symbols Selection */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    商品 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'].map((symbol) => {
                      const isSelected = selectedSymbols.includes(symbol);
                      
                      return (
                        <button
                          key={symbol}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
                            } else {
                              setSelectedSymbols([...selectedSymbols, symbol]);
                            }
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {symbol}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    已选择 {selectedSymbols.length} 个商品
                  </p>
                </div>

                {/* Request Frequency */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    请求频率(分钟) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.requestFrequency}
                    onChange={(e) => setFormData({ ...formData, requestFrequency: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="1"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    设置策略执的时间间隔，建议不低于 3 分钟
                  </p>
                </div>

                {/* Estimated execution info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">预计每日执行次数</span>
                    <span className="text-gray-900">
                      {Math.floor(1440 / formData.requestFrequency)} 次
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
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
              确定
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Preview Modal */}
      {showPreview && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formData.name || '新策略'}-执行预览
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* SYSTEM PROMPT - Collapsible */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedSystemPrompt(!expandedSystemPrompt)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedSystemPrompt ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>SYSTEM_PROMPT</span>
                </button>
                
                {expandedSystemPrompt && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-gray-700 text-sm whitespace-pre-wrap font-mono">
                      {formData.systemPrompt || '（未设置）'}
                    </div>
                  </div>
                )}
              </div>

              {/* USER PROMPT - Collapsible */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedUserPrompt(!expandedUserPrompt)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedUserPrompt ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>USER_PROMPT</span>
                </button>
                
                {expandedUserPrompt && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-gray-700 text-sm whitespace-pre-wrap font-mono">
                      {formData.userPrompt || '（未设置）'}
                    </div>
                  </div>
                )}
              </div>

              {/* AI OUTPUT - Collapsible */}
              <div>
                <button
                  onClick={() => setExpandedAIOutput(!expandedAIOutput)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedAIOutput ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>AI_OUTPUT</span>
                </button>
                
                {expandedAIOutput && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-gray-700 text-sm whitespace-pre-line">
                      {aiOutput || '点击下方"运行 AI 测试"按钮查看AI输出结果'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bottom Run Test Button */}
            <div className="mt-4 flex-shrink-0">
              <button
                type="button"
                onClick={handleRunAITest}
                disabled={isRunningTest}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isRunningTest ? '运行中...' : '运行 AI 测试'}
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}