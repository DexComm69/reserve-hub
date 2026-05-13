// Form Switching
function switchForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forms = [loginForm, signupForm, forgotPasswordForm];

    forms.forEach(form => {
        if (form) form.classList.remove('active');
    });

    if (formType === 'login') {
        loginForm.classList.add('active');
    } else if (formType === 'signup') {
        signupForm.classList.add('active');
    } else if (formType === 'forgotPassword') {
        if (forgotPasswordForm) forgotPasswordForm.classList.add('active');
    }
}

// Toggle Password Visibility
function togglePassword(fieldId, buttonEl) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Use passed element or current event target
    const button = buttonEl || (event && (event.currentTarget || event.target.closest('button')));
    if (!button) return;

    const icon = button.querySelector('i');
    if (!icon) return;

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check Password Strength
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');

    if (!strengthBar) return;

    strengthBar.classList.remove('weak', 'fair', 'strong');

    if (password.length < 6) {
        strengthBar.classList.add('weak');
    } else if (password.length < 10) {
        if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strengthBar.classList.add('strong');
        } else {
            strengthBar.classList.add('fair');
        }
    } else {
        if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
            strengthBar.classList.add('strong');
        } else if (/[A-Z]/.test(password) || /[0-9]/.test(password)) {
            strengthBar.classList.add('fair');
        } else {
            strengthBar.classList.add('weak');
        }
    }
}

// Validate Email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate Password
function validatePassword(password) {
    return password.length >= 6;
}

// Show Error Message
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Clear Error Message
function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Login Form Submission
document.getElementById('loginFormElement')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    let isValid = true;

    // Clear previous errors
    clearError('loginIdentifierError');
    clearError('loginPasswordError');

    // Validate identifier
    if (!identifier) {
        showError('loginIdentifierError', 'Email or Username is required');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('loginPasswordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('loginPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (isValid) {
        const userData = {
            identifier: identifier,
            password: password
        };

        const submitBtn = this.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Signing In...</span>';
        submitBtn.disabled = true;

        fetch('../api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                if (data.success) {
                    if (rememberMe) {
                        localStorage.setItem('reservehub_user', JSON.stringify({
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.name,
                            phone: data.user.phone,
                            timestamp: new Date().toISOString()
                        }));
                    } else {
                        sessionStorage.setItem('reservehub_user', JSON.stringify({
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.name,
                            phone: data.user.phone,
                            timestamp: new Date().toISOString()
                        }));
                    }

                    showSuccessModal('Login Successful!', `Welcome back, ${data.user.name}!`);
                    this.reset();
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showError('loginPasswordError', data.message);
                }
            })
            .catch(error => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                showError('loginPasswordError', 'Network error. Please try again later.');
                console.error('Error:', error);
            });
    }
});

// Signup Form Submission
document.getElementById('signupFormElement')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;

    let isValid = true;

    // Clear previous errors
    clearError('signupUsernameError');
    clearError('signupNameError');
    clearError('signupEmailError');
    clearError('signupPhoneError');
    clearError('signupPasswordError');
    clearError('confirmPasswordError');
    clearError('agreeTermsError');

    // Validate username
    if (!username) {
        showError('signupUsernameError', 'Username is required');
        isValid = false;
    } else if (username.length < 3) {
        showError('signupUsernameError', 'Username must be at least 3 characters');
        isValid = false;
    }

    // Validate name
    if (!name) {
        showError('signupNameError', 'Name is required');
        isValid = false;
    } else if (name.length < 3) {
        showError('signupNameError', 'Name must be at least 3 characters');
        isValid = false;
    }

    // Validate email
    if (!email) {
        showError('signupEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('signupEmailError', 'Please enter a valid email');
        isValid = false;
    }

    // Validate phone
    if (!phone) {
        showError('signupPhoneError', 'Phone number is required');
        isValid = false;
    } else if (phone.length < 8) {
        showError('signupPhoneError', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('signupPasswordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('signupPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    // Validate terms
    if (!agreeTerms) {
        showError('agreeTermsError', 'You must agree to the terms and privacy policy');
        isValid = false;
    }

    if (isValid) {
        const userData = {
            username: username,
            name: name,
            email: email,
            phone: phone,
            password: password
        };

        const submitBtn = this.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Creating Account...</span>';
        submitBtn.disabled = true;

        fetch('../api/signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                if (data.success) {
                    showSuccessModal('Account Created!', `Welcome ${name}! Your account has been created successfully.`);
                    this.reset();
                    setTimeout(() => {
                        switchForm('login');
                    }, 2000);
                } else {
                    showError('signupEmailError', data.message);
                }
            })
            .catch(error => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                showError('signupPasswordError', 'Network error. Please try again later.');
                console.error('Error:', error);
            });
    }
});

// Forgot Password Form Submission
document.getElementById('forgotPasswordFormElement')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();
    let isValid = true;

    clearError('resetEmailError');

    if (!email) {
        showError('resetEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('resetEmailError', 'Please enter a valid email');
        isValid = false;
    }

    if (isValid) {
        const submitBtn = this.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending Link...</span>';
        submitBtn.disabled = true;

        // Make API call to send reset link
        fetch('../api/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            if (data.success) {
                showSuccessModal('Reset Link Sent!', data.message || `We've sent a password reset link to ${email}`);
                this.reset();
                setTimeout(() => {
                    switchForm('login');
                }, 3000);
            } else {
                showError('resetEmailError', data.message || 'Failed to send reset link. Please try again.');
            }
        })
        .catch(error => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            showError('resetEmailError', 'Network error. Please try again later.');
            console.error('Error:', error);
        });
    }
});

// Show Success Modal
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successText').textContent = message;
    modal.classList.add('show');

    // Auto-close after 3 seconds
    setTimeout(() => {
        modal.classList.remove('show');
    }, 3000);
}

// Social Login Integration
function socialLogin(provider) {
    if (provider === 'google') {
        googleLogin();
    } else if (provider === 'facebook') {
        facebookLogin();
    }
}

// Initialize Google Sign-In
function initGoogleSignIn() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "883807509960-bg31ba8sicarhupujk7c9if3dg29ifro.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            context: 'signin',
            ux_mode: 'popup',
            auto_select: false
        });
        console.log('Google Sign-In Initialized');
    }
}

// Google Login Implementation
function googleLogin() {
    console.log('Attempting Google Login...');
    if (typeof google !== 'undefined') {
        // Initialize right before prompting to ensure client_id is never "missing"
        google.accounts.id.initialize({
            client_id: "883807509960-bg31ba8sicarhupujk7c9if3dg29ifro.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            ux_mode: 'popup',
            context: 'signin'
        });

        google.accounts.id.prompt((notification) => {
            console.log('Google Prompt Status:', notification.getMomentType(), notification.getNotDisplayedReason());
            if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn('Google Prompt not displayed:', reason);
                
                // Fallback: If One Tap is suppressed or skipped, try to use the manual picker
                if (reason === 'suppressed_by_user' || reason === 'skipped_by_user') {
                    // Note: GSI doesn't have a direct "open picker" method without rendering a button.
                    // We advise the user to clear cookies or we could render a hidden button.
                    alert('Google login was dismissed. Try clearing your browser cookies or use a different browser.');
                } else {
                    alert('Google login failed: ' + reason);
                }
            }
        });
    } else {
        console.error('Google SDK not loaded');
        alert('Google Login is currently unavailable. Please refresh the page.');
    }
}

function handleGoogleResponse(response) {
    if (response.credential) {
        // Decode the JWT (simplistic client-side decoding for UI, backend must verify)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        processSocialLogin({
            provider: 'google',
            token: response.credential,
            email: payload.email,
            name: payload.name,
            id: payload.sub
        });
    }
}

// Facebook Login Implementation
function facebookLogin() {
    FB.login(function (response) {
        if (response.status === 'connected') {
            FB.api('/me', { fields: 'name,email' }, function (userData) {
                processSocialLogin({
                    provider: 'facebook',
                    token: response.authResponse.accessToken,
                    email: userData.email,
                    name: userData.name,
                    id: userData.id
                });
            });
        }
    }, { scope: 'public_profile,email' });
}

// Unified Social Login Processor
function processSocialLogin(data) {
    const loginForm = document.getElementById('loginFormElement');
    const submitBtn = loginForm?.querySelector('.submit-btn');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    if (!data.email) {
        console.error('Social Login Error: No email provided by ' + data.provider);
        alert('Could not retrieve your email from ' + data.provider + '. Please make sure your email is verified and public.');
        return;
    }

    if (submitBtn) {
        submitBtn.innerHTML = '<span>Processing...</span>';
        submitBtn.disabled = true;
    }

    fetch('../api/social_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Server returned ' + res.status + ': ' + res.statusText);
            }
            return res.json();
        })
        .then(res => {
            if (res.success) {
                localStorage.setItem('reservehub_user', JSON.stringify({
                    id: res.user.id,
                    email: res.user.email,
                    name: res.user.name,
                    phone: res.user.phone,
                    timestamp: new Date().toISOString()
                }));

                showSuccessModal('Login Successful!', `Welcome, ${res.user.name}!`);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
                alert(res.message || 'Social login failed. Please try again.');
            }
        })
        .catch(err => {
            console.error('Social Login Error:', err);
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
}

// Input validation on blur
const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
inputs.forEach(input => {
    input.addEventListener('blur', function () {
        // Clear error on blur for better UX
        const errorId = this.id + 'Error';
        const errorElement = document.getElementById(errorId);
        if (errorElement && this.value.trim()) {
            clearError(errorId);
        }
    });
});

// Prevent form submission on Enter in social buttons
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
    });
});

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    // Initialize social SDKs
    initGoogleSignIn();

    const user = localStorage.getItem('reservehub_user');
    if (user && window.location.pathname.includes('login-signup')) {
        console.log('User already logged in:', user);
    }
});
