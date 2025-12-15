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

// 币安价格接口类型
export interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

/**
 * 从币安获取单个交易对的实时价格
 * @param symbol 交易对，例如 'BTCUSDT'
 * @returns 价格数据
 */
export async function getBinancePrice(symbol: string): Promise<BinanceTickerPrice> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new ApiError(
        `获取币安价格失败: ${response.status} ${response.statusText}`,
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
      error instanceof Error ? error.message : '获取币安价格失败'
    );
  }
}

/**
 * 从币安获取多个交易对的实时价格
 * @param symbols 交易对数组，例如 ['BTCUSDT', 'ETHUSDT']
 * @returns 价格数据数组
 */
export async function getBinancePrices(symbols: string[]): Promise<BinanceTickerPrice[]> {
  try {
    // 并发请求所有交易对的价格
    const promises = symbols.map(symbol => getBinancePrice(symbol));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取币安价格失败'
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
