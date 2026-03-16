---
name: AlphaNow 项目总览
description: AlphaNow AI量化交易管理平台的项目架构、技术栈、开发规范和API约定
---

# AlphaNow - AI量化交易管理平台

## 项目概述

AlphaNow 是一个面向 AI 量化交易的前端管理平台，用于管理交易账户、监控持仓、配置策略、查看 AI 对话记录等。

- **产品名称**: AlphaNow
- **定位**: AI 量化交易管理后台
- **目标用户**: 量化交易团队（管理员 + 普通用户）
- **线上环境**: `https://alphanow.io`（正式）/ `https://test.alphanow.io`（测试）

---

## 技术栈

| 类别       | 技术                                         |
| ---------- | -------------------------------------------- |
| 框架       | React 18 + TypeScript                        |
| 构建工具   | Vite 6 (SWC 编译)                            |
| UI 组件库  | Radix UI + shadcn/ui 组件 (48个)             |
| 图表       | Recharts                                     |
| 样式       | CSS (index.css) + Tailwind CSS 工具类 (clsx, tailwind-merge, class-variance-authority) |
| 表单       | react-hook-form                              |
| 通知       | Sonner (toast)                               |
| 新闻服务   | Express.js (server/ 目录, 轮询 CryptoCompare API) |

---

## 目录结构

```
klines_v2/
├── src/
│   ├── App.tsx              # 入口组件，路由分发（URL参数模式）
│   ├── main.tsx             # 挂载点
│   ├── index.css            # 全局样式（约50KB，含所有自定义样式）
│   ├── components/          # 业务组件（28个 .tsx 文件）
│   │   ├── ui/              # shadcn/ui 基础组件（48个）
│   │   ├── figma/           # Figma 导出组件
│   │   ├── LoginPage.tsx
│   │   ├── MainLayout.tsx   # 主布局（侧边栏 + 内容区）
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── AccountMonitor.tsx    # 账户监控（最大组件，~92KB）
│   │   ├── TradingAccounts.tsx   # 交易账户管理
│   │   ├── StrategyList.tsx      # 策略列表
│   │   ├── StrategyDetail.tsx    # 策略详情
│   │   ├── StrategyMonitor.tsx   # 策略监控
│   │   ├── StrategyConfigPage.tsx # 策略配置
│   │   ├── StrategyConfigList.tsx # 策略配置列表
│   │   ├── OperationInstance.tsx  # 操作实例详情
│   │   ├── RiskManagement.tsx    # 风控管理
│   │   ├── FundManagement.tsx    # 资金管理
│   │   ├── FundTransfer.tsx      # 资金划转
│   │   ├── AIChatModal.tsx       # AI对话弹窗
│   │   ├── JsonViewer.tsx        # JSON查看器
│   │   └── ...               # 用户管理、密码修改等页面
│   ├── services/
│   │   └── api.ts           # 所有后端 API 调用（单文件，~80KB，2770行）
│   ├── hooks/
│   │   └── useClickOutside.ts
│   ├── utils/
│   │   ├── storage.ts       # localStorage 封装（用户信息、Token管理）
│   │   └── format.ts        # 数字/货币格式化工具
│   └── styles/
│       └── globals.css      # 全局CSS变量定义
├── server/                  # 新闻服务（Express, CryptoCompare API 轮询）
│   ├── server.js
│   └── .env
├── public/                  # 静态资源
├── .env.development         # 开发环境API: https://test.alphanow.io
├── .env.test                # 测试环境API: https://test.alphanow.io
├── .env.production          # 正式环境API: https://alphanow.io
├── vite.config.ts           # Vite配置（含大量版本别名）
├── package.json
├── BUILD_GUIDE.md           # 构建指南
└── ACCOUNT_API_SUMMARY.md   # 账户API集成文档
```

---

## 路由机制

**不使用 react-router**，而是通过 URL 查询参数 (`?page=xxx`) 进行路由分发：
- 主布局由 `MainLayout.tsx` 管理侧边栏导航
- 独立标签页通过 `window.open()` 新开窗口，使用 `?page=xxx&param1=yyy` 传参
- `App.tsx` 中 `renderStandalonePage()` 根据 `page` 参数渲染对应组件

支持的独立页面路由：
| page 参数               | 组件                         |
| ----------------------- | ---------------------------- |
| `instance`              | OperationInstance            |
| `strategy-detail`       | StrategyDetail               |
| `strategy-config`       | StrategyConfigPage           |
| `profile`               | ProfilePage                  |
| `change-password`       | ChangePasswordPage           |
| `user-create`           | CreateUserPage               |
| `trading-account-create`| CreateTradingAccountPage     |
| `trading-account-init`  | InitAccountPage              |
| `trading-account-edit`  | EditTradingAccountPage       |
| `fund-transfer`         | FundTransfer                 |

---

## API 约定

### 基础配置
- **基础路径前缀**: `/alphanow-admin/api/`
- **请求方式**: 几乎全部为 `POST`（包括查询类接口）
- **认证方式**: 同时在 Header 中传 `Authorization: Bearer {token}` 和 `alphatoken: {token}`

### 统一响应格式
```typescript
interface ApiResponse<T> {
  code: number;       // 200 = 成功
  success: boolean;
  description: string;
  data: T;
  requestId: string;
}
```

### 分页请求/响应
```typescript
// 请求
interface PageRequest<T> {
  page: number;
  pageSize: number;
  param: T;
}
// 响应
interface PageResponse<T> {
  records: T[];
  total: number;
}
```

### 登录超时 (Session Expired)
- 条件: HTTP 500 + code 3004 + data 包含 "登录已失效"
- 处理: 清除 localStorage 并跳转到登录页面，通过回调函数 `onSessionExpired` 由 `App.tsx` 设置

### 错误处理模式
所有 API 函数遵循统一的错误处理模式：
```typescript
export async function someApiCall(token: string, ...): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      await handleResponseError(response, '默认错误消息');
    }

    const apiResponse: ApiResponse<T> = await response.json();
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细错误信息
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }
    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || '网络请求失败');
  }
}
```

### 主要 API 模块
| 模块     | 路径前缀                          | 功能                       |
| -------- | --------------------------------- | -------------------------- |
| 用户     | `/api/user/`                      | 登录、登出、用户信息       |
| 交易     | `/api/trade/position/`            | 持仓列表、AI对话、平仓记录 |
| 账户     | `/api/account/`                   | 账户列表、创建、编辑、划转 |
| 对话     | `/api/chat/`                      | 对话详情、对话列表         |
| 策略     | `/api/strategy/`                  | 策略管理相关               |
| 市场数据 | Bybit 公开 API (v5/market)        | 实时价格                   |

---

## 用户权限体系

| userType | 角色       | 权限范围                               |
| -------- | ---------- | -------------------------------------- |
| 0        | 超级管理员 | 创建/删除用户，管理所有账户和策略       |
| 1        | 普通用户   | 查看自己的数据                         |
| 2        | 团队管理员 | 管理团队内用户                         |

权限检查工具函数位于 `src/utils/storage.ts`：
- `getUserType()`: 获取用户类型
- `isAdmin()`: 判断是否管理员 (userType === 0)

---

## 本地存储 (localStorage)

| Key          | 用途                     |
| ------------ | ------------------------ |
| `user_info`  | JSON格式的用户信息       |
| `auth_token` | 鉴权 Token               |

封装在 `src/utils/storage.ts` 中，提供 `saveUserInfo`, `getUserInfo`, `getToken`, `clearUserInfo`, `isLoggedIn` 等函数。

---

## 开发与构建

### 开发
```bash
npm install
npm run dev          # 启动开发服务器，端口 3000
```

### 构建
```bash
npm run build:test   # 构建测试环境
npm run build:prod   # 构建正式环境
npm run build:all    # 同时构建两个环境并打包为 zip
```

### 新闻服务 (可选)
```bash
cd server
npm install
node server.js       # 启动新闻轮询服务，端口 3000
```
- 轮询 CryptoCompare API，间隔120秒
- 支持按币种查询：BTC, ETH, SOL, BNB, HYPE, XRP, DOGE, ZEC, ADA
- 提供 REST API 和 SSE 推送

---

## 编码规范

1. **语言**: 所有注释和 UI 文本使用中文
2. **组件模式**: 函数组件 + Hooks (useState, useEffect, useRef, useCallback)
3. **样式**: 使用 `index.css` 中的自定义类名 + Tailwind 工具类，不使用 CSS Modules
4. **导入别名**: `@/` 映射到 `src/` 目录
5. **API 调用**: 所有调用集中在 `src/services/api.ts`，不在组件中直接 fetch
6. **状态管理**: 无全局状态管理库，使用组件本地状态 + props 传递
7. **错误处理**: 使用自定义 `ApiError` 类，统一的错误格式
8. **数字格式化**: 使用 `src/utils/format.ts` 中的工具函数
9. **新增组件**: 放在 `src/components/` 下，文件名使用 PascalCase
10. **新增UI组件**: 放在 `src/components/ui/` 下，使用 shadcn/ui 风格
