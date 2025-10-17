import * as Yup from 'yup';

// Login validation schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  twoFactorCode: Yup.string()
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits')
    .nullable()
    .when('$require2FA', {
      is: true,
      then: (schema) => schema.required('Two-factor authentication code is required'),
      otherwise: (schema) => schema.nullable(),
    }),
});

// Registration validation schema
export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  full_name: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .nullable(),
  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters')
    .required('Location is required'),
  user_type: Yup.string()
    .oneOf(['owner', 'shelter', 'admin'], 'Invalid user type')
    .default('owner'),
});

// Password change validation schema
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits')
    .required('Verification code is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// Password reset confirmation schema
export const passwordResetConfirmSchema = Yup.object().shape({
  token: Yup.string()
    .required('Reset token is required'),
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

// Email verification schema
export const emailVerificationSchema = Yup.object().shape({
  token: Yup.string()
    .required('Verification token is required'),
});

// Account deactivation schema
export const deactivateAccountSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required to deactivate account'),
  reason: Yup.string()
    .max(500, 'Reason must be less than 500 characters')
    .nullable(),
});

// Account reactivation schema
export const reactivateAccountSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});
