const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    // Unique session identifier
    sessionId: { type: String, required: true, unique: true },
    // Simple lifecycle marker
    state: { type: String, required: true, default: 'started' },
    // User identifier (mirrors session for now)
    userId: { type: String, required: true },
    // Creation timestamp
    createdAt: { type: Date, default: Date.now },
    // Collected resume fields (incrementally filled)
    resumeData: {
        personalInfo: {
            name: String,
            phone: String,
            email: String,
            city: String,
            languages: [String]
        },
        workExperience: [{
            jobTitle: String,
            company: String,
            yearsWorked: Number,
            responsibilities: [String],
            keywords: [String],
        }],
        skills: [String],
        education: [{ degree: String, institution: String, years: String }],
    },
    // Question flow progress
    progress: {
        currentStep: { type: Number, default: 0 },
        totalSteps: { type: Number, default: 0 },
        completed: { type: Boolean, default: false }
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
