#!/usr/bin/env node

try {
    const robot = require('@jitsi/robotjs');
    robot.setMouseDelay(20);
    robot.setKeyboardDelay(20);

    let inputBuffer = Buffer.alloc(0);

    process.stdin.on('data', (chunk) => {
        inputBuffer = Buffer.concat([inputBuffer, chunk]);
        processInput();
    });

    function processInput() {
        while (inputBuffer.length >= 4) {
            const length = inputBuffer.readUInt32LE(0);
            if (inputBuffer.length >= 4 + length) {
                const message = inputBuffer.slice(4, 4 + length);
                inputBuffer = inputBuffer.slice(4 + length);
                try {
                    const data = JSON.parse(message.toString('utf8'));
                    handleMessage(data);
                } catch (e) {
                    sendResponse({ success: false, error: e.message });
                }
            } else {
                break;
            }
        }
    }

    function handleMessage(message) {
        try {
            const action = message.action;
            let result = { success: true };
            const modifiers = normalizeModifiers(message.modifiers);

            switch (action) {
                case 'ping':
                    result.host = 'com.browserrecorder.nativehost';
                    break;
                case 'moveMouse':
                    robot.moveMouse(message.x, message.y);
                    break;
                case 'moveMouseSmooth':
                    robot.moveMouseSmooth(message.x, message.y, message.speed);
                    break;
                case 'mouseClick':
                    robot.mouseClick(message.button || 'left', message.double || false);
                    break;
                case 'mouseToggle':
                    robot.mouseToggle(message.down || 'down', message.button || 'left');
                    break;
                case 'scrollMouse':
                    robot.scrollMouse(message.x || 0, message.y || 0);
                    break;
                case 'setMouseDelay':
                    robot.setMouseDelay(message.ms || 0);
                    break;
                case 'setKeyboardDelay':
                    robot.setKeyboardDelay(message.ms || 0);
                    break;
                case 'keyTap':
                    robot.keyTap(message.key, modifiers);
                    break;
                case 'keyToggle':
                    robot.keyToggle(message.key, message.down || 'down', modifiers);
                    break;
                case 'typeString':
                    robot.typeString(message.text);
                    break;
                case 'getMousePos':
                    result.position = robot.getMousePos();
                    break;
                case 'getScreenSize':
                    result.size = robot.getScreenSize();
                    break;
                default:
                    result.success = false;
                    result.error = 'Unknown action';
            }

            sendResponse(result);
        } catch (e) {
            sendResponse({ success: false, error: e.message });
        }
    }

    function normalizeModifiers(modifiers) {
        if (!modifiers) {
            return undefined;
        }
        if (Array.isArray(modifiers)) {
            return modifiers.length > 0 ? modifiers : undefined;
        }
        return modifiers;
    }

    function sendResponse(data) {
        const message = JSON.stringify(data);
        const messageBuffer = Buffer.from(message, 'utf8');
        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32LE(messageBuffer.length, 0);
        process.stdout.write(lengthBuffer);
        process.stdout.write(messageBuffer);
    }

} catch (e) {
    const errorMsg = `Failed to load robotjs: ${e.message}\nPlease install robotjs: npm install robotjs`;
    const response = JSON.stringify({ success: false, error: errorMsg });
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(Buffer.from(response, 'utf8').length, 0);
    process.stdout.write(lengthBuffer);
    process.stdout.write(response);
    process.exit(1);
}
