# 浏览器操作录制插件 Spec

## Why
用户需要一种方式录制浏览器操作（点击、输入、导航等），并导出为 JSON 格式，供后续开发自动化 Chrome 插件使用。当前缺乏这样的录制工具，导致开发自动化脚本时需要手动编写操作序列，工作量大且容易出错。

**核心设计**：采用 Playwright 风格的浏览器自动化方式
- 通过 DOM 选择器定位元素
- 使用页面级操作（click, fill 等）
- 不是 Win32 级别的鼠标移动和键盘按键

## What Changes
- 开发一个 Chrome 扩展插件，命名为 "Browser Operation Recorder"
- 使用**侧边栏界面**作为主要操作界面，提供更宽敞的操作空间
- 录制用户在网页上的关键操作：点击、输入、导航等
- 导航事件仅作为辅助信息记录，回放时通过重放用户操作触发导航
- 支持暂停/继续录制
- 将录制内容导出为结构化的 JSON 文件
- 提供操作回放预览功能（浏览器自动化方式）

## Impact
- 新增能力：浏览器操作录制与导出
- 采用 Playwright 风格的回放方式：click(), fill() 等页面级操作
- 涉及系统：Chrome 扩展架构、侧边栏 UI

## ADDED Requirements

### Requirement: 侧边栏界面
系统 SHALL 提供侧边栏作为主要操作界面：
- 通过 Chrome 工具栏图标或快捷键打开侧边栏
- 侧边栏宽度不小于 350px，提供充足的操作空间
- 侧边栏包含：录制控制区、操作列表区、导出按钮区

### Requirement: 操作录制核心功能
系统 SHALL 提供完整的浏览器操作录制能力，支持记录以下操作类型：
- **点击事件**：记录点击的元素（CSS 选择器、XPath）
- **输入事件**：记录输入的字段（选择器）和输入的文本值
- **导航事件**：记录页面跳转（URL 变化）仅作为辅助信息
- **滚动事件**：记录滚动位置

**关键改进**：导航事件不应替代用户操作，回放时通过重放用户操作（点击链接、按钮）来触发导航，而不是直接跳转 URL。

### Requirement: 元素定位信息
系统 SHALL 为每个操作记录精确的元素定位信息：
- CSS 选择器路径（优先使用能唯一标识元素的短选择器）
- XPath 路径
- 元素的文本内容
- 元素属性（id、name、class、data-* 等）

### Requirement: 录制控制
系统 SHALL 提供以下录制控制功能（位于侧边栏顶部）：
- 开始录制
- 暂停/继续录制
- 停止录制
- 清空当前录制
- 录制状态指示器（录制中/已暂停/未录制）

### Requirement: 操作列表显示
系统 SHALL 在侧边栏中央区域显示录制操作列表：
- 每个操作显示：序号、类型图标、简要描述
- 点击操作可查看详细信息
- 支持删除单个操作
- 显示操作总数和录制时长

### Requirement: JSON 导出格式
导出的 JSON 文件 SHALL 包含以下结构：
```json
{
  "version": "1.0",
  "exportTime": "ISO 8601 时间戳",
  "totalSteps": 10,
  "steps": [
    {
      "id": 1,
      "type": "click" | "input" | "navigate" | "scroll",
      "timestamp": 1234567890123,
      "target": {
        "selector": "CSS 选择器",
        "xpath": "XPath 路径",
        "text": "元素文本",
        "attributes": {}
      },
      "data": {
        "value": "输入值",
        "url": "跳转URL",
        "scrollPosition": { "x": 0, "y": 0 }
      }
    }
  ]
}
```

### Requirement: 导出功能
系统 SHALL 提供 JSON 导出功能（位于侧边栏底部）：
- 一键导出当前录制的所有操作
- 自动生成文件名：recording_YYYYMMDD_HHMMSS.json
- 支持下载到本地

### Requirement: 回放预览（Playwright 风格）
系统 SHALL 提供录制回放功能（位于侧边栏）：
- 使用**浏览器自动化方式**，不是系统级键鼠操作
- 逐步执行录制的操作，类似 Playwright 的 API：
  - `element.click()` - 点击
  - `element.fill(value)` - 填充输入
  - `element.selectOption(value)` - 选择下拉框
- 显示当前执行到第几步
- 支持单步跳过
- 支持重播
- 回放时通过点击链接/按钮触发导航，而不是直接跳转 URL

## Technical Approach
- 使用 Chrome Extension Manifest V3
- 使用 chrome.sidePanel API 实现侧边栏界面
- Content Script 监听页面 DOM 事件
- Background Script 管理录制状态
- 回放通过 chrome.scripting.executeScript 注入 JavaScript 操作页面元素
- 存储：使用 chrome.storage.local 保存录制数据
- 图标：使用扩展工具栏图标触发侧边栏打开

## Non-Goals (Out of Scope)
- 不支持系统级键鼠操作（不需要 native host）
- 不支持录制文件上传操作
- 不支持录制右键菜单操作
- 不支持录制浏览器快捷键（Ctrl+C 等）
