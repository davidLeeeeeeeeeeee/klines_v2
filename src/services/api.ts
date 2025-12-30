// API基础配置
//export const API_BASE_URL = 'https://alphanow.io';
// 根据环境变量决定使用哪个API地址
// 开发环境默认使用测试地址，生产环境使用正式地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production' ? 'https://alphanow.io' : 'https://test.alphanow.io');
// 通用API响应包装类型
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  description: string;
  data: T;
  requestId: string;
}

// 请求接口类型定义
export interface LoginRequest {
  username: string;
  password: string;
}

// 响应接口类型定义
export interface LoginResponse {
  equity: number;
  id: number;
  token: string;
  username: string;
  userType: number; // 用户类型：0=管理员，1=普通用户
}

export interface UserInfoResponse {
  equity: number;
  id: number;
  token: string;
  userType: number; // 用户类型：0=管理员，1=普通用户
  username: string;
}

// API错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 用户登录
 * @param request 登录请求参数
 * @returns 登录响应数据
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('登录请求:', request);
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('登录响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `登录失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<LoginResponse> = await response.json();
    console.log('登录完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '登录失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    console.log('登录响应数据:', apiResponse.data);
    console.log('Token字段:', apiResponse.data.token);

    // 返回data字段中的实际数据
    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 用户登出
 * @param token 用户token
 * @returns 是否成功登出
 */
/**
 * Get current user info after login.
 * @param token user token
 * @returns user info response data
 */
export async function getCurrentUserInfo(token: string): Promise<UserInfoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/user/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.description || errorData.message || `Failed to fetch user info: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<UserInfoResponse> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      const errorMessage = apiResponse.description || 'Failed to fetch user info';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch user info'
    );
  }
}


export async function logout(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `登出失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<boolean> = await response.json();
    console.log('登出响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '登出失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data === true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// 持仓相关接口类型定义
export interface PositionResponse {
  accountId: number;
  accountName: string;
  userId: number; // 账户UID
  entryPrice: number;
  lastPrice: number;
  leverage: number;
  qty: number;
  side: string; // 'Buy' 或 'Sell'
  stopLoss: number;
  symbol: string;
  takeProfit: number;
  unrealisedPnl: number;
  curRealisedPnl: number; // 已结盈亏
  breakEvenPoint: number; // 盈亏平衡价
  marginPlRatio: number; // 保证金盈亏比率
  exchange?: string; // 交易所名称
  strategyType?: string; // 策略类型
  createdTime?: string; // 创建时间
  takeProfitRatio?: number; // 止盈收益率
  stopLossRatio?: number; // 止损收益率
}

export interface PositionChatRequest {
  accountId: number;
  side: string;
  symbol: string;
}

export interface ChatResponse {
  createTime: string;
  id: number;
  model: string;
  prompt: string;
  response: string;
  strategyType: string;
  updateTime: string;
  symbol?: string; // 交易对
  side?: string; // 方向: 'Buy', 'Sell', 'Wait'
}

// 对话列表请求参数
export interface ChatListReq {
  endTime?: string;
  model?: string;
  side?: string;
  startTime?: string;
  strategyType?: string;
  symbol?: string;
}

// 对话列表响应数据
export interface ChatResVO {
  createTime: string;
  id: number;
  model: string;
  prompt: string;
  response: string;
  side: string;
  strategyType: string;
  symbol: string;
  updateTime: string;
}

// 平仓订单记录相关类型
export interface ClosePnlListReq {
  accountId?: number;
  exchange?: string;
  side?: string;
  strategyType?: string;
  symbol?: string;
  closeType?: string; // 平仓类型: MANUAL(手动平仓), PROFIT_LOSS(止盈止损), STRATEGY(策略平仓)
}

// 一键平仓请求参数
export interface ClosePositionReq {
  accountId?: number;
  closeSide?: string; // 'Buy' 或 'Sell'，不传表示全部平仓
  symbol?: string;
}

export interface PageRequest<T> {
  page: number;
  pageSize: number;
  param: T;
}

export interface ClosePnlVO {
  accountId: number;
  accountUid: string; // 账户UID
  accountName: string; // 账户名称
  avgEntryPrice: number;
  avgExitPrice: number;
  closeChatId: number;
  closeFee: number;
  closeTime: string;
  closeType: string; // 成交类型: MANUAL(手动平仓), PROFIT_LOSS(止盈止损), STRATEGY(策略平仓)
  closedPnl: number;
  closedQty: number;
  createTime: string;
  exchange: string;
  id: number;
  leverage: number;
  openChatId: number;
  openFee: number;
  openTime: string;
  orderCreateTime: number;
  orderId: string;
  qty: number;
  side: string;
  strategyType: string;
  symbol: string;
  updateTime: string;
  userId: number;
  fundingFee?: number; // 资金费
  marginPlRatio?: number; // 保证金盈亏比率
  maxProfit?: number; // 最大浮盈
  maxProfitRate?: number; // 最大浮盈率
  maxLoss?: number; // 最大浮亏
  maxLossRate?: number; // 最大浮亏率
}

export interface PageResponse<T> {
  records: T[];
  total: number;
}

/**
 * 获取用户持仓列表
 * @param token 用户token
 * @param symbol 可选的交易对筛选
 * @param strategyType 可选的策略类型筛选
 * @returns 持仓列表
 */
export async function getPositionList(
  token: string,
  symbol?: string,
  strategyType?: string
): Promise<PositionResponse[]> {
  try {
    const url = new URL(`${API_BASE_URL}/alphanow-admin/api/trade/position/list`);
    if (symbol) {
      url.searchParams.append('symbol', symbol);
    }
    if (strategyType) {
      url.searchParams.append('strategyType', strategyType);
    }

    console.log('获取持仓列表 - Token:', token);
    console.log('获取持仓列表 - URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    console.log('持仓列表响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `获取持仓列表失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<PositionResponse[]> = await response.json();
    console.log('持仓列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取持仓列表失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取持仓对应的AI Chat
 * @param token 用户token
 * @param request 持仓chat请求参数
 * @returns Chat响应数据
 */
export async function getPositionChat(
  token: string,
  request: PositionChatRequest
): Promise<ChatResponse> {
  try {
    console.log('获取AI Chat - Token:', token);
    console.log('获取AI Chat - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/trade/position/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('AI Chat响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `获取AI Chat失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<ChatResponse> = await response.json();
    console.log('AI Chat完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取AI Chat失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取平仓订单记录（分页）
 * @param token 用户token
 * @param request 分页请求参数
 * @returns 分页响应数据
 */
export async function getClosedPositionList(
  token: string,
  request: PageRequest<ClosePnlListReq>
): Promise<PageResponse<ClosePnlVO>> {
  try {
    console.log('获取平仓订单列表 - Token:', token);
    console.log('获取平仓订单列表 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/trade/position/close/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || `HTTP错误: ${response.status}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<PageResponse<ClosePnlVO>> = await response.json();
    console.log('平仓订单列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取平仓订单列表失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取平仓订单列表失败'
    );
  }
}

/**
 * 获取对话记录详情
 * @param token 用户token
 * @param chatId 对话ID
 * @returns Chat响应数据
 */
export async function getChatDetail(
  token: string,
  chatId: number
): Promise<ChatResponse> {
  try {
    console.log('获取对话详情 - Token:', token);
    console.log('获取对话详情 - ChatID:', chatId);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/chat/detail?chatId=${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || `HTTP错误: ${response.status}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<ChatResponse> = await response.json();
    console.log('对话详情完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取对话详情失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取对话详情失败'
    );
  }
}

/**
 * 获取对话列表（分页）
 * @param token 用户token
 * @param request 分页请求参数
 * @returns 分页响应数据
 */
export async function getChatList(
  token: string,
  request: PageRequest<ChatListReq>
): Promise<PageResponse<ChatResVO>> {
  try {
    console.log('获取对话列表 - Token:', token);
    console.log('获取对话列表 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/chat/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || `HTTP错误: ${response.status}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<PageResponse<ChatResVO>> = await response.json();
    console.log('对话列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取对话列表失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取对话列表失败'
    );
  }
}

// 账户管理相关接口类型定义
export interface AccountListReq {
  accType?: number; // 账号类型：0=主账号，1=子账号，不传表示全部
  exchange: string; // 交易所类型：BYBIT，传空字符串表示不筛选
  search: string; // 搜索关键字，传空字符串表示不搜索
  strategyType?: string; // 策略类型，不传表示全部，传空字符串表示未跟随，传具体名称表示筛选该策略
}

export interface AccountRes {
  accType: number; // 账号类型：0=主账号，1=子账号
  createTime: string; // 创建时间
  equity: number; // 净值
  exchange: string; // 交易所
  id: number; // 本地账户ID
  init: boolean; // 初始化状态
  initEquity: number; // 初始净值
  mainAccId: number; // 主账号ID，主账号该值为0
  mainAccName: string; // 主账号名，主账号该值为空
  mainAccUid: string; // 主账号UID，主账号该值为空
  name: string; // 账户名
  profitRate: number; // 收益率（百分比）
  strategyType: string; // 策略类型
  strategyTypeName: string; // 策略类型(名)
  subAccCount: number; // 子账户数 (当前为主账户时展示)
  uid: string; // 交易所账户ID
  updateTime: string; // 更新时间
}

// 创建主账号请求参数
export interface AccountCreateReq {
  accType: number; // 账号类型：0=主账号，1=子账号
  apiKey: string; // KEY
  apiPassphrase: string; // 密码（可选）
  apiSecret: string; // SECRET
  exchange: string; // 交易所类型：BYBIT
  mainAccId: number; // 主账号ID，主账号该值为-1
  name: string; // 账户名
  strategyType: string; // 策略类型（可选）
}

// 编辑账号请求参数
export interface AccountModifyReq {
  id: number; // 账户ID
  name: string; // 账户名
}

// 账号资金转移请求参数
export interface AccountTransferReq {
  amount: number; // 转移金额
  fromAccountId: number; // 转出账户ID
  toAccountId: number; // 转入账户ID
}

// 通用ID请求参数
export interface CommonIdRequest {
  id: number; // ID
  name?: string; // name（可选）
}

// 账户策略绑定请求参数
export interface StrategyModelBindReq {
  accountId: number; // 账户ID
  strategyModelName: string; // 策略名
}

// Bybit创建子账户请求参数
export interface BybitAccountInitReq {
  mainAccId: number; // 主账号数据库ID
  num: number; // 子账户数量
  subBalance: number; // 子账户余额(整数)
  subPrefix: string; // 子账户前缀(需4字符以上)
}

// Bybit 价格接口类型
export interface BybitTickerItem {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
}

export interface BybitTickerResponse {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: BybitTickerItem[];
  };
  time: number;
}

export interface CryptoPrice {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

/**
 * 从 Bybit 获取所有交易对的实时价格
 * @returns 价格数据数组
 */
export async function getBybitPrices(): Promise<BybitTickerResponse> {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=linear',
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new ApiError(
        `获取 Bybit 价格失败: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取 Bybit 价格失败'
    );
  }
}

/**
 * 从 Bybit 获取指定交易对的实时价格
 * @param symbols 交易对数组，例如 ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
 * @returns 价格数据数组
 */
export async function getCryptoPrices(symbols: string[]): Promise<CryptoPrice[]> {
  try {
    const allPrices = await getBybitPrices();

    if (allPrices.retCode !== 0) {
      throw new ApiError(`Bybit API 错误: ${allPrices.retMsg}`);
    }

    // 从所有价格中筛选出需要的交易对
    const filteredPrices = allPrices.result.list
      .filter(item => symbols.includes(item.symbol))
      .map(item => ({
        symbol: item.symbol,
        price: item.lastPrice,
        priceChangePercent: item.price24hPcnt,
      }));

    return filteredPrices;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取加密货币价格失败'
    );
  }
}

/**
 * 获取账户列表
 * @param token 用户token
 * @param request 账户列表请求参数
 * @returns 账户列表
 */
export async function getAccountList(
  token: string,
  request: AccountListReq
): Promise<AccountRes[]> {
  try {
    console.log('获取账户列表 - Token:', token);
    console.log('获取账户列表 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('账户列表响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `获取账户列表失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<AccountRes[]> = await response.json();
    console.log('账户列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '获取账户列表失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    // 如果 data 为 null，返回空数组
    return apiResponse.data || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 创建主账号
 * @param token 用户token
 * @param request 创建主账号请求参数
 * @returns 创建结果
 */
export async function createMainAccount(
  token: string,
  request: AccountCreateReq
): Promise<void> {
  try {
    console.log('创建主账号 - Token:', token);
    console.log('创建主账号 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/main/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('创建主账号响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `创建主账号失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<any> = await response.json();
    console.log('创建主账号完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '创建主账号失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 编辑账号
 * @param token 用户token
 * @param request 编辑账号请求参数
 * @returns 编辑结果
 */
export async function modifyAccount(
  token: string,
  request: AccountModifyReq
): Promise<boolean> {
  try {
    console.log('编辑账号 - Token:', token);
    console.log('编辑账号 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/modify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('编辑账号响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `编辑账号失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const result: boolean = await response.json();
    console.log('编辑账号完整响应:', result);

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 账号内互转
 * @param token 用户token
 * @param request 账号资金转移请求参数
 * @returns 转移结果
 */
export async function transferAccount(
  token: string,
  request: AccountTransferReq
): Promise<boolean> {
  try {
    console.log('账号资金转移 - Token:', token);
    console.log('账号资金转移 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('账号资金转移响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `资金转移失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const result: boolean = await response.json();
    console.log('账号资金转移完整响应:', result);

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取账号详情
 * @param token 用户token
 * @param request 通用ID请求参数
 * @returns 账号详情
 */
export async function getAccountDetail(
  token: string,
  request: CommonIdRequest
): Promise<AccountRes> {
  try {
    console.log('获取账号详情 - Token:', token);
    console.log('获取账号详情 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('获取账号详情响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取账号详情失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<AccountRes> = await response.json();
    console.log('获取账号详情完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取账号详情失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(errorMessage, response.status, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 账号绑定策略
 * @param token 用户token
 * @param request 账户策略绑定请求参数
 * @returns 绑定结果
 */
export async function bindAccountStrategy(
  token: string,
  request: StrategyModelBindReq
): Promise<boolean> {
  try {
    console.log('账号绑定策略 - Token:', token);
    console.log('账号绑定策略 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/strategy/model/bind`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('账号绑定策略 - 响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `绑定策略失败: ${response.statusText}`;
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<boolean> = await response.json();
    console.log('账号绑定策略完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '绑定策略失败';
      throw new ApiError(errorMessage, response.status, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * Bybit创建子账户
 * @param token 用户token
 * @param request Bybit创建子账户请求参数
 * @returns 创建的子账户数量
 */
export async function createBybitSubAccounts(
  token: string,
  request: BybitAccountInitReq
): Promise<number> {
  try {
    console.log('Bybit创建子账户 - Token:', token);
    console.log('Bybit创建子账户 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/account/bybit/sub/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('Bybit创建子账户响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `创建子账户失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<number> = await response.json();
    console.log('Bybit创建子账户完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '创建子账户失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 一键平仓(全部)
 * @param token 用户token
 * @param request 一键平仓请求参数
 * @returns 是否成功
 */
export async function closeAllPositions(
  token: string,
  request: ClosePositionReq
): Promise<boolean> {
  try {
    console.log('一键平仓 - Token:', token);
    console.log('一键平仓 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/trade/position/close/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('一键平仓响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `一键平仓失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<boolean> = await response.json();
    console.log('一键平仓完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '一键平仓失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data === true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 一键平仓(单个)
 * @param token 用户token
 * @param request 一键平仓请求参数
 * @returns 是否成功
 */
export async function closeOnePosition(
  token: string,
  request: ClosePositionReq
): Promise<boolean> {
  try {
    console.log('单个平仓 - Token:', token);
    console.log('单个平仓 - 请求参数:', request);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/trade/position/close/one`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(request),
    });

    console.log('单个平仓响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 构建详细的错误信息
      let errorMessage = errorData.description || errorData.message || `单个平仓失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      console.log('HTTP 错误响应:', errorData);
      console.log('构建的错误信息:', errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<boolean> = await response.json();
    console.log('单个平仓完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      // 构建详细的错误信息
      let errorMessage = apiResponse.description || '单个平仓失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data === true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// ==================== 仪表盘相关接口 ====================

// 通用时间请求体
export interface CommonTimeReq {
  startTime?: string; // ISO 8601 格式的日期时间字符串
  endTime?: string;   // ISO 8601 格式的日期时间字符串
}

// 顶部总览响应
export interface PanelOverviewRes {
  equity: number;           // 总净值
  initEquity: number;       // 初始净值
  totalClosePnl: number;    // 总平仓盈亏
  unrealisedPnl: number;    // 持仓浮动盈亏
  userId: number;           // 用户ID
}

// 交易统计响应
export interface PanelCloseStatistics {
  lossAmount: number;       // 亏损金额
  lossCount: number;        // 亏损交易数
  maxDrawdownRate: number;  // 最大回撤(比例)
  positionCount: number;    // 仓位总数
  totalFee: number;         // 总手续费
  totalTradeAmount: number; // 总交易金额
  userId: number;           // 用户ID
  winAmount: number;        // 盈利金额
  winCount: number;         // 盈利交易数
}

// 策略排名响应
export interface PanelStrategyRankingRes {
  strategyType: string;     // 策略类型
  totalClosePnl: number;    // 总平仓盈亏
}

// 交易对偏好响应
export interface PanelSymbolLikeRes {
  symbol: string;           // 交易对
  tradeCount: number;       // 交易次数
}

// 交易对排名响应
export interface PanelSymbolRankingRes {
  symbol: string;           // 交易对
  totalClosePnl: number;    // 总平仓盈亏
}

/**
 * 获取仪表盘顶部总览数据
 * @param token 用户token
 * @returns 总览数据
 */
export async function getPanelOverview(token: string): Promise<PanelOverviewRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取总览数据失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelOverviewRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取总览数据失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取交易统计数据
 * @param token 用户token
 * @param params 可选的时间范围参数
 * @returns 交易统计数据
 */
export async function getPanelCloseStatistics(token: string, params?: { startTime?: string; endTime?: string }): Promise<PanelCloseStatistics> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/closeStatistics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取交易统计失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelCloseStatistics> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取交易统计失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取策略排名数据
 * @param token 用户token
 * @param timeReq 时间范围请求参数
 * @returns 策略排名数据数组
 */
export async function getPanelStrategyRanking(
  token: string,
  timeReq?: CommonTimeReq
): Promise<PanelStrategyRankingRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(timeReq || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取策略排名失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelStrategyRankingRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取策略排名失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取交易对偏好数据
 * @param token 用户token
 * @param params 可选的时间范围参数
 * @returns 交易对偏好数据数组
 */
export async function getPanelSymbolLike(token: string, params?: { startTime?: string; endTime?: string }): Promise<PanelSymbolLikeRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/symbol/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取交易对偏好失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelSymbolLikeRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取交易对偏好失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取交易对排名数据
 * @param token 用户token
 * @param timeReq 时间范围请求参数
 * @returns 交易对排名数据数组
 */
export async function getPanelSymbolRanking(
  token: string,
  timeReq?: CommonTimeReq
): Promise<PanelSymbolRankingRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/symbol/ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify(timeReq || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取交易对排名失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelSymbolRankingRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取交易对排名失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// ==================== 收益率曲线图 API ====================

/**
 * 历史收益率曲线图响应
 */
export interface HistoryLine {
  createTime: string;
  id: number;
  lineX: string[];  // X轴数据（时间）
  lineY: number[];  // Y轴数据（收益率）
  updateTime: string;
}

/**
 * 获取历史收益率曲线图数据
 * @param token 认证令牌
 * @param startTime 开始时间 (格式: YYYY-MM-DD HH:mm:ss)
 * @param endTime 结束时间 (格式: YYYY-MM-DD HH:mm:ss)
 * @returns 历史收益率曲线图数据
 */
export async function getPanelHistoryEquityLine(
  token: string,
  startTime: string,
  endTime: string
): Promise<HistoryLine> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/history/equity/line`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({
        startTime,
        endTime
      })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<HistoryLine> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取历史收益率曲线图失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// ==================== 策略模型相关接口 ====================

/**
 * 策略模型请求参数
 */
export interface StrategyModelReq {
  aiModel: string;              // 策略模型
  description: string;          // 策略描述
  frequency: number;            // 执行频率(分钟)
  indicators: string[];         // 技术指标列表
  intervals: string[];          // K线时间周期列表
  klineNum: number;             // K线数量
  name: string;                 // 策略名称
  needPosition: boolean;        // 是否提供持仓数据
  riskLevel: string;            // 风险等级
  symbols: string[];            // 币种列表
  systemPrompt: string;         // 系统提示词
  tag: string;                  // 标签
}

/**
 * 策略模型列表响应
 */
export interface StrategyModelOverview {
  totalClosePnl: number | null;      // 总盈亏
  followAccountNum: number | null;   // 跟随账户数
  totalFund: number | null;          // 总资金
  winCount: number | null;           // 盈利交易数
  winAmount: number | null;          // 盈利金额
  lossCount: number | null;          // 亏损交易数
  lossAmount: number | null;         // 亏损金额
}

export interface StrategyModelListRes {
  description: string;          // 策略描述
  id: number;                   // 策略模型id
  name: string;                 // 策略名称
  riskLevel: string;            // 风险等级
  runDays: number | null;       // 运行天数
  status: number;               // 策略运行状态：-1=停止, 0=暂停, 1=运行中
  tag: string;                  // 标签
  overview: StrategyModelOverview | null; // 统计概览
  aiModel: string | null;       // AI模型
}

/**
 * 策略模型历史版本
 */
export interface StrategyModelSimpleHistoryRes {
  createTime: string;           // 创建时间
  id: number;                   // 策略模型id
  version: number;              // 版本
}

/**
 * 策略模型详情响应
 */
export interface StrategyModelDetailRes {
  aiModel: string | null;       // 策略模型
  createTime: string | null;    // 创建时间
  description: string | null;   // 策略描述
  frequency: number | null;     // 执行频率(分钟)
  historyList: StrategyModelSimpleHistoryRes[] | null; // 历史版本
  indicators: string[] | null;  // 技术指标列表
  intervals: string[] | null;   // K线时间周期列表
  klineNum: number | null;      // K线数量
  name: string | null;          // 策略名称
  needPosition: boolean | null; // 是否提供持仓数据
  riskLevel: string | null;     // 风险等级
  status: boolean | null;       // 是否启用
  symbols: string[] | null;     // 币种列表
  systemPrompt: string | null;  // 系统提示词
  tag: string | null;           // 标签
  version: number | null;       // 版本
}

/**
 * 策略模型预览响应
 */
export interface StrategyModelPreviewRes {
  aiOutput: any;                // AI输出（JSON对象）
  name: string;                 // 策略模型名称
  systemPrompt: string;         // 系统提示词
  userPrompt: any;              // 用户提示词（JSON对象）
}

/**
 * 创建策略模型
 * @param token 认证令牌
 * @param request 策略模型参数
 * @returns 是否创建成功
 */
export async function createStrategyModel(
  token: string,
  request: StrategyModelReq
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<boolean> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '创建策略模型失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取策略模型列表
 * @param token 认证令牌
 * @returns 策略模型列表
 */
export async function getStrategyModelList(
  token: string
): Promise<StrategyModelListRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      }
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategyModelListRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取策略模型列表失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 获取策略模型详情
 * @param token 认证令牌
 * @param id 策略模型ID
 * @param version 版本号（可选）
 * @returns 策略模型详情
 */
export async function getStrategyModelDetail(
  token: string,
  id: number,
  version?: number
): Promise<StrategyModelDetailRes> {
  try {
    const requestBody: { id: number; version?: number } = { id };
    if (version !== undefined) {
      requestBody.version = version;
    }

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategyModelDetailRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取策略模型详情失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 更新策略模型
 * @param token 认证令牌
 * @param request 策略模型参数
 * @returns 是否更新成功
 */
export async function upgradeStrategyModel(
  token: string,
  request: StrategyModelReq
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<boolean> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '更新策略模型失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 切换策略模型状态
 * @param token 认证令牌
 * @param id 策略模型ID
 * @returns 是否切换成功
 */
export async function switchStrategyModelStatus(
  token: string,
  id: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/status/switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<boolean> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '切换策略模型状态失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

/**
 * 预览策略模型
 * @param token 认证令牌
 * @param request 策略模型参数
 * @param timeoutMs 超时时间（毫秒），默认 300000 (300秒)
 * @returns 策略模型预览数据
 */
export async function previewStrategyModel(
  token: string,
  request: StrategyModelReq,
  timeoutMs: number = 300000
): Promise<StrategyModelPreviewRes> {
  try {
    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/root/strategy/model/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'alphatoken': token
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`HTTP错误: ${response.status}`, response.status);
      }

      const apiResponse: ApiResponse<StrategyModelPreviewRes> = await response.json();

      if (!apiResponse.success || apiResponse.code !== 200) {
        let errorMessage = apiResponse.description || '预览策略模型失败';
        throw new ApiError(errorMessage, apiResponse.code, apiResponse);
      }

      return apiResponse.data;
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(`请求超时（${timeoutMs / 1000}秒），请稍后重试`);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// ==================== 系统字典 API ====================

/**
 * 字典项
 */
export interface DictItem {
  name: string;
  code: string;
  message: string;
}

/**
 * 系统字典响应数据
 */
export interface SystemDictData {
  AppConfigType: DictItem[];
  AiModel: DictItem[];
  OrderCloseType: DictItem[];
  SideType: DictItem[];
  SymbolType: DictItem[];
  RiskLevel: DictItem[];
  AccountType: DictItem[];
  UserType: DictItem[];
  StrategyModel: DictItem[];
  Indicator: DictItem[];
  ExchangeType: DictItem[];
  Interval: DictItem[];
  StrategyStatus: DictItem[];
}

/**
 * 获取系统字典
 * @returns 系统字典数据
 */
export async function getSystemDict(): Promise<SystemDictData> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/system/dict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<SystemDictData> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取系统字典失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取系统字典失败'
    );
  }
}


// ==================== 每日盈亏 API ====================

/**
 * 历史线图数据（用于每日盈亏）
 */
export interface HistoryLineRes {
  lineX: string[];  // X轴数据（日期）
  lineY: number[];  // Y轴数据（数值）
}

/**
 * 每日盈亏响应
 */
export interface PanelDailyProfitLossRes {
  amount: HistoryLineRes;  // 收益额
  rate: HistoryLineRes;    // 收益率
}

/**
 * 获取每日盈亏数据
 * @param token 用户token
 * @returns 每日盈亏数据
 */
export async function getPanelDailyProfitLoss(token: string): Promise<PanelDailyProfitLossRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/history/dailyProfitLoss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取每日盈亏失败: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const apiResponse: ApiResponse<PanelDailyProfitLossRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取每日盈亏失败';
      throw new ApiError(errorMessage, apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    );
  }
}

// ==================== 策略表现页面 API ====================

/**
 * 策略顶部总览响应
 */
export interface StrategyPanelOverviewRes {
  followAccountNum: number | null;  // 跟随账户数
  lossAmount: number | null;        // 亏损金额
  lossCount: number | null;         // 亏损交易数
  totalClosePnl: number | null;     // 总收益额
  totalFund: number | null;         // 资金规模
  winAmount: number | null;         // 盈利金额
  winCount: number | null;          // 盈利交易数
}

/**
 * 策略交易统计响应
 */
export interface StrategyCloseStatisticsRes {
  lossAmount: number | null;        // 亏损金额
  lossCount: number | null;         // 亏损交易数
  maxDrawdownRate: number | null;   // 最大回撤(比例)
  positionCount: number | null;     // 仓位总数
  totalFee: number | null;          // 总手续费
  totalTradeAmount: number | null;  // 总交易金额
  userId: number | null;            // 用户ID
  winAmount: number | null;         // 盈利金额
  winCount: number | null;          // 盈利交易数
}

/**
 * 策略交易对偏好响应
 */
export interface StrategySymbolLikeRes {
  symbol: string;                   // 交易对
  tradeCount: number;               // 交易数
}

/**
 * 策略交易对排名响应
 */
export interface StrategySymbolRankingRes {
  symbol: string;                   // 交易对
  totalClosePnl: number;            // 总盈亏
}

/**
 * 获取策略顶部总览
 */
export async function getStrategyPanelOverview(
  token: string,
  strategyType: string
): Promise<StrategyPanelOverviewRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/overview?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      }
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategyPanelOverviewRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取策略总览失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

/**
 * 获取策略交易统计
 */
export async function getStrategyCloseStatistics(
  token: string,
  strategyType: string,
  params?: { startTime?: string; endTime?: string }
): Promise<StrategyCloseStatisticsRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/closeStatistics?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ ...params, strategyType })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategyCloseStatisticsRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取交易统计失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

/**
 * 获取策略每日盈亏
 */
export async function getStrategyDailyProfitLoss(
  token: string,
  strategyType: string,
  params?: { startTime?: string; endTime?: string }
): Promise<PanelDailyProfitLossRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/history/dailyProfitLoss?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ ...params, strategyType })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<PanelDailyProfitLossRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取每日盈亏失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

/**
 * 获取策略历史净值折线图
 */
export async function getStrategyHistoryEquityLine(
  token: string,
  strategyType: string,
  startTime?: string,
  endTime?: string
): Promise<HistoryLineRes> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/history/equity/line?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ startTime, endTime, strategyType })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<HistoryLineRes> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取净值曲线失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

/**
 * 获取策略交易对偏好
 */
export async function getStrategySymbolLike(
  token: string,
  strategyType: string,
  params?: { startTime?: string; endTime?: string }
): Promise<StrategySymbolLikeRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/symbol/like?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ ...params, strategyType })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategySymbolLikeRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取交易对偏好失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

/**
 * 获取策略交易对排名
 */
export async function getStrategySymbolRanking(
  token: string,
  strategyType: string,
  params?: { startTime?: string; endTime?: string }
): Promise<StrategySymbolRankingRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/strategy/symbol/ranking?strategyType=${encodeURIComponent(strategyType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token
      },
      body: JSON.stringify({ ...params, strategyType })
    });

    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status}`, response.status);
    }

    const apiResponse: ApiResponse<StrategySymbolRankingRes[]> = await response.json();

    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(apiResponse.description || '获取交易对排名失败', apiResponse.code, apiResponse);
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : '网络请求失败');
  }
}

// 策略操作实例响应类型
export interface StrategyInstanceRes {
  accountId: number;
  chatId: number;
  confidence: number;
  createTime: string;
  entryPrice: number | null;
  failureReason: string | null;
  id: number;
  isSuccess: boolean;
  orderId: string | null;
  qty: number | null;
  side: string;
  status: boolean;
  stopLoss: number | null;
  strategyId: number;
  strategyType: string;
  suggestEntryPrice: number | null;
  symbol: string;
  takeProfit: number | null;
  updateTime: string;
  userId: number;
}

/**
 * 获取仓位操作实例列表
 * @param token 用户token
 * @param id 平仓记录ID
 * @returns 策略实例列表
 */
export async function getPositionStrategyInstance(
  token: string,
  id: number
): Promise<StrategyInstanceRes[]> {
  try {
    console.log('获取策略操作实例 - Token:', token);
    console.log('获取策略操作实例 - ID:', id);

    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/trade/position/strategy/instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
      body: JSON.stringify({ id }),
    });

    console.log('策略操作实例响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.description || errorData.message || `获取策略操作实例失败: ${response.statusText}`;
      if (errorData.data && typeof errorData.data === 'string') {
        errorMessage += `: ${errorData.data}`;
      }
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<StrategyInstanceRes[]> = await response.json();
    console.log('策略操作实例完整响应:', apiResponse);

    if (!apiResponse.success || apiResponse.code !== 200) {
      let errorMessage = apiResponse.description || '获取策略操作实例失败';
      if (apiResponse.data && typeof apiResponse.data === 'string') {
        errorMessage += `: ${apiResponse.data}`;
      }
      throw new ApiError(
        errorMessage,
        apiResponse.code,
        apiResponse
      );
    }

    return apiResponse.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取策略操作实例失败'
    );
  }
}