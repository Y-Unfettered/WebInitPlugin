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
        handlePlaybackClick(message.selector, message.xpath, message.position);
        break;
      case 'PLAYBACK_INPUT':
        handlePlaybackInput(message.selector, message.value);
        break;
      case 'PLAYBACK_CHANGE':
        handlePlaybackChange(message.selector, message.xpath, message.value);
        break;
      case 'PLAYBACK_HOVER':
        handlePlaybackHover(message.selector, message.xpath, message.position);
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
  document.addEventListener('mouseover', handleHover, true);
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
  document.removeEventListener('mouseover', handleHover, true);
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
    
    const eventData = {
      eventType: eventTypes.CLICK,
      element: {
        tagName: clickableElement.tagName,
        id: clickableElement.id || null,
        className: clickableElement.className || null,
        name: clickableElement.name || null,
        type: clickableElement.type || null,
        value: clickableElement.value || null,
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
      url: window.location.href
    };

    sendEventToBackground(eventData);
  } catch (error) {
    console.error('Error handling click event:', error);
  }
}

function handleHover(event) {
  if (!isListening || isPaused) {
    return;
  }
  try {
    const target = event.target;
    const eventData = {
      eventType: eventTypes.HOVER,
      element: {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        name: target.name || null,
        type: target.type || null,
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
    const eventData = {
      eventType: eventTypes.INPUT,
      element: {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        name: target.name || null,
        type: target.type || null
      },
      locator: {
        cssSelector: generateCSSSelector(target),
        xpath: generateXPath(target),
        accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
      },
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
        type: target.type || null
      },
      locator: {
        cssSelector: generateCSSSelector(target),
        xpath: generateXPath(target),
        accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
      },
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
      const eventData = {
        eventType: eventTypes.KEY,
        element: {
          tagName: target.tagName,
          id: target.id || null,
          className: target.className || null,
          name: target.name || null,
          type: target.type || null
        },
        locator: {
          cssSelector: generateCSSSelector(target),
          xpath: generateXPath(target),
          accessibleName: target.getAttribute('aria-label') || target.getAttribute('name') || null
        },
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

async function handlePlaybackHover(selector, xpath, position) {
  try {
    const element = await waitForElement(selector, xpath, 3000);
    if (!element) {
      console.warn('Element not found for playback hover:', selector, xpath);
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

    console.log('Playback hover executed on:', selector);
  } catch (error) {
    console.error('Error executing playback hover:', error);
  }
}

async function handlePlaybackClick(selector, xpath, position) {
  try {
    const element = await waitForElement(selector, xpath, 3000);
    if (!element) {
      console.warn('Element not found for playback click:', selector, xpath);
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

    console.log('Playback click executed on:', selector);
  } catch (error) {
    console.error('Error executing playback click:', error);
  }
}

async function handlePlaybackInput(selector, value) {
  try {
    const element = await waitForElement(selector, null, 3000);
    if (!element) {
      console.warn('Element not found for playback input:', selector);
      return;
    }

    element.focus();
    await delay(100);

    element.value = '';
    await delay(50);

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      await simulateKeyPress(char);
      await delay(50 + Math.random() * 50);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('Playback input executed on:', selector, 'value:', value);
  } catch (error) {
    console.error('Error executing playback input:', error);
  }
}

async function handlePlaybackChange(selector, xpath, value) {
  try {
    const element = await waitForElement(selector, xpath, 3000);
    if (!element) {
      console.warn('Element not found for playback change:', selector, xpath);
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
    console.log('Playback change executed on:', selector, 'value:', value);
  } catch (error) {
    console.error('Error executing playback change:', error);
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

function simulateMouseMove(clientX, clientY) {
  return new Promise(resolve => {
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
