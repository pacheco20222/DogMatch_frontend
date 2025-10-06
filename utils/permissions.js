/**
 * Permission utilities for role-based access control
 * Defines what each user type can do in the app
 */

export const USER_TYPES = {
  OWNER: 'owner',
  SHELTER: 'shelter', 
  ADMIN: 'admin'
};

/**
 * Check if user can create events
 * Only admins and shelters can create events
 */
export const canCreateEvents = (user) => {
  return user?.user_type === USER_TYPES.ADMIN || user?.user_type === USER_TYPES.SHELTER;
};

/**
 * Check if user can manage other users
 * Only admins can manage users
 */
export const canManageUsers = (user) => {
  return user?.user_type === USER_TYPES.ADMIN;
};

/**
 * Check if user can moderate content
 * Only admins can moderate content
 */
export const canModerateContent = (user) => {
  return user?.user_type === USER_TYPES.ADMIN;
};

/**
 * Check if user can view admin features
 * Only admins can view admin features
 */
export const canViewAdminFeatures = (user) => {
  return user?.user_type === USER_TYPES.ADMIN;
};

/**
 * Check if user can create adoption listings
 * Shelters and admins can create adoption listings
 */
export const canCreateAdoptionListings = (user) => {
  return user?.user_type === USER_TYPES.SHELTER || user?.user_type === USER_TYPES.ADMIN;
};

/**
 * Get user type display name
 */
export const getUserTypeDisplayName = (userType) => {
  switch (userType) {
    case USER_TYPES.OWNER:
      return 'Dog Owner';
    case USER_TYPES.SHELTER:
      return 'Shelter';
    case USER_TYPES.ADMIN:
      return 'Administrator';
    default:
      return 'User';
  }
};

/**
 * Get user type color for UI
 */
export const getUserTypeColor = (userType) => {
  switch (userType) {
    case USER_TYPES.OWNER:
      return '#4F8EF7'; // Blue
    case USER_TYPES.SHELTER:
      return '#10B981'; // Green
    case USER_TYPES.ADMIN:
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};
