// API基础配置
//export const API_BASE_URL = 'https://alphanow.io';
// 根据环境变量决定使用哪个API地址
// 开发环境默认使用测试地址，生产环境使用正式地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production' ? 'https://alphanow.io' : 'http://170.75.175.152:8755');
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
  entryPrice: number;
  lastPrice: number;
  leverage: number;
  qty: number;
  side: string; // 'Buy' 或 'Sell'
  stopLoss: number;
  symbol: string;
  takeProfit: number;
  unrealisedPnl: number;
  exchange?: string; // 交易所名称
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
  symbol?: string;
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
  avgEntryPrice: number;
  avgExitPrice: number;
  closeChatId: number;
  closeFee: number;
  closeTime: string;
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
}

export interface PageResponse<T> {
  records: T[];
  total: number;
}

/**
 * 获取用户持仓列表
 * @param token 用户token
 * @param symbol 可选的交易对筛选
 * @returns 持仓列表
 */
export async function getPositionList(
  token: string,
  symbol?: string
): Promise<PositionResponse[]> {
  try {
    const url = new URL(`${API_BASE_URL}/alphanow-admin/api/trade/position/list`);
    if (symbol) {
      url.searchParams.append('symbol', symbol);
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
  accType: number; // 账号类型：0=主账号，1=子账号，传0表示不筛选
  exchange: string; // 交易所类型：BYBIT，传空字符串表示不筛选
  search: string; // 搜索关键字，传空字符串表示不搜索
  strategyType: string; // 策略类型，传空字符串表示不筛选
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
 * @returns 交易统计数据
 */
export async function getPanelCloseStatistics(token: string): Promise<PanelCloseStatistics> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/closeStatistics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
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
 * @returns 交易对偏好数据数组
 */
export async function getPanelSymbolLike(token: string): Promise<PanelSymbolLikeRes[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alphanow-admin/api/panel/symbol/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'alphatoken': token,
      },
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
