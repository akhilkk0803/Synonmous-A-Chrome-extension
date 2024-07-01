let index = 0;
let meaningsData = null;

function showMeaningPopup(data) {
  meaningsData = data;
  updatePopup();
}

function showSummaryPopup(data) {
  const popup = createPopup();
  popup.innerHTML = `
    <p id="close">X</p>
    <p>${data}</p>`;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.remove();
  }, 10000);
}

function createPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "10px";
  popup.style.right = "10px";
  popup.style.padding = "10px";
  popup.style.color = "white";
  popup.style.backgroundColor = "black";
  popup.style.border = "1px solid black";
  popup.style.borderRadius = "10px";
  popup.style.zIndex = "10000";
  return popup;
}

function updatePopup() {
  const definition =
    "Meaning of the selected word is <br/>" +
    (meaningsData[0]?.meanings[0]?.definitions[index]?.definition ||
      "No definition found.");
  console.log("Definition to display:", definition);

  let popup = document.getElementById("popup");
  if (!popup) {
    popup = createPopup();
    popup.id = "popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <p id="close">X</p>
    <p>${definition}</p>
    <button id="prev-meaning">Previous</button>
    <button id="next-meaning">Next</button>
  `;

  document.getElementById("close").addEventListener("click", () => {
    index = 0;
    popup.remove();
  });

  document.getElementById("prev-meaning").addEventListener("click", () => {
    if (index > 0) {
      index--;
      updatePopup();
    }
  });

  document.getElementById("next-meaning").addEventListener("click", () => {
    if (index < meaningsData[0]?.meanings[0]?.definitions.length - 1) {
      index++;
      updatePopup();
    }
  });

  setTimeout(() => {
    popup.remove();
  }, 5000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showMeaningPopup") {
    index = 0;
    showMeaningPopup(message.data);
  }
  if (message.action === "showSummaryPopup") {
    showSummaryPopup(message.data);
  }
});
