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
    change: '变更',
    navigate: '导航',
    scroll: '滚动',
    wait: '等待',
    hover: '悬停',
    key: '按键'
  };

  const VIEW_NAMES = {
    home: 'home',
    recorder: 'recorder'
  };

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
  let currentView = VIEW_NAMES.home;

  const elements = {
    homeView: document.getElementById('homeView'),
    recorderView: document.getElementById('recorderView'),
    openRecorderCard: document.getElementById('openRecorderCard'),
    btnBackHome: document.getElementById('btnBackHome'),
    homeOperationCount: document.getElementById('homeOperationCount'),
    recordingStatus: document.getElementById('recordingStatus'),
    statusText: document.getElementById('statusText'),
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
    switchView(VIEW_NAMES.home);
  }

  function switchView(viewName) {
    currentView = viewName;
    elements.homeView.classList.toggle('hidden', viewName !== VIEW_NAMES.home);
    elements.recorderView.classList.toggle('hidden', viewName !== VIEW_NAMES.recorder);
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
        elements.btnStepOver.disabled = false;
        break;
      case 'playbackResumed':
        isPausedPlayback = false;
        updatePlaybackButtonState(false);
        elements.btnStepOver.disabled = true;
        break;
      default:
        break;
    }
  }

  function setupEventListeners() {
    elements.openRecorderCard.addEventListener('click', () => switchView(VIEW_NAMES.recorder));
    elements.btnBackHome.addEventListener('click', () => switchView(VIEW_NAMES.home));
    elements.btnRecord.addEventListener('click', () => startRecording());
    elements.btnPause.addEventListener('click', () => togglePause());
    elements.btnStop.addEventListener('click', () => stopRecording());
    elements.btnClear.addEventListener('click', () => clearRecording());
    elements.btnExport.addEventListener('click', () => exportJSON());
    elements.btnPlayback.addEventListener('click', () => togglePlayback());
    elements.btnStopPlayback.addEventListener('click', () => stopPlayback());
    elements.btnStepOver.addEventListener('click', () => stepOver());
    elements.btnScrollToTop.addEventListener('click', scrollToTop);
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnDeleteOperation.addEventListener('click', deleteSelectedOperation);
    elements.operationDetailModal.addEventListener('click', (event) => {
      if (event.target === elements.operationDetailModal) {
        closeModal();
      }
    });
  }

  function updatePlaybackButtonState(isPaused) {
    const playIcon = elements.btnPlayback.querySelector('.btn-icon-play');
    const pauseIcon = elements.btnPlayback.querySelector('.btn-icon-pause');
    const btnText = elements.btnPlayback.querySelector('.btn-text');

    if (isPaused) {
      playIcon.style.display = 'flex';
      pauseIcon.style.display = 'none';
      btnText.textContent = '继续';
    } else {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'flex';
      btnText.textContent = '暂停';
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
    elements.recordingStatus.classList.remove('recording', 'paused', 'idle');

    switch (state) {
      case 'recording':
        elements.recordingStatus.classList.add('recording');
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
        elements.recordingStatus.classList.add('paused');
        elements.statusText.textContent = '已暂停';
        elements.btnRecord.disabled = true;
        elements.btnPause.disabled = false;
        elements.btnStop.disabled = false;
        elements.btnClear.disabled = false;
        stopDurationTimer();
        break;
      case 'idle':
      default:
        elements.recordingStatus.classList.add('idle');
        elements.statusText.textContent = '未录制';
        elements.btnRecord.disabled = false;
        elements.btnPause.disabled = true;
        elements.btnStop.disabled = true;
        elements.btnClear.disabled = operations.length === 0;
        recordingStartTime = null;
        stopDurationTimer();
        if (!operations.length) {
          elements.recordingDuration.textContent = '00:00';
        }
        break;
    }
  }

  function updateOperations(ops) {
    const nextOperations = Array.isArray(ops) ? ops : [];
    const isNewOperation = nextOperations.length > lastOperationCount;
    const shouldScrollToBottom = isNewOperation && recordingState === 'recording';

    operations = nextOperations;
    elements.operationCount.textContent = operations.length;
    elements.homeOperationCount.textContent = `${operations.length} 个步骤`;
    elements.btnClear.disabled = operations.length === 0 || recordingState !== 'idle';
    elements.btnExport.disabled = operations.length === 0;
    elements.btnPlayback.disabled = operations.length === 0;
    elements.btnStepOver.disabled = operations.length === 0 || (isPlayingPlayback && !isPausedPlayback);

    renderOperationsList(shouldScrollToBottom);
    lastOperationCount = operations.length;
  }

  function renderOperationsList(shouldScrollToBottom) {
    if (operations.length === 0) {
      elements.emptyState.hidden = false;
      elements.operationsList.querySelectorAll('.operation-item').forEach((item) => item.remove());
      return;
    }

    elements.emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    operations.forEach((operation, index) => {
      fragment.appendChild(createOperationItem(operation, index));
    });

    elements.operationsList.querySelectorAll('.operation-item').forEach((item) => item.remove());
    elements.operationsList.appendChild(fragment);

    if (shouldScrollToBottom) {
      elements.operationsList.scrollTo({
        top: elements.operationsList.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function createOperationItem(operation, index) {
    const item = document.createElement('div');
    item.className = 'operation-item';
    item.dataset.index = String(index);

    item.innerHTML = `
      <span class="operation-number">${index + 1}</span>
      <div class="operation-icon ${operation.type}">${ICON_SVGS[operation.type] || ICON_SVGS.click}</div>
      <div class="operation-content">
        <div class="operation-type ${operation.type}">${TYPE_NAMES[operation.type] || operation.type}</div>
        <div class="operation-target">${escapeHtml(getOperationDescription(operation))}</div>
        <div class="operation-time">${formatTime(operation.timestamp || Date.now())}</div>
      </div>
      <div class="operation-actions">
        <button class="btn-delete-operation" title="删除" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    item.addEventListener('click', (event) => {
      if (!event.target.closest('.btn-delete-operation')) {
        showOperationDetail(index);
      }
    });

    item.querySelector('.btn-delete-operation').addEventListener('click', (event) => {
      event.stopPropagation();
      deleteOperation(index);
    });

    return item;
  }

  function getOperationDescription(operation) {
    switch (operation.type) {
      case 'click':
        return operation.target?.text || operation.target?.selector || operation.target?.xpath || '点击元素';
      case 'input':
        return operation.target?.text || operation.target?.selector || '输入框';
      case 'change':
        return operation.target?.text || operation.target?.selector || `变更值: ${String(operation.data?.newValue ?? operation.data?.value ?? '')}`;
      case 'navigate':
        return operation.data?.url || '页面导航';
      case 'scroll':
        return `滚动到 (${operation.data?.scrollPosition?.x || 0}, ${operation.data?.scrollPosition?.y || 0})`;
      case 'wait':
        return operation.data?.condition || '等待条件';
      case 'hover':
        return operation.target?.text || operation.target?.selector || operation.target?.xpath || '悬停元素';
      case 'key':
        return `按键: ${operation.data?.key || 'Unknown'}`;
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
        elements.recordingDuration.textContent = formatDuration(Date.now() - recordingStartTime);
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
    if (!port) {
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    port.postMessage({ type: 'startRecording', tabId: tab?.id });
    recordingStartTime = Date.now();
    startDurationTimer();
  }

  function togglePause() {
    if (!port) {
      return;
    }

    if (recordingState === 'recording') {
      port.postMessage({ type: 'pauseRecording' });
    } else if (recordingState === 'paused') {
      port.postMessage({ type: 'resumeRecording' });
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
    if (!confirm('确定要清空所有录制操作吗？')) {
      return;
    }

    operations = [];
    updateOperations([]);
    if (port) {
      port.postMessage({ type: 'clearRecording' });
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
    if (selectedOperationIndex === null) {
      return;
    }

    deleteOperation(selectedOperationIndex);
    closeModal();
  }

  function showOperationDetail(index) {
    selectedOperationIndex = index;
    const operation = operations[index];
    if (!operation) {
      return;
    }

    elements.operationsList.querySelectorAll('.operation-item.active').forEach((item) => {
      item.classList.remove('active');
    });
    const activeItem = elements.operationsList.querySelector(`[data-index="${index}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    const rows = [];
    rows.push(createDetailRow('操作类型', TYPE_NAMES[operation.type] || operation.type));
    rows.push(createDetailRow('时间', new Date(operation.timestamp).toLocaleString()));

    if (operation.target?.selector) {
      rows.push(createDetailRow('CSS 选择器', operation.target.selector, true));
    }
    if (operation.target?.xpath) {
      rows.push(createDetailRow('XPath', operation.target.xpath, true));
    }
    if (operation.target?.text) {
      rows.push(createDetailRow('元素文本', operation.target.text));
    }
    if (operation.target?.attributes) {
      const attrs = Object.entries(operation.target.attributes)
        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
        .map(([key, value]) => `${key}="${value}"`)
        .join(', ');
      if (attrs) {
        rows.push(createDetailRow('元素属性', attrs));
      }
    }
    if (operation.data?.value) {
      rows.push(createDetailRow('输入值', String(operation.data.value)));
    }
    if (operation.data?.newValue !== undefined) {
      rows.push(createDetailRow('新值', String(operation.data.newValue)));
    }
    if (operation.data?.url) {
      rows.push(createDetailRow('目标 URL', operation.data.url));
    }
    if (operation.data?.scrollPosition) {
      rows.push(createDetailRow('滚动位置', `X: ${operation.data.scrollPosition.x}, Y: ${operation.data.scrollPosition.y}`));
    }
    if (operation.data?.condition) {
      rows.push(createDetailRow('等待条件', operation.data.condition));
    }
    if (operation.data?.key) {
      rows.push(createDetailRow('按键', operation.data.key));
    }

    elements.modalBody.innerHTML = rows.join('');
    elements.operationDetailModal.classList.remove('hidden');
  }

  function createDetailRow(label, value, isCode) {
    return `
      <div class="detail-row">
        <span class="detail-label">${escapeHtml(label)}</span>
        <span class="detail-value ${isCode ? 'selector' : ''}">${escapeHtml(value || '-')}</span>
      </div>
    `;
  }

  function closeModal() {
    elements.operationDetailModal.classList.add('hidden');
    selectedOperationIndex = null;
    elements.operationsList.querySelectorAll('.operation-item.active').forEach((item) => {
      item.classList.remove('active');
    });
  }

  function scrollToTop() {
    elements.operationsList.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportJSON() {
    if (!operations.length) {
      return;
    }

    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      totalSteps: operations.length,
      steps: operations.map((operation, index) => ({
        id: index + 1,
        type: operation.type,
        timestamp: operation.timestamp,
        target: operation.target || {},
        data: operation.data || {}
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `recording_${timestamp}.json`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function togglePlayback() {
    if (!port || !operations.length) {
      return;
    }

    if (!isPlayingPlayback) {
      isPlayingPlayback = true;
      isPausedPlayback = false;
      port.postMessage({ type: 'startPlayback', operations });
      elements.playbackIndicator.classList.remove('hidden');
      elements.playbackStep.textContent = `0/${operations.length}`;
      updatePlaybackButtonState(false);
      elements.btnStopPlayback.disabled = false;
      elements.btnStepOver.disabled = true;
      currentPlaybackStep = 0;
      return;
    }

    if (isPausedPlayback) {
      isPausedPlayback = false;
      port.postMessage({ type: 'resumePlayback' });
      updatePlaybackButtonState(false);
      elements.btnStepOver.disabled = true;
      return;
    }

    isPausedPlayback = true;
    port.postMessage({ type: 'pausePlayback' });
    updatePlaybackButtonState(true);
    elements.btnStepOver.disabled = false;
  }

  function stepOver() {
    if (!port || !operations.length) {
      return;
    }

    if (!isPlayingPlayback) {
      isPlayingPlayback = true;
      isPausedPlayback = true;
      elements.playbackIndicator.classList.remove('hidden');
      elements.playbackStep.textContent = `0/${operations.length}`;
      updatePlaybackButtonState(true);
      elements.btnStopPlayback.disabled = false;
      elements.btnStepOver.disabled = false;
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
    elements.playbackStep.textContent = `${step}/${total}`;

    elements.operationsList.querySelectorAll('.operation-item').forEach((item, index) => {
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

  function stopPlaybackUI() {
    isPlayingPlayback = false;
    isPausedPlayback = false;
    currentPlaybackStep = 0;

    elements.playbackIndicator.classList.add('hidden');

    const playIcon = elements.btnPlayback.querySelector('.btn-icon-play');
    const pauseIcon = elements.btnPlayback.querySelector('.btn-icon-pause');
    const btnText = elements.btnPlayback.querySelector('.btn-text');
    playIcon.style.display = 'flex';
    pauseIcon.style.display = 'none';
    btnText.textContent = '回放';

    elements.btnPlayback.disabled = operations.length === 0;
    elements.btnStopPlayback.disabled = true;
    elements.btnStepOver.disabled = operations.length === 0;

    elements.operationsList.querySelectorAll('.operation-item').forEach((item) => {
      item.classList.remove('active', 'completed');
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
