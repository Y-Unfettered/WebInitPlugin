let isListening = false;
let isPaused = false;

const eventTypes = {
  CLICK: 'click',
  INPUT: 'input',
  NAVIGATE: 'navigate',
  SCROLL: 'scroll',
  CHANGE: 'change',
  HOVER: 'hover',
  KEY: 'key'
};

const RECORD_HOVER_EVENTS = false;
let playbackCursorEl = null;
let playbackCursorHideTimer = null;
let lastPointerScreenPosition = null;

let lastUrl = window.location.href;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'START_LISTENING':
        startListening();
        break;
      case 'STOP_LISTENING':
        stopListening();
        break;
      case 'PAUSE_LISTENING':
        pauseListening();
        break;
      case 'RESUME_LISTENING':
        resumeListening();
        break;
      case 'PLAYBACK_CLICK':
        handlePlaybackClick(message.target || { selector: message.selector, xpath: message.xpath }, message.position);
        break;
      case 'PLAYBACK_INPUT':
        handlePlaybackInput(message.target || { selector: message.selector, xpath: message.xpath }, message.value, message.position);
        break;
      case 'PLAYBACK_CHANGE':
        handlePlaybackChange(message.target || { selector: message.selector, xpath: message.xpath }, message.value, message.position);
        break;
      case 'PLAYBACK_HOVER':
        handlePlaybackHover(message.target || { selector: message.selector, xpath: message.xpath }, message.position);
        break;
      case 'PLAYBACK_KEY':
        handlePlaybackKey(
          message.target || { selector: message.selector, xpath: message.xpath },
          message.keyData || {},
          message.position
        );
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error handling message in content script:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

function startListening() {
  if (isListening) {
    return;
  }
  isListening = true;
  isPaused = false;
  lastUrl = window.location.href;

  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  if (RECORD_HOVER_EVENTS) {
    document.addEventListener('mouseover', handleHover, true);
  }
  document.addEventListener('keydown', handleKeydown, true);
  window.addEventListener('scroll', handleScroll, { passive: true });

  observeNavigation();

  console.log('Content script: started listening');
}

function stopListening() {
  if (!isListening) {
    return;
  }
  isListening = false;
  isPaused = false;

  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('change', handleChange, true);
  if (RECORD_HOVER_EVENTS) {
    document.removeEventListener('mouseover', handleHover, true);
  }
  document.removeEventListener('keydown', handleKeydown, true);
  window.removeEventListener('scroll', handleScroll);

  console.log('Content script: stopped listening');
}

function pauseListening() {
  isPaused = true;
  console.log('Content script: paused');
}

function resumeListening() {
  isPaused = false;
  console.log('Content script: resumed');
}

function handleClick(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    let target = event.target;
    
    const clickableTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
    
    let clickableElement = target;
    if (!clickableTags.includes(target.tagName)) {
      const closestClickable = target.closest('button, a, input, textarea, select');
      if (closestClickable) {
        clickableElement = closestClickable;
      }
    }
    
    const screenPosition = buildEventScreenPosition(event);
    lastPointerScreenPosition = screenPosition;
    const eventData = {
      eventType: eventTypes.CLICK,
      element: {
        tagName: clickableElement.tagName,
        id: clickableElement.id || null,
        className: clickableElement.className || null,
        name: clickableElement.name || null,
        type: clickableElement.type || null,
        value: clickableElement.value || null,
        href: clickableElement.href || clickableElement.getAttribute('href') || null,
        ariaLabel: clickableElement.getAttribute('aria-label') || null,
        role: clickableElement.getAttribute('role') || null,
        textContent: clickableElement.textContent ? clickableElement.textContent.trim().substring(0, 100) : null
      },
      locator: {
        cssSelector: generateCSSSelector(clickableElement),
        xpath: generateXPath(clickableElement),
        accessibleName: clickableElement.getAttribute('aria-label') || clickableElement.getAttribute('name') || null
      },
      position: {
        x: event.clientX,
        y: event.clientY
      },
      screenPosition: screenPosition,
      viewportContext: buildViewportContext(),
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling click event:', error);
  }
}

function handleHover(event) {
  if (!RECORD_HOVER_EVENTS) {
    return;
  }
  if (!isListening || isPaused) {
    return;
  }
  try {
    const target = event.target;
    const screenPosition = buildEventScreenPosition(event);
    lastPointerScreenPosition = screenPosition;
    const eventData = {
      eventType: eventTypes.HOVER,
      element: {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        name: target.name || null,
        type: target.type || null,
        href: target.href || target.getAttribute?.('href') || null,
        ariaLabel: target.getAttribute('aria-label') || null,
        role: target.getAttribute('role') || null,
        textContent: target.textContent ? target.textContent.trim().substring(0, 100) : null
      },
      locator: {
        cssSelector: generateCSSSelector(target),
        xpath: generateXPath(target),
        accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
      },
      position: {
        x: event.clientX,
        y: event.clientY
      },
      screenPosition: screenPosition,
      viewportContext: buildViewportContext(),
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling hover event:', error);
  }
}

function handleInput(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    const target = event.target;
    const elementPosition = buildElementPosition(target);
    const eventData = {
      eventType: eventTypes.INPUT,
      element: {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        name: target.name || null,
        type: target.type || null,
        href: target.href || target.getAttribute?.('href') || null,
        ariaLabel: target.getAttribute('aria-label') || null,
        role: target.getAttribute('role') || null
      },
      locator: {
        cssSelector: generateCSSSelector(target),
        xpath: generateXPath(target),
        accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
      },
      position: elementPosition,
      screenPosition: lastPointerScreenPosition || (elementPosition ? buildScreenPositionFromViewportPoint(elementPosition.x, elementPosition.y) : null),
      viewportContext: buildViewportContext(),
      inputValue: target.value || '',
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling input event:', error);
  }
}

function handleChange(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    const target = event.target;
    let newValue = null;
    const elementPosition = buildElementPosition(target);

    if (target.tagName === 'SELECT') {
      newValue = target.value;
    } else if (target.type === 'checkbox' || target.type === 'radio') {
      newValue = target.checked;
    } else {
      newValue = target.value;
    }

    const eventData = {
      eventType: eventTypes.CHANGE,
      element: {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        name: target.name || null,
        type: target.type || null,
        href: target.href || target.getAttribute?.('href') || null,
        ariaLabel: target.getAttribute('aria-label') || null,
        role: target.getAttribute('role') || null
      },
      locator: {
        cssSelector: generateCSSSelector(target),
        xpath: generateXPath(target),
        accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
      },
      position: elementPosition,
      screenPosition: lastPointerScreenPosition || (elementPosition ? buildScreenPositionFromViewportPoint(elementPosition.x, elementPosition.y) : null),
      viewportContext: buildViewportContext(),
      newValue: newValue,
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling change event:', error);
  }
}

function handleKeydown(event) {
  if (!isListening || isPaused) {
    return;
  }
  
  const key = event.key;
  const specialKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'];
  
  if (specialKeys.includes(key) || event.ctrlKey || event.altKey || event.metaKey) {
    try {
      const target = event.target;
      const elementPosition = buildElementPosition(target);
      const eventData = {
        eventType: eventTypes.KEY,
        element: {
          tagName: target.tagName,
          id: target.id || null,
          className: target.className || null,
          name: target.name || null,
          type: target.type || null,
          href: target.href || target.getAttribute?.('href') || null,
          ariaLabel: target.getAttribute('aria-label') || null,
          role: target.getAttribute('role') || null
        },
        locator: {
          cssSelector: generateCSSSelector(target),
          xpath: generateXPath(target),
          accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
        },
        position: elementPosition,
        screenPosition: lastPointerScreenPosition || (elementPosition ? buildScreenPositionFromViewportPoint(elementPosition.x, elementPosition.y) : null),
        viewportContext: buildViewportContext(),
        keyData: {
          key: key,
          code: event.code,
          ctrlKey: event.ctrlKey || false,
          altKey: event.altKey || false,
          metaKey: event.metaKey || false,
          shiftKey: event.shiftKey || false
        },
        url: window.location.href
      };

      sendEventToBackground(eventData);
    } catch (error) {
      console.error('Error handling keydown event:', error);
    }
  }
}

function handleScroll(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    const eventData = {
      eventType: eventTypes.SCROLL,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY,
        maxX: document.documentElement.scrollWidth - window.innerWidth,
        maxY: document.documentElement.scrollHeight - window.innerHeight
      },
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling scroll event:', error);
  }
}

function observeNavigation() {
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      handleNavigate({ type: 'navigation' });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('popstate', () => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      handleNavigate({ type: 'navigation' });
    }
  });
}

function handleNavigate(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    const eventData = {
      eventType: eventTypes.NAVIGATE,
      url: window.location.href,
      referrer: document.referrer || null
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling navigate event:', error);
  }
}

function generateCSSSelector(element) {
  try {
    if (element.id) {
      const idSelector = `#${CSS.escape(element.id)}`;
      if (document.querySelectorAll(idSelector).length === 1) {
        return idSelector;
      }
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href');
      if (href) {
        const hrefSelector = `a[href="${CSS.escape(href)}"]`;
        if (document.querySelectorAll(hrefSelector).length === 1) {
          return hrefSelector;
        }
      }
    }

    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      const ariaSelector = `${element.tagName.toLowerCase()}[aria-label="${CSS.escape(ariaLabel)}"]`;
      if (document.querySelectorAll(ariaSelector).length === 1) {
        return ariaSelector;
      }
    }

    const nameAttr = element.getAttribute('name');
    if (nameAttr) {
      const nameSelector = `${element.tagName.toLowerCase()}[name="${CSS.escape(nameAttr)}"]`;
      if (document.querySelectorAll(nameSelector).length === 1) {
        return nameSelector;
      }
    }

    let selector = element.tagName.toLowerCase();

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c && !c.startsWith('js-'));
      if (classes.length > 0) {
        const uniqueClasses = [...new Set(classes)].slice(0, 2);
        const classSelector = uniqueClasses.map(c => CSS.escape(c)).join('.');
        const testSelector = selector + '.' + classSelector;
        if (document.querySelectorAll(testSelector).length === 1) {
          return testSelector;
        }
        selector += '.' + uniqueClasses.map(c => CSS.escape(c)).join('.');
      }
    }

    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === element.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    const fullSelector = selector;
    if (document.querySelectorAll(fullSelector).length === 1) {
      return fullSelector;
    }

    let ancestor = element.parentElement;
    let depth = 0;
    const maxDepth = 5;

    while (ancestor && depth < maxDepth) {
      depth++;
      let ancestorSelector = ancestor.tagName.toLowerCase();

      if (ancestor.id) {
        ancestorSelector = `#${CSS.escape(ancestor.id)}`;
        const uniqueSelector = ancestorSelector + ' ' + selector;
        if (document.querySelectorAll(uniqueSelector).length === 1) {
          return uniqueSelector;
        }
      }

      if (ancestor.className && typeof ancestor.className === 'string') {
        const classes = ancestor.className.trim().split(/\s+/).filter(c => c && !c.startsWith('js-')).slice(0, 1);
        if (classes.length > 0) {
          ancestorSelector += '.' + CSS.escape(classes[0]);
        }
      }

      const parentSiblings = Array.from(ancestor.parentElement?.children || []).filter(
        child => child.tagName === ancestor.tagName
      );
      if (parentSiblings.length > 1) {
        const idx = parentSiblings.indexOf(ancestor) + 1;
        ancestorSelector += `:nth-of-type(${idx})`;
      }

      selector = ancestorSelector + ' ' + selector;

      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }

      ancestor = ancestor.parentElement;
    }

    return selector;
  } catch (error) {
    console.error('Error generating CSS selector:', error);
    return element.tagName.toLowerCase();
  }
}

function generateXPath(element) {
  try {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.tagName.toLowerCase();
      const pathIndex = `[${index}]`;
      parts.unshift(`${tagName}${pathIndex}`);

      current = current.parentElement;
    }

    return '/' + parts.join('/');
  } catch (error) {
    console.error('Error generating XPath:', error);
    return '/html';
  }
}

function findElementBySelector(selector) {
  try {
    if (!selector) {
      return null;
    }
    if (selector.startsWith('/')) {
      const result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue;
    } else {
      return document.querySelector(selector);
    }
  } catch (error) {
    console.error('Error finding element:', error);
    return null;
  }
}

function locatePlaybackElement(target, position) {
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const selector = target?.selector || '';
  const xpath = target?.xpath || '';
  const expectedText = normalize(target?.text);
  const expectedAccessibleName = normalize(target?.accessibleName || target?.attributes?.ariaLabel);
  const expectedHref = target?.attributes?.href || '';
  const expectedId = target?.attributes?.id || '';
  const expectedName = target?.attributes?.name || '';
  const expectedType = target?.attributes?.type || '';
  const expectedRole = target?.attributes?.role || '';
  const expectedTag = String(target?.tagName || '').toUpperCase();

  const addCandidate = (list, element, source) => {
    if (!element || list.some((entry) => entry.element === element)) {
      return;
    }
    list.push({ element, source });
  };

  const candidates = [];

  if (selector) {
    try {
      document.querySelectorAll(selector).forEach((element) => addCandidate(candidates, element, 'selector'));
    } catch (error) {
      console.warn('Selector lookup failed in content script:', error);
    }
  }

  if (xpath) {
    try {
      const snapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (let i = 0; i < snapshot.snapshotLength; i++) {
        const node = snapshot.snapshotItem(i);
        if (node?.nodeType === Node.ELEMENT_NODE) {
          addCandidate(candidates, node, 'xpath');
        }
      }
    } catch (error) {
      console.warn('XPath lookup failed in content script:', error);
    }
  }

  if (expectedId) {
    addCandidate(candidates, document.getElementById(expectedId), 'id');
  }

  if (expectedHref) {
    document.querySelectorAll('a[href]').forEach((element) => {
      if (element.href === expectedHref || element.getAttribute('href') === expectedHref) {
        addCandidate(candidates, element, 'href');
      }
    });
  }

  if (expectedAccessibleName) {
    document.querySelectorAll('[aria-label]').forEach((element) => {
      if (normalize(element.getAttribute('aria-label')) === expectedAccessibleName) {
        addCandidate(candidates, element, 'aria');
      }
    });
  }

  if (expectedName) {
    document.querySelectorAll(`[name="${CSS.escape(expectedName)}"]`).forEach((element) => addCandidate(candidates, element, 'name'));
  }

  if (expectedText) {
    const textSelector = expectedTag ? expectedTag.toLowerCase() : 'a,button,[role="button"],li,span,div';
    document.querySelectorAll(textSelector).forEach((element) => {
      if (normalize(element.textContent) === expectedText) {
        addCandidate(candidates, element, 'text');
      }
    });
  }

  let best = null;
  for (const candidate of candidates) {
    const element = candidate.element;
    const rect = element.getBoundingClientRect();
    const text = normalize(element.textContent);
    const ariaLabel = normalize(element.getAttribute('aria-label'));
    const href = element.href || element.getAttribute('href') || '';
    let score = 0;

    if (candidate.source === 'selector') score += 80;
    if (candidate.source === 'xpath') score += 70;
    if (candidate.source === 'id') score += 120;
    if (candidate.source === 'href') score += 160;
    if (candidate.source === 'aria') score += 140;
    if (candidate.source === 'name') score += 110;
    if (candidate.source === 'text') score += 130;
    if (expectedTag && element.tagName === expectedTag) score += 50;
    if (expectedType && String(element.type || '') === expectedType) score += 30;
    if (expectedRole && String(element.getAttribute('role') || '') === expectedRole) score += 25;
    if (expectedText && text === expectedText) score += 180;
    if (expectedAccessibleName && ariaLabel === expectedAccessibleName) score += 120;
    if (expectedHref && href === expectedHref) score += 220;
    if (expectedId && element.id === expectedId) score += 120;
    if (expectedName && element.getAttribute('name') === expectedName) score += 70;

    if (position && typeof position.x === 'number' && typeof position.y === 'number') {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      score -= Math.min(Math.hypot(centerX - position.x, centerY - position.y), 400);
    }

    if (rect.width <= 0 || rect.height <= 0) {
      score -= 200;
    }

    if (!best || score > best.score) {
      best = { element, score };
    }
  }

  return best && best.score >= 0 ? best.element : null;
}

async function waitForPlaybackTarget(target, position, timeout = 3000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = locatePlaybackElement(target, position);
    if (element) {
      return element;
    }
    await delay(100);
  }
  return null;
}

async function handlePlaybackHover(target, position) {
  try {
    const element = await waitForPlaybackTarget(target, position, 3000);
    if (!element) {
      console.warn('Element not found for playback hover:', target);
      return;
    }

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = position?.x || centerX;
    const clientY = position?.y || centerY;

    await simulateMouseMove(clientX, clientY);
    await delay(100);
    
    await simulateMouseOver(element, clientX, clientY);
    await delay(200);

    console.log('Playback hover executed on:', target?.selector || target?.xpath || target?.text);
  } catch (error) {
    console.error('Error executing playback hover:', error);
  }
}

async function handlePlaybackClick(target, position) {
  try {
    const element = await waitForPlaybackTarget(target, position, 3000);
    if (!element) {
      console.warn('Element not found for playback click:', target);
      return;
    }

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = position?.x || centerX;
    const clientY = position?.y || centerY;

    await simulateMouseMove(clientX, clientY);
    await delay(100);
    
    await simulateMouseOver(element, clientX, clientY);
    await delay(150);
    
    await simulateMouseDown(element, clientX, clientY);
    await delay(50);
    
    await simulateMouseUp(element, clientX, clientY);
    await delay(50);

    console.log('Playback click executed on:', target?.selector || target?.xpath || target?.text);
  } catch (error) {
    console.error('Error executing playback click:', error);
  }
}

async function handlePlaybackInput(target, value, position) {
  try {
    const element = await waitForPlaybackTarget(target, position, 3000);
    if (!element) {
      console.warn('Element not found for playback input:', target);
      return;
    }

    element.focus();
    await delay(100);

    applyInputValue(element, value);
    await delay(50);

    console.log('Playback input executed on:', target?.selector || target?.xpath || target?.text, 'value:', value);
  } catch (error) {
    console.error('Error executing playback input:', error);
  }
}

async function handlePlaybackChange(target, value, position) {
  try {
    const element = await waitForPlaybackTarget(target, position, 3000);
    if (!element) {
      console.warn('Element not found for playback change:', target);
      return;
    }

    if (element.tagName === 'SELECT') {
      element.value = value;
    } else if (element.type === 'checkbox') {
      element.checked = value;
    } else if (element.type === 'radio') {
      element.checked = value;
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('Playback change executed on:', target?.selector || target?.xpath || target?.text, 'value:', value);
  } catch (error) {
    console.error('Error executing playback change:', error);
  }
}

async function handlePlaybackKey(target, keyData, position) {
  try {
    const element = target ? await waitForPlaybackTarget(target, position, 3000) : document.activeElement;
    const targetElement = element || document.activeElement || document.body;
    if (!targetElement) {
      console.warn('Element not found for playback key:', target);
      return;
    }

    targetElement.focus?.();
    await delay(30);

    const key = keyData?.key || '';
    const code = keyData?.code || key;
    const keyCode = resolveKeyCode(key);
    const eventInit = {
      key,
      code,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      ctrlKey: !!keyData?.ctrlKey,
      altKey: !!keyData?.altKey,
      metaKey: !!keyData?.metaKey,
      shiftKey: !!keyData?.shiftKey
    };

    targetElement.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    if (key.length === 1 || key === 'Enter') {
      targetElement.dispatchEvent(new KeyboardEvent('keypress', eventInit));
    }
    targetElement.dispatchEvent(new KeyboardEvent('keyup', eventInit));

    if (key === 'Enter') {
      const form = targetElement.closest?.('form');
      if (form) {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    }

    console.log('Playback key executed on:', target?.selector || target?.xpath || target?.text, key);
  } catch (error) {
    console.error('Error executing playback key:', error);
  }
}

async function waitForElement(selector, xpath, timeout = 3000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = findElementBySelector(selector) || (xpath ? findElementBySelector(xpath) : null);
    if (element) {
      return element;
    }
    await delay(100);
  }
  return null;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildEventScreenPosition(event) {
  if (typeof event?.screenX !== 'number' || typeof event?.screenY !== 'number') {
    return null;
  }

  return {
    x: Math.round(event.screenX),
    y: Math.round(event.screenY)
  };
}

function buildElementPosition(element) {
  if (!element || typeof element.getBoundingClientRect !== 'function') {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    x: Math.round(rect.left + rect.width / 2),
    y: Math.round(rect.top + rect.height / 2)
  };
}

function buildScreenPositionFromViewportPoint(clientX, clientY) {
  if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return null;
  }

  return {
    x: Math.round(window.screenX + clientX),
    y: Math.round(window.screenY + clientY)
  };
}

function buildViewportContext() {
  return {
    screenX: window.screenX,
    screenY: window.screenY,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    visualViewportOffsetLeft: window.visualViewport?.offsetLeft || 0,
    visualViewportOffsetTop: window.visualViewport?.offsetTop || 0
  };
}

function ensurePlaybackCursor() {
  if (playbackCursorEl && document.body.contains(playbackCursorEl)) {
    return playbackCursorEl;
  }

  playbackCursorEl = document.createElement('div');
  playbackCursorEl.id = 'browser-recorder-playback-cursor';
  playbackCursorEl.style.position = 'fixed';
  playbackCursorEl.style.left = '0';
  playbackCursorEl.style.top = '0';
  playbackCursorEl.style.width = '18px';
  playbackCursorEl.style.height = '18px';
  playbackCursorEl.style.borderRadius = '50%';
  playbackCursorEl.style.background = 'rgba(37, 99, 235, 0.85)';
  playbackCursorEl.style.border = '2px solid #ffffff';
  playbackCursorEl.style.boxShadow = '0 0 0 6px rgba(37, 99, 235, 0.18)';
  playbackCursorEl.style.transform = 'translate(-50%, -50%)';
  playbackCursorEl.style.pointerEvents = 'none';
  playbackCursorEl.style.zIndex = '2147483647';
  playbackCursorEl.style.transition = 'left 120ms linear, top 120ms linear, transform 80ms ease, opacity 120ms ease';
  playbackCursorEl.style.opacity = '0';
  document.documentElement.appendChild(playbackCursorEl);
  return playbackCursorEl;
}

function showPlaybackCursor(clientX, clientY, pressed = false) {
  const cursor = ensurePlaybackCursor();
  cursor.style.left = `${clientX}px`;
  cursor.style.top = `${clientY}px`;
  cursor.style.opacity = '1';
  cursor.style.transform = pressed ? 'translate(-50%, -50%) scale(0.82)' : 'translate(-50%, -50%) scale(1)';

  if (playbackCursorHideTimer) {
    clearTimeout(playbackCursorHideTimer);
  }
  playbackCursorHideTimer = setTimeout(() => {
    hidePlaybackCursor();
  }, 1600);
}

function hidePlaybackCursor() {
  if (!playbackCursorEl) {
    return;
  }
  playbackCursorEl.style.opacity = '0';
  playbackCursorEl.style.transform = 'translate(-50%, -50%) scale(1)';
}

function applyInputValue(element, value) {
  const prototype = element.tagName === 'TEXTAREA'
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    data: value,
    inputType: 'insertText'
  }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function resolveKeyCode(key) {
  const keyMap = {
    Enter: 13,
    Tab: 9,
    Escape: 27,
    Backspace: 8,
    Delete: 46,
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    Home: 36,
    End: 35,
    PageUp: 33,
    PageDown: 34
  };

  if (keyMap[key]) {
    return keyMap[key];
  }

  if (key && key.length === 1) {
    return key.toUpperCase().charCodeAt(0);
  }

  return 0;
}

function simulateMouseMove(clientX, clientY) {
  return new Promise(resolve => {
    showPlaybackCursor(clientX, clientY, false);
    const event = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      pointerType: 'mouse',
      isPrimary: true
    });
    document.elementFromPoint(clientX, clientY)?.dispatchEvent(event);
    resolve();
  });
}

function simulateMouseOver(element, clientX, clientY) {
  return new Promise(resolve => {
    const mouseOverEvent = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY
    });
    element.dispatchEvent(mouseOverEvent);

    const pointerOverEvent = new PointerEvent('pointerover', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      pointerType: 'mouse',
      isPrimary: true
    });
    element.dispatchEvent(pointerOverEvent);

    const mouseEnterEvent = new MouseEvent('mouseenter', {
      bubbles: false,
      cancelable: true,
      clientX: clientX,
      clientY: clientY
    });
    element.dispatchEvent(mouseEnterEvent);

    resolve();
  });
}

function simulateMouseDown(element, clientX, clientY) {
  return new Promise(resolve => {
    showPlaybackCursor(clientX, clientY, true);
    const event = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      isPrimary: true
    });
    element.dispatchEvent(event);

    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      button: 0,
      buttons: 1
    });
    element.dispatchEvent(mouseDownEvent);

    resolve();
  });
}

function simulateMouseUp(element, clientX, clientY) {
  return new Promise(resolve => {
    showPlaybackCursor(clientX, clientY, false);
    const event = new PointerEvent('pointerup', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      pointerType: 'mouse',
      button: 0,
      buttons: 0,
      isPrimary: true
    });
    element.dispatchEvent(event);

    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      button: 0,
      buttons: 0
    });
    element.dispatchEvent(mouseUpEvent);

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      button: 0
    });
    element.dispatchEvent(clickEvent);

    resolve();
  });
}

function simulateKeyPress(char) {
  return new Promise(resolve => {
    const keyCode = char.charCodeAt(0);
    const key = char.toLowerCase();

    const keydownEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      charCode: keyCode,
      keyCode: keyCode
    });
    document.activeElement?.dispatchEvent(keydownEvent);

    const keypressEvent = new KeyboardEvent('keypress', {
      bubbles: true,
      cancelable: true,
      key: char,
      charCode: keyCode,
      keyCode: keyCode
    });
    document.activeElement?.dispatchEvent(keypressEvent);

    const keyupEvent = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      charCode: 0,
      keyCode: keyCode
    });
    document.activeElement?.dispatchEvent(keyupEvent);

    resolve();
  });
}

function sendEventToBackground(eventData) {
  try {
    chrome.runtime.sendMessage({
      type: 'RECORD_EVENT',
      eventData: eventData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to send event to background:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error('Error sending event to background:', error);
  }
}

window.navigationListenerAttached = true;
