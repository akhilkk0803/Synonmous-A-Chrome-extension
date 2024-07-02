const url = "https://api.ai21.com/studio/v1/j2-ultra/chat";

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "Bearer A5ZBlX98L7kJhU5ofzZjJ7ZzrfT3ZU5S",
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // Create context menu items for both features
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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu item clicked");

  // Handle Get Text Meaning functionality
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

  // Handle Summarize Text functionality
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

  // Handle Pronounce Text functionality
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
