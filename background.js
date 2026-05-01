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
        attributes: {
          id: eventData.element?.id || '',
          className: eventData.element?.className || '',
          name: eventData.element?.name || '',
          type: eventData.element?.type || '',
          value: eventData.element?.value || ''
        }
      },
      data: {}
    };

    if (eventData.eventType === 'input') {
      operation.data.value = eventData.inputValue || '';
    } else if (eventData.eventType === 'change') {
      operation.data.newValue = eventData.newValue;
      operation.data.value = eventData.newValue;
    } else if (eventData.eventType === 'navigate') {
      operation.data.url = eventData.url;
    } else if (eventData.eventType === 'scroll') {
      operation.data.scrollPosition = eventData.scrollPosition;
    } else if (eventData.eventType === 'click') {
      operation.data.position = eventData.position;
      if (eventData.url) {
        operation.data.url = eventData.url;
      }
    } else if (eventData.eventType === 'hover') {
      operation.data.position = eventData.position;
      if (eventData.url) {
        operation.data.url = eventData.url;
      }
    } else if (eventData.eventType === 'key') {
      operation.data = eventData.keyData || {};
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
      await executeHover(tabId, step);
      delayMs = 500;
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

async function findElement(tabId, selector, xpath) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (sel, xp) => {
        let element = null;
        if (sel) element = document.querySelector(sel);
        if (!element && xp) {
          const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          element = result.singleNodeValue;
        }
        return element !== null;
      },
      args: [selector, xpath]
    });
    return result[0]?.result;
  } catch (error) {
    console.error('Failed to find element:', error);
    return false;
  }
}

async function executeHover(tabId, step) {
  try {
    const exists = await findElement(tabId, step.target?.selector, step.target?.xpath);
    if (!exists) {
      console.warn('Element not found for hover');
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (sel, xp) => {
        let element = null;
        if (sel) element = document.querySelector(sel);
        if (!element && xp) {
          const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          element = result.singleNodeValue;
        }
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const mouseX = rect.left + rect.width / 2;
        const mouseY = rect.top + rect.height / 2;
        
        const mouseOverEvent = new MouseEvent('mouseover', {
          bubbles: true, cancelable: true, clientX: mouseX, clientY: mouseY
        });
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: false, cancelable: true, clientX: mouseX, clientY: mouseY
        });
        
        element.dispatchEvent(mouseOverEvent);
        element.dispatchEvent(mouseEnterEvent);
      },
      args: [step.target?.selector, step.target?.xpath]
    });
    
    console.log('Hover executed:', step.target?.selector);
  } catch (error) {
    console.error('Failed to execute hover:', error);
  }
}

async function executeClick(tabId, step) {
  try {
    const selector = step.target?.selector;
    const xpath = step.target?.xpath;
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (sel, xp) => {
        return new Promise((resolve) => {
          let attempts = 0;
          const maxAttempts = 5;
          
          const tryClick = () => {
            let element = null;
            if (sel) {
              element = document.querySelector(sel);
            }
            if (!element && xp) {
              const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              element = result.singleNodeValue;
            }
            
            if (!element) {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(tryClick, 300);
              } else {
                console.error('Element not found after', maxAttempts, 'attempts');
                resolve({ success: false, error: 'Element not found' });
              }
              return;
            }
            
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            requestAnimationFrame(() => {
              setTimeout(() => {
                try {
                  element.focus();
                  
                  element.click();
                  
                  console.log('Native click() called on:', element.tagName, '- selector:', sel);
                  
                  if (element.tagName === 'FORM') {
                    element.submit();
                    console.log('Form submitted');
                  }
                  
                  if (element.tagName === 'A') {
                    console.log('Link clicked, href:', element.href);
                  }
                  
                  resolve({ success: true, tagName: element.tagName, className: element.className });
                } catch (e) {
                  console.error('Error executing click:', e);
                  resolve({ success: false, error: e.message });
                }
              }, 200);
            });
          };
          
          tryClick();
        });
      },
      args: [selector, xpath]
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('Click executed on:', selector || xpath);
  } catch (error) {
    console.error('Failed to execute click:', error);
  }
}

async function executeFill(tabId, step) {
  try {
    const exists = await findElement(tabId, step.target?.selector, step.target?.xpath);
    if (!exists) {
      console.warn('Element not found for fill');
      return;
    }

    const text = step.data?.value || '';
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (sel, xp, inputText) => {
        let element = null;
        if (sel) element = document.querySelector(sel);
        if (!element && xp) {
          const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          element = result.singleNodeValue;
        }
        if (!element) return;
        element.focus();
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.value = inputText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      },
      args: [step.target?.selector, step.target?.xpath, text]
    });

    console.log('Fill executed:', step.target?.selector, 'Value:', text);
  } catch (error) {
    console.error('Failed to execute fill:', error);
  }
}

async function executeChange(tabId, step) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (sel, xp, val) => {
        let element = null;
        if (sel) element = document.querySelector(sel);
        if (!element && xp) {
          const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          element = result.singleNodeValue;
        }
        if (!element) return;
        if (element.tagName === 'SELECT') {
          element.value = val;
        } else if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = val;
        } else {
          element.value = val;
        }
        element.dispatchEvent(new Event('change', { bubbles: true }));
      },
      args: [
        step.target?.selector,
        step.target?.xpath,
        step.data?.newValue !== undefined ? step.data.newValue : step.data?.value
      ]
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
    const key = step.data?.key || '';
    const ctrlKey = step.data?.ctrlKey || false;
    const altKey = step.data?.altKey || false;
    const metaKey = step.data?.metaKey || false;
    const shiftKey = step.data?.shiftKey || false;
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (k, ctrl, alt, meta, shift) => {
        const eventOptions = {
          key: k,
          code: k === 'Enter' ? 'Enter' : (k === 'Tab' ? 'Tab' : k),
          keyCode: k === 'Enter' ? 13 : (k === 'Tab' ? 9 : k.charCodeAt(0)),
          which: k === 'Enter' ? 13 : (k === 'Tab' ? 9 : k.charCodeAt(0)),
          bubbles: true,
          cancelable: true,
          ctrlKey: ctrl,
          altKey: alt,
          metaKey: meta,
          shiftKey: shift
        };
        
        const input = document.activeElement;
        if (input) {
          const keydownEvent = new KeyboardEvent('keydown', eventOptions);
          input.dispatchEvent(keydownEvent);
          
          if (k === 'Enter') {
            const form = input.closest('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
          }
          
          const keyupEvent = new KeyboardEvent('keyup', eventOptions);
          input.dispatchEvent(keyupEvent);
          
          console.log('Key event dispatched:', k, 'to element:', input.tagName);
        }
      },
      args: [key, ctrlKey, altKey, metaKey, shiftKey]
    });

    console.log('Key executed:', key);
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
