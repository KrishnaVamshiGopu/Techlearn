// Constants
const API_BASE_URL = 'https://techlearn-hla8.onrender.com/api';

// DOM Elements
const exercisesGrid = document.getElementById('exercisesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileJoinDate = document.getElementById('profileJoinDate');
const completedExercises = document.getElementById('completedExercises');
const inProgressExercises = document.getElementById('inProgressExercises');
const totalScore = document.getElementById('totalScore');
const activityList = document.getElementById('activityList');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Failed to fetch profile');
        }

        const user = await response.json();
        updateUserProfile(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        showError('Failed to load user profile');
    }
}

// Update user profile UI
function updateUserProfile(user) {
    profileName.textContent = user.name || 'User';
    profileEmail.textContent = user.email || 'No email provided';
    profileJoinDate.textContent = `Member since: ${formatDate(user.createdAt)}`;
}

// Fetch exercises
async function fetchExercises() {
    try {
        const response = await fetch(`${API_BASE_URL}/exercises`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch exercises');
        }

        const exercises = await response.json();
        
        // Fetch user progress to mark started exercises
        const progressResponse = await fetch(`${API_BASE_URL}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (progressResponse.ok) {
            const progress = await progressResponse.json();
            // Mark exercises that have progress
            exercises.forEach(exercise => {
                exercise.hasProgress = progress.some(p => p.exerciseId === exercise.id);
            });
        }
        
        displayExercises(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        showError('Failed to load exercises');
    }
}

// Display exercises in grid
function displayExercises(exercises) {
    exercisesGrid.innerHTML = '';
    
    exercises.forEach(exercise => {
        const exerciseCard = createExerciseCard(exercise);
        exercisesGrid.appendChild(exerciseCard);
    });
}

// Create exercise card
function createExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card card h-100 border-0 shadow-sm';
    
    // Check if exercise has been started (has progress)
    const hasProgress = exercise.hasProgress || false;
    const buttonText = hasProgress ? 'Continue Coding' : 'Start Exercise';
    const buttonIcon = hasProgress ? 'fa-code' : 'fa-play';
    
    card.innerHTML = `
        <div class="card-body">
            <div class="exercise-header d-flex justify-content-between align-items-start mb-3">
                <h3 class="card-title h5 mb-0">${exercise.title}</h3>
            </div>
            <p class="card-text text-muted mb-4">${exercise.description}</p>
            <div class="exercise-footer">
                <button class="btn btn-primary start-btn" data-exercise-id="${exercise.id}">
                    <i class="fas ${buttonIcon} me-2"></i> ${buttonText}
                </button>
            </div>
        </div>
    `;

    // Add hover effect
    card.addEventListener('mouseenter', () => {
        card.classList.add('shadow');
        card.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('shadow');
        card.style.transform = 'translateY(0)';
    });

    // Add click handler for start button
    const startBtn = card.querySelector('.start-btn');
    startBtn.addEventListener('click', () => {
        window.location.href = `compiler.html?exerciseId=${exercise.id}`;
    });

    return card;
}

// Fetch user progress
async function fetchUserProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch progress');
        }

        const progress = await response.json();
        updateProgressUI(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        showError('Failed to load progress');
    }
}

// Update progress UI
function updateProgressUI(progress) {
    if (completedExercises) completedExercises.textContent = progress.completed || 0;
    if (inProgressExercises) inProgressExercises.textContent = progress.inProgress || 0;
    if (totalScore) totalScore.textContent = progress.totalScore || 0;

    // Update activity list
    if (activityList) {
        activityList.innerHTML = '';
        if (progress.recentActivity && progress.recentActivity.length > 0) {
            progress.recentActivity.forEach(activity => {
                const activityItem = createActivityItem(activity);
                activityList.appendChild(activityItem);
            });
        } else {
            activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        }
    }
}

// Create activity item
function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    item.innerHTML = `
        <div class="activity-icon">
            <i class="fas ${getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-info">
            <h4>${activity.title}</h4>
            <p>${formatDate(activity.timestamp)}</p>
        </div>
    `;

    return item;
}

// Get activity icon based on type
function getActivityIcon(type) {
    switch (type) {
        case 'completed':
            return 'fa-check-circle';
        case 'started':
            return 'fa-play-circle';
        case 'achievement':
            return 'fa-trophy';
        default:
            return 'fa-info-circle';
    }
}

// Show error message
function showError(message) {
    alert(message);
}

// Handle navigation
function handleNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Initialize dashboard
async function initializeDashboard() {
    showLoading();
    try {
        await Promise.all([
            fetchUserProfile(),
            fetchExercises(),
            fetchUserProgress()
        ]);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to initialize dashboard');
    } finally {
        hideLoading();
    }
}

// Event listeners
logoutBtn.addEventListener('click', handleLogout);
handleNavigation();

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);