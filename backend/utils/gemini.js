/**
 * Gemini API Helper Module
 * Handles all interactions with Google's Generative AI (Gemini) API
 * Includes error handling, rate limiting, and request logging
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration
const CONFIG = {
  model: 'gemini-1.5-flash', // Latest stable model (gemini-pro is deprecated)
  maxRetries: 3,
  retryDelay: 1000, // ms
  timeout: 30000, // ms
};

/**
 * Retry logic for API calls
 * Handles rate limits and transient errors
 */
async function retryWithBackoff(fn, retries = CONFIG.maxRetries, delay = CONFIG.retryDelay) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED')) {
      console.warn(`Rate limited. Retrying in ${delay}ms... (${CONFIG.maxRetries - retries + 1}/${CONFIG.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Log API request and response
 */
function logRequest(prompt, response, duration) {
  console.log(`
========== GEMINI API REQUEST ==========
Timestamp: ${new Date().toISOString()}
Model: ${CONFIG.model}
Prompt Length: ${prompt.length} characters
Response Length: ${response?.length || 0} characters
Duration: ${duration}ms
========================================
  `);
}

/**
 * Log API errors
 */
function logError(error, context) {
  console.error(`
========== GEMINI API ERROR ==========
Timestamp: ${new Date().toISOString()}
Context: ${context}
Error Status: ${error.status || 'Unknown'}
Error Code: ${error.code || 'Unknown'}
Error Message: ${error.message}
========================================
  `);
}

/**
 * Generic function to call Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - API response text
 */
async function callGemini(prompt, options = {}) {
  const startTime = Date.now();
  
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }

  try {
    const model = genAI.getGenerativeModel({ model: CONFIG.model });

    const callAPI = async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    };

    const responseText = await retryWithBackoff(callAPI);
    const duration = Date.now() - startTime;
    
    logRequest(prompt, responseText, duration);
    
    return responseText;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, 'callGemini');
    
    // Specific error handling
    if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    if (error.status === 401 || error.code === 'AUTHENTICATION_FAILED') {
      throw new Error('Gemini API authentication failed. Check your API key.');
    }
    
    if (error.status === 400 || error.code === 'INVALID_REQUEST') {
      throw new Error(`Invalid request to Gemini API: ${error.message}`);
    }
    
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Analyze a resume using Gemini
 * Extracts: skills, experience, education, certifications, summary
 * @param {string} resumeContent - Full resume text
 * @returns {Promise<Object>} - Parsed resume data
 */
async function analyzeResume(resumeContent) {
  if (!resumeContent || typeof resumeContent !== 'string') {
    throw new Error('Resume content must be a non-empty string');
  }

  const prompt = `Analyze the following resume and extract key information. Return as JSON.

RESUME:
${resumeContent}

Please extract and return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "summary": "Brief professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration description",
      "description": "Brief description of role"
    }
  ],
  "education": [
    {
      "degree": "Degree Type",
      "field": "Field of Study",
      "school": "School Name"
    }
  ],
  "certifications": ["cert1", "cert2", ...],
  "yearsOfExperience": number,
  "topSkills": ["top1", "top2", "top3", "top4", "top5"]
}`;

  try {
    console.log('Analyzing resume with Gemini...');
    const responseText = await callGemini(prompt);
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response');
      return {
        summary: 'Unable to parse resume',
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        yearsOfExperience: 0,
        topSkills: []
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Resume analysis successful');
    return parsedData;
  } catch (error) {
    logError(error, 'analyzeResume');
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}

/**
 * Analyze a job posting using Gemini
 * Extracts: title, skills required, experience level, responsibilities
 * @param {string} jobContent - Full job description text
 * @returns {Promise<Object>} - Parsed job data
 */
async function analyzeJob(jobContent) {
  if (!jobContent || typeof jobContent !== 'string') {
    throw new Error('Job content must be a non-empty string');
  }

  const prompt = `Analyze the following job posting and extract key information. Return as JSON.

JOB POSTING:
${jobContent}

Please extract and return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "title": "Job Title",
  "experienceLevel": "junior|mid|senior|lead",
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "yearsExperienceRequired": number,
  "qualifications": ["qualification1", "qualification2", ...],
  "salaryRange": "salary description or null",
  "jobType": "full-time|part-time|contract|remote",
  "summary": "Brief job summary"
}`;

  try {
    console.log('Analyzing job posting with Gemini...');
    const responseText = await callGemini(prompt);
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response');
      return {
        title: 'Unknown',
        experienceLevel: 'mid',
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        yearsExperienceRequired: 0,
        qualifications: [],
        salaryRange: null,
        jobType: 'full-time',
        summary: 'Unable to parse job'
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Job analysis successful');
    return parsedData;
  } catch (error) {
    logError(error, 'analyzeJob');
    throw new Error(`Failed to analyze job: ${error.message}`);
  }
}

/**
 * Compare resume to job description
 * Returns match score and detailed analysis
 * @param {string} resumeContent - Full resume text
 * @param {string} jobContent - Full job description text
 * @returns {Promise<Object>} - Comparison analysis with match score
 */
async function compareResumeToJob(resumeContent, jobContent) {
  if (!resumeContent || typeof resumeContent !== 'string') {
    throw new Error('Resume content must be a non-empty string');
  }

  if (!jobContent || typeof jobContent !== 'string') {
    throw new Error('Job content must be a non-empty string');
  }

  const prompt = `Compare the following resume to a job description and provide a detailed match analysis. Return as JSON.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobContent}

Please analyze and return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "overallMatchScore": number between 0-100,
  "matchPercentage": "XX%",
  "matchLevel": "poor|fair|good|excellent",
  "matchingSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "strengthAreas": ["area1", "area2", ...],
  "improvementAreas": ["area1", "area2", ...],
  "experienceFit": "description of experience fit",
  "topRecommendations": ["recommendation1", "recommendation2", ...],
  "salaryExpectationFit": "likely fit or concern",
  "summary": "Brief overall summary of fit"
}`;

  try {
    console.log('Comparing resume to job with Gemini...');
    const responseText = await callGemini(prompt);
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response');
      return {
        overallMatchScore: 0,
        matchPercentage: '0%',
        matchLevel: 'poor',
        matchingSkills: [],
        missingSkills: [],
        strengthAreas: [],
        improvementAreas: [],
        experienceFit: 'Unable to parse',
        topRecommendations: [],
        salaryExpectationFit: 'Unknown',
        summary: 'Unable to parse comparison'
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Comparison analysis successful');
    return parsedData;
  } catch (error) {
    logError(error, 'compareResumeToJob');
    throw new Error(`Failed to compare resume to job: ${error.message}`);
  }
}

/**
 * Generate improvement suggestions for resume
 * @param {string} resumeContent - Full resume text
 * @param {string} jobContent - Job description (optional, for targeted suggestions)
 * @returns {Promise<Object>} - Suggestions for improvement
 */
async function generateImprovementSuggestions(resumeContent, jobContent = null) {
  if (!resumeContent || typeof resumeContent !== 'string') {
    throw new Error('Resume content must be a non-empty string');
  }

  let prompt = `Review the following resume and provide specific suggestions for improvement. Return as JSON.

RESUME:
${resumeContent}`;

  if (jobContent) {
    prompt += `\n\nJOB DESCRIPTION:
${jobContent}

Provide suggestions tailored to this job description.`;
  }

  prompt += `\n\nPlease provide ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "overallRating": number between 1-10,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": [
    {
      "area": "Area to improve",
      "suggestion": "Specific suggestion",
      "impact": "high|medium|low"
    }
  ],
  "priorityImprovements": ["improvement1", "improvement2", ...],
  "estimatedImpactOnMatcher": "Estimated percentage increase in match score"
}`;

  try {
    console.log('Generating improvement suggestions with Gemini...');
    const responseText = await callGemini(prompt);
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response');
      return {
        overallRating: 0,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        priorityImprovements: [],
        estimatedImpactOnMatcher: 'Unknown'
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Improvement suggestions generated');
    return parsedData;
  } catch (error) {
    logError(error, 'generateImprovementSuggestions');
    throw new Error(`Failed to generate suggestions: ${error.message}`);
  }
}

/**
 * Perform detailed comparison for database storage
 * Optimized for saving structured comparison data
 * @param {string} resumeContent - Full resume text
 * @param {string} jobContent - Full job description text
 * @returns {Promise<Object>} - Detailed comparison analysis ready for database
 */
async function performDetailedComparison(resumeContent, jobContent) {
  if (!resumeContent || typeof resumeContent !== 'string') {
    throw new Error('Resume content must be a non-empty string');
  }

  if (!jobContent || typeof jobContent !== 'string') {
    throw new Error('Job content must be a non-empty string');
  }

  const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist. Analyze the following resume against the job description and provide a detailed technical comparison. Return ONLY valid JSON (no markdown, no code blocks) with NO newlines between key-value pairs.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobContent}

Return ONLY this JSON structure (no markdown, no explanation):
{
  "matchScore": number between 0 and 100,
  "matchPercentage": "XX%",
  "matchLevel": "poor|fair|good|excellent|perfect",
  "summary": "1-2 sentence overall fit assessment",
  "skillsMatch": {
    "matched": ["skill1 that candidate has that job needs", "skill2"],
    "missing": ["critical skill missing", "desired skill missing"],
    "percentage": number between 0-100
  },
  "experienceMatch": {
    "score": number 0-100,
    "yearsRequiredByJob": number if stated,
    "yearsInResume": number estimated,
    "details": "Brief assessment of experience fit"
  },
  "educationMatch": {
    "score": number 0-100,
    "required": "what job requires",
    "hasInResume": "what resume shows",
    "details": "Brief assessment"
  },
  "keywordMatch": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["missing keyword1", "missing keyword2"],
    "percentage": number 0-100
  },
  "strengths": [
    "Strength 1 - how candidate is well-suited",
    "Strength 2 - alignment with role"
  ],
  "weaknesses": [
    "Weakness 1 - gap or concern",
    "Weakness 2 - missing qualification"
  ],
  "recommendations": [
    {
      "category": "skills|experience|keywords|formatting|structure",
      "priority": "high|medium|low",
      "suggestion": "Specific, actionable recommendation"
    }
  ],
  "optimizedSections": {
    "summary": "Suggested professional summary tailored to job",
    "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}`;

  try {
    console.log('Performing detailed comparison analysis with Gemini...');
    const responseText = await callGemini(prompt);
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from detailed comparison response');
      return getDefaultComparisonStructure();
    }

    const comparison = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response
    return normalizeComparisonData(comparison);
  } catch (error) {
    logError(error, 'performDetailedComparison');
    throw new Error(`Failed to perform detailed comparison: ${error.message}`);
  }
}

/**
 * Normalize and validate comparison data
 * @param {Object} data - Raw comparison data from Gemini
 * @returns {Object} - Normalized comparison data
 */
function normalizeComparisonData(data) {
  const normalized = {
    matchScore: Math.min(100, Math.max(0, data.matchScore || 0)),
    matchPercentage: data.matchPercentage || '0%',
    matchLevel: ['poor', 'fair', 'good', 'excellent', 'perfect'].includes(data.matchLevel) 
      ? data.matchLevel 
      : 'fair',
    summary: data.summary || 'Unable to generate summary',
    skillsMatch: {
      matched: Array.isArray(data.skillsMatch?.matched) ? data.skillsMatch.matched : [],
      missing: Array.isArray(data.skillsMatch?.missing) ? data.skillsMatch.missing : [],
      percentage: Math.min(100, Math.max(0, data.skillsMatch?.percentage || 0))
    },
    experienceMatch: {
      score: Math.min(100, Math.max(0, data.experienceMatch?.score || 0)),
      yearsRequiredByJob: data.experienceMatch?.yearsRequiredByJob || null,
      yearsInResume: data.experienceMatch?.yearsInResume || null,
      details: data.experienceMatch?.details || 'No details available'
    },
    educationMatch: {
      score: Math.min(100, Math.max(0, data.educationMatch?.score || 0)),
      required: data.educationMatch?.required || 'Not specified',
      hasInResume: data.educationMatch?.hasInResume || 'Not specified',
      details: data.educationMatch?.details || 'No details available'
    },
    keywordMatch: {
      matched: Array.isArray(data.keywordMatch?.matched) ? data.keywordMatch.matched : [],
      missing: Array.isArray(data.keywordMatch?.missing) ? data.keywordMatch.missing : [],
      percentage: Math.min(100, Math.max(0, data.keywordMatch?.percentage || 0))
    },
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    recommendations: Array.isArray(data.recommendations) 
      ? data.recommendations.map(rec => ({
          category: ['skills', 'experience', 'keywords', 'formatting', 'structure'].includes(rec.category)
            ? rec.category
            : 'skills',
          priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
          suggestion: rec.suggestion || ''
        }))
      : [],
    optimizedSections: {
      summary: data.optimizedSections?.summary || '',
      skills: Array.isArray(data.optimizedSections?.skills) ? data.optimizedSections.skills : [],
      keywords: Array.isArray(data.optimizedSections?.keywords) ? data.optimizedSections.keywords : []
    }
  };

  return normalized;
}

/**
 * Get default comparison structure
 * Used as fallback if Gemini response parsing fails
 * @returns {Object} - Default comparison structure
 */
function getDefaultComparisonStructure() {
  return {
    matchScore: 0,
    matchPercentage: '0%',
    matchLevel: 'poor',
    summary: 'Unable to perform comparison. Please try again.',
    skillsMatch: {
      matched: [],
      missing: [],
      percentage: 0
    },
    experienceMatch: {
      score: 0,
      yearsRequiredByJob: null,
      yearsInResume: null,
      details: 'Unable to assess'
    },
    educationMatch: {
      score: 0,
      required: 'Unknown',
      hasInResume: 'Unknown',
      details: 'Unable to assess'
    },
    keywordMatch: {
      matched: [],
      missing: [],
      percentage: 0
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
    optimizedSections: {
      summary: '',
      skills: [],
      keywords: []
    }
  };
}

module.exports = {
  callGemini,
  analyzeResume,
  analyzeJob,
  compareResumeToJob,
  generateImprovementSuggestions,
  performDetailedComparison,
  normalizeComparisonData,
  getDefaultComparisonStructure
};
