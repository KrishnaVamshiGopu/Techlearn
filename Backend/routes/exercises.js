const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs').promises;

// Path to exercises.json in the backend's data folder
const exercisesPath = path.join(__dirname, '../data/exercises.json');

// Get all exercises
router.get('/', auth, async (req, res) => {
    try {
        const exercisesData = await fs.readFile(exercisesPath, 'utf8');
        const exercises = JSON.parse(exercisesData);
        res.json(exercises);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ msg: "Server error while fetching exercises" });
    }
});

// Get specific exercise by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.id, 10);
        const exercisesData = await fs.readFile(exercisesPath, 'utf8');
        const exercises = JSON.parse(exercisesData);
        const exercise = exercises.find(ex => ex.id === exerciseId);

        if (!exercise) {
            return res.status(404).json({ msg: "Exercise not found" });
        }

        res.json(exercise);
    } catch (err) {
        console.error('Error fetching exercise:', err);
        res.status(500).json({ msg: "Server error while fetching exercise" });
    }
});

module.exports = router;
