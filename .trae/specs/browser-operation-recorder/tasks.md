# Tasks

- [x] Task 1: 创建 Chrome 扩展基础结构
  - [x] SubTask 1.1: 创建 manifest.json (Manifest V3，配置 sidePanel 权限)
  - [x] SubTask 1.2: 创建 background.js 背景脚本（管理录制状态）
  - [x] SubTask 1.3: 创建 content.js 内容脚本（监听页面事件）
  - [x] SubTask 1.4: 创建 sidebar.html 侧边栏界面
  - [x] SubTask 1.5: 创建 sidebar.js 侧边栏逻辑
  - [x] SubTask 1.6: 创建 sidebar.css 侧边栏样式

- [x] Task 2: 实现侧边栏 UI
  - [x] SubTask 2.1: 实现侧边栏布局结构（控制区、列表区、底部按钮区）
  - [x] SubTask 2.2: 实现录制状态指示器
  - [x] SubTask 2.3: 实现操作列表显示组件
  - [x] SubTask 2.4: 实现录制控制按钮

- [x] Task 3: 实现操作录制核心逻辑
  - [x] SubTask 3.1: 实现事件监听器（click, input, navigate, scroll）
  - [x] SubTask 3.2: 实现元素定位信息提取（CSS selector, XPath）
  - [x] SubTask 3.3: 实现录制状态管理（开始、暂停、停止）
  - [x] SubTask 3.4: 实现录制数据存储与同步

- [x] Task 4: 实现 JSON 导出功能
  - [x] SubTask 4.1: 设计 JSON 数据结构
  - [x] SubTask 4.2: 实现 JSON 文件生成与下载

- [x] Task 5: 实现回放预览功能（浏览器事件模拟）
  - [x] SubTask 5.1: 实现逐步回放逻辑
  - [x] SubTask 5.2: 实现回放控制（播放、暂停、单步、重播）

- [x] Task 6: 修复导航录制问题（关键改进）
  - [x] SubTask 6.1: 修改导航事件处理逻辑，导航事件仅作为辅助信息记录
  - [x] SubTask 6.2: 回放时通过重放用户操作触发导航，而非直接跳转URL

- [x] Task 7: 实现真实系统级键鼠操作（关键改进）
  - [x] SubTask 7.1: 安装配置 robotjs 依赖（使用 @jitsi/robotjs 预编译版本）
  - [x] SubTask 7.2: 实现 Native Messaging 通信机制
  - [x] SubTask 7.3: 修改回放逻辑使用真实系统级键鼠操作
  - [x] SubTask 7.4: 测试真实键鼠操作功能（本地服务已成功启动）

- [x] Task 8: 测试与验证改进功能
  - [x] SubTask 8.1: 验证导航录制改进（记录真实操作而非直接跳转）
  - [x] SubTask 8.2: 验证真实系统级键鼠回放功能
  - [x] SubTask 8.3: 端到端测试完整录制回放流程