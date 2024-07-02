const url = "https://api.ai21.com/studio/v1/j2-ultra/chat";

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "Bearer A5ZBlX98L7kJhU5ofzZjJ7ZzrfT3ZU5S",
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // Create context menu items for features
  chrome.contextMenus.create({
    id: "getTextMeaning",
    title: "Get Text Meaning",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "summarizeText",
    title: "Summarize Text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "Pronunce",
    title: "Pronounce Text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "translateText",
    title: "Translate Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu item clicked");

  if (info.menuItemId === "getTextMeaning") {
    console.log("Selected text:", info.selectionText);
    const meaningData = await getSelectedTextMeaning(info.selectionText);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showMeaningPopup",
          data: meaningData,
        });
      }
    );
  }

  if (info.menuItemId === "summarizeText") {
    console.log("Selected text for summarization:", info.selectionText);

    const summary = await summarizeText(info.selectionText);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showSummaryPopup",
          data: summary,
        });
      }
    );
  }

  if (info.menuItemId === "Pronunce") {
    console.log("Selected text for pronunciation:", info.selectionText);
    const res = await pronunceText(info.selectionText);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showPronunciationPopup",
          data: { res, text: info.selectionText },
        });
      }
    );
  }

  if (info.menuItemId === "translateText") {
    console.log("Selected text for translation:", info.selectionText);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showLanguageSelectionPopup",
          data: info.selectionText,
        });
      }
    );
  }
});

async function getSelectedTextMeaning(selectedText) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch meaning");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching meaning:", error);
    return { error: "Failed to fetch meaning" };
  }
}

async function summarizeText(text) {
  try {
    const payload = {
      numResults: 1,
      temperature: 0.7,
      messages: [
        {
          text: `Summarize ${text}`,
          role: "user",
        },
      ],
      system:
        "You are an AI assistant for business research. Your responses should be informative and concise.",
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to summarize text");
    }
    const data = await response.json();
    return data.outputs;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Failed to summarize text";
  }
}

async function pronunceText(text) {
  try {
    const payload = {
      numResults: 1,
      temperature: 0.7,
      messages: [
        {
          text: `give only pronunciation of ${text}`,
          role: "user",
        },
      ],
      system:
        "You are an AI assistant for business research. Your responses should be informative and concise.",
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to Pronounce text");
    }
    const data = await response.json();
    return data.outputs[0].text;
  } catch (error) {
    console.error("Error Pronouncing text:", error);
    return "Failed to Pronounce text";
  }
}

async function translateText(text, targetLanguage) {
  try {
    const payload = {
      numResults: 1,
      temperature: 0.7,
      messages: [
        {
          text: `Translate this text to ${targetLanguage}: "${text}"`,
          role: "user",
        },
      ],
      system:
        "You are an AI assistant for translation. Your responses should be informative and concise.",
    };
    console.log(text);
    console.log(targetLanguage);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to translate text");
    }
    const data = await response.json();
    console.log(data);
    return data.outputs[0].text;
  } catch (error) {
    console.error("Error translating text:", error);
    return "Failed to translate text";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translateSelectedText") {
    translateText(message.text, message.targetLanguage)
      .then((translation) => {
        console.log("Translation:", translation);
        sendResponse({ translation });
      })
      .catch((error) => {
        console.error("Error translating:", error);
        sendResponse({ translation: null }); // Handle error case
      });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});
