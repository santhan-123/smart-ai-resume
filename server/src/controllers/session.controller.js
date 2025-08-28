// Creates a session and seeds the first AI prompt.
const Session = require('../models/Session');
const Message = require('../models/Message');
const { v4:uuidv4 } = require('uuid');
const { getFirstPrompt } = require('../services/flow.service');

// POST /api/session  -> { sessionId, initialMessage }
exports.createSession = async (req, res) => {
    try {
        const sessionId = uuidv4();

        const newSession = new Session({
            sessionId,
            userId: sessionId
        });

        await newSession.save();

    const firstPrompt = getFirstPrompt();
    const initialMessage = new Message({ sessionId, sender: 'ai', text: `Hello! I am your Resume Assistant. ${firstPrompt}` });

        await initialMessage.save();

    res.status(201).json({ sessionId: newSession.sessionId, initialMessage: initialMessage.text });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};