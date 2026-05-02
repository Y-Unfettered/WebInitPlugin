(function() {
  const STORAGE_KEYS = {
    customTools: 'customAutomationTools'
  };

  const ICON_SVGS = {
    click: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>',
    input: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    change: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    navigate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
    wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    hover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M12 7v5l3 3"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="7" height="7" rx="2"></rect><rect x="14" y="4" width="7" height="7" rx="2"></rect><rect x="8.5" y="13" width="7" height="7" rx="2"></rect><path d="M10 8h4M12 11v2"></path></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z"></path></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>',
    magic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4l1.2 3.3L11.5 8.5 8.2 9.7 7 13 5.8 9.7 2.5 8.5l3.3-1.2L7 4z"></path><path d="M16 3l.9 2.5L19.5 6.5 17 7.4 16 10l-.9-2.6L12.5 6.5l2.6-1L16 3z"></path><path d="M14 14l1.6 4.4L20 20l-4.4 1.6L14 26l-1.6-4.4L8 20l4.4-1.6L14 14z" transform="translate(0 -2)"></path></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"></path></svg>',
    window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 8h18"></path></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V5a1 1 0 012 0v6"></path><path d="M11 11V4a1 1 0 112 0v7"></path><path d="M15 11V6a1 1 0 112 0v7"></path><path d="M19 11a1 1 0 112 0v3a7 7 0 01-7 7h-2a7 7 0 01-7-7v-1a2 2 0 012-2h12z"></path></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>'
  };

  const PRESET_ICON_OPTIONS = [
    { id: 'spark', label: '灵感', svgKey: 'spark' },
    { id: 'filter', label: '筛选', svgKey: 'filter' },
    { id: 'target', label: '定位', svgKey: 'target' },
    { id: 'list', label: '列表', svgKey: 'list' },
    { id: 'magic', label: '生成', svgKey: 'magic' },
    { id: 'bolt', label: '效率', svgKey: 'bolt' },
    { id: 'window', label: '页面', svgKey: 'window' },
    { id: 'hand', label: '交互', svgKey: 'hand' },
    { id: 'grid', label: '工具', svgKey: 'grid' }
  ];

  const TYPE_NAMES = {
    click: '点击',
    input: '输入',
    change: '变更',
    navigate: '导航',
    scroll: '滚动',
    wait: '等待',
    hover: '悬停',
    key: '按键',
    group: '融合组'
  };

  const VIEW_NAMES = {
    home: 'home',
    generator: 'generator',
    runner: 'runner',
    recorder: 'recorder'
  };

  const RUNNER_COLLECT_FIELD_OPTIONS = [
    { id: 'title', label: '视频标题' },
    { id: 'author', label: '作者昵称' },
    { id: 'publishTime', label: '发布时间' },
    { id: 'duration', label: '视频时长' },
    { id: 'likes', label: '点赞数' },
    { id: 'comments', label: '评论数' },
    { id: 'favorites', label: '收藏数' },
    { id: 'shares', label: '分享数' },
    { id: 'videoUrl', label: '视频链接' },
    { id: 'coverUrl', label: '封面链接' },
    { id: 'commentSample', label: '评论内容' },
    { id: 'tags', label: '话题标签' }
  ];

  const RUNNER_CONFIG_FIELD_OPTIONS = [
    { id: 'keyword', label: '关键词' },
    { id: 'sortBy', label: '排序依据' },
    { id: 'publishTime', label: '发布时间' },
    { id: 'videoDuration', label: '视频时长' },
    { id: 'searchScope', label: '搜索范围' },
    { id: 'contentFormat', label: '内容形式' },
    { id: 'collectCount', label: '采集视频数量' },
    { id: 'commentCount', label: '每视频评论数' },
    { id: 'failureThreshold', label: '连续失败阈值' },
    { id: 'confirmBeforeSearch', label: '搜索前确认' },
    { id: 'confirmAfterFilter', label: '筛选后确认' },
    { id: 'confirmBeforeEachCollect', label: '每条采集前确认' },
    { id: 'confirmBeforeExport', label: '导出前确认' }
  ];

  const GROUP_BINDING_TYPE_OPTIONS = [
    { id: '', label: '不绑定特殊类型' },
    { id: 'singleChoice', label: '单选类' },
    { id: 'loop', label: '循环类' }
  ];

  const GROUP_SINGLE_CHOICE_FIELD_OPTIONS = [
    { id: 'sortBy', label: '排序依据' },
    { id: 'publishTime', label: '发布时间' },
    { id: 'videoDuration', label: '视频时长' },
    { id: 'searchScope', label: '搜索范围' },
    { id: 'contentFormat', label: '内容形式' }
  ];

  const GROUP_LOOP_FIELD_OPTIONS = [
    { id: 'collectCount', label: '采集视频数量' },
    { id: 'commentCount', label: '每条视频评论数' }
  ];

  const RUNNER_SELECT_OPTIONS = {
    sortBy: [
      { value: 'comprehensive', label: '综合排序' },
      { value: 'latest', label: '最新发布' },
      { value: 'mostLiked', label: '最多点赞' }
    ],
    publishTime: [
      { value: 'all', label: '不限' },
      { value: '1d', label: '一天内' },
      { value: '7d', label: '一周内' },
      { value: '180d', label: '半年内' }
    ],
    videoDuration: [
      { value: 'all', label: '不限' },
      { value: 'lt1m', label: '1分钟以下' },
      { value: '1to5m', label: '1 到 5 分钟' },
      { value: 'gt5m', label: '5 分钟以上' }
    ],
    searchScope: [
      { value: 'all', label: '不限' },
      { value: 'following', label: '关注的人' },
      { value: 'watched', label: '最近看过' },
      { value: 'unwatched', label: '还未看过' }
    ],
    contentFormat: [
      { value: 'all', label: '不限' },
      { value: 'video', label: '视频' },
      { value: 'imageText', label: '图文' }
    ]
  };

  const RUNNER_CONFIG_FIELD_DEFINITIONS = [
    { id: 'keyword', label: '关键词', type: 'text', defaultValue: '', layout: 'full', builtIn: true, enabled: true },
    { id: 'sortBy', label: '排序依据', type: 'select', defaultValue: 'comprehensive', options: RUNNER_SELECT_OPTIONS.sortBy, builtIn: true, enabled: true },
    { id: 'publishTime', label: '发布时间', type: 'select', defaultValue: '7d', options: RUNNER_SELECT_OPTIONS.publishTime, builtIn: true, enabled: true },
    { id: 'videoDuration', label: '视频时长', type: 'select', defaultValue: 'all', options: RUNNER_SELECT_OPTIONS.videoDuration, builtIn: true, enabled: true },
    { id: 'searchScope', label: '搜索范围', type: 'select', defaultValue: 'all', options: RUNNER_SELECT_OPTIONS.searchScope, builtIn: true, enabled: true },
    { id: 'contentFormat', label: '内容形式', type: 'select', defaultValue: 'all', options: RUNNER_SELECT_OPTIONS.contentFormat, builtIn: true, enabled: true },
    { id: 'collectCount', label: '采集视频数量', type: 'number', defaultValue: 5, min: 1, builtIn: true, enabled: true },
    { id: 'commentCount', label: '每视频评论数', type: 'number', defaultValue: 10, min: 0, builtIn: true, enabled: true },
    { id: 'failureThreshold', label: '连续失败阈值', type: 'number', defaultValue: 3, min: 1, builtIn: true, enabled: true },
    { id: 'confirmBeforeSearch', label: '搜索前确认', type: 'checkbox', defaultValue: false, builtIn: true, enabled: true },
    { id: 'confirmAfterFilter', label: '筛选后确认', type: 'checkbox', defaultValue: false, builtIn: true, enabled: true },
    { id: 'confirmBeforeEachCollect', label: '每条采集前确认', type: 'checkbox', defaultValue: false, builtIn: true, enabled: true },
    { id: 'confirmBeforeExport', label: '导出前确认', type: 'checkbox', defaultValue: false, builtIn: true, enabled: true }
  ];

  let port = null;
  let recordingState = 'idle';
  let operations = [];
  let lastOperationCount = 0;
  let recordingStartTime = null;
  let durationTimer = null;
  let isPausedPlayback = false;
  let isPlayingPlayback = false;
  let selectedOperationIndex = null;
  let draggedGeneratorStepId = null;
  let draggedSortStepId = null;
  let pendingIconSelection = null;
  let currentView = VIEW_NAMES.home;
  let generatorImportMode = 'replace';
  let configFieldDrafts = [];

  const generatorState = {
    importedFileName: '',
    steps: [],
    selectedToolId: null
  };

  const createToolDraft = {
    name: '',
    description: '',
    icon: null
  };

  const runnerState = {
    selectedToolId: null,
    activePage: 'config',
    isRunning: false,
    isPaused: false,
    totalSteps: 0,
    currentStep: 0
  };

  let customTools = [];

  const elements = {
    homeView: document.getElementById('homeView'),
    homeFeatureGrid: document.getElementById('homeFeatureGrid'),
    generatorView: document.getElementById('generatorView'),
    runnerView: document.getElementById('runnerView'),
    recorderView: document.getElementById('recorderView'),
    openGeneratorCard: document.getElementById('openGeneratorCard'),
    openRecorderCard: document.getElementById('openRecorderCard'),
    btnBackFromGenerator: document.getElementById('btnBackFromGenerator'),
    btnBackFromRunner: document.getElementById('btnBackFromRunner'),
    btnBackHome: document.getElementById('btnBackHome'),
    btnImportGeneratorJson: document.getElementById('btnImportGeneratorJson'),
    btnAppendGeneratorJson: document.getElementById('btnAppendGeneratorJson'),
    btnImportRecordingToGenerator: document.getElementById('btnImportRecordingToGenerator'),
    generatorFileInput: document.getElementById('generatorFileInput'),
    generatorFileName: document.getElementById('generatorFileName'),
    generatorStepCount: document.getElementById('generatorStepCount'),
    generatorOperationsList: document.getElementById('generatorOperationsList'),
    generatorEmptyState: document.getElementById('generatorEmptyState'),
    btnOpenCreateToolModal: document.getElementById('btnOpenCreateToolModal'),
    runnerToolTitle: document.getElementById('runnerToolTitle'),
    runnerConfigForm: document.getElementById('runnerConfigForm'),
    runnerCollectFields: document.getElementById('runnerCollectFields'),
    runnerLogList: document.getElementById('runnerLogList'),
    runnerStepsList: document.getElementById('runnerStepsList'),
    runnerStepsEmptyState: document.getElementById('runnerStepsEmptyState'),
    btnAppendRunnerJson: document.getElementById('btnAppendRunnerJson'),
    btnImportRecordingToRunner: document.getElementById('btnImportRecordingToRunner'),
    runnerPageTabs: Array.from(document.querySelectorAll('[data-runner-page-target]')),
    runnerPages: Array.from(document.querySelectorAll('[data-runner-page]')),
    btnRunnerPrevPage: document.getElementById('btnRunnerPrevPage'),
    btnRunnerNextPage: document.getElementById('btnRunnerNextPage'),
    btnRunRunner: document.getElementById('btnRunRunner'),
    btnStopRunner: document.getElementById('btnStopRunner'),
    btnEditRunnerTool: document.getElementById('btnEditRunnerTool'),
    btnSaveRunnerConfig: document.getElementById('btnSaveRunnerConfig'),
    configFieldModal: document.getElementById('configFieldModal'),
    btnCloseConfigFieldModal: document.getElementById('btnCloseConfigFieldModal'),
    configFieldManagerList: document.getElementById('configFieldManagerList'),
    btnAddConfigField: document.getElementById('btnAddConfigField'),
    configFieldTypeChooser: document.getElementById('configFieldTypeChooser'),
    btnSaveConfigFieldModal: document.getElementById('btnSaveConfigFieldModal'),
    toastStack: document.getElementById('toastStack'),
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
    btnDeleteOperation: document.getElementById('btnDeleteOperation'),
    stepSortModal: document.getElementById('stepSortModal'),
    btnCloseStepSortModal: document.getElementById('btnCloseStepSortModal'),
    stepSortList: document.getElementById('stepSortList'),
    createToolModal: document.getElementById('createToolModal'),
    btnCloseCreateToolModal: document.getElementById('btnCloseCreateToolModal'),
    toolNameInput: document.getElementById('toolNameInput'),
    toolDescriptionInput: document.getElementById('toolDescriptionInput'),
    btnSelectToolIcon: document.getElementById('btnSelectToolIcon'),
    toolIconPreview: document.getElementById('toolIconPreview'),
    toolIconLabel: document.getElementById('toolIconLabel'),
    btnConfirmCreateTool: document.getElementById('btnConfirmCreateTool'),
    iconPickerModal: document.getElementById('iconPickerModal'),
    btnCloseIconPickerModal: document.getElementById('btnCloseIconPickerModal'),
    iconPickerGrid: document.getElementById('iconPickerGrid'),
    localIconInput: document.getElementById('localIconInput')
  };

  function init() {
    customTools = loadCustomTools();
    hydrateRunnerSelectOptions();
    renderIconPicker();
    renderRunnerCollectFields();
    renderHomeCards();
    connectToBackground();
    setupEventListeners();
    loadRecordingState();
    syncGeneratorMeta();
    syncCreateToolDraftUI();
    renderGeneratorSteps();
    renderRunnerSteps();
    switchView(VIEW_NAMES.home);
  }

  function setupEventListeners() {
    elements.openGeneratorCard.addEventListener('click', () => {
      generatorState.selectedToolId = null;
      switchView(VIEW_NAMES.generator);
    });
    elements.openRecorderCard.addEventListener('click', () => switchView(VIEW_NAMES.recorder));
    elements.btnBackFromGenerator.addEventListener('click', () => switchView(VIEW_NAMES.home));
    elements.btnBackFromRunner.addEventListener('click', () => switchView(VIEW_NAMES.home));
    elements.btnBackHome.addEventListener('click', () => switchView(VIEW_NAMES.home));
    elements.btnImportGeneratorJson.addEventListener('click', () => openGeneratorFilePicker('replace'));
    elements.btnAppendGeneratorJson?.addEventListener('click', () => openGeneratorFilePicker('append'));
    elements.btnImportRecordingToGenerator?.addEventListener('click', () => importRecordedOperationsIntoSteps('append'));
    elements.generatorFileInput.addEventListener('change', handleGeneratorFileImport);
    elements.btnOpenCreateToolModal.addEventListener('click', openCreateToolModal);
    elements.btnEditRunnerTool.addEventListener('click', handleRunnerEditButton);
    elements.btnAppendRunnerJson?.addEventListener('click', () => openGeneratorFilePicker('append'));
    elements.btnImportRecordingToRunner?.addEventListener('click', openConfigFieldModal);
    elements.btnRunnerPrevPage.addEventListener('click', () => stepRunnerPage(-1));
    elements.btnRunnerNextPage.addEventListener('click', () => stepRunnerPage(1));
    elements.btnRunRunner.addEventListener('click', runRunnerTool);
    elements.btnStopRunner?.addEventListener('click', stopRunnerTool);
    elements.btnSaveRunnerConfig.addEventListener('click', saveRunnerConfig);
    elements.btnCloseConfigFieldModal?.addEventListener('click', closeConfigFieldModal);
    elements.btnAddConfigField?.addEventListener('click', addConfigFieldDraft);
    elements.btnSaveConfigFieldModal?.addEventListener('click', saveConfigFieldModal);
    elements.runnerConfigForm.addEventListener('input', handleRunnerConfigFormChange);
    elements.runnerConfigForm.addEventListener('change', handleRunnerConfigFormChange);
    elements.runnerCollectFields.addEventListener('change', handleRunnerCollectFieldsChange);
    elements.runnerPageTabs.forEach((button) => {
      button.addEventListener('click', () => switchRunnerPage(button.dataset.runnerPageTarget));
    });

    elements.toolNameInput.addEventListener('input', (event) => {
      createToolDraft.name = event.target.value;
    });
    elements.toolDescriptionInput.addEventListener('input', (event) => {
      createToolDraft.description = event.target.value;
    });
    elements.btnSelectToolIcon.addEventListener('click', openIconPickerModal);
    elements.btnConfirmCreateTool.addEventListener('click', confirmCreateTool);
    elements.btnCloseCreateToolModal.addEventListener('click', closeCreateToolModal);
    elements.btnCloseIconPickerModal.addEventListener('click', closeIconPickerModal);
    elements.localIconInput.addEventListener('change', handleLocalIconSelected);

    elements.btnRecord.addEventListener('click', startRecording);
    elements.btnPause.addEventListener('click', togglePause);
    elements.btnStop.addEventListener('click', stopRecording);
    elements.btnClear.addEventListener('click', clearRecording);
    elements.btnExport.addEventListener('click', exportJSON);
    elements.btnPlayback.addEventListener('click', togglePlayback);
    elements.btnStopPlayback.addEventListener('click', stopPlayback);
    elements.btnStepOver.addEventListener('click', stepOver);
    elements.btnScrollToTop.addEventListener('click', scrollToTop);
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnDeleteOperation.addEventListener('click', deleteSelectedOperation);
    elements.btnCloseStepSortModal?.addEventListener('click', closeStepSortModal);

    [elements.operationDetailModal, elements.createToolModal, elements.iconPickerModal, elements.stepSortModal, elements.configFieldModal].forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target !== modal) {
          return;
        }
        if (modal === elements.operationDetailModal) {
          closeModal();
        } else if (modal === elements.stepSortModal) {
          closeStepSortModal();
        } else if (modal === elements.configFieldModal) {
          closeConfigFieldModal();
        } else if (modal === elements.createToolModal) {
          closeCreateToolModal();
        } else {
          closeIconPickerModal();
        }
      });
    });

    elements.generatorOperationsList.addEventListener('dragover', handleGeneratorListDragOver);
    elements.generatorOperationsList.addEventListener('drop', handleGeneratorListDrop);
    elements.runnerStepsList.addEventListener('dragover', handleGeneratorListDragOver);
    elements.runnerStepsList.addEventListener('drop', handleGeneratorListDrop);
    elements.configFieldManagerList?.addEventListener('input', handleConfigFieldManagerInput);
    elements.configFieldManagerList?.addEventListener('change', handleConfigFieldManagerInput);
    elements.configFieldManagerList?.addEventListener('click', handleConfigFieldManagerClick);
    elements.configFieldTypeChooser?.addEventListener('click', handleConfigFieldTypeChooserClick);
  }

  function connectToBackground() {
    if (!window.chrome || !chrome.runtime || !chrome.runtime.connect) {
      return;
    }

    try {
      port = chrome.runtime.connect({ name: 'sidebar' });
      port.onMessage.addListener(handleBackgroundMessage);
      port.onDisconnect.addListener(() => {
        port = null;
        setTimeout(connectToBackground, 1000);
      });
    } catch (error) {
      console.error('Failed to connect to background:', error);
    }
  }

  function loadRecordingState() {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      updateRecordingState('idle');
      updateOperations([]);
      return;
    }

    chrome.storage.local.get(['recordingState', 'operations'], (result) => {
      if (result.recordingState) {
        updateRecordingState(result.recordingState);
      } else {
        updateRecordingState('idle');
      }
      updateOperations(result.operations || []);
    });
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
        updateRunnerPlaybackStep(message.step, message.total);
        break;
      case 'playbackComplete':
        stopPlaybackUI();
        handleRunnerPlaybackComplete();
        break;
      case 'playbackPaused':
        isPausedPlayback = true;
        updatePlaybackButtonState(true);
        elements.btnStepOver.disabled = false;
        handleRunnerPlaybackPaused(message.step, message.total);
        break;
      case 'playbackResumed':
        isPausedPlayback = false;
        updatePlaybackButtonState(false);
        elements.btnStepOver.disabled = true;
        handleRunnerPlaybackResumed(message.step, message.total);
        break;
      default:
        break;
    }
  }

  function switchView(viewName) {
    currentView = viewName;
    elements.homeView.classList.toggle('hidden', viewName !== VIEW_NAMES.home);
    elements.generatorView.classList.toggle('hidden', viewName !== VIEW_NAMES.generator);
    elements.runnerView.classList.toggle('hidden', viewName !== VIEW_NAMES.runner);
    elements.recorderView.classList.toggle('hidden', viewName !== VIEW_NAMES.recorder);
  }

  function updateRecordingState(state) {
    recordingState = state || 'idle';
    elements.recordingStatus.classList.remove('recording', 'paused', 'idle');

    switch (recordingState) {
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

  function updateOperations(nextOperations) {
    const normalized = Array.isArray(nextOperations) ? nextOperations : [];
    const isNewOperation = normalized.length > lastOperationCount;
    const shouldScrollToBottom = isNewOperation && recordingState === 'recording';

    operations = normalized;
    elements.operationCount.textContent = String(operations.length);
    elements.homeOperationCount.textContent = `${operations.length} 个步骤`;
    elements.btnClear.disabled = operations.length === 0 || recordingState !== 'idle';
    elements.btnExport.disabled = operations.length === 0;
    elements.btnPlayback.disabled = operations.length === 0;
    elements.btnStepOver.disabled = operations.length === 0 || (isPlayingPlayback && !isPausedPlayback);

    renderRecordedOperations(shouldScrollToBottom);
    lastOperationCount = operations.length;
  }

  function renderRecordedOperations(shouldScrollToBottom) {
    syncEmptyStateVisibility(elements.emptyState, operations.length === 0);
    elements.operationsList.querySelectorAll('.operation-item').forEach((item) => item.remove());

    if (!operations.length) {
      return;
    }

    const fragment = document.createDocumentFragment();
    operations.forEach((operation, index) => {
      fragment.appendChild(createRecordedOperationItem(operation, index));
    });
    elements.operationsList.appendChild(fragment);

    if (shouldScrollToBottom) {
      elements.operationsList.scrollTo({
        top: elements.operationsList.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function createRecordedOperationItem(operation, index) {
    const item = document.createElement('div');
    item.className = 'operation-item';
    item.dataset.index = String(index);

    item.innerHTML = `
      <span class="operation-number">${index + 1}</span>
      <div class="operation-icon ${operation.type}">${ICON_SVGS[operation.type] || ICON_SVGS.click}</div>
      <div class="operation-content">
        <div class="operation-type">${escapeHtml(TYPE_NAMES[operation.type] || operation.type || '步骤')}</div>
        <div class="operation-target">${escapeHtml(getOperationDescription(operation))}</div>
        <div class="operation-time">${formatTime(operation.timestamp || Date.now())}</div>
      </div>
      <div class="operation-actions">
        <button class="btn-delete-operation" title="删除" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
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

  function handleGeneratorFileImport(event) {
    const [file] = event.target.files || [];
    if (!file) {
      generatorImportMode = 'replace';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || ''));
        applyImportedSteps(normalizeImportedOperations(payload), file.name, generatorImportMode);
      } catch (error) {
        console.error('Failed to import generator JSON:', error);
        window.alert('导入失败，请确认 JSON 文件格式正确。');
      } finally {
        generatorImportMode = 'replace';
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      window.alert('读取文件失败，请重试。');
      generatorImportMode = 'replace';
      event.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  function normalizeImportedOperations(payload) {
    const rawSteps = Array.isArray(payload) ? payload : payload?.steps;
    if (!Array.isArray(rawSteps)) {
      throw new Error('Invalid imported JSON format');
    }

    const importBatchId = createId('import');
    return rawSteps.map((step, index) => normalizeGeneratorStep(step, `${importBatchId}_${index}`));
  }

  function openGeneratorFilePicker(mode) {
    generatorImportMode = mode === 'append' ? 'append' : 'replace';
    elements.generatorFileInput.click();
  }

  function importRecordedOperationsIntoSteps(mode = 'append') {
    if (!operations.length) {
      window.alert('当前没有可导入的录制步骤。');
      return;
    }

    applyImportedSteps(normalizeImportedOperations(operations), '当前录制', mode);
  }

  function applyImportedSteps(importedSteps, sourceName, mode = 'replace') {
    const nextSteps = Array.isArray(importedSteps) ? importedSteps : [];
    if (!nextSteps.length) {
      window.alert('没有可导入的步骤。');
      return;
    }

    generatorState.steps = mode === 'append'
      ? [...generatorState.steps, ...nextSteps]
      : nextSteps;
    generatorState.importedFileName = resolveImportedFileName(sourceName, mode);
    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function resolveImportedFileName(sourceName, mode) {
    const nextName = String(sourceName || '').trim();
    if (!nextName) {
      return generatorState.importedFileName;
    }
    if (mode !== 'append' || !generatorState.importedFileName) {
      return nextName;
    }
    if (generatorState.importedFileName.includes(nextName)) {
      return generatorState.importedFileName;
    }
    return `${generatorState.importedFileName} + ${nextName}`;
  }

  function normalizeGeneratorStep(step, index) {
    const bindings = step?.bindings && typeof step.bindings === 'object' ? step.bindings : {};
    const children = Array.isArray(step?.children)
      ? step.children.map((child, childIndex) => normalizeGeneratorStep(child, `${index}_${childIndex}`))
      : [];

    return {
      id: step?.id || createStepId(index),
      type: step?.type || 'click',
      label: step?.label || getOperationDescription(step),
      enabled: step?.enabled !== false,
      target: step?.target ? { ...step.target } : {},
      data: step?.data ? { ...step.data } : {},
      timestamp: step?.timestamp || Date.now(),
      note: step?.note || '',
      bindings: {
        configField: bindings.configField || '',
        collectField: bindings.collectField || '',
        groupType: bindings.groupType || '',
        groupField: bindings.groupField || ''
      },
      children
    };
  }

  function syncGeneratorMeta() {
    elements.generatorFileName.textContent = generatorState.importedFileName || '未导入';
    elements.generatorStepCount.textContent = String(generatorState.steps.length);
    elements.btnOpenCreateToolModal.disabled = generatorState.steps.length === 0;
  }

  function renderGeneratorSteps() {
    renderStepEditorList(elements.generatorOperationsList, elements.generatorEmptyState);
  }

  function renderRunnerSteps() {
    renderStepEditorList(elements.runnerStepsList, elements.runnerStepsEmptyState);
  }

  function renderStepEditorList(listElement, emptyElement) {
    if (!listElement || !emptyElement) {
      return;
    }

    syncEmptyStateVisibility(emptyElement, generatorState.steps.length === 0);
    listElement.querySelectorAll('.operation-item').forEach((item) => item.remove());

    if (!generatorState.steps.length) {
      return;
    }

    const fragment = document.createDocumentFragment();
    generatorState.steps.forEach((step, index) => {
      fragment.appendChild(createGeneratorStepCard(step, index));
    });
    listElement.appendChild(fragment);
  }

  function refreshStepEditors() {
    const scrollState = captureStepEditorScrollState();
    syncGeneratorMeta();
    renderGeneratorSteps();
    renderRunnerSteps();
    restoreStepEditorScrollState(scrollState);
  }

  function captureStepEditorScrollState() {
    return {
      generator: elements.generatorOperationsList?.scrollTop || 0,
      runner: elements.runnerStepsList?.scrollTop || 0
    };
  }

  function restoreStepEditorScrollState(scrollState) {
    if (!scrollState) {
      return;
    }

    requestAnimationFrame(() => {
      if (elements.generatorOperationsList) {
        elements.generatorOperationsList.scrollTop = scrollState.generator || 0;
      }
      if (elements.runnerStepsList) {
        elements.runnerStepsList.scrollTop = scrollState.runner || 0;
      }
    });
  }

  function persistRunnerStepEdits() {
    if (currentView !== VIEW_NAMES.runner || !runnerState.selectedToolId) {
      return;
    }

    const toolIndex = customTools.findIndex((item) => item.id === runnerState.selectedToolId);
    if (toolIndex === -1) {
      return;
    }

    customTools[toolIndex] = normalizeCustomTool({
      ...customTools[toolIndex],
      steps: deepClone(generatorState.steps),
      updatedAt: Date.now()
    });
    persistCustomTools();
    renderHomeCards();
  }

  function createGeneratorStepCard(step, index) {
    const item = document.createElement('div');
    item.className = `operation-item${step.enabled ? '' : ' is-disabled'}`;
    item.dataset.stepId = step.id;
    item.draggable = true;

    const isGroup = step.type === 'group';
    const stepLabelTitle = isGroup ? '融合组名称' : '步骤名称';
    const valueEditor = buildGeneratorValueEditor(step);
    const bindingEditor = buildGeneratorBindingEditor(step);
    const childBlock = isGroup ? buildGroupChildrenMarkup(step.children) : '';

    item.innerHTML = `
      <div class="generator-step-card">
        <div class="generator-step-top">
          <button class="operation-number generator-step-order-trigger" type="button" data-action="open-sorter" aria-label="打开步骤排序面板">${index + 1}</button>
          <span class="generator-step-type">${escapeHtml(TYPE_NAMES[step.type] || step.type || '步骤')}</span>
          <div class="operation-icon ${step.type}">${ICON_SVGS[step.type] || ICON_SVGS.click}</div>
          <div class="generator-step-main">
            <div class="generator-step-meta">
                  <div class="generator-step-actions">
                <button class="generator-step-button" type="button" data-action="move-up">上移</button>
                <button class="generator-step-button" type="button" data-action="move-down">下移</button>
                <button class="generator-step-button" type="button" data-action="toggle-enabled">${step.enabled ? '停用' : '启用'}</button>
                ${isGroup ? '<button class="generator-step-button" type="button" data-action="ungroup">拆分</button>' : ''}
                <button class="generator-step-button is-danger" type="button" data-action="delete">删除</button>
              </div>
            </div>
            <div class="generator-step-fields">
              <label class="generator-step-field">
                <span class="generator-step-field-label">${stepLabelTitle}</span>
                <input class="generator-step-input" type="text" data-field="label" value="${escapeAttribute(step.label || '')}" placeholder="给这个步骤起个名字">
              </label>
              ${valueEditor}
              ${bindingEditor}
              <label class="generator-step-field">
                <span class="generator-step-field-label">备注</span>
                <textarea class="generator-step-textarea" data-field="note" placeholder="记录这个步骤需要怎样调整或使用。">${escapeHtml(step.note || '')}</textarea>
              </label>
              ${childBlock}
            </div>
          </div>
        </div>
        <div class="generator-merge-zone" data-action="merge-drop">拖到这里融合到当前步骤</div>
      </div>
    `;

    wireGeneratorStepEvents(item, step.id);
    return item;
  }

  function buildGeneratorValueEditor(step) {
    switch (step.type) {
      case 'input':
        return '';
      case 'change':
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">输入内容</span>
            <textarea class="generator-step-textarea" data-field="data.value" placeholder="这里填写复用时真正要输入的内容。">${escapeHtml(String(step.data?.value ?? step.data?.newValue ?? ''))}</textarea>
          </label>
        `;
      case 'navigate':
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">目标地址</span>
            <input class="generator-step-input" type="text" data-field="data.url" value="${escapeAttribute(step.data?.url || '')}" placeholder="目标页面 URL">
          </label>
        `;
      case 'key':
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">按键</span>
            <input class="generator-step-input" type="text" data-field="data.key" value="${escapeAttribute(step.data?.key || '')}" placeholder="例如 Enter">
          </label>
        `;
      case 'wait':
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">等待条件</span>
            <input class="generator-step-input" type="text" data-field="data.condition" value="${escapeAttribute(step.data?.condition || '')}" placeholder="例如 页面加载完成">
          </label>
        `;
      case 'scroll':
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">滚动位置</span>
            <input class="generator-step-input" type="text" data-field="data.scrollPosition" value="${escapeAttribute(formatScrollPosition(step.data?.scrollPosition))}" placeholder="例如 0, 800">
          </label>
        `;
      case 'group':
        return '';
      default:
        return `
          <label class="generator-step-field">
            <span class="generator-step-field-label">定位信息</span>
            <input class="generator-step-input" type="text" data-field="target.selector" value="${escapeAttribute(step.target?.selector || step.target?.xpath || '')}" placeholder="可调整成更稳定的选择器或识别描述">
          </label>
        `;
    }
  }

  function buildGeneratorBindingEditor(step) {
    if (step.type === 'group') {
      return buildGroupBindingEditor(step);
    }

    if (step.type === 'click' || step.type === 'key') {
      return '';
    }

    if (step.type === 'input') {
      const configOptions = [
        '<option value="">不绑定配置字段</option>',
        ...RUNNER_CONFIG_FIELD_OPTIONS.map((field) => (
          `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.configField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
        ))
      ].join('');

      return `
        <div class="generator-step-binding-grid">
          <label class="generator-step-field">
            <span class="generator-step-field-label">配置字段绑定</span>
            <select class="generator-step-select" data-field="bindings.configField">
              ${configOptions}
            </select>
          </label>
        </div>
      `;
    }

    const configOptions = [
      '<option value="">不绑定配置字段</option>',
      ...RUNNER_CONFIG_FIELD_OPTIONS.map((field) => (
        `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.configField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
      ))
    ].join('');

    const collectOptions = [
      '<option value="">不绑定采集字段</option>',
      ...RUNNER_COLLECT_FIELD_OPTIONS.map((field) => (
        `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.collectField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
      ))
    ].join('');

    if (step.type === 'input') {
      return `
        <div class="generator-step-binding-grid">
          <label class="generator-step-field">
            <span class="generator-step-field-label">閰嶇疆瀛楁缁戝畾</span>
            <select class="generator-step-select" data-field="bindings.configField">
              ${configOptions}
            </select>
          </label>
        </div>
      `;
    }

    return `
      <div class="generator-step-binding-grid">
        <label class="generator-step-field">
          <span class="generator-step-field-label">配置字段绑定</span>
          <select class="generator-step-select" data-field="bindings.configField">
            ${configOptions}
          </select>
        </label>
        <label class="generator-step-field">
          <span class="generator-step-field-label">采集字段绑定</span>
          <select class="generator-step-select" data-field="bindings.collectField">
            ${collectOptions}
          </select>
        </label>
      </div>
    `;
  }

  function buildGroupBindingEditor(step) {
    const typeOptions = GROUP_BINDING_TYPE_OPTIONS.map((option) => (
      `<option value="${escapeAttribute(option.id)}"${option.id === step.bindings?.groupType ? ' selected' : ''}>${escapeHtml(option.label)}</option>`
    )).join('');

    const fieldOptionsSource = step.bindings?.groupType === 'loop'
      ? GROUP_LOOP_FIELD_OPTIONS
      : GROUP_SINGLE_CHOICE_FIELD_OPTIONS;

    const defaultFieldLabel = step.bindings?.groupType === 'loop'
      ? '不绑定循环字段'
      : '不绑定单选字段';

    const fieldOptions = [
      `<option value="">${defaultFieldLabel}</option>`,
      ...fieldOptionsSource.map((field) => (
        `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.groupField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
      ))
    ].join('');

    const fieldLabel = step.bindings?.groupType === 'loop' ? '循环字段' : '匹配字段';
    const hint = step.bindings?.groupType === 'loop'
      ? '按配置中的数量顺序执行这组步骤。'
      : '按配置中的选项命中对应步骤。';

    return `
      <div class="generator-step-binding-grid">
        <label class="generator-step-field">
          <span class="generator-step-field-label">融合组类型</span>
          <select class="generator-step-select" data-field="bindings.groupType">
            ${typeOptions}
          </select>
        </label>
        <label class="generator-step-field">
          <span class="generator-step-field-label">${fieldLabel}</span>
          <select class="generator-step-select" data-field="bindings.groupField">
            ${fieldOptions}
          </select>
        </label>
      </div>
      <div class="generator-step-binding-hint">${escapeHtml(hint)}</div>
    `;
  }

  function buildGroupChildrenMarkup(children) {
    const rows = children.map((child, index) => `
      <div class="generator-step-child">
        <span class="generator-step-child-index">${index + 1}</span>
        <span>${escapeHtml(child.label || getOperationDescription(child))}</span>
      </div>
    `).join('');

    return `
      <div class="generator-step-field">
        <span class="generator-step-field-label">融合内容</span>
        <div class="generator-step-children">${rows}</div>
      </div>
    `;
  }

  function wireGeneratorStepEvents(item, stepId) {
    item.addEventListener('dragstart', (event) => handleGeneratorDragStart(event, stepId));
    item.addEventListener('dragend', handleGeneratorDragEnd);
    item.addEventListener('dragover', (event) => handleGeneratorStepDragOver(event, item));
    item.addEventListener('dragleave', (event) => handleGeneratorStepDragLeave(event, item));
    item.addEventListener('drop', (event) => handleGeneratorStepDrop(event, stepId, item));

    item.querySelectorAll('[data-field]').forEach((field) => {
      field.addEventListener('input', (event) => {
        updateGeneratorStepField(stepId, event.target.dataset.field, event.target.value);
      });
      field.addEventListener('change', (event) => {
        updateGeneratorStepField(stepId, event.target.dataset.field, event.target.value);
      });
    });

    item.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', (event) => {
        handleGeneratorAction(event.currentTarget.dataset.action, stepId);
      });
    });
  }

  function updateGeneratorStepField(stepId, fieldPath, value) {
    const step = getGeneratorStepById(stepId);
    if (!step) {
      return;
    }

    if (fieldPath === 'label') {
      step.label = value;
      persistRunnerStepEdits();
      return;
    }
    if (fieldPath === 'note') {
      step.note = value;
      persistRunnerStepEdits();
      return;
    }
    if (fieldPath === 'data.scrollPosition') {
      step.data.scrollPosition = parseScrollPosition(value);
      persistRunnerStepEdits();
      return;
    }
    if (fieldPath === 'bindings.groupType') {
      step.bindings.groupType = value;
      step.bindings.groupField = '';
      refreshStepEditors();
      persistRunnerStepEdits();
      return;
    }

    setByPath(step, fieldPath, value);
    if (fieldPath === 'data.value' && step.type === 'change') {
      step.data.newValue = value;
    }
    persistRunnerStepEdits();
  }

  function handleGeneratorAction(action, stepId) {
    if (action === 'open-sorter') {
      openStepSortModal(stepId);
      return;
    }

    if (action === 'move-up') {
      moveGeneratorStep(stepId, -1);
      return;
    }

    if (action === 'move-down') {
      moveGeneratorStep(stepId, 1);
      return;
    }

    if (action === 'toggle-enabled') {
      const step = getGeneratorStepById(stepId);
      if (!step) {
        return;
      }
      step.enabled = !step.enabled;
      refreshStepEditors();
      persistRunnerStepEdits();
      return;
    }

    if (action === 'delete') {
      generatorState.steps = generatorState.steps.filter((step) => step.id !== stepId);
      refreshStepEditors();
      persistRunnerStepEdits();
      return;
    }

    if (action === 'ungroup') {
      ungroupGeneratorStep(stepId);
    }
  }

  function moveGeneratorStep(stepId, direction) {
    const index = generatorState.steps.findIndex((step) => step.id === stepId);
    if (index === -1) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= generatorState.steps.length) {
      return;
    }

    const [step] = generatorState.steps.splice(index, 1);
    generatorState.steps.splice(targetIndex, 0, step);
    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function openStepSortModal(activeStepId) {
    if (!elements.stepSortModal || !elements.stepSortList) {
      return;
    }

    renderStepSortList(activeStepId);
    elements.stepSortModal.classList.remove('hidden');
  }

  function closeStepSortModal() {
    draggedSortStepId = null;
    if (!elements.stepSortModal || !elements.stepSortList) {
      return;
    }

    elements.stepSortModal.classList.add('hidden');
    elements.stepSortList.innerHTML = '';
  }

  function renderStepSortList(activeStepId) {
    if (!elements.stepSortList) {
      return;
    }

    elements.stepSortList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    generatorState.steps.forEach((step, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `step-sort-item${step.id === activeStepId ? ' is-active' : ''}`;
      row.dataset.stepId = step.id;
      row.draggable = true;
      row.innerHTML = `
        <span class="step-sort-item-number">${index + 1}</span>
        <span class="step-sort-item-label">${escapeHtml(step.label || getOperationDescription(step))}</span>
      `;
      wireStepSortItemEvents(row);
      fragment.appendChild(row);
    });
    elements.stepSortList.appendChild(fragment);
  }

  function wireStepSortItemEvents(item) {
    const stepId = item.dataset.stepId;
    item.addEventListener('dragstart', (event) => {
      draggedSortStepId = stepId;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', stepId);
      item.classList.add('is-dragging');
    });
    item.addEventListener('dragend', () => {
      draggedSortStepId = null;
      item.classList.remove('is-dragging');
      clearStepSortDragStates();
    });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!draggedSortStepId || draggedSortStepId === stepId) {
        return;
      }
      item.classList.add('is-drop-target');
      event.dataTransfer.dropEffect = 'move';
    });
    item.addEventListener('dragleave', (event) => {
      if (isPointInsideRect(event.clientX, event.clientY, item.getBoundingClientRect())) {
        return;
      }
      item.classList.remove('is-drop-target');
    });
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      item.classList.remove('is-drop-target');
      if (!draggedSortStepId || draggedSortStepId === stepId) {
        return;
      }

      const rect = item.getBoundingClientRect();
      const placeAfter = event.clientY > rect.top + rect.height / 2;
      reorderGeneratorSteps(draggedSortStepId, stepId, placeAfter);
      renderStepSortList(draggedSortStepId);
    });
  }

  function clearStepSortDragStates() {
    elements.stepSortList?.querySelectorAll('.step-sort-item').forEach((item) => {
      item.classList.remove('is-drop-target', 'is-dragging');
    });
  }

  function ungroupGeneratorStep(stepId) {
    const index = generatorState.steps.findIndex((step) => step.id === stepId);
    if (index === -1) {
      return;
    }

    const step = generatorState.steps[index];
    if (step.type !== 'group' || !step.children.length) {
      return;
    }

    const expanded = step.children.map((child, childIndex) => ({
      ...deepClone(child),
      id: createStepId(`${stepId}_${childIndex}`)
    }));

    generatorState.steps.splice(index, 1, ...expanded);
    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function handleGeneratorDragStart(event, stepId) {
    draggedGeneratorStepId = stepId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', stepId);
    event.currentTarget.classList.add('dragging');
  }

  function handleGeneratorDragEnd(event) {
    draggedGeneratorStepId = null;
    event.currentTarget.classList.remove('dragging');
    clearGeneratorDragStates();
  }

  function handleGeneratorStepDragOver(event, item) {
    event.preventDefault();
    if (!draggedGeneratorStepId || draggedGeneratorStepId === item.dataset.stepId) {
      return;
    }
    item.classList.add('drag-target');
    item.classList.toggle('merge-ready', isGeneratorMergeIntent(event, item));
    event.dataTransfer.dropEffect = 'move';
  }

  function handleGeneratorStepDragLeave(event, item) {
    if (isPointInsideRect(event.clientX, event.clientY, item.getBoundingClientRect())) {
      return;
    }

    item.classList.remove('drag-target', 'merge-ready');
  }

  function handleGeneratorStepDrop(event, targetStepId, item) {
    event.preventDefault();
    const shouldMerge = item.classList.contains('merge-ready');
    item.classList.remove('drag-target', 'merge-ready');

    if (!draggedGeneratorStepId || draggedGeneratorStepId === targetStepId) {
      return;
    }

    if (shouldMerge) {
      mergeGeneratorSteps(draggedGeneratorStepId, targetStepId);
      return;
    }

    const rect = item.getBoundingClientRect();
    const placeAfter = event.clientY > rect.top + rect.height / 2;
    reorderGeneratorSteps(draggedGeneratorStepId, targetStepId, placeAfter);
  }

  function handleGeneratorListDragOver(event) {
    event.preventDefault();
  }

  function handleGeneratorListDrop(event) {
    if (event.target.closest('.operation-item')) {
      return;
    }
    event.preventDefault();
    moveGeneratorStepToEnd(draggedGeneratorStepId);
  }

  function reorderGeneratorSteps(draggedStepId, targetStepId, placeAfter) {
    const fromIndex = generatorState.steps.findIndex((step) => step.id === draggedStepId);
    const targetIndex = generatorState.steps.findIndex((step) => step.id === targetStepId);
    if (fromIndex === -1 || targetIndex === -1 || fromIndex === targetIndex) {
      return;
    }

    const [draggedStep] = generatorState.steps.splice(fromIndex, 1);
    let insertIndex = targetIndex;
    if (fromIndex < targetIndex) {
      insertIndex -= 1;
    }
    if (placeAfter) {
      insertIndex += 1;
    }
    generatorState.steps.splice(insertIndex, 0, draggedStep);
    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function moveGeneratorStepToEnd(stepId) {
    if (!stepId) {
      return;
    }
    const index = generatorState.steps.findIndex((step) => step.id === stepId);
    if (index === -1 || index === generatorState.steps.length - 1) {
      return;
    }
    const [step] = generatorState.steps.splice(index, 1);
    generatorState.steps.push(step);
    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function mergeGeneratorSteps(draggedStepId, targetStepId) {
    if (!draggedStepId || draggedStepId === targetStepId) {
      return;
    }

    const draggedIndex = generatorState.steps.findIndex((step) => step.id === draggedStepId);
    const targetIndex = generatorState.steps.findIndex((step) => step.id === targetStepId);
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const dragged = generatorState.steps[draggedIndex];
    const target = generatorState.steps[targetIndex];
    const draggedChildren = dragged.type === 'group'
      ? dragged.children.map((child) => deepClone(child))
      : [cloneStepForGroup(dragged)];

    if (target.type === 'group') {
      target.children.push(...draggedChildren);
      if (!target.label) {
        target.label = '融合步骤组';
      }
    } else {
      generatorState.steps[targetIndex] = {
        id: target.id,
        type: 'group',
        label: target.label || '融合步骤组',
        enabled: target.enabled,
        target: {},
        data: {},
        timestamp: target.timestamp || Date.now(),
        note: target.note || '',
        children: [cloneStepForGroup(target), ...draggedChildren]
      };
    }

    const removalIndex = generatorState.steps.findIndex((step) => step.id === draggedStepId);
    if (removalIndex !== -1) {
      generatorState.steps.splice(removalIndex, 1);
    }

    refreshStepEditors();
    persistRunnerStepEdits();
  }

  function cloneStepForGroup(step) {
    return {
      id: createStepId(`child_${step.id}`),
      type: step.type,
      label: step.label,
      enabled: step.enabled,
      target: deepClone(step.target || {}),
      data: deepClone(step.data || {}),
      bindings: deepClone(step.bindings || { configField: '', collectField: '', groupType: '', groupField: '' }),
      timestamp: step.timestamp || Date.now(),
      note: step.note || '',
      children: []
    };
  }

  function clearGeneratorDragStates() {
    document.querySelectorAll('#generatorOperationsList .operation-item, #runnerStepsList .operation-item').forEach((item) => {
      item.classList.remove('dragging', 'drag-target', 'merge-ready');
    });
  }

  function isGeneratorMergeIntent(event, item) {
    const rect = item.getBoundingClientRect();
    const mergeThresholdY = rect.top + rect.height * 0.55;
    return event.clientY >= mergeThresholdY;
  }

  function isPointInsideRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function openCreateToolModal() {
    if (!generatorState.steps.length) {
      return;
    }

    if (generatorState.selectedToolId) {
      const selectedTool = customTools.find((tool) => tool.id === generatorState.selectedToolId);
      if (selectedTool) {
        createToolDraft.name = selectedTool.name;
        createToolDraft.description = selectedTool.description;
        createToolDraft.icon = deepClone(selectedTool.icon);
      }
    } else {
      createToolDraft.name = createToolDraft.name || stripJsonExtension(generatorState.importedFileName) || '';
      createToolDraft.description = createToolDraft.description || '';
      createToolDraft.icon = createToolDraft.icon || {
        kind: 'preset',
        value: PRESET_ICON_OPTIONS[0].id
      };
    }

    syncCreateToolDraftUI();
    elements.createToolModal.classList.remove('hidden');
  }

  function closeCreateToolModal() {
    elements.createToolModal.classList.add('hidden');
  }

  function syncCreateToolDraftUI() {
    elements.toolNameInput.value = createToolDraft.name;
    elements.toolDescriptionInput.value = createToolDraft.description;
    renderToolIconPreview();
  }

  function renderToolIconPreview() {
    const icon = createToolDraft.icon;
    if (!icon) {
      elements.toolIconPreview.innerHTML = ICON_SVGS.spark;
      elements.toolIconLabel.textContent = '选择图标';
      return;
    }

    if (icon.kind === 'preset') {
      const option = PRESET_ICON_OPTIONS.find((item) => item.id === icon.value);
      elements.toolIconPreview.innerHTML = ICON_SVGS[option?.svgKey || 'spark'];
      elements.toolIconLabel.textContent = option?.label || '预设图标';
      return;
    }

    elements.toolIconPreview.innerHTML = `<img src="${icon.value}" alt="自定义图标">`;
    elements.toolIconLabel.textContent = icon.label || '本地图标';
  }

  function renderIconPicker() {
    const fragment = document.createDocumentFragment();

    PRESET_ICON_OPTIONS.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'icon-picker-option';
      button.dataset.iconId = option.id;
      button.innerHTML = `${ICON_SVGS[option.svgKey]}<span>${escapeHtml(option.label)}</span>`;
      button.addEventListener('click', () => selectPresetIcon(option.id));
      fragment.appendChild(button);
    });

    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.className = 'icon-picker-option';
    uploadButton.dataset.upload = 'true';
    uploadButton.innerHTML = `${ICON_SVGS.window}<span>本地选择</span>`;
    uploadButton.addEventListener('click', () => elements.localIconInput.click());
    fragment.appendChild(uploadButton);

    elements.iconPickerGrid.innerHTML = '';
    elements.iconPickerGrid.appendChild(fragment);
    refreshIconPickerSelection();
  }

  function openIconPickerModal() {
    pendingIconSelection = deepClone(createToolDraft.icon || {
      kind: 'preset',
      value: PRESET_ICON_OPTIONS[0].id
    });
    refreshIconPickerSelection();
    elements.iconPickerModal.classList.remove('hidden');
  }

  function closeIconPickerModal() {
    pendingIconSelection = null;
    elements.iconPickerModal.classList.add('hidden');
    elements.localIconInput.value = '';
  }

  function refreshIconPickerSelection() {
    const selectedPresetId = pendingIconSelection?.kind === 'preset' ? pendingIconSelection.value : null;
    elements.iconPickerGrid.querySelectorAll('.icon-picker-option').forEach((button) => {
      const isUpload = button.dataset.upload === 'true';
      const isSelected = (!isUpload && button.dataset.iconId === selectedPresetId)
        || (isUpload && pendingIconSelection?.kind === 'upload');
      button.classList.toggle('is-selected', isSelected);
    });
  }

  function selectPresetIcon(iconId) {
    pendingIconSelection = {
      kind: 'preset',
      value: iconId
    };
    createToolDraft.icon = deepClone(pendingIconSelection);
    refreshIconPickerSelection();
    syncCreateToolDraftUI();
    closeIconPickerModal();
  }

  function handleLocalIconSelected(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      createToolDraft.icon = {
        kind: 'upload',
        value: String(reader.result || ''),
        label: file.name
      };
      pendingIconSelection = deepClone(createToolDraft.icon);
      refreshIconPickerSelection();
      syncCreateToolDraftUI();
      closeIconPickerModal();
    };
    reader.readAsDataURL(file);
  }

  function confirmCreateTool() {
    const name = elements.toolNameInput.value.trim();
    const description = elements.toolDescriptionInput.value.trim();
    const icon = deepClone(createToolDraft.icon || {
      kind: 'preset',
      value: PRESET_ICON_OPTIONS[0].id
    });

    if (!name) {
      window.alert('请先填写自动化名称。');
      return;
    }

    const toolId = generatorState.selectedToolId || createId('tool');
    const existingTool = customTools.find((item) => item.id === toolId);
    const tool = {
      id: toolId,
      name,
      description,
      icon,
      steps: deepClone(generatorState.steps),
      importedFileName: generatorState.importedFileName,
      runtime: deepClone(existingTool?.runtime || createDefaultToolRuntime()),
      updatedAt: Date.now()
    };

    upsertCustomTool(tool);
    generatorState.selectedToolId = toolId;
    closeCreateToolModal();
    switchView(VIEW_NAMES.home);
  }

  function upsertCustomTool(tool) {
    const normalizedTool = normalizeCustomTool(tool);
    const index = customTools.findIndex((item) => item.id === normalizedTool.id);
    if (index === -1) {
      customTools.push(normalizedTool);
    } else {
      customTools[index] = normalizedTool;
    }
    persistCustomTools();
    renderHomeCards();
  }

  function loadCustomTool(toolId) {
    const tool = customTools.find((item) => item.id === toolId);
    if (!tool) {
      return;
    }

    generatorState.importedFileName = tool.importedFileName || `${tool.name}.json`;
    generatorState.steps = deepClone(tool.steps || []);
    generatorState.selectedToolId = tool.id;
    createToolDraft.name = tool.name;
    createToolDraft.description = tool.description || '';
    createToolDraft.icon = deepClone(tool.icon);
    syncGeneratorMeta();
    syncCreateToolDraftUI();
    renderGeneratorSteps();
    switchView(VIEW_NAMES.generator);
  }

  function openToolRunner(toolId) {
    const tool = customTools.find((item) => item.id === toolId);
    if (!tool) {
      return;
    }

    runnerState.selectedToolId = tool.id;
    runnerState.activePage = 'config';
    runnerState.isRunning = false;
    runnerState.isPaused = false;
    runnerState.totalSteps = 0;
    runnerState.currentStep = 0;
    generatorState.importedFileName = tool.importedFileName || `${tool.name}.json`;
    generatorState.steps = deepClone(tool.steps || []);
    generatorState.selectedToolId = tool.id;
    renderRunnerView(tool);
    switchView(VIEW_NAMES.runner);
  }

  function openRunnerToolStepEditor() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    generatorState.importedFileName = tool.importedFileName || `${tool.name}.json`;
    generatorState.steps = deepClone(tool.steps || []);
    generatorState.selectedToolId = tool.id;
    renderRunnerSteps();
    switchRunnerPage('steps');
  }

  function handleRunnerEditButton() {
    if (runnerState.activePage === 'steps') {
      saveRunnerStepEdits();
      return;
    }
    openRunnerToolStepEditor();
  }

  function renderHomeCards() {
    elements.homeFeatureGrid.querySelectorAll('[data-custom-tool-card="true"]').forEach((node) => node.remove());

    const fragment = document.createDocumentFragment();
    customTools.forEach((tool) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feature-card feature-card-custom';
      button.dataset.customToolCard = 'true';
      button.dataset.toolId = tool.id;
      button.innerHTML = `
        <span class="feature-card-badge">已生成</span>
        <div class="feature-card-icon">${renderHomeCardIcon(tool.icon)}</div>
        <div class="feature-card-body">
          <h2>${escapeHtml(tool.name)}</h2>
          <p>${escapeHtml(tool.description || '自定义自动化工具，可继续编辑和复用步骤。')}</p>
        </div>
        <div class="feature-card-meta">
          <span class="feature-metric">${Array.isArray(tool.steps) ? tool.steps.length : 0} 个步骤</span>
          <span class="feature-link">打开</span>
        </div>
      `;
      button.addEventListener('click', () => openToolRunner(tool.id));
      fragment.appendChild(button);
    });

    elements.homeFeatureGrid.appendChild(fragment);
  }

  function renderHomeCardIcon(icon) {
    if (!icon) {
      return ICON_SVGS.spark;
    }
    if (icon.kind === 'preset') {
      const option = PRESET_ICON_OPTIONS.find((item) => item.id === icon.value);
      return ICON_SVGS[option?.svgKey || 'spark'];
    }
    return `<img src="${icon.value}" alt="${escapeAttribute(icon.label || '自定义图标')}">`;
  }

  function loadCustomTools() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.customTools);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((tool) => normalizeCustomTool(tool)) : [];
    } catch (error) {
      console.error('Failed to load custom tools:', error);
      return [];
    }
  }

  function persistCustomTools() {
    try {
      window.localStorage.setItem(STORAGE_KEYS.customTools, JSON.stringify(customTools));
    } catch (error) {
      console.error('Failed to persist custom tools:', error);
    }
  }

  function createDefaultToolRuntime() {
    return {
      config: {
        keyword: '',
        sortBy: 'comprehensive',
        publishTime: '7d',
        videoDuration: 'all',
        searchScope: 'all',
        contentFormat: 'all',
        collectCount: 5,
        commentCount: 10,
        failureThreshold: 3,
        confirmBeforeSearch: false,
        confirmAfterFilter: false,
        confirmBeforeEachCollect: false,
        confirmBeforeExport: false
      },
      configFields: createDefaultRunnerConfigFields(),
      collectFields: ['title', 'author', 'publishTime', 'likes', 'comments', 'videoUrl'],
      logs: [],
      updatedAt: null
    };
  }

  function normalizeCustomTool(tool) {
    const defaults = createDefaultToolRuntime();
    const nextTool = tool && typeof tool === 'object' ? tool : {};
    const runtime = nextTool.runtime && typeof nextTool.runtime === 'object' ? nextTool.runtime : {};
    const config = runtime.config && typeof runtime.config === 'object' ? runtime.config : {};
    const validFieldIds = new Set(RUNNER_COLLECT_FIELD_OPTIONS.map((field) => field.id));
    const collectFields = Array.isArray(runtime.collectFields) && runtime.collectFields.length
      ? runtime.collectFields.filter((fieldId) => validFieldIds.has(fieldId))
      : defaults.collectFields.slice();

    return {
      ...nextTool,
      description: nextTool.description || '',
      icon: nextTool.icon || null,
      steps: Array.isArray(nextTool.steps) ? nextTool.steps.map((step, index) => normalizeGeneratorStep(step, `tool_${index}`)) : [],
      importedFileName: nextTool.importedFileName || '',
      runtime: {
        config: {
          ...defaults.config,
          ...config
        },
        configFields: normalizeRunnerConfigFields(runtime.configFields),
        collectFields,
        logs: Array.isArray(runtime.logs) ? runtime.logs : [],
        updatedAt: runtime.updatedAt || nextTool.updatedAt || null
      },
      updatedAt: nextTool.updatedAt || Date.now()
    };
  }

  function renderRunnerCollectFields() {
    const fragment = document.createDocumentFragment();
    RUNNER_COLLECT_FIELD_OPTIONS.forEach((field) => {
      const label = document.createElement('label');
      label.className = 'runner-checkbox';
      label.innerHTML = `
        <input type="checkbox" data-collect-field="${field.id}">
        <span>${escapeHtml(field.label)}</span>
      `;
      fragment.appendChild(label);
    });

    elements.runnerCollectFields.innerHTML = '';
    elements.runnerCollectFields.appendChild(fragment);
  }

  function hydrateRunnerSelectOptions() {
    Object.entries(RUNNER_SELECT_OPTIONS).forEach(([field, options]) => {
      const select = elements.runnerConfigForm?.querySelector(`[data-runner-field="${field}"]`);
      if (!select) {
        return;
      }

      select.innerHTML = options
        .map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`)
        .join('');
    });
  }

  function getRunnerTool() {
    return customTools.find((item) => item.id === runnerState.selectedToolId) || null;
  }

  function renderRunnerView(tool) {
    const normalizedTool = normalizeCustomTool(tool);
    elements.runnerToolTitle.textContent = normalizedTool.name || '运行自动化工具';
    syncRunnerForm(normalizedTool);
    renderRunnerLogs(normalizedTool);
    renderRunnerSteps();
    syncRunnerActionButtons();
    switchRunnerPage(runnerState.activePage);
  }

  function syncRunnerActionButtons() {
    if (!elements.btnRunRunner) {
      return;
    }
    elements.btnRunRunner.textContent = runnerState.isRunning ? '停止' : '运行';
  }

  function syncRunnerForm(tool) {
    renderRunnerConfigFields(tool);

    const selectedFields = new Set(tool.runtime.collectFields || []);
    elements.runnerCollectFields.querySelectorAll('[data-collect-field]').forEach((input) => {
      input.checked = selectedFields.has(input.dataset.collectField);
    });
  }

  function renderRunnerConfigFields(tool) {
    const configFields = getActiveRunnerConfigFields(tool);
    const topFields = configFields.filter((field) => field.layout === 'full');
    const bodyFields = configFields.filter((field) => field.layout !== 'full' && field.type !== 'checkbox');
    const checkboxFields = configFields.filter((field) => field.type === 'checkbox');

    const topMarkup = topFields.map((field) => buildRunnerConfigFieldMarkup(field, tool.runtime.config, true)).join('');
    const bodyMarkup = bodyFields.map((field) => buildRunnerConfigFieldMarkup(field, tool.runtime.config, false)).join('');
    const checkboxMarkup = checkboxFields.map((field) => buildRunnerConfigCheckboxMarkup(field, tool.runtime.config)).join('');

    elements.runnerConfigForm.innerHTML = `
      ${topMarkup}
      ${bodyMarkup ? `<div class="runner-form-grid">${bodyMarkup}</div>` : ''}
      ${checkboxMarkup ? `<div class="runner-confirm-grid">${checkboxMarkup}</div>` : ''}
    `;
  }

  function buildRunnerConfigFieldMarkup(field, config, isFullWidth) {
    const value = config[field.id] ?? field.defaultValue ?? '';
    if (field.type === 'select') {
      const options = Array.isArray(field.options) ? field.options : [];
      const optionsMarkup = options.map((option) => (
        `<option value="${escapeAttribute(option.value)}"${String(option.value) === String(value) ? ' selected' : ''}>${escapeHtml(option.label)}</option>`
      )).join('');
      return `
        <label class="generator-field${isFullWidth ? ' runner-form-full' : ''}">
          <span class="generator-field-label">${escapeHtml(field.label)}</span>
          <select class="generator-text-input" data-runner-field="${escapeAttribute(field.id)}">
            ${optionsMarkup}
          </select>
        </label>
      `;
    }

    const inputType = field.type === 'number' ? 'number' : 'text';
    const minAttr = field.type === 'number' && field.min !== null && field.min !== undefined
      ? ` min="${escapeAttribute(field.min)}"`
      : '';
    return `
      <label class="generator-field${isFullWidth ? ' runner-form-full' : ''}">
        <span class="generator-field-label">${escapeHtml(field.label)}</span>
        <input class="generator-text-input" type="${inputType}"${minAttr} data-runner-field="${escapeAttribute(field.id)}" value="${escapeAttribute(value)}">
      </label>
    `;
  }

  function buildRunnerConfigCheckboxMarkup(field, config) {
    return `
      <label class="runner-checkbox">
        <input type="checkbox" data-runner-confirm="${escapeAttribute(field.id)}"${config[field.id] ? ' checked' : ''}>
        <span>${escapeHtml(field.label)}</span>
      </label>
    `;
  }

  function handleRunnerConfigFormChange(event) {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    const field = event.target.dataset.runnerField;
    const confirmField = event.target.dataset.runnerConfirm;
    if (!field && !confirmField) {
      return;
    }

    if (field) {
      const isNumeric = ['collectCount', 'commentCount', 'failureThreshold'].includes(field);
      tool.runtime.config[field] = isNumeric ? Number(event.target.value || 0) : event.target.value;
    } else if (confirmField) {
      tool.runtime.config[confirmField] = Boolean(event.target.checked);
    }

    touchRunnerTool(tool, false);
  }

  function openConfigFieldModal() {
    const tool = getRunnerTool();
    if (!tool || !elements.configFieldModal) {
      return;
    }

    configFieldDrafts = getRunnerConfigFields(tool).map((field) => deepClone(field));
    renderConfigFieldManager();
    elements.configFieldTypeChooser?.classList.add('hidden');
    elements.configFieldModal.classList.remove('hidden');
  }

  function closeConfigFieldModal() {
    configFieldDrafts = [];
    elements.configFieldTypeChooser?.classList.add('hidden');
    elements.configFieldModal?.classList.add('hidden');
  }

  function renderConfigFieldManager() {
    if (!elements.configFieldManagerList) {
      return;
    }

    elements.configFieldManagerList.innerHTML = configFieldDrafts.map((field) => `
      <div class="config-field-card${field.enabled === false ? ' is-disabled' : ''}" data-field-id="${escapeAttribute(field.id)}">
        <div class="config-field-card-top">
          <div class="config-field-card-meta">
            <span class="config-field-card-id">${escapeHtml(field.id)}</span>
            <span class="config-field-card-type">${escapeHtml(getConfigFieldTypeLabel(field.type))}</span>
          </div>
          <div class="config-field-card-actions">
            <label class="config-field-toggle">
              <input type="checkbox" data-config-field-prop="enabled"${field.enabled !== false ? ' checked' : ''}>
              <span>启用</span>
            </label>
            ${field.builtIn ? '' : '<button class="generator-step-button is-danger" type="button" data-config-field-action="delete">删除字段</button>'}
          </div>
        </div>
        <label class="generator-step-field">
          <span class="generator-step-field-label">字段名称</span>
          <input class="generator-step-input" type="text" data-config-field-prop="label" value="${escapeAttribute(field.label)}">
        </label>
      </div>
    `).join('');
  }

  function handleConfigFieldManagerInput(event) {
    const card = event.target.closest('[data-field-id]');
    if (!card) {
      return;
    }

    const field = configFieldDrafts.find((item) => item.id === card.dataset.fieldId);
    if (!field) {
      return;
    }

    const prop = event.target.dataset.configFieldProp;
    if (!prop) {
      return;
    }

    if (prop === 'enabled') {
      field.enabled = Boolean(event.target.checked);
      renderConfigFieldManager();
    } else if (prop === 'label') {
      field.label = event.target.value;
    }
  }

  function handleConfigFieldManagerClick(event) {
    const button = event.target.closest('[data-config-field-action]');
    if (!button) {
      return;
    }

    const card = button.closest('[data-field-id]');
    if (!card) {
      return;
    }

    if (button.dataset.configFieldAction === 'delete') {
      configFieldDrafts = configFieldDrafts.filter((field) => field.id !== card.dataset.fieldId);
      renderConfigFieldManager();
    }
  }

  function addConfigFieldDraft() {
    const nextIndex = configFieldDrafts.filter((field) => !field.builtIn).length + 1;
    configFieldDrafts.push({
      id: createId(`custom_field_${nextIndex}`),
      label: `自定义字段 ${nextIndex}`,
      type: 'text',
      defaultValue: '',
      options: [],
      min: null,
      layout: '',
      builtIn: false,
      enabled: true
    });
    renderConfigFieldManager();
  }

  function saveConfigFieldModal() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    tool.runtime.configFields = normalizeRunnerConfigFields(configFieldDrafts).map((field) => {
      const normalized = { ...field, label: String(field.label || '').trim() || '未命名字段' };
      if (tool.runtime.config[normalized.id] === undefined) {
        tool.runtime.config[normalized.id] = deepClone(normalized.defaultValue ?? '');
      }
      return normalized;
    });

    Object.keys(tool.runtime.config).forEach((key) => {
      if (!tool.runtime.configFields.some((field) => field.id === key) && !RUNNER_CONFIG_FIELD_DEFINITIONS.some((field) => field.id === key)) {
        delete tool.runtime.config[key];
      }
    });

    touchRunnerTool(tool, false);
    renderRunnerView(tool);
    closeConfigFieldModal();
    showToast('字段已保存', 'success');
  }

  function getConfigFieldTypeLabel(type) {
    switch (type) {
      case 'number':
        return '数字';
      case 'select':
        return '选项';
      case 'checkbox':
        return '开关';
      default:
        return '文本';
    }
  }

  function handleRunnerCollectFieldsChange(event) {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    const collectField = event.target.dataset.collectField;
    if (!collectField) {
      return;
    }

    const nextFields = new Set(tool.runtime.collectFields || []);
    if (event.target.checked) {
      nextFields.add(collectField);
    } else {
      nextFields.delete(collectField);
    }
    tool.runtime.collectFields = Array.from(nextFields);
    touchRunnerTool(tool, false);
  }

  function touchRunnerTool(tool, showSavedFeedback) {
    tool.runtime.updatedAt = Date.now();
    tool.updatedAt = Date.now();
    persistCustomTools();
    renderHomeCards();

    if (showSavedFeedback) {
      showToast('已保存', 'success');
    }
  }

  function createDefaultRunnerConfigFields() {
    return RUNNER_CONFIG_FIELD_DEFINITIONS.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      defaultValue: deepClone(field.defaultValue),
      options: Array.isArray(field.options) ? deepClone(field.options) : [],
      min: field.min ?? null,
      layout: field.layout || '',
      builtIn: field.builtIn !== false,
      enabled: field.enabled !== false
    }));
  }

  function normalizeRunnerConfigFields(configFields) {
    const baseFields = createDefaultRunnerConfigFields();
    const baseMap = new Map(baseFields.map((field) => [field.id, field]));
    const provided = Array.isArray(configFields) ? configFields : [];
    const providedMap = new Map();

    provided.forEach((field, index) => {
      if (!field || typeof field !== 'object') {
        return;
      }

      const fallbackId = field.id || createId(`config_field_${index}`);
      const normalizedId = String(fallbackId).trim().replace(/\s+/g, '_');
      if (!normalizedId || providedMap.has(normalizedId)) {
        return;
      }

      const base = baseMap.get(normalizedId);
      providedMap.set(normalizedId, {
        ...(base || {}),
        id: normalizedId,
        label: String(field.label || base?.label || '未命名字段').trim() || '未命名字段',
        type: field.type || base?.type || 'text',
        defaultValue: field.defaultValue !== undefined ? deepClone(field.defaultValue) : deepClone(base?.defaultValue ?? ''),
        options: Array.isArray(field.options) ? deepClone(field.options) : deepClone(base?.options || []),
        min: field.min ?? base?.min ?? null,
        layout: field.layout || base?.layout || '',
        builtIn: field.builtIn !== false ? Boolean(base?.builtIn ?? true) : false,
        enabled: field.enabled !== false
      });
    });

    const merged = baseFields.map((field) => providedMap.get(field.id) || field);
    providedMap.forEach((field, id) => {
      if (!baseMap.has(id)) {
        merged.push(field);
      }
    });
    return merged;
  }

  function getRunnerConfigFields(tool) {
    return normalizeRunnerConfigFields(tool?.runtime?.configFields);
  }

  function getActiveRunnerConfigFields(tool) {
    return getRunnerConfigFields(tool).filter((field) => field.enabled !== false);
  }

  function getRunnerConfigFieldOptionsForEditor() {
    const tool = currentView === VIEW_NAMES.runner ? getRunnerTool() : null;
    const configFields = getActiveRunnerConfigFields(tool || { runtime: { configFields: createDefaultRunnerConfigFields() } });
    return configFields.map((field) => ({
      id: field.id,
      label: field.label
    }));
  }

  function showToast(message, variant = 'info') {
    if (!elements.toastStack) {
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-card toast-${variant}`;
    toast.textContent = message;
    elements.toastStack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const hideToast = () => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        toast.remove();
      }, 220);
    };

    window.setTimeout(hideToast, 1800);
  }

  function saveRunnerConfig() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }
    appendRunnerLog(tool, '已保存采集配置和采集字段');
    touchRunnerTool(tool, true);
    renderRunnerLogs(tool);
  }

  function saveRunnerStepEdits() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    tool.steps = deepClone(generatorState.steps);
    appendRunnerLog(tool, '已保存步骤编辑');
    touchRunnerTool(tool, true);
    renderRunnerLogs(tool);
  }

  function syncRunnerActionButtons() {
    if (!elements.btnRunRunner) {
      return;
    }

    if (!runnerState.isRunning) {
      elements.btnRunRunner.textContent = '运行';
      if (elements.btnStopRunner) {
        elements.btnStopRunner.disabled = true;
      }
      return;
    }

    elements.btnRunRunner.textContent = runnerState.isPaused ? '继续' : '暂停';
    if (elements.btnStopRunner) {
      elements.btnStopRunner.disabled = false;
    }
  }

  function syncRunnerActionButtons() {
    if (!elements.btnRunRunner) {
      return;
    }

    if (!runnerState.isRunning) {
      elements.btnRunRunner.textContent = '运行脚本';
      if (elements.btnStopRunner) {
        elements.btnStopRunner.disabled = true;
      }
      return;
    }

    elements.btnRunRunner.textContent = runnerState.isPaused ? '继续脚本' : '暂停脚本';
    if (elements.btnStopRunner) {
      elements.btnStopRunner.disabled = false;
    }
  }

  function runRunnerTool() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    runnerState.isRunning = !runnerState.isRunning;
    appendRunnerLog(tool, runnerState.isRunning ? '开始运行自动化工具' : '停止运行自动化工具');
    touchRunnerTool(tool, false);
    renderRunnerLogs(tool);
    syncRunnerActionButtons();
    switchRunnerPage('logs');
  }

  function switchRunnerPage(pageName) {
    const navigablePages = ['config', 'fields', 'logs'];
    const validPages = [...navigablePages, 'steps'];
    if (!validPages.includes(pageName)) {
      return;
    }

    runnerState.activePage = pageName;
    elements.runnerView.classList.toggle('is-step-editing', pageName === 'steps');
    elements.runnerView.classList.toggle('is-log-view', pageName === 'logs');
    elements.runnerPageTabs.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.runnerPageTarget === pageName);
    });
    elements.runnerPages.forEach((page) => {
      page.classList.toggle('hidden', page.dataset.runnerPage !== pageName);
    });

    if (pageName === 'steps') {
      elements.btnRunnerPrevPage.disabled = true;
      elements.btnRunnerNextPage.disabled = true;
    } else {
      const pageIndex = navigablePages.indexOf(pageName);
      elements.btnRunnerPrevPage.disabled = pageIndex === 0;
      elements.btnRunnerNextPage.disabled = pageIndex === navigablePages.length - 1;
    }
    elements.btnRunnerPrevPage.classList.toggle('hidden', pageName === 'steps' || pageName === 'config');
    elements.btnRunnerNextPage.classList.toggle('hidden', pageName === 'steps' || pageName === 'logs');
    elements.btnSaveRunnerConfig.classList.toggle('hidden', pageName === 'logs' || pageName === 'steps');
    elements.btnRunRunner.classList.toggle('hidden', pageName !== 'logs');
    elements.btnStopRunner?.classList.toggle('hidden', pageName !== 'logs');
    elements.btnEditRunnerTool.textContent = pageName === 'steps' ? '保存编辑' : '编辑步骤';
    elements.btnEditRunnerTool.classList.toggle('btn-create-tool', pageName === 'steps');
    elements.btnEditRunnerTool.classList.toggle('btn-runner-secondary', pageName !== 'steps');
    elements.btnEditRunnerTool.classList.toggle('btn-runner-full', pageName === 'steps');
    elements.btnEditRunnerTool.textContent = pageName === 'steps' ? '保存编辑' : '编辑步骤';
    elements.btnEditRunnerTool.textContent = pageName === 'steps' ? '保存编辑' : '编辑步骤';
    syncRunnerActionButtons();
  }

  function stepRunnerPage(direction) {
    const pages = ['config', 'fields', 'logs'];
    const currentIndex = pages.indexOf(runnerState.activePage);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }
    switchRunnerPage(pages[nextIndex]);
  }

  function syncRunnerActionButtons() {
    if (!elements.btnRunRunner) {
      return;
    }
    if (!runnerState.isRunning) {
      elements.btnRunRunner.textContent = '运行';
      return;
    }
    elements.btnRunRunner.textContent = runnerState.isPaused ? '继续' : '暂停';
  }

  function runRunnerTool() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }
    if (!port) {
      window.alert('请在扩展侧边栏中运行自动化步骤，当前 file 预览页无法连接后台执行。');
      return;
    }

    if (!runnerState.isRunning) {
      const executableSteps = resolveRunnerOperations(tool);
      if (!executableSteps.length) {
        window.alert('当前没有可执行的自动化步骤。');
        return;
      }

      runnerState.isRunning = true;
      runnerState.isPaused = false;
      runnerState.currentStep = 0;
      runnerState.totalSteps = executableSteps.length;
      appendRunnerLog(tool, `开始运行自动化工具，共 ${executableSteps.length} 步`);
      touchRunnerTool(tool, false);
      renderRunnerLogs(tool);
      syncRunnerActionButtons();
      switchRunnerPage('logs');
      port.postMessage({ type: 'startPlayback', operations: executableSteps });
      return;
    }

    if (runnerState.isPaused) {
      runnerState.isPaused = false;
      appendRunnerLog(tool, `继续执行自动化步骤（从第 ${Math.max(runnerState.currentStep, 1)} 步继续）`);
      touchRunnerTool(tool, false);
      renderRunnerLogs(tool);
      syncRunnerActionButtons();
      port.postMessage({ type: 'resumePlayback' });
      return;
    }

    runnerState.isPaused = true;
    appendRunnerLog(tool, `暂停执行自动化步骤（暂停在第 ${Math.max(runnerState.currentStep, 1)} 步）`);
    touchRunnerTool(tool, false);
    renderRunnerLogs(tool);
    syncRunnerActionButtons();
    port.postMessage({ type: 'pausePlayback' });
  }

  function stopRunnerTool() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    if (port) {
      port.postMessage({ type: 'stopPlayback' });
    }

    runnerState.isRunning = false;
    runnerState.isPaused = false;
    runnerState.currentStep = 0;
    runnerState.totalSteps = 0;
    appendRunnerLog(tool, '已完全停止脚本运行并归零');
    touchRunnerTool(tool, false);
    renderRunnerLogs(tool);
    syncRunnerActionButtons();
    showToast('脚本已完全停止', 'success');
  }

  function resolveRunnerOperations(tool) {
    const steps = Array.isArray(tool?.steps) ? tool.steps : [];
    return steps.flatMap((step) => resolveRunnerStep(step, tool));
  }

  function resolveRunnerStep(step, tool) {
    if (!step || step.enabled === false) {
      return [];
    }

    if (step.type === 'group') {
      const children = Array.isArray(step.children) ? step.children : [];

      if (step.bindings?.groupType === 'loop' && step.bindings?.groupField) {
        const loopCount = Math.max(0, Number(tool.runtime?.config?.[step.bindings.groupField] || 0));
        const loopSteps = [];
        for (let index = 0; index < loopCount; index += 1) {
          children.forEach((child) => {
            loopSteps.push(...resolveRunnerStep(child, tool));
          });
        }
        return loopSteps;
      }

      if (step.bindings?.groupType === 'singleChoice' && step.bindings?.groupField) {
        const matchedChild = children.find((child) => matchSingleChoiceChild(child, tool, step.bindings.groupField));
        return matchedChild ? resolveRunnerStep(matchedChild, tool) : [];
      }

      return children.flatMap((child) => resolveRunnerStep(child, tool));
    }

    return [createExecutableRunnerStep(step, tool)];
  }

  function createExecutableRunnerStep(step, tool) {
    const nextStep = deepClone(step);
    const boundField = step.bindings?.configField;
    if (!boundField) {
      return nextStep;
    }

    const boundValue = getRunnerConfigBoundValue(tool, boundField);
    if (boundValue === '' || boundValue === null || boundValue === undefined) {
      return nextStep;
    }

    if (nextStep.type === 'input') {
      nextStep.data = nextStep.data || {};
      nextStep.data.value = String(boundValue);
    } else if (nextStep.type === 'change') {
      nextStep.data = nextStep.data || {};
      nextStep.data.value = String(boundValue);
      nextStep.data.newValue = String(boundValue);
    }

    return nextStep;
  }

  function matchSingleChoiceChild(step, tool, fieldId) {
    if (!step || step.enabled === false) {
      return false;
    }

    const rawValue = tool.runtime?.config?.[fieldId];
    const displayValue = getRunnerConfigBoundValue(tool, fieldId);
    const haystacks = [
      step.label,
      step.target?.text,
      step.target?.selector,
      step.target?.xpath,
      step.data?.value,
      step.data?.newValue
    ].filter(Boolean).map((value) => String(value));

    return haystacks.some((value) => value.includes(String(displayValue)) || value.includes(String(rawValue)));
  }

  function getRunnerConfigBoundValue(tool, fieldId) {
    const rawValue = tool.runtime?.config?.[fieldId];
    const selectOptions = RUNNER_SELECT_OPTIONS[fieldId];
    if (Array.isArray(selectOptions)) {
      return selectOptions.find((option) => option.value === rawValue)?.label || rawValue || '';
    }
    return rawValue;
  }

  function updateRunnerPlaybackStep(step, total) {
    if (!runnerState.isRunning && !runnerState.isPaused) {
      return;
    }
    runnerState.currentStep = Number(step || 0);
    runnerState.totalSteps = Number(total || runnerState.totalSteps || 0);
  }

  function handleRunnerPlaybackPaused(step, total) {
    if (!runnerState.isRunning && !runnerState.isPaused) {
      return;
    }
    runnerState.isRunning = true;
    runnerState.isPaused = true;
    updateRunnerPlaybackStep(step, total);
    syncRunnerActionButtons();
  }

  function handleRunnerPlaybackResumed(step, total) {
    if (!runnerState.isRunning && !runnerState.isPaused) {
      return;
    }
    runnerState.isRunning = true;
    runnerState.isPaused = false;
    updateRunnerPlaybackStep(step, total);
    syncRunnerActionButtons();
  }

  function handleRunnerPlaybackComplete() {
    if (!runnerState.isRunning && !runnerState.isPaused) {
      return;
    }

    const tool = getRunnerTool();
    runnerState.isRunning = false;
    runnerState.isPaused = false;
    runnerState.currentStep = 0;
    runnerState.totalSteps = 0;

    if (tool) {
      appendRunnerLog(tool, '自动化步骤执行完成');
      touchRunnerTool(tool, false);
      renderRunnerLogs(tool);
    }

    syncRunnerActionButtons();
  }

  function appendRunnerLog(tool, message) {
    if (!Array.isArray(tool.runtime.logs)) {
      tool.runtime.logs = [];
    }
    tool.runtime.logs.unshift({
      id: createId('runner_log'),
      message,
      timestamp: Date.now()
    });
    tool.runtime.logs = tool.runtime.logs.slice(0, 100);
  }

  function renderRunnerLogs(tool) {
    const logs = Array.isArray(tool.runtime.logs) ? tool.runtime.logs : [];
    if (!logs.length) {
      elements.runnerLogList.innerHTML = `
        <div class="empty-state">
          <p>暂无运行日志</p>
          <p class="empty-hint">保存配置或后续接入实际执行后，这里会显示时间线记录。</p>
        </div>
      `;
      return;
    }

    elements.runnerLogList.innerHTML = logs.map((log) => `
      <div class="runner-log-item">
        <div class="runner-log-time">${escapeHtml(new Date(log.timestamp).toLocaleString())}</div>
        <div class="runner-log-message">${escapeHtml(log.message)}</div>
      </div>
    `).join('');
  }

  function renderHomeCards() {
    elements.homeFeatureGrid.querySelectorAll('[data-custom-tool-card="true"]').forEach((node) => node.remove());

    const fragment = document.createDocumentFragment();
    customTools.forEach((tool) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feature-card feature-card-custom';
      button.dataset.customToolCard = 'true';
      button.dataset.toolId = tool.id;
      button.innerHTML = `
        <span class="feature-card-badge">已生成</span>
        <div class="feature-card-icon">${renderHomeCardIcon(tool.icon)}</div>
        <div class="feature-card-body">
          <h2>${escapeHtml(tool.name)}</h2>
          <p>${escapeHtml(tool.description || '自定义自动化工具，打开后先配置运行参数和采集字段。')}</p>
        </div>
        <div class="feature-card-meta">
          <span class="feature-metric">${Array.isArray(tool.steps) ? tool.steps.length : 0} 个步骤</span>
          <span class="feature-link">运行</span>
        </div>
      `;
      button.addEventListener('click', () => openToolRunner(tool.id));
      fragment.appendChild(button);
    });

    elements.homeFeatureGrid.appendChild(fragment);
  }

  function loadCustomTools() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.customTools);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((tool) => normalizeCustomTool(tool)) : [];
    } catch (error) {
      console.error('Failed to load custom tools:', error);
      return [];
    }
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
    if (!durationTimer) {
      return;
    }
    clearInterval(durationTimer);
    durationTimer = null;
  }

  async function startRecording() {
    if (!port || !window.chrome || !chrome.tabs?.query) {
      window.alert('当前环境无法开始录制，请在扩展侧边栏中使用。');
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
    if (!window.confirm('确定要清空所有录制操作吗？')) {
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

    const rows = [
      createDetailRow('操作类型', TYPE_NAMES[operation.type] || operation.type),
      createDetailRow('时间', new Date(operation.timestamp || Date.now()).toLocaleString())
    ];

    if (operation.target?.selector) {
      rows.push(createDetailRow('CSS 选择器', operation.target.selector, true));
    }
    if (operation.target?.xpath) {
      rows.push(createDetailRow('XPath', operation.target.xpath, true));
    }
    if (operation.target?.text) {
      rows.push(createDetailRow('元素文本', operation.target.text));
    }
    if (operation.data?.value !== undefined) {
      rows.push(createDetailRow('输入值', String(operation.data.value)));
    }
    if (operation.data?.newValue !== undefined) {
      rows.push(createDetailRow('新值', String(operation.data.newValue)));
    }
    if (operation.data?.url) {
      rows.push(createDetailRow('目标 URL', operation.data.url));
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
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `recording_${timestamp}.json`;
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

  function updatePlaybackButtonState(isPaused) {
    const playIcon = elements.btnPlayback.querySelector('.btn-icon-play');
    const pauseIcon = elements.btnPlayback.querySelector('.btn-icon-pause');
    const btnText = elements.btnPlayback.querySelector('.btn-text');

    playIcon.classList.toggle('hidden', !isPaused);
    pauseIcon.classList.toggle('hidden', isPaused);
    btnText.textContent = isPaused ? '继续' : '暂停';
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
    elements.playbackIndicator.classList.add('hidden');
    elements.btnPlayback.disabled = operations.length === 0;
    elements.btnStopPlayback.disabled = true;
    elements.btnStepOver.disabled = operations.length === 0;
    elements.btnPlayback.querySelector('.btn-icon-play').classList.remove('hidden');
    elements.btnPlayback.querySelector('.btn-icon-pause').classList.add('hidden');
    elements.btnPlayback.querySelector('.btn-text').textContent = '回放';
    elements.operationsList.querySelectorAll('.operation-item').forEach((item) => {
      item.classList.remove('active', 'completed');
    });
  }

  function syncEmptyStateVisibility(element, isEmpty) {
    element.hidden = !isEmpty;
    element.classList.toggle('hidden', !isEmpty);
  }

  function getOperationDescription(operation) {
    switch (operation?.type) {
      case 'click':
        return operation.target?.text || operation.target?.selector || operation.target?.xpath || '点击元素';
      case 'input':
        return operation.target?.text || operation.target?.selector || '输入内容';
      case 'change':
        return operation.target?.text || operation.target?.selector || `变更值 ${String(operation.data?.newValue ?? operation.data?.value ?? '')}`;
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
      case 'group':
        return operation.label || '融合步骤组';
      default:
        return '未知操作';
    }
  }

  function getGeneratorStepById(stepId) {
    return generatorState.steps.find((step) => step.id === stepId) || null;
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

  function formatScrollPosition(scrollPosition) {
    if (!scrollPosition || typeof scrollPosition !== 'object') {
      return '';
    }
    return `${scrollPosition.x || 0}, ${scrollPosition.y || 0}`;
  }

  function parseScrollPosition(value) {
    const [xRaw, yRaw] = String(value).split(',').map((part) => part.trim());
    return {
      x: Number(xRaw || 0),
      y: Number(yRaw || 0)
    };
  }

  function setByPath(target, path, value) {
    const keys = path.split('.');
    let current = target;
    for (let index = 0; index < keys.length - 1; index += 1) {
      const key = keys[index];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  }

  function createStepId(seed) {
    return createId(`step_${String(seed).replace(/\W/g, '')}`);
  }

  function stripJsonExtension(fileName) {
    return String(fileName || '').replace(/\.json$/i, '');
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/\n/g, '&#10;');
  }

  const __originalSwitchRunnerPage = switchRunnerPage;
  switchRunnerPage = function(pageName) {
    __originalSwitchRunnerPage(pageName);
    if (elements.btnEditRunnerTool) {
      elements.btnEditRunnerTool.textContent = pageName === 'steps' ? '保存编辑' : '编辑步骤';
    }
  };

  syncRunnerActionButtons = function() {
    if (!elements.btnRunRunner) {
      return;
    }

    if (!runnerState.isRunning) {
      elements.btnRunRunner.textContent = '运行脚本';
      if (elements.btnStopRunner) {
        elements.btnStopRunner.disabled = true;
      }
      return;
    }

    elements.btnRunRunner.textContent = runnerState.isPaused ? '继续脚本' : '暂停脚本';
    if (elements.btnStopRunner) {
      elements.btnStopRunner.disabled = false;
    }
  };

  buildGeneratorBindingEditor = function(step) {
    if (step.type === 'group') {
      return buildGroupBindingEditor(step);
    }

    if (step.type === 'click' || step.type === 'key') {
      return '';
    }

    const configOptions = [
      '<option value="">不绑定配置字段</option>',
      ...getRunnerConfigFieldOptionsForEditor().map((field) => (
        `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.configField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
      ))
    ].join('');

    if (step.type === 'input') {
      return `
        <div class="generator-step-binding-grid">
          <label class="generator-step-field">
            <span class="generator-step-field-label">配置字段绑定</span>
            <select class="generator-step-select" data-field="bindings.configField">
              ${configOptions}
            </select>
          </label>
        </div>
      `;
    }

    const collectOptions = [
      '<option value="">不绑定采集字段</option>',
      ...RUNNER_COLLECT_FIELD_OPTIONS.map((field) => (
        `<option value="${escapeAttribute(field.id)}"${field.id === step.bindings?.collectField ? ' selected' : ''}>${escapeHtml(field.label)}</option>`
      ))
    ].join('');

    return `
      <div class="generator-step-binding-grid">
        <label class="generator-step-field">
          <span class="generator-step-field-label">配置字段绑定</span>
          <select class="generator-step-select" data-field="bindings.configField">
            ${configOptions}
          </select>
        </label>
        <label class="generator-step-field">
          <span class="generator-step-field-label">采集字段绑定</span>
          <select class="generator-step-select" data-field="bindings.collectField">
            ${collectOptions}
          </select>
        </label>
      </div>
    `;
  };

  function slugifyConfigFieldOptionValue(label, index) {
    const normalized = String(label || '')
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return normalized || `option_${index + 1}`;
  }

  function isSelectableConfigFieldType(type) {
    return type === 'select' || type === 'radio' || type === 'multiSelect';
  }

  function getDefaultConfigFieldOptions(type) {
    if (!isSelectableConfigFieldType(type)) {
      return [];
    }
    return [
      { label: '选项 1', value: 'option_1' },
      { label: '选项 2', value: 'option_2' }
    ];
  }

  function formatConfigFieldOptions(options) {
    return (Array.isArray(options) ? options : []).map((option) => {
      const label = String(option?.label || option?.value || '').trim();
      const value = String(option?.value || '').trim();
      if (!label) {
        return '';
      }
      return value && value !== label ? `${label}|${value}` : label;
    }).filter(Boolean).join('\n');
  }

  function parseConfigFieldOptions(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [rawLabel, rawValue] = line.split('|');
        const label = String(rawLabel || '').trim();
        const value = String(rawValue || '').trim() || slugifyConfigFieldOptionValue(label, index);
        return {
          label: label || `选项 ${index + 1}`,
          value
        };
      });
  }

  function coerceConfigFieldDefaultValue(field) {
    if (field.type === 'checkbox') {
      return Boolean(field.defaultValue);
    }
    if (field.type === 'number') {
      return Number(field.defaultValue ?? field.min ?? 0) || 0;
    }
    if (field.type === 'multiSelect') {
      return Array.isArray(field.defaultValue) ? field.defaultValue : [];
    }
    if (isSelectableConfigFieldType(field.type)) {
      const firstOption = Array.isArray(field.options) && field.options.length > 0 ? field.options[0].value : '';
      return field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== ''
        ? String(field.defaultValue)
        : firstOption;
    }
    return String(field.defaultValue ?? '');
  }

  function createConfigFieldDraftByType(type) {
    const nextIndex = configFieldDrafts.filter((field) => !field.builtIn).length + 1;
    const optionList = getDefaultConfigFieldOptions(type);
    const baseLabel = {
      text: '文本字段',
      number: '数字字段',
      select: '下拉字段',
      radio: '单选字段',
      multiSelect: '多选字段',
      checkbox: '勾选字段'
    }[type] || '自定义字段';

    return {
      id: createId(`custom_field_${type}_${nextIndex}`),
      label: `${baseLabel}${nextIndex}`,
      type,
      defaultValue: type === 'checkbox' ? false : type === 'multiSelect' ? [] : optionList[0]?.value ?? '',
      options: optionList,
      min: type === 'number' ? 0 : null,
      layout: '',
      builtIn: false,
      enabled: true
    };
  }

  getConfigFieldTypeLabel = function(type) {
    switch (type) {
      case 'number':
        return '数字框';
      case 'select':
        return '下拉框';
      case 'radio':
        return '单选框';
      case 'multiSelect':
        return '多选框';
      case 'checkbox':
        return '勾选项';
      default:
        return '输入框';
    }
  };

  buildRunnerConfigFieldMarkup = function(field, config, isFullWidth) {
    const value = config[field.id] ?? field.defaultValue ?? (field.type === 'multiSelect' ? [] : '');
    const options = Array.isArray(field.options) ? field.options : [];

    if (field.type === 'select' || field.type === 'multiSelect') {
      const selectedValues = new Set(Array.isArray(value) ? value.map(String) : [String(value)]);
      const optionsMarkup = options.map((option) => (
        `<option value="${escapeAttribute(option.value)}"${selectedValues.has(String(option.value)) ? ' selected' : ''}>${escapeHtml(option.label)}</option>`
      )).join('');
      const multipleAttr = field.type === 'multiSelect' ? ' multiple size="4"' : '';
      const multipleClass = field.type === 'multiSelect' ? ' runner-multiselect' : '';
      return `
        <label class="generator-field${isFullWidth ? ' runner-form-full' : ''}">
          <span class="generator-field-label">${escapeHtml(field.label)}</span>
          <select class="generator-text-input${multipleClass}" data-runner-field="${escapeAttribute(field.id)}"${multipleAttr}>
            ${optionsMarkup}
          </select>
        </label>
      `;
    }

    if (field.type === 'radio') {
      const selectedValue = String(value ?? '');
      const optionsMarkup = options.map((option) => `
        <label class="runner-radio-option">
          <input type="radio" name="runner_field_${escapeAttribute(field.id)}" data-runner-field="${escapeAttribute(field.id)}" value="${escapeAttribute(option.value)}"${String(option.value) === selectedValue ? ' checked' : ''}>
          <span>${escapeHtml(option.label)}</span>
        </label>
      `).join('');
      return `
        <div class="generator-field${isFullWidth ? ' runner-form-full' : ''}">
          <span class="generator-field-label">${escapeHtml(field.label)}</span>
          <div class="runner-radio-group">
            ${optionsMarkup}
          </div>
        </div>
      `;
    }

    const inputType = field.type === 'number' ? 'number' : 'text';
    const minAttr = field.type === 'number' && field.min !== null && field.min !== undefined
      ? ` min="${escapeAttribute(field.min)}"`
      : '';
    return `
      <label class="generator-field${isFullWidth ? ' runner-form-full' : ''}">
        <span class="generator-field-label">${escapeHtml(field.label)}</span>
        <input class="generator-text-input" type="${inputType}"${minAttr} data-runner-field="${escapeAttribute(field.id)}" value="${escapeAttribute(value)}">
      </label>
    `;
  };

  handleRunnerConfigFormChange = function(event) {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    const fieldId = event.target.dataset.runnerField;
    const confirmField = event.target.dataset.runnerConfirm;
    if (!fieldId && !confirmField) {
      return;
    }

    if (fieldId) {
      const fieldDef = getRunnerConfigFields(tool).find((item) => item.id === fieldId);
      if (!fieldDef) {
        return;
      }

      if (fieldDef.type === 'number') {
        tool.runtime.config[fieldId] = Number(event.target.value || 0);
      } else if (fieldDef.type === 'multiSelect') {
        tool.runtime.config[fieldId] = Array.from(event.target.selectedOptions || []).map((option) => option.value);
      } else {
        tool.runtime.config[fieldId] = event.target.value;
      }
    } else if (confirmField) {
      tool.runtime.config[confirmField] = Boolean(event.target.checked);
    }

    touchRunnerTool(tool, false);
  };

  renderConfigFieldManager = function() {
    if (!elements.configFieldManagerList) {
      return;
    }

    elements.configFieldManagerList.innerHTML = configFieldDrafts.map((field) => {
      const selectableOptions = isSelectableConfigFieldType(field.type)
        ? `
          <label class="generator-step-field">
            <span class="generator-step-field-label">选项内容</span>
            <textarea class="generator-step-textarea" rows="4" data-config-field-prop="optionsText" placeholder="一行一个选项，可写成 显示名称|提交值">${escapeHtml(formatConfigFieldOptions(field.options))}</textarea>
            <span class="config-field-options-hint">一行一个选项；如果要自定义提交值，用“显示名称|提交值”。</span>
          </label>
        `
        : '';

      return `
        <div class="config-field-card${field.enabled === false ? ' is-disabled' : ''}" data-field-id="${escapeAttribute(field.id)}">
          <div class="config-field-card-top">
            <div class="config-field-card-meta">
              <span class="config-field-card-type">${escapeHtml(getConfigFieldTypeLabel(field.type))}</span>
            </div>
            <div class="config-field-card-actions">
              <label class="config-field-toggle">
                <input type="checkbox" data-config-field-prop="enabled"${field.enabled !== false ? ' checked' : ''}>
                <span>启用字段</span>
              </label>
              ${field.builtIn ? '' : '<button class="generator-step-button is-danger" type="button" data-config-field-action="delete">删除字段</button>'}
            </div>
          </div>
          <label class="generator-step-field">
            <span class="generator-step-field-label">字段名称</span>
            <input class="generator-step-input" type="text" data-config-field-prop="label" value="${escapeAttribute(field.label)}">
          </label>
          ${selectableOptions}
        </div>
      `;
    }).join('');
  };

  handleConfigFieldManagerInput = function(event) {
    const card = event.target.closest('[data-field-id]');
    if (!card) {
      return;
    }

    const field = configFieldDrafts.find((item) => item.id === card.dataset.fieldId);
    if (!field) {
      return;
    }

    const prop = event.target.dataset.configFieldProp;
    if (!prop) {
      return;
    }

    if (prop === 'enabled') {
      field.enabled = Boolean(event.target.checked);
      renderConfigFieldManager();
      return;
    }

    if (prop === 'label') {
      field.label = event.target.value;
      return;
    }

    if (prop === 'optionsText') {
      field.options = parseConfigFieldOptions(event.target.value);
    }
  };

  handleConfigFieldManagerClick = function(event) {
    const button = event.target.closest('[data-config-field-action]');
    if (!button) {
      return;
    }

    const card = button.closest('[data-field-id]');
    if (!card) {
      return;
    }

    if (button.dataset.configFieldAction === 'delete') {
      configFieldDrafts = configFieldDrafts.filter((field) => field.id !== card.dataset.fieldId);
      renderConfigFieldManager();
    }
  };

  addConfigFieldDraft = function() {
    elements.configFieldTypeChooser?.classList.toggle('hidden');
  };

  function handleConfigFieldTypeChooserClick(event) {
    const button = event.target.closest('[data-config-field-type-add]');
    if (!button) {
      return;
    }

    const type = button.dataset.configFieldTypeAdd || 'text';
    configFieldDrafts.push(createConfigFieldDraftByType(type));
    elements.configFieldTypeChooser?.classList.add('hidden');
    renderConfigFieldManager();
  }

  saveConfigFieldModal = function() {
    const tool = getRunnerTool();
    if (!tool) {
      return;
    }

    tool.runtime.configFields = normalizeRunnerConfigFields(configFieldDrafts.map((field) => {
      const options = isSelectableConfigFieldType(field.type)
        ? (Array.isArray(field.options) && field.options.length > 0 ? field.options : getDefaultConfigFieldOptions(field.type))
        : [];
      return {
        ...field,
        label: String(field.label || '').trim() || '未命名字段',
        options,
        defaultValue: coerceConfigFieldDefaultValue({ ...field, options })
      };
    })).map((field) => ({
      ...field,
      label: String(field.label || '').trim() || '未命名字段',
      options: isSelectableConfigFieldType(field.type)
        ? (Array.isArray(field.options) && field.options.length > 0 ? field.options : getDefaultConfigFieldOptions(field.type))
        : [],
      defaultValue: coerceConfigFieldDefaultValue(field)
    }));

    tool.runtime.configFields.forEach((field) => {
      if (tool.runtime.config[field.id] === undefined) {
        tool.runtime.config[field.id] = deepClone(field.defaultValue);
        return;
      }

      if (field.type === 'multiSelect' && !Array.isArray(tool.runtime.config[field.id])) {
        tool.runtime.config[field.id] = Array.isArray(field.defaultValue) ? deepClone(field.defaultValue) : [];
      }
      if (field.type === 'checkbox') {
        tool.runtime.config[field.id] = Boolean(tool.runtime.config[field.id]);
      }
      if (field.type === 'number') {
        tool.runtime.config[field.id] = Number(tool.runtime.config[field.id] || 0);
      }
    });

    Object.keys(tool.runtime.config).forEach((key) => {
      if (!tool.runtime.configFields.some((field) => field.id === key) && !RUNNER_CONFIG_FIELD_DEFINITIONS.some((field) => field.id === key)) {
        delete tool.runtime.config[key];
      }
    });

    touchRunnerTool(tool, false);
    renderRunnerView(tool);
    closeConfigFieldModal();
    showToast('字段已保存', 'success');
  };

  document.addEventListener('DOMContentLoaded', init);
})();
