/* global chrome */

let currentDocId = null;
let docLastIndex = 0;
let authToken = null;

function createOrUpdateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (currentDocId && authToken) {
      setTimeout(() => {
        chrome.contextMenus.create({
          id: "add-to-doc",
          title: "Add to Doc",
          contexts: ["selection"],
        });
      }, 50);
    }
  });
}

chrome.storage.local.get(["token"], (result) => {
  authToken = result.token || null;
});

// Listen for token updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.token) {
    authToken = changes.token.newValue || null;
    createOrUpdateContextMenu();
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

    let newText = "";
    if (docLastIndex === 1) {
      newText = text;
    } else {
      newText = `\n${text}`;
    }
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

chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message);
  if (message.action === "logout") {
    chrome.storage.local.set({ token: null }, () => {
      chrome.storage.local.get(["selectedDocData"], (result) => {
        chrome.storage.local.set(
          {
            selectedDocData: {
              ...result.selectedDocData,
              docId: null,
            },
          },
          () => {}
        );
      });
    });
  }
});
