// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend port

/**
 * Calls the backend to create a new conversational session.
 * @returns {Promise<{sessionId: string, initialMessage: string}>}
 */
export const createSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error (createSession):', error);
    throw error;
  }
};

/**
 * Sends a user message to the backend and gets an AI response.
 * @param {string} sessionId The current session ID.
 * @param {string} message The user's message.
 * @returns {Promise<{sessionId: string, aiResponse: string, resumeData: object, sessionState: string}>}
 */
export const sendMessage = async (sessionId, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, message }),
    });

    // Detect DOCX (binary) response BEFORE attempting JSON parse
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // Try to parse JSON error; if fails fall back to status text
      let errMsg = response.statusText;
      try {
        const errJson = await response.json();
        errMsg = errJson.error || errJson.message || errMsg;
  } catch { /* swallow */ }
      throw new Error(errMsg || 'Failed to get AI response');
    }

    if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      // It's a DOCX file (zip starts with PK..) => return blob payload
      const blob = await response.blob();
      // Extract filename from Content-Disposition if present
      const disposition = response.headers.get('content-disposition') || '';
      let filename = 'resume.docx';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      if (match) filename = match[1];
      return { type: 'docx', blob, filename };
    }

    // Otherwise assume JSON
    const data = await response.json();
    return data; // Expected: { sessionId, aiResponse, ... }
  } catch (error) {
    console.error('API Error (sendMessage):', error);
    throw error;
  }
};


// You would add other API calls here as needed, e.g., for downloading the resume.