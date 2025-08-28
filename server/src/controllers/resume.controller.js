// Handles user messages: stores them, advances question flow, or generates DOCX.
const Session = require('../models/Session');
const Message = require('../models/Message');
const Resume = require('../models/Resume');
const docxService = require('../services/docx.service');
const { processAnswer, getProgress } = require('../services/flow.service');

// POST /api/resume  -> dynamic AI prompt or DOCX file when user types GENERATE RESUME
exports.handleMessage = async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }

    try {
        let session = await Session.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

    // log user input
    await new Message({ sessionId, sender: 'user', text: message }).save();

        // --- Check for user's explicit GENERATE RESUME command ---
    if (message.trim().toUpperCase() === 'GENERATE RESUME') {
        session.state = 'ready_to_generate';
        await session.save();

        const finalResume = new Resume({
            sessionId: session.sessionId,
            personalInfo: session.resumeData.personalInfo,
            workExperience: session.resumeData.workExperience,
            skills: session.resumeData.skills,
            education: session.resumeData.education,
            generatedAt: new Date(),
        });
        await finalResume.save();

        const docxBuffer = await docxService.generateResume(session.resumeData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="resume_${sessionId}.docx"`);
        return res.status(200).send(docxBuffer);
    }

    // Advance deterministic question flow
        if (!session.progress.completed) {
            const result = await processAnswer(session, message);
            await session.save();
            if (result.error) {
                await new Message({ sessionId, sender: 'ai', text: result.error + ' Please try again. ' + result.prompt }).save();
                return res.status(200).json({ sessionId, aiResponse: result.error + ' Please try again. ' + result.prompt, resumeData: session.resumeData, progress: getProgress(session) });
            }
            if (result.done) {
                const completionMsg = 'All required information collected. Type GENERATE RESUME to download your resume.';
                await new Message({ sessionId, sender: 'ai', text: completionMsg }).save();
                return res.status(200).json({ sessionId, aiResponse: completionMsg, resumeData: session.resumeData, progress: getProgress(session) });
            }
            await new Message({ sessionId, sender: 'ai', text: result.nextPrompt }).save();
            return res.status(200).json({ sessionId, aiResponse: result.nextPrompt, resumeData: session.resumeData, progress: getProgress(session) });
        } else {
            const postCompleteMsg = 'Information already collected. Type GENERATE RESUME to get the document or NEW to start over.';
            await new Message({ sessionId, sender: 'ai', text: postCompleteMsg }).save();
            return res.status(200).json({ sessionId, aiResponse: postCompleteMsg, resumeData: session.resumeData, progress: getProgress(session) });
        }

    } catch (error) {
        console.error('Error handling message or generating resume:', error);
        res.status(500).json({ error: 'Failed to process message or generate resume' });
    }
};
