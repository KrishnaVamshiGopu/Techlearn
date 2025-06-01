const fs = require('fs');
const path = require('path');

const progressPath = path.join(__dirname, '../db/progress.json');

// Ensure progress.json exists
if (!fs.existsSync(progressPath)) {
    fs.writeFileSync(progressPath, JSON.stringify({}));
}

exports.getProgress = (req, res) => {
    try {
        const userId = req.user.id;
        const data = JSON.parse(fs.readFileSync(progressPath));
        const progress = data[userId] || { completed: [], inProgress: 0 };
        res.json(progress);
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ msg: "Error getting progress" });
    }
};

exports.getExerciseProgress = (req, res) => {
    try {
        const userId = req.user.id;
        const exerciseId = req.params.exerciseId;
        const data = JSON.parse(fs.readFileSync(progressPath));
        const userProgress = data[userId] || { exercises: {} };
        const exerciseProgress = userProgress.exercises?.[exerciseId] || { code: '' };
        res.json(exerciseProgress);
    } catch (error) {
        console.error('Error getting exercise progress:', error);
        res.status(500).json({ msg: "Error getting exercise progress" });
    }
};

exports.saveExerciseProgress = (req, res) => {
    try {
        const userId = req.user.id;
        const exerciseId = req.params.exerciseId;
        const { code } = req.body;

        // Read existing progress
        const data = JSON.parse(fs.readFileSync(progressPath));
        
        // Initialize user progress if it doesn't exist
        if (!data[userId]) {
            data[userId] = {
                completed: [],
                inProgress: 0,
                exercises: {}
            };
        }

        // Initialize exercises object if it doesn't exist
        if (!data[userId].exercises) {
            data[userId].exercises = {};
        }

        // Save exercise progress
        data[userId].exercises[exerciseId] = { code };

        // Write back to file
        fs.writeFileSync(progressPath, JSON.stringify(data, null, 2));
        
        res.json({ msg: "Progress saved successfully" });
    } catch (error) {
        console.error('Error saving exercise progress:', error);
        res.status(500).json({ msg: "Error saving progress" });
    }
};
