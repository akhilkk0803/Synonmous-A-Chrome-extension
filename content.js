function showMeaningPopup(data) {
  const definition =
    data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";
  console.log("Definition to display:", definition);
  const popup = document.createElement("div");
  popup.id = "meaning-popup";
  popup.innerText = definition;
  popup.style.position = "fixed";
  popup.style.top = "10px";
  popup.style.right = "10px";
  popup.style.padding = "10px";
  popup.style.color = "white";
  popup.style.backgroundColor = "white";
  popup.style.border = "1px solid black";
  popup.style.borderRadius = "30px";
  popup.style.backgroundColor = "black";
  popup.style.zIndex = "10000";
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 5000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showMeaningPopup") {
    showMeaningPopup(message.data);
  }
});
