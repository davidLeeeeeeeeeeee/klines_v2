import { LoginResponse } from '../services/api';

// LocalStorage键名
const USER_INFO_KEY = 'user_info';
const TOKEN_KEY = 'auth_token';

/**
 * 保存用户信息到localStorage
 * @param userInfo 用户信息
 */
export function saveUserInfo(userInfo: LoginResponse): void {
  try {
    console.log('保存用户信息:', userInfo);
    console.log('Token值:', userInfo.token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    localStorage.setItem(TOKEN_KEY, userInfo.token);
    console.log('Token已保存到localStorage');
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
}

/**
 * 获取用户信息
 * @returns 用户信息或null
 */
export function getUserInfo(): LoginResponse | null {
  try {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    if (!userInfoStr) {
      return null;
    }
    return JSON.parse(userInfoStr) as LoginResponse;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 获取token
 * @returns token或null
 */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('从localStorage获取token:', token);
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  try {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('清除用户信息失败:', error);
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  const token = getToken();
  const userInfo = getUserInfo();
  return !!(token && userInfo);
}

