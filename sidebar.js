(function() {
  const ICON_SVGS = {
    click: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>',
    input: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    change: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    navigate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
    wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    hover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M12 7v5l3 3"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>'
  };

  const TYPE_NAMES = {
    click: '点击',
    input: '输入',
    navigate: '导航',
    scroll: '滚动',
    wait: '等待',
    hover: '悬停',
    key: '按键'
  };

  TYPE_NAMES.change = 'change';

  let port = null;
  let recordingState = 'idle';
  let operations = [];
  let lastOperationCount = 0;
  let recordingStartTime = null;
  let durationTimer = null;
  let currentPlaybackStep = 0;
  let isPausedPlayback = false;
  let isPlayingPlayback = false;
  let selectedOperationIndex = null;

  const elements = {
    recordingStatus: document.getElementById('recordingStatus'),
    statusText: document.querySelector('.status-text'),
    btnRecord: document.getElementById('btnRecord'),
    btnPause: document.getElementById('btnPause'),
    btnStop: document.getElementById('btnStop'),
    btnClear: document.getElementById('btnClear'),
    operationCount: document.getElementById('operationCount'),
    recordingDuration: document.getElementById('recordingDuration'),
    operationsList: document.getElementById('operationsList'),
    emptyState: document.getElementById('emptyState'),
    btnExport: document.getElementById('btnExport'),
    btnPlayback: document.getElementById('btnPlayback'),
    btnStopPlayback: document.getElementById('btnStopPlayback'),
    btnStepOver: document.getElementById('btnStepOver'),
    playbackIndicator: document.getElementById('playbackIndicator'),
    playbackStep: document.getElementById('playbackStep'),
    btnScrollToTop: document.getElementById('btnScrollToTop'),
    operationDetailModal: document.getElementById('operationDetailModal'),
    modalBody: document.getElementById('modalBody'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnDeleteOperation: document.getElementById('btnDeleteOperation')
  };

  function init() {
    connectToBackground();
    setupEventListeners();
    loadRecordingState();
  }

  function connectToBackground() {
    try {
      port = chrome.runtime.connect({ name: 'sidebar' });
      port.onMessage.addListener(handleBackgroundMessage);
      port.onDisconnect.addListener(() => {
        setTimeout(connectToBackground, 1000);
      });

      chrome.storage.local.get(['recordingState', 'operations'], (result) => {
        if (result.recordingState) {
          updateRecordingState(result.recordingState);
        }
        if (result.operations) {
          updateOperations(result.operations);
        }
      });
    } catch (error) {
      console.error('Failed to connect to background:', error);
      setTimeout(connectToBackground, 1000);
    }
  }

  function handleBackgroundMessage(message) {
    switch (message.type) {
      case 'stateUpdate':
        updateRecordingState(message.state);
        break;
      case 'operationsUpdate':
        updateOperations(message.operations);
        break;
      case 'playbackStep':
        updatePlaybackUI(message.step, message.total);
        break;
      case 'playbackComplete':
        stopPlaybackUI();
        break;
      case 'playbackPaused':
        isPausedPlayback = true;
        updatePlaybackButtonState(true);
        if (elements.btnStepOver) {
          elements.btnStepOver.disabled = false;
        }
        break;
      case 'playbackResumed':
        isPausedPlayback = false;
        updatePlaybackButtonState(false);
        if (elements.btnStepOver) {
          elements.btnStepOver.disabled = true;
        }
        break;
    }
  }

  function setupEventListeners() {
    if (elements.btnRecord) {
      elements.btnRecord.addEventListener('click', () => startRecording());
    }
    if (elements.btnPause) {
      elements.btnPause.addEventListener('click', () => togglePause());
    }
    if (elements.btnStop) {
      elements.btnStop.addEventListener('click', () => stopRecording());
    }
    if (elements.btnClear) {
      elements.btnClear.addEventListener('click', () => clearRecording());
    }
    if (elements.btnExport) {
      elements.btnExport.addEventListener('click', () => exportJSON());
    }
    if (elements.btnPlayback) {
      elements.btnPlayback.addEventListener('click', () => {
        console.log('btnPlayback clicked');
        togglePlayback();
      });
    }
    if (elements.btnStopPlayback) {
      elements.btnStopPlayback.addEventListener('click', () => stopPlayback());
    }
    if (elements.btnStepOver) {
      elements.btnStepOver.addEventListener('click', () => stepOver());
    }
    if (elements.btnScrollToTop) {
      elements.btnScrollToTop.addEventListener('click', scrollToTop);
    }
    if (elements.btnCloseModal) {
      elements.btnCloseModal.addEventListener('click', closeModal);
    }
    if (elements.btnDeleteOperation) {
      elements.btnDeleteOperation.addEventListener('click', deleteSelectedOperation);
    }
    if (elements.operationDetailModal) {
      elements.operationDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.operationDetailModal) {
          closeModal();
        }
      });
    }
  }

  function updatePlaybackButtonState(isPaused) {
    const btn = elements.btnPlayback;
    if (!btn) {
      console.log('btnPlayback not found');
      return;
    }

    const playIcon = btn.querySelector('.btn-icon-play');
    const pauseIcon = btn.querySelector('.btn-icon-pause');
    const btnText = btn.querySelector('.btn-text');

    console.log('updatePlaybackButtonState called, isPaused:', isPaused);
    console.log('playIcon:', playIcon, 'pauseIcon:', pauseIcon, 'btnText:', btnText);

    if (isPaused) {
      if (playIcon) {
        playIcon.style.display = 'flex';
        console.log('Set playIcon to flex');
      }
      if (pauseIcon) {
        pauseIcon.style.display = 'none';
        console.log('Set pauseIcon to none');
      }
      if (btnText) {
        btnText.textContent = '继续';
        console.log('Set btnText to 继续');
      }
    } else {
      if (playIcon) {
        playIcon.style.display = 'none';
        console.log('Set playIcon to none');
      }
      if (pauseIcon) {
        pauseIcon.style.display = 'flex';
        console.log('Set pauseIcon to flex');
      }
      if (btnText) {
        btnText.textContent = '暂停';
        console.log('Set btnText to 暂停');
      }
    }
  }

  function loadRecordingState() {
    chrome.storage.local.get(['recordingState', 'operations'], (result) => {
      if (result.recordingState) {
        updateRecordingState(result.recordingState);
      }
      if (result.operations) {
        updateOperations(result.operations);
      }
    });
  }

  function updateRecordingState(state) {
    recordingState = state;
    const statusEl = elements.recordingStatus;

    statusEl.classList.remove('recording', 'paused', 'idle');

    switch (state) {
      case 'recording':
        statusEl.classList.add('recording');
        elements.statusText.textContent = '录制中';
        elements.btnRecord.disabled = true;
        elements.btnPause.disabled = false;
        elements.btnStop.disabled = false;
        elements.btnClear.disabled = true;
        if (!recordingStartTime) {
          recordingStartTime = Date.now();
          startDurationTimer();
        }
        break;
      case 'paused':
        statusEl.classList.add('paused');
        elements.statusText.textContent = '已暂停';
        elements.btnRecord.disabled = true;
        elements.btnPause.disabled = false;
        elements.btnStop.disabled = false;
        elements.btnClear.disabled = false;
        stopDurationTimer();
        break;
      case 'idle':
      default:
        statusEl.classList.add('idle');
        elements.statusText.textContent = '未录制';
        elements.btnRecord.disabled = false;
        elements.btnPause.disabled = true;
        elements.btnStop.disabled = true;
        elements.btnClear.disabled = operations.length === 0;
        recordingStartTime = null;
        stopDurationTimer();
        break;
    }
  }

  function updateOperations(ops) {
    const isNewOperation = ops && ops.length > lastOperationCount;
    const shouldScrollToBottom = isNewOperation && recordingState === 'recording';

    operations = ops || [];
    elements.operationCount.textContent = operations.length;
    elements.btnClear.disabled = operations.length === 0 || recordingState !== 'idle';
    elements.btnExport.disabled = operations.length === 0;
    elements.btnPlayback.disabled = operations.length === 0;
    elements.btnStepOver.disabled = operations.length === 0;

    renderOperationsList(shouldScrollToBottom);
    lastOperationCount = operations.length;
  }

  function renderOperationsList(shouldScrollToBottom = false) {
    if (operations.length === 0) {
      elements.emptyState.hidden = false;
      const existingItems = elements.operationsList.querySelectorAll('.operation-item');
      existingItems.forEach(item => item.remove());
      return;
    }

    elements.emptyState.hidden = true;

    const fragment = document.createDocumentFragment();
    operations.forEach((op, index) => {
      const item = createOperationItem(op, index);
      fragment.appendChild(item);
    });

    const existingItems = elements.operationsList.querySelectorAll('.operation-item');
    existingItems.forEach(item => item.remove());
    elements.operationsList.appendChild(fragment);

    if (shouldScrollToBottom) {
      elements.operationsList.scrollTo({
        top: elements.operationsList.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function createOperationItem(op, index) {
    const item = document.createElement('div');
    item.className = 'operation-item';
    item.dataset.index = index;

    const time = op.timestamp ? formatTime(op.timestamp) : formatTime(Date.now());

    item.innerHTML = `
      <span class="operation-number">${index + 1}</span>
      <div class="operation-icon ${op.type}">${ICON_SVGS[op.type] || ICON_SVGS.click}</div>
      <div class="operation-content">
        <div class="operation-type ${op.type}">${TYPE_NAMES[op.type] || op.type}</div>
        <div class="operation-target">${getOperationDescription(op)}</div>
        <div class="operation-time">${time}</div>
      </div>
      <div class="operation-actions">
        <button class="btn-delete-operation" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-delete-operation')) {
        showOperationDetail(index);
      }
    });

    item.querySelector('.btn-delete-operation').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteOperation(index);
    });

    return item;
  }

  function getOperationDescription(op) {
    switch (op.type) {
      case 'click':
        return op.target?.selector || op.target?.text || '点击元素';
      case 'input':
        return op.target?.selector || '输入框';
      case 'change':
        return op.target?.selector || `change: ${String(op.data?.newValue !== undefined ? op.data.newValue : op.data?.value ?? '')}`;
      case 'navigate':
        return op.data?.url || '页面导航';
      case 'scroll':
        return `滚动至 (${op.data?.scrollPosition?.x || 0}, ${op.data?.scrollPosition?.y || 0})`;
      case 'wait':
        return op.data?.condition || '等待条件';
      case 'hover':
        return op.target?.selector || op.target?.text || '悬停元素';
      case 'key':
        return `按键: ${op.data?.key || 'Unknown'}`;
      default:
        return '未知操作';
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function startDurationTimer() {
    stopDurationTimer();
    durationTimer = setInterval(() => {
      if (recordingStartTime && recordingState === 'recording') {
        const duration = Date.now() - recordingStartTime;
        elements.recordingDuration.textContent = formatDuration(duration);
      }
    }, 1000);
  }

  function stopDurationTimer() {
    if (durationTimer) {
      clearInterval(durationTimer);
      durationTimer = null;
    }
  }

  async function startRecording() {
    if (port) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      port.postMessage({ type: 'startRecording', tabId: tab?.id });
    }
    recordingStartTime = Date.now();
    startDurationTimer();
  }

  function togglePause() {
    if (recordingState === 'recording') {
      if (port) {
        port.postMessage({ type: 'pauseRecording' });
      }
    } else if (recordingState === 'paused') {
      if (port) {
        port.postMessage({ type: 'resumeRecording' });
      }
      startDurationTimer();
    }
  }

  function stopRecording() {
    if (port) {
      port.postMessage({ type: 'stopRecording' });
    }
    stopDurationTimer();
  }

  function clearRecording() {
    if (confirm('确定要清空所有录制的操作吗？')) {
      operations = [];
      updateOperations([]);
      if (port) {
        port.postMessage({ type: 'clearRecording' });
      }
    }
  }

  function deleteOperation(index) {
    operations.splice(index, 1);
    updateOperations(operations);
    if (port) {
      port.postMessage({ type: 'updateOperations', operations });
    }
  }

  function deleteSelectedOperation() {
    if (selectedOperationIndex !== null) {
      deleteOperation(selectedOperationIndex);
      closeModal();
    }
  }

  function showOperationDetail(index) {
    selectedOperationIndex = index;
    const op = operations[index];
    if (!op) return;

    const activeItems = elements.operationsList.querySelectorAll('.operation-item.active');
    activeItems.forEach(item => item.classList.remove('active'));
    const item = elements.operationsList.querySelector(`[data-index="${index}"]`);
    if (item) item.classList.add('active');

    let html = '';
    html += createDetailRow('操作类型', TYPE_NAMES[op.type] || op.type);
    html += createDetailRow('时间戳', new Date(op.timestamp).toLocaleString());

    if (op.target) {
      if (op.target.selector) {
        html += createDetailRow('CSS 选择器', op.target.selector, true);
      }
      if (op.target.xpath) {
        html += createDetailRow('XPath', op.target.xpath, true);
      }
      if (op.target.text) {
        html += createDetailRow('元素文本', op.target.text);
      }
      if (op.target.attributes) {
        const attrs = Object.entries(op.target.attributes)
          .map(([k, v]) => `${k}="${v}"`)
          .join(', ');
        if (attrs) {
          html += createDetailRow('元素属性', attrs);
        }
      }
    }

    if (op.data) {
      if (op.data.value) {
        html += createDetailRow('输入值', op.data.value);
      }
      if (op.data.newValue !== undefined) {
        html += createDetailRow('New Value', String(op.data.newValue));
      }
      if (op.data.url) {
        html += createDetailRow('目标 URL', op.data.url);
      }
      if (op.data.scrollPosition) {
        html += createDetailRow('滚动位置', `X: ${op.data.scrollPosition.x}, Y: ${op.data.scrollPosition.y}`);
      }
      if (op.data.condition) {
        html += createDetailRow('等待条件', op.data.condition);
      }
      if (op.data.key) {
        html += createDetailRow('按键', op.data.key);
      }
    }

    elements.modalBody.innerHTML = html;
    elements.operationDetailModal.hidden = false;
  }

  function createDetailRow(label, value, isCode = false) {
    return `
      <div class="detail-row">
        <span class="detail-label">${label}</span>
        <span class="detail-value ${isCode ? 'selector' : ''}">${value || '-'}</span>
      </div>
    `;
  }

  function closeModal() {
    elements.operationDetailModal.hidden = true;
    selectedOperationIndex = null;
    const activeItems = elements.operationsList.querySelectorAll('.operation-item.active');
    activeItems.forEach(item => item.classList.remove('active'));
  }

  function scrollToTop() {
    elements.operationsList.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportJSON() {
    if (operations.length === 0) return;

    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      totalSteps: operations.length,
      steps: operations.map((op, index) => ({
        id: index + 1,
        type: op.type,
        timestamp: op.timestamp,
        target: op.target || {},
        data: op.data || {}
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `recording_${timestamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function togglePlayback() {
    console.log('togglePlayback called, isPlayingPlayback:', isPlayingPlayback, 'isPausedPlayback:', isPausedPlayback);
    if (!port || operations.length === 0) {
      console.log('Early return: port or operations empty');
      return;
    }

    if (!isPlayingPlayback) {
      console.log('Starting playback');
      isPlayingPlayback = true;
      isPausedPlayback = false;
      port.postMessage({ type: 'startPlayback', operations });
      if (elements.playbackIndicator) {
        elements.playbackIndicator.hidden = false;
      }
      if (elements.playbackStep) {
        elements.playbackStep.textContent = `0/${operations.length}`;
      }
      updatePlaybackButtonState(false);
      if (elements.btnStopPlayback) {
        elements.btnStopPlayback.disabled = false;
      }
      if (elements.btnStepOver) {
        elements.btnStepOver.disabled = true;
      }
      currentPlaybackStep = 0;
    } else if (isPausedPlayback) {
      isPausedPlayback = false;
      port.postMessage({ type: 'resumePlayback' });
      updatePlaybackButtonState(false);
      if (elements.btnStepOver) {
        elements.btnStepOver.disabled = true;
      }
    } else {
      isPausedPlayback = true;
      port.postMessage({ type: 'pausePlayback' });
      updatePlaybackButtonState(true);
      if (elements.btnStepOver) {
        elements.btnStepOver.disabled = false;
      }
    }
  }

  function stepOver() {
    if (!port || operations.length === 0) return;

    if (!isPlayingPlayback) {
      isPlayingPlayback = true;
      isPausedPlayback = true;
      if (elements.playbackIndicator) {
        elements.playbackIndicator.hidden = false;
      }
      if (elements.playbackStep) {
        elements.playbackStep.textContent = `0/${operations.length}`;
      }
      updatePlaybackButtonState(true);
      if (elements.btnStopPlayback) {
        elements.btnStopPlayback.disabled = false;
      }
      if (elements.btnStepOver) {
        elements.btnStepOver.disabled = false;
      }
      currentPlaybackStep = 0;
    }

    port.postMessage({ type: 'stepOver', operations });
  }

  function stopPlayback() {
    if (port) {
      port.postMessage({ type: 'stopPlayback' });
    }
    stopPlaybackUI();
  }

  function updatePlaybackUI(step, total) {
    currentPlaybackStep = step;
    if (elements.playbackStep) {
      elements.playbackStep.textContent = `${step}/${total}`;
    }

    if (elements.operationsList) {
      const items = elements.operationsList.querySelectorAll('.operation-item');
      items.forEach((item, index) => {
        if (index + 1 < step) {
          item.classList.add('completed');
          item.classList.remove('active');
        } else if (index + 1 === step) {
          item.classList.add('active');
          item.classList.remove('completed');
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          item.classList.remove('active', 'completed');
        }
      });
    }
  }

  function stopPlaybackUI() {
    isPlayingPlayback = false;
    isPausedPlayback = false;

    if (elements.playbackIndicator) {
      elements.playbackIndicator.hidden = true;
    }
    if (elements.btnPlayback) {
      const playIcon = elements.btnPlayback.querySelector('.btn-icon-play');
      const pauseIcon = elements.btnPlayback.querySelector('.btn-icon-pause');
      const btnText = elements.btnPlayback.querySelector('.btn-text');
      if (playIcon) playIcon.style.display = 'flex';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (btnText) btnText.textContent = '回放';
      elements.btnPlayback.disabled = operations.length === 0;
    }
    if (elements.btnStopPlayback) {
      elements.btnStopPlayback.disabled = true;
    }
    if (elements.btnStepOver) {
      elements.btnStepOver.disabled = operations.length === 0;
    }

    if (elements.operationsList) {
      const items = elements.operationsList.querySelectorAll('.operation-item');
      items.forEach(item => {
        item.classList.remove('active', 'completed');
      });
    }

    currentPlaybackStep = 0;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
