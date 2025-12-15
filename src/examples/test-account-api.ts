/**
 * 账户列表 API 测试脚本
 * 
 * 这个文件展示了如何测试账户列表 API
 * 可以在浏览器控制台中运行这些函数来测试 API
 */

import { getAccountList, AccountListReq } from '../services/api';

// 测试用的 token（需要替换为真实的 token）
const TEST_TOKEN = 'your-test-token-here';

/**
 * 测试1: 获取所有账户
 */
export async function testGetAllAccounts() {
  console.log('=== 测试1: 获取所有账户 ===');
  try {
    const result = await getAccountList(TEST_TOKEN, {});
    console.log('✅ 成功获取账户列表');
    console.log('账户数量:', result.length);
    console.log('账户列表:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取账户列表失败:', error);
    throw error;
  }
}

/**
 * 测试2: 获取主账号列表
 */
export async function testGetMainAccounts() {
  console.log('=== 测试2: 获取主账号列表 ===');
  try {
    const result = await getAccountList(TEST_TOKEN, {
      accType: 0
    });
    console.log('✅ 成功获取主账号列表');
    console.log('主账号数量:', result.length);
    console.log('主账号列表:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取主账号列表失败:', error);
    throw error;
  }
}

/**
 * 测试3: 获取子账号列表
 */
export async function testGetSubAccounts() {
  console.log('=== 测试3: 获取子账号列表 ===');
  try {
    const result = await getAccountList(TEST_TOKEN, {
      accType: 1
    });
    console.log('✅ 成功获取子账号列表');
    console.log('子账号数量:', result.length);
    console.log('子账号列表:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取子账号列表失败:', error);
    throw error;
  }
}

/**
 * 测试4: 按交易所筛选
 */
export async function testGetBybitAccounts() {
  console.log('=== 测试4: 获取BYBIT交易所账户 ===');
  try {
    const result = await getAccountList(TEST_TOKEN, {
      exchange: 'BYBIT'
    });
    console.log('✅ 成功获取BYBIT账户列表');
    console.log('BYBIT账户数量:', result.length);
    console.log('BYBIT账户列表:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取BYBIT账户列表失败:', error);
    throw error;
  }
}

/**
 * 测试5: 搜索账户
 */
export async function testSearchAccounts(keyword: string) {
  console.log(`=== 测试5: 搜索账户 (关键字: ${keyword}) ===`);
  try {
    const result = await getAccountList(TEST_TOKEN, {
      search: keyword
    });
    console.log('✅ 成功搜索账户');
    console.log('搜索结果数量:', result.length);
    console.log('搜索结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 搜索账户失败:', error);
    throw error;
  }
}

/**
 * 测试6: 组合筛选条件
 */
export async function testCombinedFilters() {
  console.log('=== 测试6: 组合筛选条件 ===');
  try {
    const result = await getAccountList(TEST_TOKEN, {
      accType: 0,
      exchange: 'BYBIT'
    });
    console.log('✅ 成功使用组合筛选');
    console.log('筛选结果数量:', result.length);
    console.log('筛选结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 组合筛选失败:', error);
    throw error;
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests(token: string) {
  console.log('🚀 开始运行所有测试...\n');
  
  // 更新测试 token
  const originalToken = TEST_TOKEN;
  (global as any).TEST_TOKEN = token;
  
  const tests = [
    { name: '获取所有账户', fn: testGetAllAccounts },
    { name: '获取主账号', fn: testGetMainAccounts },
    { name: '获取子账号', fn: testGetSubAccounts },
    { name: '获取BYBIT账户', fn: testGetBybitAccounts },
    { name: '搜索账户', fn: () => testSearchAccounts('test') },
    { name: '组合筛选', fn: testCombinedFilters },
  ];
  
  const results = {
    passed: 0,
    failed: 0,
    total: tests.length
  };
  
  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
      console.log(`✅ ${test.name} - 通过\n`);
    } catch (error) {
      results.failed++;
      console.log(`❌ ${test.name} - 失败\n`);
    }
  }
  
  console.log('=== 测试结果汇总 ===');
  console.log(`总测试数: ${results.total}`);
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  return results;
}

// 在浏览器控制台中使用示例：
// import { runAllTests } from './src/examples/test-account-api';
// runAllTests('your-actual-token');

