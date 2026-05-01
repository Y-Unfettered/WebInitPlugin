param(
    [switch]$SelfTest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$nativeInputSource = @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

public static class NativeInputHost
{
    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT
    {
        public int type;
        public InputUnion U;
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct InputUnion
    {
        [FieldOffset(0)] public MOUSEINPUT mi;
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public HARDWAREINPUT hi;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT
    {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT
    {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct HARDWAREINPUT
    {
        public uint uMsg;
        public ushort wParamL;
        public ushort wParamH;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT
    {
        public int X;
        public int Y;
    }

    private const int INPUT_MOUSE = 0;
    private const int INPUT_KEYBOARD = 1;

    private const uint KEYEVENTF_KEYUP = 0x0002;
    private const uint KEYEVENTF_UNICODE = 0x0004;

    private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    private const uint MOUSEEVENTF_LEFTUP = 0x0004;
    private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
    private const uint MOUSEEVENTF_RIGHTUP = 0x0010;
    private const uint MOUSEEVENTF_MIDDLEDOWN = 0x0020;
    private const uint MOUSEEVENTF_MIDDLEUP = 0x0040;
    private const uint MOUSEEVENTF_WHEEL = 0x0800;
    private const uint MOUSEEVENTF_HWHEEL = 0x01000;

    private const int SM_CXSCREEN = 0;
    private const int SM_CYSCREEN = 1;

    private static int _mouseDelay = 20;
    private static int _keyboardDelay = 20;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetCursorPos(int X, int Y);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    private static extern short VkKeyScan(char ch);

    private static readonly Dictionary<string, ushort> KeyMap = new Dictionary<string, ushort>(StringComparer.OrdinalIgnoreCase)
    {
        { "backspace", 0x08 },
        { "tab", 0x09 },
        { "enter", 0x0D },
        { "shift", 0x10 },
        { "control", 0x11 },
        { "ctrl", 0x11 },
        { "alt", 0x12 },
        { "pause", 0x13 },
        { "capslock", 0x14 },
        { "escape", 0x1B },
        { "space", 0x20 },
        { "pageup", 0x21 },
        { "pagedown", 0x22 },
        { "end", 0x23 },
        { "home", 0x24 },
        { "left", 0x25 },
        { "up", 0x26 },
        { "right", 0x27 },
        { "down", 0x28 },
        { "insert", 0x2D },
        { "delete", 0x2E },
        { "0", 0x30 }, { "1", 0x31 }, { "2", 0x32 }, { "3", 0x33 }, { "4", 0x34 },
        { "5", 0x35 }, { "6", 0x36 }, { "7", 0x37 }, { "8", 0x38 }, { "9", 0x39 },
        { "a", 0x41 }, { "b", 0x42 }, { "c", 0x43 }, { "d", 0x44 }, { "e", 0x45 },
        { "f", 0x46 }, { "g", 0x47 }, { "h", 0x48 }, { "i", 0x49 }, { "j", 0x4A },
        { "k", 0x4B }, { "l", 0x4C }, { "m", 0x4D }, { "n", 0x4E }, { "o", 0x4F },
        { "p", 0x50 }, { "q", 0x51 }, { "r", 0x52 }, { "s", 0x53 }, { "t", 0x54 },
        { "u", 0x55 }, { "v", 0x56 }, { "w", 0x57 }, { "x", 0x58 }, { "y", 0x59 },
        { "z", 0x5A },
        { "command", 0x5B },
        { "meta", 0x5B },
        { "f1", 0x70 }, { "f2", 0x71 }, { "f3", 0x72 }, { "f4", 0x73 }, { "f5", 0x74 },
        { "f6", 0x75 }, { "f7", 0x76 }, { "f8", 0x77 }, { "f9", 0x78 }, { "f10", 0x79 },
        { "f11", 0x7A }, { "f12", 0x7B }
    };

    public static void SetMouseDelayValue(int ms)
    {
        _mouseDelay = Math.Max(0, ms);
    }

    public static void SetKeyboardDelayValue(int ms)
    {
        _keyboardDelay = Math.Max(0, ms);
    }

    public static void MoveMouse(int x, int y)
    {
        SetCursorPos(x, y);
        Sleep(_mouseDelay);
    }

    public static void MoveMouseSmooth(int x, int y, double speed)
    {
        POINT start;
        if (!GetCursorPos(out start))
        {
            MoveMouse(x, y);
            return;
        }

        int dx = x - start.X;
        int dy = y - start.Y;
        int maxDelta = Math.Max(Math.Abs(dx), Math.Abs(dy));
        int steps = Math.Max(3, Math.Min(60, maxDelta / 12));
        if (speed > 0)
        {
            steps = Math.Max(3, Math.Min(80, (int)Math.Round(steps / Math.Max(0.25, speed))));
        }

        for (int i = 1; i <= steps; i++)
        {
            int nextX = start.X + (dx * i / steps);
            int nextY = start.Y + (dy * i / steps);
            SetCursorPos(nextX, nextY);
            Sleep(Math.Max(1, _mouseDelay));
        }
    }

    public static void MouseClick(string button, bool isDouble)
    {
        ClickButton(button);
        if (isDouble)
        {
            Sleep(80);
            ClickButton(button);
        }
    }

    public static void MouseToggle(string direction, string button)
    {
        bool down = string.Equals(direction, "down", StringComparison.OrdinalIgnoreCase);
        SendMouseInput(GetMouseButtonFlag(button, down));
        Sleep(_mouseDelay);
    }

    public static void ScrollMouse(int x, int y)
    {
        if (x != 0)
        {
            SendMouseInput(MOUSEEVENTF_HWHEEL, (uint)(x * 120));
        }
        if (y != 0)
        {
            SendMouseInput(MOUSEEVENTF_WHEEL, (uint)(y * 120));
        }
        Sleep(_mouseDelay);
    }

    public static int[] GetMousePosition()
    {
        POINT point;
        if (!GetCursorPos(out point))
        {
            return new int[] { 0, 0 };
        }
        return new int[] { point.X, point.Y };
    }

    public static int[] GetScreenSize()
    {
        return new int[] { GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN) };
    }

    public static void KeyTap(string key, string[] modifiers)
    {
        var modifierCodes = NormalizeModifierCodes(modifiers);
        foreach (var modifier in modifierCodes)
        {
            SendKey(modifier, false);
        }

        TapSingleKey(key);

        for (int i = modifierCodes.Count - 1; i >= 0; i--)
        {
            SendKey(modifierCodes[i], true);
        }
    }

    public static void KeyToggle(string key, string direction, string[] modifiers)
    {
        var modifierCodes = NormalizeModifierCodes(modifiers);
        bool keyUp = !string.Equals(direction, "down", StringComparison.OrdinalIgnoreCase);

        if (!keyUp)
        {
            foreach (var modifier in modifierCodes)
            {
                SendKey(modifier, false);
            }
        }

        ushort virtualKey = ResolveVirtualKey(key);
        SendKey(virtualKey, keyUp);

        if (keyUp)
        {
            for (int i = modifierCodes.Count - 1; i >= 0; i--)
            {
                SendKey(modifierCodes[i], true);
            }
        }
    }

    public static void TypeString(string text)
    {
        if (text == null)
        {
            return;
        }

        foreach (char ch in text)
        {
            SendUnicodeChar(ch);
            Sleep(_keyboardDelay);
        }
    }

    private static void TapSingleKey(string key)
    {
        ushort virtualKey = ResolveVirtualKey(key);
        SendKey(virtualKey, false);
        Sleep(_keyboardDelay);
        SendKey(virtualKey, true);
        Sleep(_keyboardDelay);
    }

    private static List<ushort> NormalizeModifierCodes(string[] modifiers)
    {
        var result = new List<ushort>();
        if (modifiers == null)
        {
            return result;
        }

        foreach (var modifier in modifiers)
        {
            if (string.IsNullOrWhiteSpace(modifier))
            {
                continue;
            }
            result.Add(ResolveVirtualKey(modifier));
        }

        return result;
    }

    private static ushort ResolveVirtualKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("Key cannot be empty.");
        }

        ushort mapped;
        if (KeyMap.TryGetValue(key, out mapped))
        {
            return mapped;
        }

        if (key.Length == 1)
        {
            short vk = VkKeyScan(key[0]);
            if (vk != -1)
            {
                return (ushort)(vk & 0xff);
            }
        }

        throw new ArgumentException("Unsupported key: " + key);
    }

    private static void ClickButton(string button)
    {
        SendMouseInput(GetMouseButtonFlag(button, true));
        Sleep(_mouseDelay);
        SendMouseInput(GetMouseButtonFlag(button, false));
        Sleep(_mouseDelay);
    }

    private static uint GetMouseButtonFlag(string button, bool down)
    {
        string normalized = string.IsNullOrWhiteSpace(button) ? "left" : button.ToLowerInvariant();
        switch (normalized)
        {
            case "left":
                return down ? MOUSEEVENTF_LEFTDOWN : MOUSEEVENTF_LEFTUP;
            case "right":
                return down ? MOUSEEVENTF_RIGHTDOWN : MOUSEEVENTF_RIGHTUP;
            case "middle":
                return down ? MOUSEEVENTF_MIDDLEDOWN : MOUSEEVENTF_MIDDLEUP;
            default:
                throw new ArgumentException("Unsupported mouse button: " + button);
        }
    }

    private static void SendMouseInput(uint flags, uint mouseData = 0)
    {
        INPUT input = new INPUT();
        input.type = INPUT_MOUSE;
        input.U.mi.dx = 0;
        input.U.mi.dy = 0;
        input.U.mi.mouseData = mouseData;
        input.U.mi.dwFlags = flags;
        input.U.mi.time = 0;
        input.U.mi.dwExtraInfo = IntPtr.Zero;
        Send(new INPUT[] { input });
    }

    private static void SendKey(ushort virtualKey, bool keyUp)
    {
        INPUT input = new INPUT();
        input.type = INPUT_KEYBOARD;
        input.U.ki.wVk = virtualKey;
        input.U.ki.wScan = 0;
        input.U.ki.dwFlags = keyUp ? KEYEVENTF_KEYUP : 0;
        input.U.ki.time = 0;
        input.U.ki.dwExtraInfo = IntPtr.Zero;
        Send(new INPUT[] { input });
    }

    private static void SendUnicodeChar(char ch)
    {
        INPUT down = new INPUT();
        down.type = INPUT_KEYBOARD;
        down.U.ki.wVk = 0;
        down.U.ki.wScan = ch;
        down.U.ki.dwFlags = KEYEVENTF_UNICODE;
        down.U.ki.time = 0;
        down.U.ki.dwExtraInfo = IntPtr.Zero;

        INPUT up = down;
        up.U.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;
        Send(new INPUT[] { down, up });
    }

    private static void Send(INPUT[] inputs)
    {
        uint sent = SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        if (sent == 0)
        {
            throw new InvalidOperationException("SendInput failed.");
        }
    }

    private static void Sleep(int ms)
    {
        if (ms > 0)
        {
            Thread.Sleep(ms);
        }
    }
}
"@

Add-Type -TypeDefinition $nativeInputSource -Language CSharp

function Send-NativeResponse {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Payload
    )

    $json = $Payload | ConvertTo-Json -Compress -Depth 8
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $lengthBytes = [System.BitConverter]::GetBytes([int]$bytes.Length)
    $stdout.Write($lengthBytes, 0, $lengthBytes.Length)
    $stdout.Write($bytes, 0, $bytes.Length)
    $stdout.Flush()
}

function Read-NativeMessage {
    $lengthBytes = New-Object byte[] 4
    $read = $stdin.Read($lengthBytes, 0, 4)
    if ($read -eq 0) {
        return $null
    }
    if ($read -lt 4) {
        throw "Incomplete native message header."
    }

    $length = [System.BitConverter]::ToInt32($lengthBytes, 0)
    $messageBytes = New-Object byte[] $length
    $offset = 0
    while ($offset -lt $length) {
        $chunkRead = $stdin.Read($messageBytes, $offset, $length - $offset)
        if ($chunkRead -le 0) {
            throw "Incomplete native message body."
        }
        $offset += $chunkRead
    }

    return [System.Text.Encoding]::UTF8.GetString($messageBytes)
}

function Get-ModifierArray {
    param($Modifiers)

    if ($null -eq $Modifiers) {
        return @()
    }
    if ($Modifiers -is [System.Array]) {
        return @($Modifiers | ForEach-Object { [string]$_ })
    }
    return @([string]$Modifiers)
}

function Get-MessageValue {
    param(
        [Parameter(Mandatory = $true)]
        $Message,
        [Parameter(Mandatory = $true)]
        [string]$Name,
        $Default = $null
    )

    $property = $Message.PSObject.Properties[$Name]
    if ($null -eq $property) {
        return $Default
    }

    return $property.Value
}

function Invoke-NativeAction {
    param($Message)

    $action = [string](Get-MessageValue -Message $Message -Name 'action' -Default '')
    $modifiers = Get-ModifierArray (Get-MessageValue -Message $Message -Name 'modifiers')

    switch ($action) {
        'ping' {
            return @{ success = $true; host = 'com.browserrecorder.nativehost'; backend = 'sendinput-powershell' }
        }
        'moveMouse' {
            [NativeInputHost]::MoveMouse([int](Get-MessageValue -Message $Message -Name 'x' -Default 0), [int](Get-MessageValue -Message $Message -Name 'y' -Default 0))
            return @{ success = $true }
        }
        'moveMouseSmooth' {
            $speed = [double](Get-MessageValue -Message $Message -Name 'speed' -Default 1.0)
            [NativeInputHost]::MoveMouseSmooth([int](Get-MessageValue -Message $Message -Name 'x' -Default 0), [int](Get-MessageValue -Message $Message -Name 'y' -Default 0), $speed)
            return @{ success = $true }
        }
        'mouseClick' {
            $button = [string](Get-MessageValue -Message $Message -Name 'button' -Default 'left')
            $doubleClick = [bool](Get-MessageValue -Message $Message -Name 'double' -Default $false)
            [NativeInputHost]::MouseClick($button, $doubleClick)
            return @{ success = $true }
        }
        'mouseToggle' {
            $direction = [string](Get-MessageValue -Message $Message -Name 'down' -Default 'down')
            $button = [string](Get-MessageValue -Message $Message -Name 'button' -Default 'left')
            [NativeInputHost]::MouseToggle($direction, $button)
            return @{ success = $true }
        }
        'scrollMouse' {
            $scrollX = [int](Get-MessageValue -Message $Message -Name 'x' -Default 0)
            $scrollY = [int](Get-MessageValue -Message $Message -Name 'y' -Default 0)
            [NativeInputHost]::ScrollMouse($scrollX, $scrollY)
            return @{ success = $true }
        }
        'setMouseDelay' {
            $mouseDelay = [int](Get-MessageValue -Message $Message -Name 'ms' -Default 0)
            [NativeInputHost]::SetMouseDelayValue($mouseDelay)
            return @{ success = $true }
        }
        'setKeyboardDelay' {
            $keyboardDelay = [int](Get-MessageValue -Message $Message -Name 'ms' -Default 0)
            [NativeInputHost]::SetKeyboardDelayValue($keyboardDelay)
            return @{ success = $true }
        }
        'keyTap' {
            [NativeInputHost]::KeyTap([string](Get-MessageValue -Message $Message -Name 'key' -Default ''), $modifiers)
            return @{ success = $true }
        }
        'keyToggle' {
            $direction = [string](Get-MessageValue -Message $Message -Name 'down' -Default 'down')
            [NativeInputHost]::KeyToggle([string](Get-MessageValue -Message $Message -Name 'key' -Default ''), $direction, $modifiers)
            return @{ success = $true }
        }
        'typeString' {
            [NativeInputHost]::TypeString([string](Get-MessageValue -Message $Message -Name 'text' -Default ''))
            return @{ success = $true }
        }
        'getMousePos' {
            $position = [NativeInputHost]::GetMousePosition()
            return @{ success = $true; position = @{ x = $position[0]; y = $position[1] } }
        }
        'getScreenSize' {
            $size = [NativeInputHost]::GetScreenSize()
            return @{ success = $true; size = @{ width = $size[0]; height = $size[1] } }
        }
        default {
            return @{ success = $false; error = "Unknown action: $action" }
        }
    }
}

if ($SelfTest) {
    $size = [NativeInputHost]::GetScreenSize()
    Write-Output ("native-host ok {0}x{1}" -f $size[0], $size[1])
    exit 0
}

$stdin = [System.Console]::OpenStandardInput()
$stdout = [System.Console]::OpenStandardOutput()

while ($true) {
    try {
        $rawMessage = Read-NativeMessage
        if ($null -eq $rawMessage) {
            break
        }

        $message = $rawMessage | ConvertFrom-Json
        $response = Invoke-NativeAction -Message $message
        Send-NativeResponse -Payload $response
    } catch {
        Send-NativeResponse -Payload @{
            success = $false
            error = $_.Exception.Message
        }
    }
}
