const axios = require('axios');

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const languageMap = {
    javascript: 63,
    python: 71,
    c: 50,
    cpp: 54,
    java: 62,
    // html: 60, // Not supported for execution, remove or replace
};

const runCode = async (sourceCode, language, stdin = '') => {
    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const options = {
        method: 'POST',
        url: JUDGE0_API_URL,
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
        },
        data: {
            source_code: sourceCode,
            language_id: languageId,
            stdin
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to run code: ${error.response?.data?.message || error.message}`);
    }
};

module.exports = runCode;
