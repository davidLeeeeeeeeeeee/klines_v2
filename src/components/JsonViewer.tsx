import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
  level?: number;
}

export function JsonViewer({ data, defaultExpanded = false, level = 0 }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // 判断数据类型
  const getType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  // 渲染基本类型值
  const renderPrimitiveValue = (value: any): JSX.Element => {
    const type = getType(value);
    
    if (type === 'null') {
      return <span className="text-gray-400">null</span>;
    }
    if (type === 'boolean') {
      return <span className="text-purple-600">{String(value)}</span>;
    }
    if (type === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    if (type === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    return <span>{String(value)}</span>;
  };

  // 如果是基本类型，直接渲染
  const type = getType(data);
  if (type !== 'object' && type !== 'array') {
    return <div className="ml-4">{renderPrimitiveValue(data)}</div>;
  }

  // 对象或数组
  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((item, index) => [index, item]) : Object.entries(data);
  const isEmpty = entries.length === 0;

  const indent = level * 16; // 每层缩进16px

  return (
    <div style={{ marginLeft: `${indent}px` }}>
      <div className="flex items-start">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
          disabled={isEmpty}
        >
          {isEmpty ? (
            <span className="w-4 h-4" />
          ) : expanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-gray-500">
            {isArray ? '[' : '{'}
            {isEmpty && (isArray ? ']' : '}')}
            {!isEmpty && !expanded && (
              <span className="text-gray-400 ml-1">
                {entries.length} {isArray ? 'items' : 'keys'}
              </span>
            )}
          </span>
        </button>
      </div>

      {expanded && !isEmpty && (
        <div className="mt-1">
          {entries.map(([key, value], index) => {
            const valueType = getType(value);
            const isComplex = valueType === 'object' || valueType === 'array';

            return (
              <div key={key} className="my-1">
                <div className="flex items-start">
                  <span className="text-blue-700 mr-2">
                    {isArray ? `[${key}]` : `"${key}"`}:
                  </span>
                  {!isComplex && renderPrimitiveValue(value)}
                </div>
                {isComplex && (
                  <JsonViewer data={value} defaultExpanded={false} level={level + 1} />
                )}
              </div>
            );
          })}
          <div className="text-gray-500">
            {isArray ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
}

