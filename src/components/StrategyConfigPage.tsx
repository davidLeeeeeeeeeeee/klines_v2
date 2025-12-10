import { useState } from 'react';
import { ChevronLeft, Sparkles, FileText, Tag, AlertCircle } from 'lucide-react';

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
    systemPrompt: strategy?.systemPrompt || '',
    userPrompt: strategy?.userPrompt || '',
    requestFrequency: strategy?.requestFrequency || 5,
    requestFrequencyUnit: strategy?.requestFrequencyUnit || 'minutes' as 'seconds' | 'minutes' | 'hours'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                {strategy ? '策略配置' : '创建新策略'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900">基本信息</h2>
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
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={3}
                  placeholder="简要描述策略的核心逻辑和特点"
                  required
                />
                <p className="text-gray-500 text-sm mt-2">
                  {formData.description.length} / 200 字符
                </p>
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

          {/* AI Prompts Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-gray-900">AI 提示词配置</h2>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-2">提示词使用说明</p>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• System 提示词定义 AI 的角色和基本行为准则</li>
                  <li>• User 提示词设置默认的查询模板和指令</li>
                  <li>• 提示词支持变量和参数，可动态替换</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* System Prompt */}
              <div>
                <label className="block text-gray-700 mb-2">
                  System 提示词
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono text-sm bg-gray-50"
                  rows={8}
                  placeholder="你是一个专业的量化交易分析师，擅长技术分析和市场趋势预测。你的任务是基于实时市场数据，为用户提供精准的交易建议..."
                />
                <p className="text-gray-500 text-sm mt-2">
                  定义 AI 助手的角色、能力范围和基本行为准则
                </p>
              </div>

              {/* User Prompt */}
              <div>
                <label className="block text-gray-700 mb-2">
                  User 提示词
                </label>
                <textarea
                  value={formData.userPrompt}
                  onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono text-sm bg-gray-50"
                  rows={8}
                  placeholder="请分析当前市场趋势，基于以下数据给出交易建议：&#10;- 当前价格：{{price}}&#10;- 24小时涨跌幅：{{change}}&#10;- 交易量：{{volume}}&#10;..."
                />
                <p className="text-gray-500 text-sm mt-2">
                  设置默认的用户查询模板，支持 {'{{variable}}'} 变量语法
                </p>
              </div>
            </div>
          </div>

          {/* Execution Settings Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-gray-900 mb-4 pb-3 border-b border-gray-200">执行设置</h2>
            
            <div className="space-y-4">
              {/* Request Frequency */}
              <div>
                <label className="block text-gray-700 mb-2">
                  请求频率 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={formData.requestFrequency}
                    onChange={(e) => setFormData({ ...formData, requestFrequency: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="1"
                    required
                  />
                  <select
                    value={formData.requestFrequencyUnit}
                    onChange={(e) => setFormData({ ...formData, requestFrequencyUnit: e.target.value as 'seconds' | 'minutes' | 'hours' })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value="seconds">秒</option>
                    <option value="minutes">分钟</option>
                    <option value="hours">小时</option>
                  </select>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  设置策略执行的时间间隔，建议不低于 1 分钟
                </p>
              </div>

              {/* Estimated execution info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">预计每日执行次数</span>
                  <span className="text-gray-900">
                    {formData.requestFrequencyUnit === 'seconds' 
                      ? Math.floor(86400 / formData.requestFrequency)
                      : formData.requestFrequencyUnit === 'minutes'
                      ? Math.floor(1440 / formData.requestFrequency)
                      : Math.floor(24 / formData.requestFrequency)
                    } 次
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {strategy ? '保存更改' : '创建策略'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}