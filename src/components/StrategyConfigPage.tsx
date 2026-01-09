import { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, FileText, Tag, AlertCircle, Eye, X, Play, LineChart, Copy } from 'lucide-react';
import {
  createStrategyModel,
  upgradeStrategyModel,
  getStrategyModelDetail,
  getStrategyModelLatest,
  previewStrategyModel,
  getSystemDict,
  StrategyModelReq,
  StrategyModelDetailRes,
  DictItem
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
- 以下是示例：
你是严格执行规则的职业交易员，专注于 M15 周期交易，使用 EMA20/EMA60 双均线趋势回踩系统。
三大铁律：禁止逆势、禁止震荡区交易、禁止追涨杀跌。

【核心思想】
- 以下是示例：
- H1 定趋势方向：过滤震荡，只做明确趋势
- M15找点位：捕捉高概率反转入场点
- ATR 动态风控：根据币种波动率自适应止损止盈
- 只做高概率、带量能确认的顺势回踩，拒绝震荡与逆势。

【策略逻辑】
- 请在这里详细描述策略规则，指标相关的条件和分析要注意使用完整 JSON 路径 描述
- 以下是示例：
1. H1 趋势过滤
    1) 做多条件：
        - 
    2) 做空条件：
        - 

2. M15 入场信号
    1） 做多信号：
        - 
    2） 做空信号：
        - 

3. 风控参数
    - entryPrice = lastPrice = m15.ohlc[19].close
    1) 止损：
        - 多单：
        - 空单：
    2) 止损：
        - 多单：
        - 空单：

    3) 单笔风险估算：riskUsd = 1.2 × h1.indicators.atr[19]（按 1 合约估算）

【confidence 打分规则（0–1）】
- 以下是示例：
- 0.8–1.0：H1 趋势 + M15 信号全满足 + 放量确认
- 0.6–0.7：H1 趋势明确，M15 信号完整但无放量
- ≤0.5：返回 "side": "Wait"
- 重要：若 H1 无趋势，或 M15 任一子条件不满足，必须返回 "Wait"。`,
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

  // 字典数据状态
  const [dictSymbols, setDictSymbols] = useState<DictItem[]>([]);
  const [dictAiModels, setDictAiModels] = useState<DictItem[]>([]);
  const [dictIndicators, setDictIndicators] = useState<DictItem[]>([]);
  const [dictIntervals, setDictIntervals] = useState<DictItem[]>([]);
  const [isDictLoading, setIsDictLoading] = useState(true);

  // 复制到剪贴板
  const formatClipboardText = (data: unknown) => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const copyToClipboard = async (data: unknown) => {
    const text = formatClipboardText(data);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  // 加载系统字典
  useEffect(() => {
    const loadSystemDict = async () => {
      try {
        const dictData = await getSystemDict();
        setDictSymbols(dictData.SymbolType || []);
        setDictAiModels(dictData.AiModel || []);
        setDictIndicators(dictData.Indicator || []);
        setDictIntervals(dictData.Interval || []);
      } catch (err) {
        console.error('加载系统字典失败:', err);
        // 使用默认值作为后备
        setDictSymbols([]);
        setDictAiModels([]);
        setDictIndicators([]);
        setDictIntervals([]);
      } finally {
        setIsDictLoading(false);
      }
    };
    loadSystemDict();
  }, []);

  // 处理换行符 - 将转义的 \n 转换为真正的换行符
  const unescapeNewlines = (text: string): string => {
    if (!text) return text;
    // 将字符串中的 \\n 替换为真正的换行符
    return text.replace(/\\n/g, '\n');
  };

  const formatBeijingDateTime = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatBeijingTimestamp = (value: string): string => {
    if (!value) return '';

    const plainMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
    if (plainMatch) {
      const [, year, month, day, hours, minutes, seconds] = plainMatch;
      const date = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds)
      ));
      return formatBeijingDateTime(date);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const beijingDate = new Date(parsed.getTime() + 8 * 60 * 60 * 1000);
      return formatBeijingDateTime(beijingDate);
    }

    return value;
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

        // 使用 latest 接口获取最新版本详情（使用策略名称）
        const detail = await getStrategyModelLatest(token, strategy.name);

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

        // 更新版本历史（按版本倒序排列）
        const currentVersionData = {
          version: detail.version || 1,
          timestamp: detail.createTime || new Date().toISOString(),
          id: parseInt(strategy.id) // 使用当前策略的ID
        };

        setVersionHistory((prev) => {
          if (!detail.historyList || detail.historyList.length === 0) {
            return prev.length > 0 ? prev : [currentVersionData];
          }

          const existingByVersion = new Map(prev.map(item => [item.version, item]));
          const history = detail.historyList.map(h => {
            const existing = existingByVersion.get(h.version);
            return {
              version: h.version,
              timestamp: existing?.timestamp || h.createTime,
              id: existing?.id ?? h.id
            };
          });

          prev.forEach(item => {
            if (!history.some(h => h.version === item.version)) {
              history.push(item);
            }
          });

          if (!history.some(h => h.version === currentVersionData.version)) {
            history.push(existingByVersion.get(currentVersionData.version) || currentVersionData);
          }

          history.sort((a, b) => b.version - a.version);
          return history;
        });
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

      // 更新版本历史（如果返回了新的历史列表，按版本倒序排列）
      const currentVersionData = {
        version: detail.version || version,
        timestamp: detail.createTime || new Date().toISOString(),
        id: versionId || parseInt(strategy.id)
      };

      setVersionHistory((prev) => {
        if (!detail.historyList || detail.historyList.length === 0) {
          return prev.length > 0 ? prev : [currentVersionData];
        }

        const existingByVersion = new Map(prev.map(item => [item.version, item]));
        const history = detail.historyList.map(h => {
          const existing = existingByVersion.get(h.version);
          return {
            version: h.version,
            timestamp: existing?.timestamp || h.createTime,
            id: existing?.id ?? h.id
          };
        });

        prev.forEach(item => {
          if (!history.some(h => h.version === item.version)) {
            history.push(item);
          }
        });

        if (!history.some(h => h.version === currentVersionData.version)) {
          history.push(existingByVersion.get(currentVersionData.version) || currentVersionData);
        }

        history.sort((a, b) => b.version - a.version);
        return history;
      });
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
                            {formatBeijingTimestamp(version.timestamp)}
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
                    {dictIntervals.map((interval) => {
                      const isSelected = selectedPeriods.includes(interval.code);
                      const canSelect = !isSelected && selectedPeriods.length >= 3;

                      return (
                        <button
                          key={interval.code}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPeriods(selectedPeriods.filter(p => p !== interval.code));
                            } else if (selectedPeriods.length < 3) {
                              setSelectedPeriods([...selectedPeriods, interval.code]);
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
                          {interval.name}
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
                    {dictIndicators.map((indicator) => {
                      const isSelected = selectedIndicators.includes(indicator.code);
                      const canSelect = !isSelected && selectedIndicators.length >= 10;

                      return (
                        <button
                          key={indicator.code}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedIndicators(selectedIndicators.filter(i => i !== indicator.code));
                            } else if (selectedIndicators.length < 10) {
                              setSelectedIndicators([...selectedIndicators, indicator.code]);
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
                          {indicator.name}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                    {dictAiModels.map((model) => (
                      <button
                        key={model.code}
                        type="button"
                        onClick={() => setFormData({ ...formData, aiModel: model.code })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.aiModel === model.code
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {model.name}
                      </button>
                    ))}
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
                    rows={32}
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
                    {dictSymbols.map((symbol) => {
                      const isSelected = selectedSymbols.includes(symbol.name);

                      return (
                        <button
                          key={symbol.code}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSymbols(selectedSymbols.filter(s => s !== symbol.name));
                            } else {
                              setSelectedSymbols([...selectedSymbols, symbol.name]);
                            }
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {symbol.name}
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
                    onChange={(e) => setFormData({ ...formData, requestFrequency: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hide-spin-button"
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
                <div className="flex items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() => copyToClipboard(unescapeNewlines(previewData?.systemPrompt || formData.systemPrompt || ''))}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Copy SYSTEM_PROMPT"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {expandedSystemPrompt && (
                  <div className="mt-2">
                    <textarea
                      value={unescapeNewlines(previewData?.systemPrompt || formData.systemPrompt || '（未设置）')}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm text-gray-700 cursor-default"
                      rows={32}
                    />
                  </div>
                )}
              </div>

              {/* USER PROMPT - Collapsible */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() => copyToClipboard(previewData?.userPrompt)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Copy USER_PROMPT"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

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
                <div className="flex items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() => copyToClipboard(previewData?.aiOutput)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Copy AI_OUTPUT"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

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
