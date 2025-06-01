const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Progress = require('../models/Progress'); // Import the new Progress model

// Get all user progress entries
// This route will now return a list of all saved progress entries for the user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching all progress entries for user:', req.user.id);

        const progressEntries = await Progress.find({ user: req.user.id });

        console.log(`Found ${progressEntries.length} progress entries`);
        res.json(progressEntries);
    } catch (err) {
        console.error('Error fetching all progress entries:', err);
        res.status(500).json({ msg: "Server error while fetching progress entries" });
    }
});

// Get specific exercise progress for the user
router.get('/:exerciseId', auth, async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.exerciseId, 10);
        console.log(`Fetching progress for exercise ${exerciseId} for user:`, req.user.id);

        if (isNaN(exerciseId)) {
            return res.status(400).json({ msg: "Invalid exercise ID" });
        }

        const progressEntry = await Progress.findOne({ user: req.user.id, exerciseId: exerciseId });

        if (!progressEntry) {
            console.log(`No progress found for exercise ${exerciseId} for user ${req.user.id}`);
            return res.status(404).json({ msg: "Progress not found" });
        }

        console.log(`Successfully fetched progress for exercise ${exerciseId}`);
        res.json(progressEntry);
    } catch (err) {
        console.error(`Error fetching progress for exercise ${req.params.exerciseId}:`, err);
        res.status(500).json({ msg: "Server error while fetching exercise progress" });
    }
});

// Save or update exercise progress for the user
router.post('/save', auth, async (req, res) => {
    try {
        const { exerciseId, codeState } = req.body;
        console.log(`Saving progress for exercise ${exerciseId} for user:`, req.user.id);

        if (!exerciseId || codeState === undefined) {
             return res.status(400).json({ msg: "Exercise ID and code state are required" });
        }

        // Find existing progress or create a new one
        let progressEntry = await Progress.findOne({ user: req.user.id, exerciseId: exerciseId });

        if (progressEntry) {
            // Update existing entry
            progressEntry.codeState = codeState;
            progressEntry.lastSavedAt = Date.now();
            await progressEntry.save();
            console.log(`Progress updated for exercise ${exerciseId} for user ${req.user.id}`);
            res.json({ msg: "Progress updated successfully", progress: progressEntry });
        } else {
            // Create new entry
            progressEntry = new Progress({
                user: req.user.id,
                exerciseId: exerciseId,
                codeState: codeState
            });
            await progressEntry.save();
            console.log(`Progress created for exercise ${exerciseId} for user ${req.user.id}`);
            res.status(201).json({ msg: "Progress saved successfully", progress: progressEntry });
        }

    } catch (err) {
        console.error('Error saving progress:', err);
        res.status(500).json({ msg: "Server error while saving progress" });
    }
});

// Keep the existing /update route for status updates if needed, or remove if redundant
// Based on the prompt, this route might become redundant if saving state covers 'in progress'
// For now, I will keep it but it might need review based on frontend logic.
router.post('/update', auth, async (req, res) => {
    try {
        const { exerciseId, status } = req.body;
        
        if (!exerciseId || !status) {
            return res.status(400).json({ msg: "Exercise ID and status are required" });
        }
        
        // In a real application, you would update the user's progress in the database
        console.log(`Updating exercise ${exerciseId} status to ${status} for user ${req.user.id}`);
        
        res.json({ msg: "Progress updated successfully" });
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ msg: "Server error while updating progress" });
    }
});

module.exports = router;