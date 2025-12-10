# Token调试指南

## 问题描述
在发送API请求时，`alphatoken`显示为`undefined`。

## 调试步骤

### 1. 打开浏览器开发者工具
- 按 `F12` 或右键点击页面选择"检查"
- 切换到"Console"（控制台）标签

### 2. 执行登录操作
登录时，控制台应该显示以下日志：

```
登录请求: {username: "...", password: "..."}
登录响应状态: 200
登录响应数据: {equity: ..., id: ..., token: "...", username: "..."}
Token字段: "实际的token值"
保存用户信息: {equity: ..., id: ..., token: "...", username: "..."}
Token值: "实际的token值"
Token已保存到localStorage
```

### 3. 检查localStorage
在控制台中执行以下命令：

```javascript
// 查看保存的token
localStorage.getItem('auth_token')

// 查看保存的用户信息
JSON.parse(localStorage.getItem('user_info'))
```

应该看到token值和完整的用户信息。

### 4. 检查API请求
当点击"AI CHAT"按钮或加载持仓列表时，控制台应该显示：

```
从localStorage获取token: "实际的token值"
获取持仓列表 - Token: "实际的token值"
获取持仓列表 - URL: https://alphanow.io/alphanow-admin/api/trade/position/list
持仓列表响应状态: 200
```

或者对于AI Chat：

```
从localStorage获取token: "实际的token值"
获取AI Chat - Token: "实际的token值"
获取AI Chat - 请求参数: {accountId: ..., symbol: "...", side: "..."}
AI Chat响应状态: 200
```

### 5. 检查网络请求
在开发者工具中切换到"Network"（网络）标签：

1. 找到对应的API请求（如 `position/list` 或 `position/chat`）
2. 点击该请求
3. 查看"Headers"（请求头）部分
4. 确认以下请求头是否存在且正确：
   - `Authorization: Bearer <token值>`
   - `alphatoken: <token值>`

## 可能的问题和解决方案

### 问题1: 登录响应中没有token字段
**症状**: 控制台显示 `Token字段: undefined`

**解决方案**: 
- 检查API返回的数据结构
- 可能token字段名不是`token`，而是其他名称（如`accessToken`、`authToken`等）
- 需要更新`LoginResponse`接口定义

### 问题2: localStorage中没有保存token
**症状**: `localStorage.getItem('auth_token')` 返回 `null`

**解决方案**:
- 检查是否有浏览器隐私设置阻止localStorage
- 检查是否在无痕模式下运行
- 查看控制台是否有"保存用户信息失败"的错误

### 问题3: token是null或undefined
**症状**: 控制台显示 `从localStorage获取token: null`

**解决方案**:
- 重新登录
- 清除localStorage后重新登录：`localStorage.clear()`
- 检查登录流程是否正确执行

### 问题4: 请求头中alphatoken是undefined
**症状**: Network标签中看到 `alphatoken: undefined`

**解决方案**:
- 这通常意味着传递给API函数的token参数是undefined
- 检查`getToken()`是否正确返回token
- 检查是否在登录前就调用了API

## 手动测试token

在控制台中执行以下代码来手动测试：

```javascript
// 1. 获取token
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// 2. 手动调用API
fetch('https://alphanow.io/alphanow-admin/api/trade/position/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'alphatoken': token
  }
})
.then(res => res.json())
.then(data => console.log('持仓数据:', data))
.catch(err => console.error('错误:', err));
```

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 控制台的完整日志截图
2. Network标签中API请求的Headers截图
3. localStorage中的数据（可以在控制台执行 `localStorage` 查看）
4. 登录接口返回的完整响应数据

