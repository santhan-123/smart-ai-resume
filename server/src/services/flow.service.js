const { z } = require('zod');
const aiService = require('./ai.service');

// Ordered questions that map user answers into resumeData.
const questions = [
  {
    key: 'personalInfo.name',
    prompt: 'What is your full name?',
    schema: z.string().min(2, 'Name too short')
  },
  {
    key: 'personalInfo.phone',
    prompt: 'What is your phone number?',
    schema: z.string().min(5, 'Phone seems too short')
  },
  {
    key: 'personalInfo.email',
    prompt: 'What is your email address?',
    schema: z.string().email('Please provide a valid email')
  },
  {
    key: 'personalInfo.city',
    prompt: 'Which city and state are you located in?',
    schema: z.string().min(2)
  },
  {
    key: 'workExperience[0].jobTitle',
    prompt: 'What is your most recent job title?',
    schema: z.string().min(2)
  },
  {
    key: 'workExperience[0].company',
    prompt: 'What is the company name for that job?',
    schema: z.string().min(2)
  },
  {
    key: 'workExperience[0].yearsWorked',
    prompt: 'How many years (number) did you work there?',
    schema: z.preprocess(v => Number(v), z.number().min(0).max(60))
  },
  {
    key: 'workExperience[0].responsibilities',
    prompt: 'List main responsibilities (comma separated).',
    schema: z.string().min(2)
  },
  {
    key: 'skills',
    prompt: 'List your key skills (comma separated).',
    schema: z.string().min(2)
  },
  {
    key: 'education[0].degree',
    prompt: 'What is your highest degree or certification?',
    schema: z.string().min(2)
  },
  {
    key: 'education[0].institution',
    prompt: 'Which institution awarded it?',
    schema: z.string().min(2)
  },
  {
    key: 'education[0].years',
    prompt: 'What years did you attend (e.g. 2019-2023)?',
    schema: z.string().min(2)
  },
  {
    key: 'personalInfo.languages',
    prompt: 'List any languages you speak (comma separated).',
    schema: z.string().min(2)
  }
];

// Ensure an array index exists for a path like workExperience[0]
function ensureArraySlot(root, pathPart) {
  const match = pathPart.match(/(\w+)\[(\d+)\]/);
  if (!match) return null;
  const [, arrKey, idxStr] = match;
  const idx = Number(idxStr);
  if (!root[arrKey]) root[arrKey] = [];
  while (root[arrKey].length <= idx) root[arrKey].push({});
  return { arrKey, idx };
}

// Minimal deep setter supporting dotted + [index] paths
function setDeep(target, keyPath, rawValue) {
  const parts = keyPath.split('.');
  let node = target;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const arrInfo = ensureArraySlot(node, part);
    if (arrInfo) {
      if (i === parts.length - 1) {
        // final array slot assignment
        node[arrInfo.arrKey][arrInfo.idx] = rawValue;
      } else {
        node = node[arrInfo.arrKey][arrInfo.idx];
      }
    } else if (i === parts.length - 1) {
      node[part] = rawValue;
    } else {
      if (!node[part]) node[part] = {};
      node = node[part];
    }
  }
}

// Validate & store answer; returns next prompt or completion state
async function processAnswer(session, answer) {
  const step = session.progress.currentStep;
  if (step >= questions.length) return { done: true };
  const q = questions[step];
  const parsed = q.schema.safeParse(answer);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, repeat: true, prompt: q.prompt };
  }

  let value = parsed.data;

  // Post-processing / normalization for certain keys
  if (q.key === 'workExperience[0].jobTitle') {
    value = await aiService.professionalizeText(value);
  }
  if (q.key === 'workExperience[0].responsibilities') {
    value = value.split(',').map(v => v.trim()).filter(Boolean).map(v => (v.endsWith('.') ? v : v + '.'));
  }
  if (q.key === 'skills') {
    value = value.split(',').map(v => v.trim()).filter(Boolean);
  }
  if (q.key === 'personalInfo.languages') {
    value = value.split(',').map(v => v.trim()).filter(Boolean);
  }

  setDeep(session.resumeData, q.key, value);
  session.progress.currentStep += 1;
  session.progress.totalSteps = questions.length;
  if (session.progress.currentStep >= questions.length) {
    session.progress.completed = true;
    return { done: true };
  }
  return { nextPrompt: questions[session.progress.currentStep].prompt };
}

function getFirstPrompt() {
  return questions[0].prompt;
}

function getProgress(session) {
  return {
    currentStep: session.progress.currentStep,
    totalSteps: questions.length,
    completed: session.progress.completed
  };
}

module.exports = { processAnswer, getFirstPrompt, getProgress };