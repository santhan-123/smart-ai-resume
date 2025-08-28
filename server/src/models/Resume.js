const mongoose = require('mongoose');

// Work experience entry
const workExperienceSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    yearsWorked: { type: Number, required: true },
    responsibilities: [String],
    keywords: [String],
});

// Education entry
const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    years: { type: String, required: true },
});

// Finalized resume snapshot
const resumeSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    // Candidate info
    personalInfo: {
        name: { type: String, required: true },
        phone: String,
        email: String,
        city: String,
        languages: [String],
    },
    workExperience: [workExperienceSchema],
    skills: [String],
    education: [educationSchema],
    generatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
