let index = 0;
let summarIndex = 0;
let meaningsData = null;
let summariesData = null;

function showMeaningPopup(data) {
  meaningsData = data;
  updateMeaningPopup();
}

function showSummaryPopup(data) {
  summariesData = data;
  updateSummaryPopup();
}

function createPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "10px";
  popup.style.right = "10px";
  popup.style.padding = "15px";
  popup.style.color = "white";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  popup.style.border = "1px solid #333";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  popup.style.maxWidth = "300px";
  popup.style.fontFamily = "Arial, sans-serif";
  popup.style.zIndex = "10000";
  return popup;
}
function showTranslationPopup(translation) {
  const popup = createPopup();
  popup.id = "translation-popup";
  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Translation</strong>
      <button id="close-translation" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
    </div>
    <p style="margin-top: 10px;">${translation}</p>
  `;
  
  // Append popup to the document body
  document.body.appendChild(popup);

  // Add event listener for close button
  document.getElementById("close-translation").addEventListener("click", () => {
    popup.remove();
  });
}

function showLanguageSelectionPopup(text) {
  const popup = createPopup();
  popup.id = "language-selection-popup";
  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Select Language</strong>
      <button id="close-language-selection" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
    </div>
    <select id="language-select" style="margin-top: 10px; padding: 5px; width: 100%;">
      <option value="Spanish">Spanish</option>
      <option value="French">French</option>
      <option value="German">German</option>
      <option value="Chinese">Chinese</option>
      <option value="Japanese">Japanese</option>
      <option value="Hindi">Hindi</option>
      <option value="Kannada">Kannada</option>
    </select>
    <button id="translate-button" style="padding: 10px; margin-top: 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Translate</button>
  `;

  // Append popup to the document body
  document.body.appendChild(popup);

  // Add event listener for close button
  document
    .getElementById("close-language-selection")
    .addEventListener("click", () => {
      popup.remove();
    });

  // Add event listener for translate button
  document.getElementById("translate-button").addEventListener("click", () => {
    const selectedLanguage = document.getElementById("language-select").value;

    // Log selected language for debugging
    console.log("Selected language:", selectedLanguage);

    // Send message to background script to translate text
    chrome.runtime.sendMessage(
      {
        action: "translateSelectedText",
        text: text,
        targetLanguage: selectedLanguage,
      },
      (response) => {
        // Log translation response for debugging
        console.log("Translation response:", response);

        showTranslationPopup(response.translation);

        popup.remove();
      }
    );
  });
}

function pronunciationPopup(data) {
  let popup = document.getElementById("pronunciation-popup");
  if (!popup) {
    popup = createPopup();
    popup.id = "pronunciation-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Pronunciation</strong>
      <button id="close-pronunciation" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
    </div>
    <p>${data.res}</p>
    <button id="play-pronunciation" style="padding: 5px 10px; margin-top: 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Play Pronunciation</button>
  `;

  document
    .getElementById("close-pronunciation")
    .addEventListener("click", () => {
      popup.remove();
    });

  document
    .getElementById("play-pronunciation")
    .addEventListener("click", () => {
      playPronunciation(data.text);
    });
}

function updateMeaningPopup() {
  const definition =
    "Meaning of the selected word is:<br/>" +
    (meaningsData[0]?.meanings[0]?.definitions[index]?.definition ||
      "No definition found.");
  const word = meaningsData[0]?.word || "No word found";
  console.log("Definition to display:", definition);

  let popup = document.getElementById("meaning-popup");
  if (!popup) {
    popup = createPopup();
    popup.id = "meaning-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Word Meaning</strong>
      <button id="close-meaning" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
    </div>
    <p>${definition}</p>
    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
      <button id="prev-meaning" style="padding: 5px 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Previous</button>
      <button id="next-meaning" style="padding: 5px 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Next</button>
    </div>
    <button id="play-pronunciation" style="padding: 5px 10px; margin-top: 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Play Pronunciation</button>
  `;

  document.getElementById("close-meaning").addEventListener("click", () => {
    index = 0;
    popup.remove();
  });

  document.getElementById("prev-meaning").addEventListener("click", () => {
    if (index > 0) {
      index--;
      updateMeaningPopup();
    }
  });

  document.getElementById("next-meaning").addEventListener("click", () => {
    if (index < meaningsData[0]?.meanings[0]?.definitions.length - 1) {
      index++;
      updateMeaningPopup();
    }
  });

  document
    .getElementById("play-pronunciation")
    .addEventListener("click", () => {
      playPronunciation(word);
    });
}

function updateSummaryPopup() {
  const summary = summariesData[summarIndex]?.text || "No summary found.";
  console.log("Summary to display:", summary);

  let popup = document.getElementById("summary-popup");
  if (!popup) {
    popup = createPopup();
    popup.id = "summary-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Summary</strong>
      <button id="close-summary" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
    </div>
    <p>${summary}</p>
    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
      <button id="prev-summary" style="padding: 5px 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Previous</button>
      <button id="next-summary" style="padding: 5px 10px; border: none; background: #444; color: white; border-radius: 5px; cursor: pointer;">Next</button>
    </div>
  `;

  document.getElementById("close-summary").addEventListener("click", () => {
    summarIndex = 0;
    popup.remove();
  });

  document.getElementById("prev-summary").addEventListener("click", () => {
    if (summarIndex > 0) {
      summarIndex--;
      updateSummaryPopup();
    }
  });

  document.getElementById("next-summary").addEventListener("click", () => {
    if (summarIndex < summariesData.length - 1) {
      summarIndex++;
      updateSummaryPopup();
    }
  });
}

function playPronunciation(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showMeaningPopup") {
    index = 0;
    showMeaningPopup(message.data);
  }
  if (message.action === "showSummaryPopup") {
    summarIndex = 0;
    showSummaryPopup(message.data);
  }
  if (message.action === "showPronunciationPopup") {
    pronunciationPopup(message.data);
  }
  if (message.action === "showLanguageSelectionPopup") {
    showLanguageSelectionPopup(message.data);
  }
});
