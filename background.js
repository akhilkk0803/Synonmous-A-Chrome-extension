chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "getTextMeaning",
    title: "Get Text Meaning",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu item clicked");
  if (info.menuItemId === "getTextMeaning") {
    console.log("Selected text:", info.selectionText);
    const data = await getSelectedTextMeaning(info.selectionText);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showMeaningPopup",
          data: data,
        });
      }
    );
  }
});

async function getSelectedTextMeaning(selectedText) {
  console.log(selectedText);
  const data = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`
  );
  const res = await data.json();
  return res;
}
