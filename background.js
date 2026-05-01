const RecordingState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PAUSED: 'paused'
};

let currentState = RecordingState.IDLE;
let recordingData = {
  events: [],
  startTime: null,
  endTime: null
};

let activeTabId = null;
const NATIVE_HOST_NAME = 'com.browserrecorder.nativehost';
let nativePlaybackAvailable = null;
const ENABLE_NATIVE_COORDINATE_PLAYBACK = true;
const viewportCalibrationCache = new Map();
const PLAYBACK_HOVER_STEPS = false;

const ROBOT_KEY_MAP = {
  Enter: 'enter',
  Tab: 'tab',
  Escape: 'escape',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Backspace: 'backspace',
  Delete: 'delete',
  Home: 'home',
  End: 'end',
  PageUp: 'pageup',
  PageDown: 'pagedown',
  ' ': 'space'
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Browser Operation Recorder installed');
  initializeStorage();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser Operation Recorder started');
  initializeStorage();
});

initializeStorage();

async function initializeStorage() {
  try {
    const result = await chrome.storage.local.get(['recordingState', 'recordingData', 'operations']);
    if (result.recordingState) {
      currentState = result.recordingState;
    }
    if (result.recordingData) {
      recordingData = result.recordingData;
    }
    if (!result.operations) {
      await chrome.storage.local.set({ operations: [] });
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'START_RECORDING':
        handleStartRecording(message.tabId);
        break;
      case 'STOP_RECORDING':
        handleStopRecording();
        break;
      case 'PAUSE_RECORDING':
        handlePauseRecording();
        break;
      case 'RESUME_RECORDING':
        handleResumeRecording();
        break;
      case 'RECORD_EVENT':
        handleRecordEvent(message.eventData);
        break;
      case 'GET_STATE':
        sendResponse({ state: currentState });
        break;
      case 'GET_RECORDING_DATA':
        handleGetRecordingData(sendResponse);
        return true;
      case 'CLEAR_RECORDING':
        handleClearRecording();
        break;
      case 'OPEN_SIDEPANEL':
        handleOpenSidePanel(message.tabId);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

let sidebarPort = null;

chrome.runtime.onConnect.addListener((port) => {
  console.log('Sidebar connected:', port.name);
  sidebarPort = port;

  port.onMessage.addListener((message) => {
    handleSidebarMessage(message, port);
  });

  port.onDisconnect.addListener(() => {
    console.log('Sidebar disconnected');
    sidebarPort = null;
  });
});

function handleSidebarMessage(message, port) {
  switch (message.type) {
    case 'startRecording':
      handleStartRecording(message.tabId);
      broadcastStateUpdate();
      break;
    case 'stopRecording':
      handleStopRecording();
      broadcastStateUpdate();
      broadcastOperationsUpdate();
      break;
    case 'pauseRecording':
      handlePauseRecording();
      broadcastStateUpdate();
      break;
    case 'resumeRecording':
      handleResumeRecording();
      broadcastStateUpdate();
      break;
    case 'clearRecording':
      handleClearRecording();
      broadcastStateUpdate();
      broadcastOperationsUpdate();
      break;
    case 'updateOperations':
      saveOperations(message.operations);
      break;
    case 'startPlayback':
      handleStartPlayback(message.operations, port);
      break;
    case 'stepOver':
      handleStepOver(message.operations, port);
      break;
    case 'stopPlayback':
      handleStopPlayback();
      break;
    case 'pausePlayback':
      handlePausePlayback();
      break;
    case 'resumePlayback':
      handleResumePlayback();
      break;
    default:
      console.warn('Unknown sidebar message type:', message.type);
  }
}

async function handleStartRecording(tabId) {
  try {
    currentState = RecordingState.RECORDING;
    activeTabId = tabId;
    recordingData = {
      events: [],
      startTime: Date.now(),
      endTime: null
    };
    await chrome.storage.local.set({
      recordingState: currentState,
      recordingData: recordingData,
      operations: []
    });

    if (tabId) {
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'START_LISTENING' });
      } catch (e) {
        console.log('Tab not available for sending message');
      }
    }

    console.log('Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

async function handleStopRecording() {
  try {
    currentState = RecordingState.IDLE;
    recordingData.endTime = Date.now();
    await chrome.storage.local.set({
      recordingState: currentState,
      recordingData: recordingData
    });

    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { type: 'STOP_LISTENING' });
      } catch (e) {
        console.log('Tab not available for sending message');
      }
    }

    await chrome.storage.local.set({ operations: recordingData.events });

    console.log('Recording stopped');
  } catch (error) {
    console.error('Failed to stop recording:', error);
  }
}

async function handlePauseRecording() {
  try {
    if (currentState !== RecordingState.RECORDING) {
      throw new Error('Cannot pause: not currently recording');
    }
    currentState = RecordingState.PAUSED;
    await chrome.storage.local.set({ recordingState: currentState });

    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { type: 'PAUSE_LISTENING' });
      } catch (e) {
        console.log('Tab not available for sending message');
      }
    }

    console.log('Recording paused');
  } catch (error) {
    console.error('Failed to pause recording:', error);
  }
}

async function handleResumeRecording() {
  try {
    if (currentState !== RecordingState.PAUSED) {
      throw new Error('Cannot resume: not currently paused');
    }
    currentState = RecordingState.RECORDING;
    await chrome.storage.local.set({ recordingState: currentState });

    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { type: 'RESUME_LISTENING' });
      } catch (e) {
        console.log('Tab not available for sending message');
      }
    }

    console.log('Recording resumed');
  } catch (error) {
    console.error('Failed to resume recording:', error);
  }
}

async function handleRecordEvent(eventData) {
  try {
    if (currentState !== RecordingState.RECORDING) {
      return;
    }

    const operation = {
      id: recordingData.events.length + 1,
      type: eventData.eventType,
      timestamp: Date.now(),
      target: {
        selector: eventData.locator?.cssSelector || '',
        xpath: eventData.locator?.xpath || '',
        text: eventData.element?.textContent || '',
        tagName: eventData.element?.tagName || '',
        accessibleName: eventData.locator?.accessibleName || '',
        attributes: {
          id: eventData.element?.id || '',
          className: eventData.element?.className || '',
          name: eventData.element?.name || '',
          type: eventData.element?.type || '',
          value: eventData.element?.value || '',
          href: eventData.element?.href || '',
          ariaLabel: eventData.element?.ariaLabel || '',
          role: eventData.element?.role || ''
        }
      },
      data: {}
    };

    if (eventData.eventType === 'input') {
      operation.data.value = eventData.inputValue || '';
      operation.data.position = eventData.position || null;
      operation.data.screenPosition = eventData.screenPosition || null;
      operation.data.viewportContext = eventData.viewportContext || null;
    } else if (eventData.eventType === 'change') {
      operation.data.newValue = eventData.newValue;
      operation.data.value = eventData.newValue;
      operation.data.position = eventData.position || null;
      operation.data.screenPosition = eventData.screenPosition || null;
      operation.data.viewportContext = eventData.viewportContext || null;
    } else if (eventData.eventType === 'navigate') {
      operation.data.url = eventData.url;
    } else if (eventData.eventType === 'scroll') {
      operation.data.scrollPosition = eventData.scrollPosition;
    } else if (eventData.eventType === 'click') {
      operation.data.position = eventData.position;
      operation.data.screenPosition = eventData.screenPosition || null;
      operation.data.viewportContext = eventData.viewportContext || null;
      if (eventData.url) {
        operation.data.url = eventData.url;
      }
    } else if (eventData.eventType === 'hover') {
      operation.data.position = eventData.position;
      operation.data.screenPosition = eventData.screenPosition || null;
      operation.data.viewportContext = eventData.viewportContext || null;
      if (eventData.url) {
        operation.data.url = eventData.url;
      }
    } else if (eventData.eventType === 'key') {
      operation.data = eventData.keyData || {};
      operation.data.position = eventData.position || null;
      operation.data.screenPosition = eventData.screenPosition || null;
      operation.data.viewportContext = eventData.viewportContext || null;
      if (eventData.url) {
        operation.data.url = eventData.url;
      }
    }

    recordingData.events.push(operation);
    await chrome.storage.local.set({ recordingData: recordingData, operations: recordingData.events });

    if (sidebarPort) {
      sidebarPort.postMessage({
        type: 'operationsUpdate',
        operations: recordingData.events
      });
    }
  } catch (error) {
    console.error('Failed to record event:', error);
  }
}

async function handleGetRecordingData(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['recordingData']);
    sendResponse({
      success: true,
      data: result.recordingData || { events: [], startTime: null, endTime: null }
    });
  } catch (error) {
    console.error('Failed to get recording data:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleClearRecording() {
  try {
    currentState = RecordingState.IDLE;
    recordingData = {
      events: [],
      startTime: null,
      endTime: null
    };
    await chrome.storage.local.set({
      recordingState: currentState,
      recordingData: recordingData,
      operations: []
    });
    console.log('Recording cleared');
  } catch (error) {
    console.error('Failed to clear recording:', error);
  }
}

async function saveOperations(operations) {
  try {
    recordingData.events = operations;
    await chrome.storage.local.set({
      recordingData: recordingData,
      operations: operations
    });
  } catch (error) {
    console.error('Failed to save operations:', error);
  }
}

async function handleOpenSidePanel(tabId) {
  try {
    const targetTabId = tabId || (await getCurrentTabId());
    if (targetTabId) {
      activeTabId = targetTabId;
      if (chrome.sidePanel) {
        await chrome.sidePanel.open({ tabId: targetTabId });
      }
    }
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
}

async function getCurrentTabId() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ? tab.id : null;
  } catch (error) {
    console.error('Failed to get current tab ID:', error);
    return null;
  }
}



function broadcastStateUpdate() {
  if (sidebarPort) {
    sidebarPort.postMessage({
      type: 'stateUpdate',
      state: currentState
    });
  }
}

function broadcastOperationsUpdate() {
  if (sidebarPort) {
    sidebarPort.postMessage({
      type: 'operationsUpdate',
      operations: recordingData.events
    });
  }
}

let playbackData = {
  operations: [],
  currentStep: 0,
  isPlaying: false,
  isPaused: false,
  intervalId: null,
  port: null,
  tabId: null
};

async function handleStartPlayback(operations, port) {
  try {
    clearPlaybackTimer();
    nativePlaybackAvailable = null;
    viewportCalibrationCache.clear();
    playbackData.operations = operations;
    playbackData.currentStep = 0;
    playbackData.isPlaying = true;
    playbackData.isPaused = false;
    playbackData.port = port;
    playbackData.tabId = await getCurrentTabId();

    if (operations.length === 0) {
      return;
    }

    const tabId = await getPlaybackTabId();
    if (!tabId) {
      console.error('No active tab found for playback');
      return;
    }

    await executeStep(tabId, 0, true);
  } catch (error) {
    console.error('Failed to start playback:', error);
  }
}

async function executeStep(tabId, stepIndex, scheduleNext = true) {
  try {
    const step = playbackData.operations[stepIndex];
    if (!step) {
      handlePlaybackComplete();
      return;
    }

    playbackData.currentStep = stepIndex;

    if (playbackData.port) {
      playbackData.port.postMessage({
        type: 'playbackStep',
        step: stepIndex + 1,
        total: playbackData.operations.length
      });
    }

    let delayMs = 800;

    if (step.type === 'hover') {
      if (PLAYBACK_HOVER_STEPS) {
        await executeHover(tabId, step);
        delayMs = 500;
      } else {
        console.log('Skipping hover step during playback');
        delayMs = 100;
      }
    } else if (step.type === 'click') {
      await executeClick(tabId, step);
      delayMs = 2000;
    } else if (step.type === 'input') {
      await executeFill(tabId, step);
      delayMs = 1000;
    } else if (step.type === 'navigate') {
      console.log('Skipping navigate step - navigation will be triggered by user actions');
      delayMs = 2500;
    } else if (step.type === 'change') {
      await executeChange(tabId, step);
      delayMs = 800;
    } else if (step.type === 'scroll') {
      await executeScroll(tabId, step);
      delayMs = 800;
    } else if (step.type === 'key') {
      await executeKey(tabId, step);
      delayMs = 1000;
    }

    playbackData.currentStep = stepIndex + 1;

    if (playbackData.currentStep >= playbackData.operations.length) {
      handlePlaybackComplete();
      return;
    }

    if (scheduleNext && playbackData.isPlaying && !playbackData.isPaused) {
      playbackData.intervalId = setTimeout(async () => {
        await executeStep(tabId, playbackData.currentStep, true);
      }, delayMs);
    }
  } catch (error) {
    console.error('Failed to execute step:', error);
    playbackData.currentStep = stepIndex + 1;

    if (playbackData.currentStep >= playbackData.operations.length) {
      handlePlaybackComplete();
      return;
    }

    if (scheduleNext && playbackData.isPlaying && !playbackData.isPaused) {
      playbackData.intervalId = setTimeout(async () => {
        await executeStep(tabId, playbackData.currentStep, true);
      }, 1000);
    }
  }
}

function locatePlaybackElement(target, recordedPosition, mode = 'exists') {
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const normalizedText = normalize(target?.text);
  const normalizedAccessibleName = normalize(target?.accessibleName || target?.attributes?.ariaLabel);
  const expectedHref = target?.attributes?.href || '';
  const expectedId = target?.attributes?.id || '';
  const expectedName = target?.attributes?.name || '';
  const expectedType = target?.attributes?.type || '';
  const expectedRole = target?.attributes?.role || '';
  const expectedTag = String(target?.tagName || '').toUpperCase();
  const selector = target?.selector || '';
  const xpath = target?.xpath || '';

  const addCandidate = (list, element, source) => {
    if (!element || list.some((entry) => entry.element === element)) {
      return;
    }
    list.push({ element, source });
  };

  const collectByXPath = (expr) => {
    const results = [];
    try {
      const snapshot = document.evaluate(expr, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (let i = 0; i < snapshot.snapshotLength; i++) {
        const node = snapshot.snapshotItem(i);
        if (node?.nodeType === Node.ELEMENT_NODE) {
          results.push(node);
        }
      }
    } catch (error) {
      console.warn('XPath lookup failed:', error);
    }
    return results;
  };

  const collectCandidates = () => {
    const candidates = [];

    if (selector) {
      try {
        document.querySelectorAll(selector).forEach((element) => addCandidate(candidates, element, 'selector'));
      } catch (error) {
        console.warn('Selector lookup failed:', error);
      }
    }

    if (xpath) {
      collectByXPath(xpath).forEach((element) => addCandidate(candidates, element, 'xpath'));
    }

    if (expectedId) {
      const byId = document.getElementById(expectedId);
      addCandidate(candidates, byId, 'id');
    }

    if (expectedHref) {
      document.querySelectorAll('a[href]').forEach((element) => {
        if (element.href === expectedHref || element.getAttribute('href') === expectedHref) {
          addCandidate(candidates, element, 'href');
        }
      });
    }

    if (normalizedAccessibleName) {
      document.querySelectorAll('[aria-label]').forEach((element) => {
        if (normalize(element.getAttribute('aria-label')) === normalizedAccessibleName) {
          addCandidate(candidates, element, 'aria');
        }
      });
    }

    if (expectedName) {
      document.querySelectorAll(`[name="${CSS.escape(expectedName)}"]`).forEach((element) => addCandidate(candidates, element, 'name'));
    }

    if (normalizedText) {
      const textSelector = expectedTag ? expectedTag.toLowerCase() : 'a,button,[role="button"],li,span,div';
      document.querySelectorAll(textSelector).forEach((element) => {
        if (normalize(element.textContent) === normalizedText) {
          addCandidate(candidates, element, 'text');
        }
      });
    }

    return candidates;
  };

  const scoreCandidate = (entry) => {
    const element = entry.element;
    const text = normalize(element.textContent);
    const ariaLabel = normalize(element.getAttribute('aria-label'));
    const href = element.href || element.getAttribute('href') || '';
    const tagName = element.tagName;
    const rect = element.getBoundingClientRect();
    let score = 0;

    if (entry.source === 'selector') score += 80;
    if (entry.source === 'xpath') score += 70;
    if (entry.source === 'id') score += 120;
    if (entry.source === 'href') score += 160;
    if (entry.source === 'aria') score += 140;
    if (entry.source === 'name') score += 110;
    if (entry.source === 'text') score += 130;
    if (expectedTag && tagName === expectedTag) score += 50;
    if (expectedType && String(element.type || '') === expectedType) score += 30;
    if (expectedRole && String(element.getAttribute('role') || '') === expectedRole) score += 25;
    if (normalizedText && text === normalizedText) score += 180;
    if (normalizedAccessibleName && ariaLabel === normalizedAccessibleName) score += 120;
    if (expectedHref && href === expectedHref) score += 220;
    if (expectedId && element.id === expectedId) score += 120;
    if (expectedName && element.getAttribute('name') === expectedName) score += 70;

    if (recordedPosition && typeof recordedPosition.x === 'number' && typeof recordedPosition.y === 'number') {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(centerX - recordedPosition.x, centerY - recordedPosition.y);
      score -= Math.min(distance, 400);
    }

    if (rect.width <= 0 || rect.height <= 0) score -= 200;
    return { element, score };
  };

  const candidates = collectCandidates();
  if (candidates.length === 0) {
    return mode === 'exists' ? false : null;
  }

  const best = candidates
    .map(scoreCandidate)
    .sort((left, right) => right.score - left.score)[0];

  if (!best || best.score < 0) {
    return mode === 'exists' ? false : null;
  }

  if (mode === 'exists') {
    return true;
  }

  return best.element;
}

const LOCATE_PLAYBACK_ELEMENT_SOURCE = locatePlaybackElement.toString();

function getPlaybackElementViewportPosition(playbackTarget, recordedPosition) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return null;
  }

  let rect = element.getBoundingClientRect();
  const isVisible =
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= window.innerHeight &&
    rect.left <= window.innerWidth;

  if (!isVisible) {
    element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    rect = element.getBoundingClientRect();
  }

  const isRecordedPointInside =
    recordedPosition &&
    typeof recordedPosition.x === 'number' &&
    typeof recordedPosition.y === 'number' &&
    recordedPosition.x >= rect.left &&
    recordedPosition.x <= rect.right &&
    recordedPosition.y >= rect.top &&
    recordedPosition.y <= rect.bottom;

  const clientX = isRecordedPointInside ? recordedPosition.x : rect.left + rect.width / 2;
  const clientY = isRecordedPointInside ? recordedPosition.y : rect.top + rect.height / 2;

  return {
    clientX,
    clientY,
    tagName: element.tagName,
    type: element.type || '',
    selector: playbackTarget?.selector || '',
    xpath: playbackTarget?.xpath || '',
    rect: {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    }
  };
}

function focusPlaybackElement(playbackTarget, recordedPosition) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return false;
  }

  element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
  element.focus();
  return true;
}

function hoverPlaybackElement(playbackTarget, recordedPosition) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const mouseX = recordedPosition?.x ?? rect.left + rect.width / 2;
  const mouseY = recordedPosition?.y ?? rect.top + rect.height / 2;

  element.dispatchEvent(new MouseEvent('mouseover', {
    bubbles: true,
    cancelable: true,
    clientX: mouseX,
    clientY: mouseY
  }));
  element.dispatchEvent(new MouseEvent('mouseenter', {
    bubbles: false,
    cancelable: true,
    clientX: mouseX,
    clientY: mouseY
  }));

  return true;
}

function clickPlaybackElement(playbackTarget, recordedPosition) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return { success: false, error: 'Element not found' };
  }

  element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
  element.focus();
  element.click();

  if (element.tagName === 'FORM') {
    element.submit();
  }

  return { success: true, tagName: element.tagName, className: element.className };
}

function fillPlaybackElement(playbackTarget, recordedPosition, inputText) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return false;
  }

  element.focus();
  element.value = '';
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.value = inputText;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function changePlaybackElement(playbackTarget, recordedPosition, value) {
  const element = locatePlaybackElement(playbackTarget, recordedPosition, 'element');
  if (!element) {
    return false;
  }

  if (element.tagName === 'SELECT') {
    element.value = value;
  } else if (element.type === 'checkbox' || element.type === 'radio') {
    element.checked = value;
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

async function findElement(tabId, target, position) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: locatePlaybackElement,
      args: [target || {}, position || null, 'exists']
    });
    return result[0]?.result;
  } catch (error) {
    console.error('Failed to find element:', error);
    return false;
  }
}

function sendNativeHostMessage(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response) {
        reject(new Error('Native host returned an empty response'));
        return;
      }
      if (response.success === false) {
        reject(new Error(response.error || 'Native host returned an error'));
        return;
      }
      resolve(response);
    });
  });
}

async function ensureNativePlaybackAvailable() {
  if (nativePlaybackAvailable === true) {
    return true;
  }

  try {
    await sendNativeHostMessage({ action: 'ping' });
    nativePlaybackAvailable = true;
    return true;
  } catch (error) {
    nativePlaybackAvailable = false;
    console.warn('Native host unavailable, falling back to DOM playback:', error.message);
    return false;
  }
}

function mapRobotKey(key) {
  if (!key) {
    return '';
  }

  if (ROBOT_KEY_MAP[key]) {
    return ROBOT_KEY_MAP[key];
  }

  return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

function getRobotModifiers(step) {
  const modifiers = [];
  if (step.data?.ctrlKey) modifiers.push('control');
  if (step.data?.altKey) modifiers.push('alt');
  if (step.data?.metaKey) modifiers.push('command');
  if (step.data?.shiftKey) modifiers.push('shift');
  return modifiers;
}

async function getTabWindowInfo(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    return await chrome.windows.get(tab.windowId);
  } catch (error) {
    console.error('Failed to get tab window info:', error);
    return null;
  }
}

async function getViewportCalibration(tabId, forceRefresh = false) {
  try {
    const windowInfo = await getTabWindowInfo(tabId);
    if (!windowInfo) {
      return null;
    }

    const cacheKey = windowInfo.id;
    if (!forceRefresh && viewportCalibrationCache.has(cacheKey)) {
      return viewportCalibrationCache.get(cacheKey);
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => ({
        screenX: window.screenX,
        screenY: window.screenY,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        visualViewportOffsetLeft: window.visualViewport?.offsetLeft || 0,
        visualViewportOffsetTop: window.visualViewport?.offsetTop || 0
      })
    });

    const metrics = result[0]?.result;
    if (!metrics) {
      return null;
    }

    const scaleX =
      metrics.outerWidth > 0 && typeof windowInfo.width === 'number'
        ? windowInfo.width / metrics.outerWidth
        : 1;
    const scaleY =
      metrics.outerHeight > 0 && typeof windowInfo.height === 'number'
        ? windowInfo.height / metrics.outerHeight
        : 1;

    const calibration = {
      windowId: windowInfo.id,
      windowLeft: windowInfo.left || 0,
      windowTop: windowInfo.top || 0,
      scaleX,
      scaleY,
      contentOriginX: (windowInfo.left || 0) + (metrics.screenX - (windowInfo.left || 0)) * scaleX,
      contentOriginY: (windowInfo.top || 0) + (metrics.screenY - (windowInfo.top || 0)) * scaleY,
      viewportMetrics: metrics
    };

    viewportCalibrationCache.set(cacheKey, calibration);
    return calibration;
  } catch (error) {
    console.error('Failed to build viewport calibration:', error);
    return null;
  }
}

async function getElementViewportPosition(tabId, target, position) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (locatorSource, playbackTarget, recordedPosition) => {
        const locate = new Function(`return (${locatorSource});`)();
        const element = locate(playbackTarget, recordedPosition, 'element');
        if (!element) {
          return null;
        }

        let rect = element.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;

        if (!isVisible) {
          element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
          rect = element.getBoundingClientRect();
        }

        const isRecordedPointInside =
          recordedPosition &&
          typeof recordedPosition.x === 'number' &&
          typeof recordedPosition.y === 'number' &&
          recordedPosition.x >= rect.left &&
          recordedPosition.x <= rect.right &&
          recordedPosition.y >= rect.top &&
          recordedPosition.y <= rect.bottom;

        const clientX = isRecordedPointInside ? recordedPosition.x : rect.left + rect.width / 2;
        const clientY = isRecordedPointInside ? recordedPosition.y : rect.top + rect.height / 2;

        return {
          clientX,
          clientY,
          tagName: element.tagName,
          type: element.type || '',
          selector: playbackTarget?.selector || '',
          xpath: playbackTarget?.xpath || '',
          rect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          }
        };
      },
      args: [LOCATE_PLAYBACK_ELEMENT_SOURCE, target || {}, position || null]
    });

    return result[0]?.result || null;
  } catch (error) {
    console.error('Failed to compute native viewport position:', error);
    return null;
  }
}

async function getElementScreenPosition(tabId, target, position) {
  try {
    const [calibration, viewportPosition] = await Promise.all([
      getViewportCalibration(tabId, true),
      getElementViewportPosition(tabId, target, position)
    ]);

    if (!calibration || !viewportPosition) {
      return null;
    }

    return {
      ...viewportPosition,
      screenX: Math.round(calibration.contentOriginX + viewportPosition.clientX * calibration.scaleX),
      screenY: Math.round(calibration.contentOriginY + viewportPosition.clientY * calibration.scaleY),
      calibration
    };
  } catch (error) {
    console.error('Failed to compute native screen position:', error);
    return null;
  }
}

function convertViewportPointToScreenPoint(clientPosition, calibration) {
  if (
    !clientPosition ||
    typeof clientPosition.x !== 'number' ||
    typeof clientPosition.y !== 'number' ||
    !calibration
  ) {
    return null;
  }

  return {
    screenX: Math.round(calibration.contentOriginX + clientPosition.x * calibration.scaleX),
    screenY: Math.round(calibration.contentOriginY + clientPosition.y * calibration.scaleY)
  };
}

async function getNativeScreenPositionForStep(tabId, step) {
  const recordedScreenPosition = step?.data?.screenPosition;
  if (
    recordedScreenPosition &&
    typeof recordedScreenPosition.x === 'number' &&
    typeof recordedScreenPosition.y === 'number'
  ) {
    return {
      screenX: Math.round(recordedScreenPosition.x),
      screenY: Math.round(recordedScreenPosition.y),
      source: 'recorded-screen'
    };
  }

  const calibration = await getViewportCalibration(tabId, true);
  const fromRecordedViewport = convertViewportPointToScreenPoint(step?.data?.position, calibration);
  if (fromRecordedViewport) {
    return {
      ...fromRecordedViewport,
      source: 'recorded-viewport'
    };
  }

  const computed = await getElementScreenPosition(tabId, step.target || {}, step.data?.position || null);
  if (!computed) {
    return null;
  }

  return {
    screenX: computed.screenX,
    screenY: computed.screenY,
    source: 'computed'
  };
}

async function focusElement(tabId, target, position) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (locatorSource, playbackTarget, recordedPosition) => {
        const locate = new Function(`return (${locatorSource});`)();
        const element = locate(playbackTarget, recordedPosition, 'element');
        if (!element) {
          return false;
        }

        element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
        element.focus();
        return true;
      },
      args: [LOCATE_PLAYBACK_ELEMENT_SOURCE, target || {}, position || null]
    });
  } catch (error) {
    console.error('Failed to focus element:', error);
  }
}

async function readElementValue(tabId, target, position) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (locatorSource, playbackTarget, recordedPosition) => {
        const locate = new Function(`return (${locatorSource});`)();
        const element = locate(playbackTarget, recordedPosition, 'element');
        if (!element) {
          return null;
        }
        return 'value' in element ? element.value : null;
      },
      args: [LOCATE_PLAYBACK_ELEMENT_SOURCE, target || {}, position || null]
    });

    return result[0]?.result ?? null;
  } catch (error) {
    console.error('Failed to read element value:', error);
    return null;
  }
}

async function tryNativeMouseMove(tabId, step) {
  if (!ENABLE_NATIVE_COORDINATE_PLAYBACK) {
    return false;
  }

  const available = await ensureNativePlaybackAvailable();
  if (!available) {
    return false;
  }

  const position = await getNativeScreenPositionForStep(tabId, step);

  if (!position) {
    return false;
  }

  try {
    await sendNativeHostMessage({
      action: 'moveMouseSmooth',
      x: position.screenX,
      y: position.screenY,
      speed: 0.8
    });
    return true;
  } catch (error) {
    nativePlaybackAvailable = false;
    console.warn('Native mouse move failed, falling back to DOM playback:', error.message);
    return false;
  }
}

async function tryNativeClick(tabId, step) {
  if (!ENABLE_NATIVE_COORDINATE_PLAYBACK) {
    return false;
  }

  const available = await ensureNativePlaybackAvailable();
  if (!available) {
    return false;
  }

  const position = await getNativeScreenPositionForStep(tabId, step);

  if (!position) {
    return false;
  }

  try {
    await sendNativeHostMessage({
      action: 'moveMouseSmooth',
      x: position.screenX,
      y: position.screenY,
      speed: 0.8
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await sendNativeHostMessage({ action: 'mouseClick', button: 'left' });
    return true;
  } catch (error) {
    nativePlaybackAvailable = false;
    console.warn('Native click failed, falling back to DOM playback:', error.message);
    return false;
  }
}

async function tryNativeFill(tabId, step) {
  if (!ENABLE_NATIVE_COORDINATE_PLAYBACK) {
    return false;
  }

  const available = await ensureNativePlaybackAvailable();
  if (!available) {
    return false;
  }

  const position = await getNativeScreenPositionForStep(tabId, step);

  if (!position) {
    return false;
  }

  try {
    await sendNativeHostMessage({
      action: 'moveMouseSmooth',
      x: position.screenX,
      y: position.screenY,
      speed: 0.8
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await sendNativeHostMessage({ action: 'mouseClick', button: 'left' });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await sendNativeHostMessage({ action: 'keyTap', key: 'a', modifiers: ['control'] });
    await sendNativeHostMessage({ action: 'keyTap', key: 'backspace' });

    const text = step.data?.value || '';
    if (text) {
      await sendNativeHostMessage({ action: 'typeString', text });
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    const actualValue = await readElementValue(tabId, step.target || {}, step.data?.position || null);
    if (actualValue !== text) {
      console.warn('Native input verification failed, falling back to DOM playback');
      return false;
    }

    return true;
  } catch (error) {
    nativePlaybackAvailable = false;
    console.warn('Native input failed, falling back to DOM playback:', error.message);
    return false;
  }
}

async function tryNativeKey(tabId, step) {
  if (!ENABLE_NATIVE_COORDINATE_PLAYBACK) {
    return false;
  }

  const available = await ensureNativePlaybackAvailable();
  if (!available) {
    return false;
  }

  try {
    if (step.target?.selector || step.target?.xpath) {
      await focusElement(tabId, step.target || {}, step.data?.position || null);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    const key = mapRobotKey(step.data?.key || '');
    if (!key) {
      return false;
    }

    if (key === 'enter') {
      return false;
    }

    await sendNativeHostMessage({
      action: 'keyTap',
      key,
      modifiers: getRobotModifiers(step)
    });
    return true;
  } catch (error) {
    nativePlaybackAvailable = false;
    console.warn('Native key playback failed, falling back to DOM playback:', error.message);
    return false;
  }
}

async function executeHover(tabId, step) {
  try {
    const nativeMoved = await tryNativeMouseMove(tabId, step);
    if (nativeMoved) {
      console.log('Hover executed through native mouse:', step.target?.selector);
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      type: 'PLAYBACK_HOVER',
      target: step.target || {},
      position: step.data?.position || null
    });
    
    console.log('Hover executed:', step.target?.selector);
  } catch (error) {
    console.error('Failed to execute hover:', error);
  }
}

async function executeClick(tabId, step) {
  try {
    const nativeClicked = await tryNativeClick(tabId, step);
    if (nativeClicked) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Click executed through native mouse:', step.target?.selector || step.target?.xpath);
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      type: 'PLAYBACK_CLICK',
      target: step.target || {},
      position: step.data?.position || null
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('Click executed on:', step.target?.selector || step.target?.xpath || step.target?.text);
  } catch (error) {
    console.error('Failed to execute click:', error);
  }
}

async function executeFill(tabId, step) {
  try {
    const nativeFilled = await tryNativeFill(tabId, step);
    if (nativeFilled) {
      console.log('Fill executed through native keyboard:', step.target?.selector, 'Value:', step.data?.value || '');
      return;
    }

    const text = step.data?.value || '';
    await chrome.tabs.sendMessage(tabId, {
      type: 'PLAYBACK_INPUT',
      target: step.target || {},
      position: step.data?.position || null,
      value: text
    });

    console.log('Fill executed:', step.target?.selector, 'Value:', text);
  } catch (error) {
    console.error('Failed to execute fill:', error);
  }
}

async function executeChange(tabId, step) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'PLAYBACK_CHANGE',
      target: step.target || {},
      position: step.data?.position || null,
      value: step.data?.newValue !== undefined ? step.data.newValue : step.data?.value
    });

    console.log(
      'Change executed:',
      step.target?.selector,
      'Value:',
      step.data?.newValue !== undefined ? step.data.newValue : step.data?.value
    );
  } catch (error) {
    console.error('Failed to execute change:', error);
  }
}

async function executeScroll(tabId, step) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (scrollPos) => {
        window.scrollTo({
          left: scrollPos?.x || 0,
          top: scrollPos?.y || 0,
          behavior: 'smooth'
        });
      },
      args: [step.data?.scrollPosition]
    });

    console.log('Scroll executed to:', step.data?.scrollPosition);
  } catch (error) {
    console.error('Failed to execute scroll:', error);
  }
}

async function executeKey(tabId, step) {
  try {
    const nativeKeySent = await tryNativeKey(tabId, step);
    if (nativeKeySent) {
      console.log('Key executed through native keyboard:', step.data?.key || '');
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      type: 'PLAYBACK_KEY',
      target: step.target || {},
      position: step.data?.position || null,
      keyData: step.data || {}
    });

    console.log('Key executed:', step.data?.key || '');
  } catch (error) {
    console.error('Failed to execute key:', error);
  }
}

async function handleStepOver(operations, port) {
  try {
    if (Array.isArray(operations) && operations.length > 0) {
      playbackData.operations = operations;
    }
    clearPlaybackTimer();
    playbackData.port = port;
    playbackData.isPlaying = false;
    playbackData.isPaused = true;
    if (playbackData.currentStep === 0) {
      playbackData.tabId = await getCurrentTabId();
    }

    if (playbackData.currentStep >= playbackData.operations.length) {
      handlePlaybackComplete();
      return;
    }

    const tabId = await getPlaybackTabId();
    if (!tabId) {
      console.error('No active tab found for step over');
      return;
    }

    await executeStep(tabId, playbackData.currentStep, false);

    if (playbackData.currentStep >= playbackData.operations.length) {
      handlePlaybackComplete();
      return;
    }

    if (playbackData.port) {
      playbackData.port.postMessage({
        type: 'playbackPaused',
        step: playbackData.currentStep,
        total: playbackData.operations.length
      });
    }
  } catch (error) {
    console.error('Failed to step over:', error);
  }
}

function handleStopPlayback() {
  try {
    playbackData.isPlaying = false;
    playbackData.isPaused = false;
    clearPlaybackTimer();
    viewportCalibrationCache.clear();
    playbackData.currentStep = 0;
    if (playbackData.port) {
      playbackData.port.postMessage({ type: 'playbackComplete' });
    }
    console.log('Playback stopped');
  } catch (error) {
    console.error('Failed to stop playback:', error);
  }
}

function handlePausePlayback() {
  try {
    playbackData.isPlaying = false;
    playbackData.isPaused = true;
    clearPlaybackTimer();
    if (playbackData.port) {
      playbackData.port.postMessage({ type: 'playbackPaused', step: playbackData.currentStep });
    }
    console.log('Playback paused at step:', playbackData.currentStep);
  } catch (error) {
    console.error('Failed to pause playback:', error);
  }
}

async function handleResumePlayback() {
  try {
    if (playbackData.operations.length === 0) {
      return;
    }
    playbackData.isPlaying = true;
    playbackData.isPaused = false;
    const tabId = await getPlaybackTabId();
    if (!tabId) {
      console.error('No active tab found for playback');
      return;
    }
    executeStep(tabId, playbackData.currentStep, true);
    if (playbackData.port) {
      playbackData.port.postMessage({ type: 'playbackResumed', step: playbackData.currentStep });
    }
    console.log('Playback resumed from step:', playbackData.currentStep);
  } catch (error) {
    console.error('Failed to resume playback:', error);
  }
}

function handlePlaybackComplete() {
  playbackData.isPlaying = false;
  playbackData.isPaused = false;
  clearPlaybackTimer();
  viewportCalibrationCache.clear();
  playbackData.currentStep = 0;
  if (playbackData.port) {
    playbackData.port.postMessage({
      type: 'playbackComplete'
    });
  }
}

function clearPlaybackTimer() {
  if (playbackData.intervalId) {
    clearTimeout(playbackData.intervalId);
    playbackData.intervalId = null;
  }
}

async function getPlaybackTabId() {
  if (playbackData.tabId) {
    try {
      await chrome.tabs.get(playbackData.tabId);
      return playbackData.tabId;
    } catch (error) {
      playbackData.tabId = null;
    }
  }

  const tabId = await getCurrentTabId();
  playbackData.tabId = tabId;
  return tabId;
}

if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error('Failed to set side panel behavior:', error);
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  await handleOpenSidePanel(tab.id);
});
