# 原生光标控制 (Native Cursor Control)

这个功能允许 Browser Operation Recorder 扩展在回放时直接控制真实的系统光标，而不是仅在浏览器内模拟鼠标操作。

## 安装步骤

### 1. 系统要求

- Windows 操作系统
- Node.js (建议 v14 或更高版本)

### 2. 安装原生主机

1. 进入 `native-host` 目录：
   ```bash
   cd native-host
   ```

2. 以管理员权限运行 `install.bat` 文件：
   ```
   install.bat
   ```

   或者手动安装：
   ```bash
   npm install
   ```

3. 手动配置注册表（可选）

   如果你想手动配置，请按以下步骤：

   对于 Chrome：
   ```
   [HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.browserrecorder.nativehost]
   @="C:\\path\\to\\WebInitPlugin\\native-host\\com.browserrecorder.nativehost.json"
   ```

   对于 Edge：
   ```
   [HKEY_CURRENT_USER\Software\Microsoft\Edge\NativeMessagingHosts\com.browserrecorder.nativehost]
   @="C:\\path\\to\\WebInitPlugin\\native-host\\com.browserrecorder.nativehost.json"
   ```

### 3. 更新扩展配置

- 确保在 `manifest.json` 中已添加 `"nativeMessaging"` 权限
- 重新加载扩展程序

## 使用说明

### 自动功能

当原生主机正确安装后，扩展会自动尝试使用真实系统光标进行操作回放：

1. **悬停操作** - 光标会平滑移动到元素位置
2. **点击操作** - 光标会移动、按下和释放
3. **输入操作** - 光标会点击输入框，然后输入文本

### 回退机制

如果原生主机不可用，扩展会自动回退到使用 `chrome.debugger` API 进行浏览器内模拟。

## 文件说明

- `native-host.js` - 原生主机主程序，使用 `robotjs` 控制光标
- `package.json` - Node.js 包依赖定义
- `install.bat` - Windows 安装脚本
- `native-host-launcher.bat` - 启动原生主机的批处理文件
- `com.browserrecorder.nativehost.json` - 原生主机配置文件

## 故障排查

### 问题：光标没有移动

**可能原因：**
- 原生主机没有正确安装
- Node.js 或 `robotjs` 依赖没有正确安装

**解决方法：**
1. 检查控制台错误信息
2. 重新运行 `install.bat`
3. 确保 Node.js 已安装并在 PATH 中

### 问题：点击位置不正确

**可能原因：**
- 窗口位置计算错误
- DPI 缩放问题

**解决方法：**
- 确保浏览器窗口在屏幕上可见
- 尝试调整浏览器窗口位置

## 卸载

1. 删除注册表项：
   - `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.browserrecorder.nativehost`
   - `HKEY_CURRENT_USER\Software\Microsoft\Edge\NativeMessagingHosts\com.browserrecorder.nativehost`

2. 删除临时配置文件：
   - `%TEMP%\com.browserrecorder.nativehost.json`
