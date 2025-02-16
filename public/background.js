/* global chrome */

let currentDocId = null;
let docLastIndex = 0;
let authToken = null;

function createOrUpdateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "add-to-doc",
      title: "Add to Doc",
      contexts: ["selection"],
    });
  });
}

chrome.storage.local.get(["token"], (result) => {
  authToken = result.token || null;
});

// Listen for token updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.token) {
    authToken = changes.token.newValue || null;
  }
});

// Fetch and update context menu on load
chrome.storage.local.get(["selectedDocData"], (data) => {
  if (data.selectedDocData?.docId) {
    currentDocId = data.selectedDocData.docId;
    docLastIndex = data.selectedDocData.docLastIndex;
    createOrUpdateContextMenu();
  }
});

// Listen for selected document changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedDocData) {
    currentDocId = changes.selectedDocData.newValue?.docId || null;
    docLastIndex = changes.selectedDocData.newValue?.docLastIndex || 0;
    createOrUpdateContextMenu();
  }
});

// Function to fetch latest token before API call
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token"], (result) => {
      resolve(result.token || null);
    });
  });
}

async function insertTextInGoogleDoc(docId, text, docLastIndex) {
  try {
    const latestToken = await getAuthToken();
    if (!latestToken) {
      console.error("No token found.");
      return;
    }

    const newText = `\n${text}`;
    const startIndex = docLastIndex;
    const endIndex = startIndex + newText.length;

    const requestBody = {
      requests: [
        {
          insertText: {
            location: { index: startIndex },
            text: newText,
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex: startIndex + 1, endIndex },
            paragraphStyle: { namedStyleType: "NORMAL_TEXT" },
            fields: "namedStyleType",
          },
        },
        {
          createParagraphBullets: {
            range: { startIndex: startIndex + 1, endIndex },
            bulletPreset: "BULLET_DISC_CIRCLE_SQUARE",
          },
        },
      ],
    };

    const res = await fetch(
      `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${latestToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) {
      console.error("Failed to insert text", await res.json());
    } else {
      chrome.storage.local.get(["selectedDocData"], (result) => {
        const updatedData = {
          ...result.selectedDocData,
          docId,
          docLastIndex: endIndex,
        };
        chrome.storage.local.set({ selectedDocData: updatedData }, () => {});
      });
    }
  } catch (error) {
    console.error("Error inserting text:", error);
  }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info) => {
  if (!currentDocId || !info.selectionText) return;

  chrome.storage.local.get(["selectedDocData"], (result) => {
    docLastIndex = result.selectedDocData?.docLastIndex || 0;
    insertTextInGoogleDoc(currentDocId, info.selectionText, docLastIndex);
  });
});
