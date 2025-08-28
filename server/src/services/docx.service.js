const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

// Build a DOCX resume from structured data.
const generateResume = async (resumeData) => {
    const children = [];

    const addSpacer = (height = 120) => {
        children.push(new Paragraph({ text: '', spacing: { after: height } }));
    };

    const heading = (text) => new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 60 },
    });

    // PERSONAL INFO (Title block)
    if (resumeData.personalInfo && resumeData.personalInfo.name) {
        children.push(new Paragraph({
            text: resumeData.personalInfo.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 }
        }));
        const contactLine = [
            resumeData.personalInfo.phone,
            resumeData.personalInfo.email,
            resumeData.personalInfo.city
        ].filter(Boolean).join(' | ');
        if (contactLine) {
            children.push(new Paragraph({
                text: contactLine,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }));
        }
    }

    // WORK EXPERIENCE
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        children.push(heading('Work Experience'));
        resumeData.workExperience.forEach((job, idx) => {
            const yearsPart = (job.yearsWorked || job.yearsWorked === 0) ? ` (${job.yearsWorked} year${job.yearsWorked === 1 ? '' : 's'})` : '';
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: job.jobTitle || 'Job Title', bold: true }),
                    new TextRun({ text: job.company ? ` - ${job.company}` : '' , italics: true }),
                    new TextRun({ text: yearsPart })
                ],
                spacing: { after: 40 }
            }));
            if (Array.isArray(job.responsibilities)) {
                job.responsibilities.filter(Boolean).forEach(r => {
                    children.push(new Paragraph({
                        children: [ new TextRun({ text: `• ${r}` }) ],
                        spacing: { after: 20 },
                    }));
                });
            }
            if (idx < resumeData.workExperience.length - 1) addSpacer(100);
        });
    }

    // SKILLS
    if (resumeData.skills && resumeData.skills.length > 0) {
        children.push(heading('Skills'));
        children.push(new Paragraph({
            children: [ new TextRun({ text: resumeData.skills.join(', ') }) ],
            spacing: { after: 120 }
        }));
    }

    // EDUCATION
    if (resumeData.education && resumeData.education.length > 0) {
        children.push(heading('Education & Training'));
        resumeData.education.forEach((edu, idx) => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: edu.degree || 'Degree', bold: true }),
                    new TextRun({ text: edu.institution ? `, ${edu.institution}` : '', italics: true }),
                    new TextRun({ text: edu.years ? ` (${edu.years})` : '' })
                ],
                spacing: { after: 80 }
            }));
            if (idx < resumeData.education.length - 1) addSpacer(40);
        });
    }

    // LANGUAGES
    if (resumeData.personalInfo && Array.isArray(resumeData.personalInfo.languages) && resumeData.personalInfo.languages.length > 0) {
        children.push(heading('Languages'));
        children.push(new Paragraph({
            children: [ new TextRun({ text: resumeData.personalInfo.languages.join(', ') }) ],
            spacing: { after: 60 }
        }));
    }

    const document = new Document({
        sections: [ { properties: {}, children } ]
    });

    return Packer.toBuffer(document);
};

module.exports = { generateResume };
