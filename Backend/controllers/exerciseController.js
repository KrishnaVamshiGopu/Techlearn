const fs = require('fs');
const path = require('path');

const exercisesPath = path.join(__dirname, '../data/exercises.json');

exports.getAllExercises = (req, res) => {
  const data = fs.readFileSync(exercisesPath);
  res.json(JSON.parse(data));
};

exports.getExerciseById = (req, res) => {
  const data = JSON.parse(fs.readFileSync(exercisesPath));
  const exercise = data.find(q => q.id == req.params.id);
  if (!exercise) return res.status(404).json({ msg: "Exercise not found" });
  res.json(exercise);
};
