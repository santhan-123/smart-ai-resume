import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';

const Section = ({ title, children }) => (
  <Box sx={{ mb:2 }}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
    {children}
  </Box>
);

const ResumePreview = ({ data }) => {
  if (!data) return (
    <Box sx={{ p:2, color:'text.secondary', fontSize:14 }}>Resume preview will appear here as you answer questions.</Box>
  );
  const { personalInfo = {}, workExperience = [], skills = [], education = [] } = data;
  return (
    <Box sx={{ p:2, height:'100%', overflowY:'auto' }}>
      {personalInfo.name && (
        <Box sx={{ mb:2 }}>
          <Typography variant="h6" fontWeight={700}>{personalInfo.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {[personalInfo.phone, personalInfo.email, personalInfo.city].filter(Boolean).join(' | ')}
          </Typography>
        </Box>
      )}
      <Divider sx={{ mb:2 }} />
      {workExperience.length > 0 && (
        <Section title="Work Experience">
          {workExperience.map((job,i) => (
            <Box key={i} sx={{ mb:1.5 }}>
              <Typography variant="body2" fontWeight={600}>{job.jobTitle} {job.company && <>( {job.company})</>}</Typography>
              {job.yearsWorked !== undefined && <Typography variant="caption" color="text.secondary">{job.yearsWorked} yrs</Typography>}
              {Array.isArray(job.responsibilities) && job.responsibilities.length>0 && (
                <ul style={{ margin:'4px 0 0 16px', padding:0 }}>
                  {job.responsibilities.map((r,ri)=>(<li key={ri} style={{ fontSize:12 }}>{r}</li>))}
                </ul>
              )}
            </Box>
          ))}
        </Section>
      )}
      {skills.length>0 && (
        <Section title="Skills">
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.5 }}>
            {skills.map((s,i)=>(<Chip key={i} label={s} size="small" />))}
          </Box>
        </Section>
      )}
      {education.length>0 && (
        <Section title="Education">
          {education.map((e,i)=>(
            <Box key={i} sx={{ mb:1 }}>
              <Typography variant="body2" fontWeight={600}>{e.degree}</Typography>
              <Typography variant="caption" color="text.secondary">{[e.institution, e.years].filter(Boolean).join(', ')}</Typography>
            </Box>
          ))}
        </Section>
      )}
      {personalInfo.languages && personalInfo.languages.length>0 && (
        <Section title="Languages">
          <Typography variant="body2">{personalInfo.languages.join(', ')}</Typography>
        </Section>
      )}
    </Box>
  );
};

export default ResumePreview;
