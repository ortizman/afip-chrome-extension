document.getElementById('changeColor').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['jszip.min.js', 'downloadAll.js']
  });
};
