/**
 * Form Validation Utilities
 * Centralized validation logic for form fields across the application
 */

const FACULTIES = [
  'COMPUTING',
  'ENGINEERING',
  'SLIIT BUSINESS SCHOOL',
  'HUMANITIES & SCIENCES',
  'GRADUATE STUDIES',
  'SCHOOL OF ARCHITECTURE',
  'SCHOOL OF LAW',
  'SCHOOL OF HOSPITALITY & CULINARY',
  'FOUNDATION PROGRAMME'
];

const STUDENT_ID_REGEX = /^[A-Za-z]{2}\d{8}$/;
const PHONE_REGEX = /^\d{10}$/;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validate Student/Campus ID format (2 English characters + 8 numbers)
 * @param {string} id - Student ID to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateStudentId(id) {
  if (!id || !id.trim()) {
    return { valid: false, error: 'Student ID is required' };
  }

  if (!STUDENT_ID_REGEX.test(id.trim())) {
    return {
      valid: false,
      error: 'Student ID must be 2 English letters followed by 8 numbers (e.g., IT23844292)'
    };
  }

  return { valid: true };
}

/**
 * Validate phone number format (10 digits)
 * @param {string} phone - Phone number to validate
 * @param {boolean} required - Whether field is required
 * @returns {object} { valid: boolean, error?: string }
 */
export function validatePhone(phone, required = false) {
  if (!phone || !phone.trim()) {
    if (required) {
      return { valid: false, error: 'Phone number is required' };
    }
    return { valid: true };
  }

  const cleaned = phone.replace(/\D/g, '');

  if (!PHONE_REGEX.test(cleaned)) {
    return {
      valid: false,
      error: 'Phone number must be exactly 10 digits'
    };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, error?: string, strength?: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      strength: 'weak'
    };
  }

  // Additional strength checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  let strength = 'weak';
  if (strengthScore >= 3) strength = 'strong';
  else if (strengthScore >= 2) strength = 'good';

  return { valid: true, strength };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate name field
 * @param {string} name - Name to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  return { valid: true };
}

/**
 * Validate faculty/department selection
 * @param {string} faculty - Faculty to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateFaculty(faculty) {
  if (!faculty || !faculty.trim()) {
    return { valid: false, error: 'Faculty is required' };
  }

  if (!FACULTIES.includes(faculty.trim())) {
    return { valid: false, error: 'Please select a valid faculty' };
  }

  return { valid: true };
}

/**
 * Get list of available faculties
 * @returns {array} Array of faculty names
 */
export function getFaculties() {
  return [...FACULTIES];
}

/**
 * Validate entire registration form
 * @param {object} formData - Form data object
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateRegistrationForm(formData) {
  const errors = {};

  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) errors.name = nameValidation.error;

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) errors.email = emailValidation.error;

  const studentIdValidation = validateStudentId(formData.studentId);
  if (!studentIdValidation.valid) errors.studentId = studentIdValidation.error;

  const facultyValidation = validateFaculty(formData.faculty);
  if (!facultyValidation.valid) errors.faculty = facultyValidation.error;

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) errors.password = passwordValidation.error;

  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) errors.phone = phoneValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
}

/**
 * Strip non-digits from phone number
 * @param {string} phone - Phone number
 * @returns {string} Digits only
 */
export function stripPhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}
