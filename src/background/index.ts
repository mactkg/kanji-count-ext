chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log(message);
  switch (message.action) {
    case 'setCache': {
      const data = { [message.cacheKey]: message.newValue };
      chrome.storage.sync.set(data);

      break;
    }
    case 'loadCache': {
      chrome.storage.sync.get([message.cacheKey], (e) => {
        sendResponse({ cache: e[message.cacheKey] });
      });
      break;
    }
  }

  return true;
});
