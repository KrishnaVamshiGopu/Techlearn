// API Configuration
const API_BASE_URL = 'https://techlearn-hla8.onrender.com/api';

// Form Toggle Functionality
const toggleBtns = document.querySelectorAll('.tab-btn');
const signinFormSection = document.getElementById('signin-form');
const signupFormSection = document.getElementById('signup-form');

// Get the actual form elements by their updated IDs
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');

// Initialize form visibility
function initializeForms() {
    // Hide both form sections initially
    if (signinFormSection) signinFormSection.style.display = 'none';
    if (signupFormSection) signupFormSection.style.display = 'none';
    
    // Show signin form section by default and activate button
    if (signinFormSection) signinFormSection.style.display = 'block';
    const signinTabBtn = document.querySelector('[onclick="switchForm(\'signin\')"]');
    if (signinTabBtn) signinTabBtn.classList.add('active');
}

// Toggle between forms (updated to use section IDs for display)
function switchForm(formType) {
    const formTabs = document.getElementById('formTabs');
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => btn.classList.remove('active'));

    if (formType === 'signin') {
        if (formTabs) formTabs.classList.remove('signup-active');
        const signinTabBtn = document.querySelector('[onclick="switchForm(\'signin\')"]');
        if (signinTabBtn) signinTabBtn.classList.add('active');
        if (signinFormSection) {
            signinFormSection.style.display = 'block';
            signinFormSection.style.animation = 'fadeIn 0.5s ease';
        }
        if (signupFormSection) signupFormSection.style.display = 'none';

    } else {
        if (formTabs) formTabs.classList.add('signup-active');
        const signupTabBtn = document.querySelector('[onclick="switchForm(\'signup\')"]');
        if (signupTabBtn) signupTabBtn.classList.add('active');
        if (signupFormSection) {
            signupFormSection.style.display = 'block';
            signupFormSection.style.animation = 'fadeIn 0.5s ease';
        }
        if (signinFormSection) signinFormSection.style.display = 'none';
    }
}

// Initialize forms when the page loads
document.addEventListener('DOMContentLoaded', initializeForms);

// Password validation
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordRequirements = document.getElementById('password-requirements');
const errorMessage = document.getElementById('error-message');

// Password requirements elements
const lengthReq = document.getElementById('length');
const uppercaseReq = document.getElementById('uppercase');
const lowercaseReq = document.getElementById('lowercase');
const numberReq = document.getElementById('number');
const specialReq = document.getElementById('special');

// Ensure password input and requirements exist before adding listeners
if (passwordInput && passwordRequirements) {
    passwordInput.addEventListener('focus', () => {
        passwordRequirements.style.display = 'block';
    });

    passwordInput.addEventListener('input', validatePassword);
}

// Ensure confirm password input exists before adding listener
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
}

function validatePassword() {
    const password = passwordInput.value;
    
    // Length check
    if (lengthReq) lengthReq.classList.toggle('valid', password.length >= 8);
    
    // Uppercase check
    if (uppercaseReq) uppercaseReq.classList.toggle('valid', /[A-Z]/.test(password));
    
    // Lowercase check
    if (lowercaseReq) lowercaseReq.classList.toggle('valid', /[a-z]/.test(password));
    
    // Number check
    if (numberReq) numberReq.classList.toggle('valid', /\d/.test(password));
    
    // Special character check
    if (specialReq) specialReq.classList.toggle('valid', /[!@#$%^&*(),.?\":{}|<>]/.test(password));
}

function validatePasswordMatch() {
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
    
    if (confirmPassword && password !== confirmPassword) {
        showError('Passwords do not match');
    } else {
        hideError();
    }
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) errorMessage.style.display = 'none';
}

// Form submissions (updated to use the correct form element IDs)
if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = signinForm.querySelector('input[type="email"]');
        const passwordInput = signinForm.querySelector('input[type="password"]');
        
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        try {
            // Show loading indicator
            if (signinForm.querySelector('.btn')) signinForm.querySelector('.btn').classList.add('loading');
            
            const response = await fetch(`${API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }
            
            // Store the token and user data
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            // Show success message
            showSuccess('Login successful! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            // Hide loading indicator in case of error
            if (signinForm.querySelector('.btn')) signinForm.querySelector('.btn').classList.remove('loading');
            showError(error.message || 'Failed to sign in. Please try again.');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        
        // Get all form data using the correct signupForm element
        const formData = new FormData(signupForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const mobile = formData.get('mobile_number');
        const gender = formData.get('gender');
        
        // Basic validation
        if (!name || !email || !mobile || !gender || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Validate email format
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Validate phone number
        if (!validatePhone(mobile)) {
            showError('Please enter a valid phone number');
            return;
        }
        
        // Validate password requirements
        const isValid = password.length >= 8 && 
                       /[A-Z]/.test(password) && 
                       /[a-z]/.test(password) && 
                       /\d/.test(password) && 
                       /[!@#$%^&*(),.?\":{}|<>]/.test(password);
        
        if (!isValid) {
            showError('Please meet all password requirements');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        hideError();
        
        try {
            // Show loading indicator
            if (signupForm.querySelector('.btn')) signupForm.querySelector('.btn').classList.add('loading');
            
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    mobile_number: mobile,
                    gender,
                    password,
                    confirm_password: confirmPassword
                })
            });
            
            // Hide loading indicator
            if (signupForm.querySelector('.btn')) signupForm.querySelector('.btn').classList.remove('loading');
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || 'Registration failed');
            }
            
            // Show success message
            showSuccess('Registration successful! Redirecting to login...');
            
            // Clear form
            signupForm.reset();
            
            // Switch to sign in form after 2 seconds
            setTimeout(() => {
                switchForm('signin');
            }, 2000);
            
        } catch (error) {
            // Hide loading indicator in case of error
            if (signupForm.querySelector('.btn')) signupForm.querySelector('.btn').classList.remove('loading');
            showError(error.message || 'Failed to register. Please try again.');
        }
    });
}

// Success message function (updated to use the existing error-message div for simplicity)
function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type} show`;
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageContainer.className = 'alert d-none';
        }, 3000);
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

// Social media login handlers (updated selector)
document.querySelectorAll('.social-btn').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = icon.querySelector('i').classList[1].split('-')[1]; // Extract platform name
        console.log(`${platform} login clicked`);
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} login would be implemented here`);
    });
});

// Enhanced form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Real-time validation for email and phone (updated selectors)
const signinEmailInput = signinForm ? signinForm.querySelector('input[type="email"]') : null;
if (signinEmailInput) {
    signinEmailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '';
        }
    });
}

const signupEmailInput = signupForm ? signupForm.querySelector('input[type="email"]') : null;
if (signupEmailInput) {
    signupEmailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#dc3545';
            showError('Please enter a valid email address');
        } else {
            this.style.borderColor = '';
            hideError();
        }
    });
}

const signupMobileInput = signupForm ? signupForm.querySelector('input[type="tel"]') : null;
if (signupMobileInput) {
    signupMobileInput.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.style.borderColor = '#dc3545';
            showError('Please enter a valid phone number');
        } else {
            this.style.borderColor = '';
            hideError();
        }
    });
}