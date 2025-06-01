const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');
const runCode = require('../utils/runcode');
const testCases = require('../data/testCases.json');

// Submit code for evaluation
router.post('/', auth, async (req, res) => {
    try {
        const { exerciseId, language, code } = req.body;

        if (!exerciseId || !language || !code) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const testCase = testCases[exerciseId];
        if (!testCase) {
            return res.status(404).json({ msg: 'Test case not found for this exercise' });
        }

        const { input, expectedOutput } = testCase;

        const result = await runCode(code, language, input);

        const userOutput = result.stdout?.trim();
        const isCorrect = userOutput === expectedOutput.trim();

        return res.json({
            userOutput,
            expectedOutput,
            isCorrect,
            status: result.status?.description
        });

    } catch (error) {
        console.error('Code submission error:', error);
        res.status(500).json({ msg: 'Error processing submission' });
    }
});

module.exports = router;
