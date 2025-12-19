import { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, FileText, Tag, AlertCircle, Eye, X, Play, LineChart } from 'lucide-react';
import {
  createStrategyModel,
  upgradeStrategyModel,
  getStrategyModelDetail,
  previewStrategyModel,
  StrategyModelReq,
  StrategyModelDetailRes
} from '../services/api';
import { getToken } from '../utils/storage';
import { JsonViewer } from './JsonViewer';

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

【数据结构说明】
- 所有 indicators.* 数组长度固定为 20
- 索引 [0] 表示最早K线，[19] 表示最新K线
- current.* 为当前指标快照，严格等价于 indicators.*[19]
- current.* 仅用于当前状态判断，历史比较必须使用 indicators[i]
- position 为账户持仓数组，每个对象代表一个独立交易账户的持仓
- 所有条件必须使用完整 json path 描述，如 m15.indicators.rsi[18]

【时间周期】
- h4: 4小时
- h1: 1小时
- m15: 15分钟

【核心指标】
- ohlc: K线数据
- volume: 成交量
- ema20: EMA20 指数移动均线
- ema60: EMA60 指数移动均线
- macd_dif: MACD快线（动量快线，短周期与长周期 EMA 差值）
- macd_dea: MACD慢线（信号慢线，DIF 的指数平滑）
- macd_hist: MACD动能柱（多空动能，DIF−DEA）
- rsi: RSI(14) 相对强弱指标
- atr: ATR(14) 平均真实波幅

【核心思想】
这里请用一两句话总结策略的核心思想。

【策略逻辑】
请在这里详细描述策略规则。

【confidence 打分规则（0–1）】
以下是示例：
- 0.9–1.0: 趋势清晰 + 回踩命中 + 入场条件完全满足 + 成交量确认
- 0.7–0.8: 趋势清晰 + 回踩命中 + 入场条件部分满足
- 0.5–0.6: 趋势清晰 + 回踩未完全到位 + 入场条件部分满足
- ≤0.4: 不交易

【最终输出格式】
  1) 严格返回以下JSON格式:
    {
      "COIN": {
        "tradeSignalArgs": {
          "coin": "<COIN>",
          "side": "Buy | Sell | Wait",
          "entryPrice": <float>,
          "takeProfit": <float>,
          "stopLoss": <float>,
          "invalidationCondition": "<string>",
          "confidence": <0–1>,
          "riskUsd": <float>,
          "simpleThought": <简要中文解释>,
          "position":[
            {
                "accountId":<accountId>,
                "side": "Close | Hold | PLMODIFY",
                "entryPrice":<float>
                "newTakeProfit": <float>,
                "newStopLoss": <float>,
                "thought":"中文解释"
            }
          ]
        }
      }
    }
    2) 如果当前有持仓，需根据当前仓位的入场点位、止盈、止损情况，判断是否需要进行 平仓(Close)，继续持有且无其它动作(Hold)，调整止盈止损(PLMODIFY)
    3) 如果需要调整止盈止损(PLMODIFY)，则设置 newTakeProfit、newStopLoss为新止盈止损点位，否则为 null`,
    userPrompt: strategy?.userPrompt || '',
    requestFrequency: strategy?.requestFrequency || 5,
    requestFrequencyUnit: strategy?.requestFrequencyUnit || 'minutes' as 'seconds' | 'minutes' | 'hours',
    aiModel: strategy?.aiModel || 'DEEPSEEK_V3'
  });

  const [timePeriod, setTimePeriod] = useState('m15');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['VOLUME', 'EMA10', 'MACD']);
  const [klineCount] = useState(20); // 固定为20，不可编辑
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSystemPrompt, setExpandedSystemPrompt] = useState(true);
  const [expandedUserPrompt, setExpandedUserPrompt] = useState(true);
  const [expandedAIOutput, setExpandedAIOutput] = useState(true);
  const [previewData, setPreviewData] = useState<{
    systemPrompt: string;
    userPrompt: any;
    aiOutput: any;
  } | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['m15']);
  const [includePositionData, setIncludePositionData] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['BTCUSDT']);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [versionHistory, setVersionHistory] = useState<Array<{ version: number; timestamp: string; id?: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testDuration, setTestDuration] = useState<number | null>(null); // 测试耗时（秒）

  // 处理换行符 - 将转义的 \n 转换为真正的换行符
  const unescapeNewlines = (text: string): string => {
    if (!text) return text;
    // 将字符串中的 \\n 替换为真正的换行符
    return text.replace(/\\n/g, '\n');
  };

  // 加载策略详情
  useEffect(() => {
    const loadStrategyDetail = async () => {
      if (!strategy?.id) return;

      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          throw new Error('未找到认证令牌，请重新登录');
        }

        const detail = await getStrategyModelDetail(token, parseInt(strategy.id));

        // 更新表单数据（安全处理可能为null的字段）
        setFormData({
          name: detail.name || '',
          description: detail.description || '',
          riskLevel: (detail.riskLevel?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high',
          tags: detail.tag || '',
          systemPrompt: detail.systemPrompt || '',
          userPrompt: '', // API中没有userPrompt字段
          requestFrequency: detail.frequency || 5,
          requestFrequencyUnit: 'minutes',
          aiModel: detail.aiModel || 'DEEPSEEK_V3'
        });

        // 更新其他状态（安全处理可能为null的字段）
        setSelectedIndicators(detail.indicators || []);
        setSelectedPeriods(detail.intervals || []);
        setIncludePositionData(detail.needPosition ?? false);
        setSelectedSymbols(detail.symbols || []);
        setCurrentVersion(detail.version || 1);

        // 更新版本历史
        if (detail.historyList && detail.historyList.length > 0) {
          const history = detail.historyList.map(h => ({
            version: h.version,
            timestamp: h.createTime,
            id: h.id
          }));
          setVersionHistory(history);
        }
      } catch (err) {
        console.error('加载策略详情失败:', err);
        alert(err instanceof Error ? err.message : '加载策略详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadStrategyDetail();
  }, [strategy?.id]);

  // 加载指定版本的策略数据
  const loadStrategyVersion = async (version: number, versionId?: number) => {
    if (!strategy?.id) return;

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      // 使用versionId（如果提供）或者使用当前策略ID
      const idToUse = versionId || parseInt(strategy.id);
      console.log(`🔄 加载版本 ${version}，使用ID: ${idToUse} (versionId: ${versionId}, strategy.id: ${strategy.id})`);

      // 调用详情接口，传入id和version参数
      const detail = await getStrategyModelDetail(token, idToUse, version);

      console.log('📦 版本详情数据:', detail);

      // 更新表单数据
      setFormData({
        name: detail.name || '',
        description: detail.description || '',
        riskLevel: (detail.riskLevel?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high',
        tags: detail.tag || '',
        systemPrompt: detail.systemPrompt || '',
        userPrompt: '',
        requestFrequency: detail.frequency || 5,
        requestFrequencyUnit: 'minutes',
        aiModel: detail.aiModel || 'DEEPSEEK_V3'
      });

      // 更新其他状态
      setSelectedIndicators(detail.indicators || []);
      setSelectedPeriods(detail.intervals || []);
      setIncludePositionData(detail.needPosition ?? false);
      setSelectedSymbols(detail.symbols || []);
      setCurrentVersion(detail.version || version);

      // 更新版本历史（如果返回了新的历史列表）
      if (detail.historyList && detail.historyList.length > 0) {
        const history = detail.historyList.map(h => ({
          version: h.version,
          timestamp: h.createTime,
          id: h.id
        }));
        setVersionHistory(history);
      }
    } catch (err) {
      console.error('加载策略版本失败:', err);
      alert(err instanceof Error ? err.message : '加载策略版本失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      // 构建API请求参数
      const requestData: StrategyModelReq = {
        name: formData.name,
        description: formData.description,
        riskLevel: formData.riskLevel.toUpperCase(), // 转换为大写：LOW, MEDIUM, HIGH
        tag: formData.tags, // 将tags字符串作为tag
        systemPrompt: formData.systemPrompt,
        frequency: formData.requestFrequency,
        aiModel: formData.aiModel,
        indicators: selectedIndicators,
        intervals: selectedPeriods,
        klineNum: klineCount,
        needPosition: includePositionData,
        symbols: selectedSymbols
      };

      if (strategy?.id) {
        // 更新现有策略
        await upgradeStrategyModel(token, requestData);
        alert('策略更新成功！');
      } else {
        // 创建新策略
        await createStrategyModel(token, requestData);
        alert('策略创建成功！');
      }

      // 调用父组件的保存回调
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      // 返回列表页
      onBack();
    } catch (err) {
      console.error('保存策略失败:', err);
      alert(err instanceof Error ? err.message : '保存策略失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAITest = async () => {
    console.log('🚀 开始运行AI测试...');
    setIsRunningTest(true);
    setExpandedAIOutput(true);

    // 记录开始时间
    const startTime = Date.now();

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      // 构建预览请求参数
      const requestData: StrategyModelReq = {
        name: formData.name,
        description: formData.description,
        riskLevel: formData.riskLevel.toUpperCase(), // 转换为大写：LOW, MEDIUM, HIGH
        tag: formData.tags,
        systemPrompt: formData.systemPrompt,
        frequency: formData.requestFrequency,
        aiModel: formData.aiModel,
        indicators: selectedIndicators,
        intervals: selectedPeriods,
        klineNum: klineCount,
        needPosition: includePositionData,
        symbols: selectedSymbols
      };

      console.log('📤 发送预览请求:', requestData);

      // 调用预览API，设置超时时间为 300 秒
      const response = await previewStrategyModel(token, requestData, 300000);

      console.log('📥 收到预览响应:', response);

      // 计算耗时
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2); // 转换为秒，保留2位小数
      setTestDuration(parseFloat(duration));

      // 保存完整的预览数据
      setPreviewData({
        systemPrompt: unescapeNewlines(response.systemPrompt || formData.systemPrompt || ''),
        userPrompt: response.userPrompt || '',
        aiOutput: response.aiOutput || ''
      });

    } catch (err) {
      console.error('❌ 运行AI测试失败:', err);

      // 即使失败也计算耗时
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      setTestDuration(parseFloat(duration));

      setPreviewData({
        systemPrompt: unescapeNewlines(formData.systemPrompt || ''),
        userPrompt: '',
        aiOutput: `❌ 测试失败: ${err instanceof Error ? err.message : '未知错误'}`
      });
    } finally {
      setIsRunningTest(false);
      console.log('✅ AI测试完成');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="text-gray-700">加载中...</div>
          </div>
        </div>
      )}

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
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[380px] z-20">
                      {versionHistory.map((version) => (
                        <button
                          key={version.version}
                          type="button"
                          onClick={async () => {
                            setShowVersionDropdown(false);
                            await loadStrategyVersion(version.version, version.id);
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 ${
                            currentVersion === version.version ? 'bg-blue-50' : ''
                          }`}
                        >
                          <span className={`font-medium whitespace-nowrap ${currentVersion === version.version ? 'text-blue-600' : 'text-gray-700'}`}>
                            Ver: {version.version}
                          </span>
                          <span className={`text-sm whitespace-nowrap ${currentVersion === version.version ? 'text-blue-600' : 'text-gray-500'}`}>
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
                    {strategy && <span className="text-gray-500 text-sm ml-2">(修改策略时不可更改名称)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${strategy ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="输入策略名称"
                    disabled={!!strategy}
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
                    {[
                      { display: '3分钟', value: 'm3' },
                      { display: '5分钟', value: 'm5' },
                      { display: '15分钟', value: 'm15' },
                      { display: '30分钟', value: 'm30' },
                      { display: '1小时', value: 'h1' },
                      { display: '4小时', value: 'h4' },
                      { display: '6小时', value: 'h6' },
                      { display: '12小时', value: 'h12' },
                      { display: '1天', value: 'd1' },
                      { display: '1周', value: 'w1' }
                    ].map((period) => {
                      const isSelected = selectedPeriods.includes(period.value);
                      const canSelect = !isSelected && selectedPeriods.length >= 3;

                      return (
                        <button
                          key={period.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPeriods(selectedPeriods.filter(p => p !== period.value));
                            } else if (selectedPeriods.length < 3) {
                              setSelectedPeriods([...selectedPeriods, period.value]);
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
                          {period.display}
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
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'DEEPSEEK_V3' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'DEEPSEEK_V3'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      DEEPSEEK_V3
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, aiModel: 'DEEPSEEK_R1' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.aiModel === 'DEEPSEEK_R1'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      DEEPSEEK_R1
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono text-sm overflow-y-auto"
                    rows={16}
                    placeholder="你是一个专业的量化交易分析师，擅长技术分析和市场趋势预测。你的任务是基于实时市场数据，为用户提供精准的交易建议..."
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
                    {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'HYPEUSDT', 'XRPUSDT', 'DOGEUSDT', 'ZECUSDT', 'ADAUSDT'].map((symbol) => {
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
              disabled={isSaving || isLoading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '确定'}
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
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {formData.name || '新策略'}-执行预览
                  </h3>
                  {testDuration !== null && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      耗时: {testDuration}s
                    </span>
                  )}
                </div>
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
                  <div className="mt-2">
                    <textarea
                      value={unescapeNewlines(previewData?.systemPrompt || formData.systemPrompt || '（未设置）')}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm text-gray-700 cursor-default"
                      rows={16}
                    />
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
                  <div className="mt-2 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    {previewData?.userPrompt ? (
                      <JsonViewer data={previewData.userPrompt} expandAll={true} />
                    ) : (
                      <div className="text-gray-500 text-sm">点击下方"运行 AI 测试"按钮查看用户提示词</div>
                    )}
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
                    {previewData?.aiOutput ? (
                      <JsonViewer data={previewData.aiOutput} expandAll={true} />
                    ) : (
                      <div className="text-gray-500 text-sm">点击下方"运行 AI 测试"按钮查看AI输出结果</div>
                    )}
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