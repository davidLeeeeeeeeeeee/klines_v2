// API基础配置
export const API_BASE_URL = 'https://alphanow.io';

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
      throw new ApiError(
        errorData.description || errorData.message || `登录失败: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<LoginResponse> = await response.json();
    console.log('登录完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '登录失败',
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
      throw new ApiError(
        errorData.description || errorData.message || `登出失败: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<boolean> = await response.json();
    console.log('登出响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '登出失败',
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
      throw new ApiError(
        errorData.description || errorData.message || `获取持仓列表失败: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<PositionResponse[]> = await response.json();
    console.log('持仓列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '获取持仓列表失败',
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
      throw new ApiError(
        errorData.description || errorData.message || `获取AI Chat失败: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<ChatResponse> = await response.json();
    console.log('AI Chat完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '获取AI Chat失败',
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
      throw new ApiError(
        errorData.description || `HTTP错误: ${response.status}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<PageResponse<ClosePnlVO>> = await response.json();
    console.log('平仓订单列表完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '获取平仓订单列表失败',
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
      throw new ApiError(
        errorData.description || `HTTP错误: ${response.status}`,
        response.status,
        errorData
      );
    }

    const apiResponse: ApiResponse<ChatResponse> = await response.json();
    console.log('对话详情完整响应:', apiResponse);

    // 检查业务状态码
    if (!apiResponse.success || apiResponse.code !== 200) {
      throw new ApiError(
        apiResponse.description || '获取对话详情失败',
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
