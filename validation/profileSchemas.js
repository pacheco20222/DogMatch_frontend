import * as Yup from 'yup';

// Update profile validation schema
export const updateProfileSchema = Yup.object().shape({
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
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .nullable(),
  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters')
    .required('Location is required'),
  bio: Yup.string()
    .max(500, 'Bio must be less than 500 characters')
    .nullable(),
  website: Yup.string()
    .url('Please enter a valid website URL')
    .max(200, 'Website URL must be less than 200 characters')
    .nullable(),
  social_media: Yup.object().shape({
    instagram: Yup.string()
      .matches(/^[a-zA-Z0-9._]+$/, 'Invalid Instagram username')
      .max(30, 'Instagram username must be less than 30 characters')
      .nullable(),
    twitter: Yup.string()
      .matches(/^[a-zA-Z0-9_]+$/, 'Invalid Twitter username')
      .max(15, 'Twitter username must be less than 15 characters')
      .nullable(),
    facebook: Yup.string()
      .url('Please enter a valid Facebook URL')
      .max(200, 'Facebook URL must be less than 200 characters')
      .nullable(),
  }).nullable(),
  preferences: Yup.object().shape({
    notifications: Yup.object().shape({
      email: Yup.boolean().default(true),
      push: Yup.boolean().default(true),
      sms: Yup.boolean().default(false),
    }).nullable(),
    privacy: Yup.object().shape({
      profile_visibility: Yup.string()
        .oneOf(['public', 'friends', 'private'], 'Invalid profile visibility setting')
               .default('public'),
      show_location: Yup.boolean().default(true),
      show_contact_info: Yup.boolean().default(false),
    }).nullable(),
  }).nullable(),
});

// Profile photo upload validation schema
export const profilePhotoSchema = Yup.object().shape({
  photo: Yup.mixed()
    .required('Photo is required')
    .test('fileSize', 'Photo must be less than 5MB', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Photo must be a valid image file', (value) => {
      if (!value) return true;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return validTypes.includes(value.type);
    }),
});

// Change password validation schema (reuse from authSchemas)
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

// Account deactivation validation schema
export const deactivateAccountSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required to deactivate account'),
  reason: Yup.string()
    .oneOf([
      'no_longer_using',
      'privacy_concerns',
      'too_many_notifications',
      'found_alternative',
      'technical_issues',
      'other'
    ], 'Please select a reason')
    .required('Please select a reason for deactivating your account'),
  feedback: Yup.string()
    .max(500, 'Feedback must be less than 500 characters')
    .nullable(),
});

// Account reactivation validation schema
export const reactivateAccountSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// Notification preferences validation schema
export const notificationPreferencesSchema = Yup.object().shape({
  email: Yup.object().shape({
    matches: Yup.boolean().default(true),
    messages: Yup.boolean().default(true),
    events: Yup.boolean().default(true),
    reminders: Yup.boolean().default(true),
    marketing: Yup.boolean().default(false),
  }),
  push: Yup.object().shape({
    matches: Yup.boolean().default(true),
    messages: Yup.boolean().default(true),
    events: Yup.boolean().default(true),
    reminders: Yup.boolean().default(true),
    marketing: Yup.boolean().default(false),
  }),
  sms: Yup.object().shape({
    matches: Yup.boolean().default(false),
    messages: Yup.boolean().default(false),
    events: Yup.boolean().default(false),
    reminders: Yup.boolean().default(false),
    marketing: Yup.boolean().default(false),
  }),
});

// Privacy preferences validation schema
export const privacyPreferencesSchema = Yup.object().shape({
  profile_visibility: Yup.string()
    .oneOf(['public', 'friends', 'private'], 'Invalid profile visibility setting')
    .required('Profile visibility is required'),
  show_location: Yup.boolean().default(true),
  show_contact_info: Yup.boolean().default(false),
  show_age: Yup.boolean().default(true),
  show_join_date: Yup.boolean().default(true),
  allow_messages_from: Yup.string()
    .oneOf(['everyone', 'matches_only', 'friends_only'], 'Invalid message setting')
    .default('matches_only'),
  show_online_status: Yup.boolean().default(true),
  show_last_seen: Yup.boolean().default(true),
});

// Block user validation schema
export const blockUserSchema = Yup.object().shape({
  user_id: Yup.number()
    .positive('Invalid user ID')
    .required('User ID is required'),
  reason: Yup.string()
    .oneOf([
      'harassment',
      'spam',
      'inappropriate_content',
      'fake_profile',
      'other'
    ], 'Please select a reason')
    .required('Please select a reason for blocking this user'),
  details: Yup.string()
    .max(300, 'Details must be less than 300 characters')
    .nullable(),
});

// Report user validation schema
export const reportUserSchema = Yup.object().shape({
  user_id: Yup.number()
    .positive('Invalid user ID')
    .required('User ID is required'),
  reason: Yup.string()
    .oneOf([
      'harassment',
      'spam',
      'inappropriate_content',
      'fake_profile',
      'underage',
      'violence',
      'other'
    ], 'Please select a reason')
    .required('Please select a reason for reporting this user'),
  details: Yup.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(500, 'Details must be less than 500 characters')
    .required('Please provide details about the issue'),
  evidence: Yup.array()
    .of(Yup.string().url('Please provide valid URLs for evidence'))
    .max(5, 'Maximum 5 evidence links allowed')
    .nullable(),
});
