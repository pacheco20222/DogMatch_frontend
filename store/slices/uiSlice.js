import { createSlice } from '@reduxjs/toolkit';

// UI slice for managing global UI state
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Loading states
    globalLoading: false,
    loadingMessage: '',
    
    // Error handling
    error: null,
    errorMessage: '',
    showError: false,
    
    // Success messages
    success: null,
    successMessage: '',
    showSuccess: false,
    
    // Modals and overlays
    modals: {
      confirmDialog: {
        visible: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      },
      imagePicker: {
        visible: false,
        onSelect: null,
        onCancel: null,
      },
    },
    
    // Navigation state
    activeTab: 'Home',
    previousRoute: null,
    
    // App state
    appState: 'active', // 'active', 'background', 'inactive'
    isOnline: true,
    
    // Theme and appearance
    theme: 'light', // 'light', 'dark'
    fontSize: 'normal', // 'small', 'normal', 'large'
    
    // Notifications
    notifications: [],
    unreadNotifications: 0,
    
    // Search and filters
    searchQuery: '',
    activeFilters: {},
    
    // Refresh states
    refreshing: {
      home: false,
      dogs: false,
      events: false,
      chats: false,
      matches: false,
    },
  },
  reducers: {
    // Loading states
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
    clearGlobalLoading: (state) => {
      state.globalLoading = false;
      state.loadingMessage = '';
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload.error;
      state.errorMessage = action.payload.message || 'An error occurred';
      state.showError = true;
    },
    clearError: (state) => {
      state.error = null;
      state.errorMessage = '';
      state.showError = false;
    },
    
    // Success messages
    setSuccess: (state, action) => {
      state.success = action.payload.success;
      state.successMessage = action.payload.message || 'Success!';
      state.showSuccess = true;
    },
    clearSuccess: (state) => {
      state.success = null;
      state.successMessage = '';
      state.showSuccess = false;
    },
    
    // Modals
    showConfirmDialog: (state, action) => {
      state.modals.confirmDialog = {
        visible: true,
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
      };
    },
    hideConfirmDialog: (state) => {
      state.modals.confirmDialog = {
        visible: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      };
    },
    showImagePicker: (state, action) => {
      state.modals.imagePicker = {
        visible: true,
        onSelect: action.payload.onSelect,
        onCancel: action.payload.onCancel,
      };
    },
    hideImagePicker: (state) => {
      state.modals.imagePicker = {
        visible: false,
        onSelect: null,
        onCancel: null,
      };
    },
    
    // Navigation
    setActiveTab: (state, action) => {
      state.previousRoute = state.activeTab;
      state.activeTab = action.payload;
    },
    setPreviousRoute: (state, action) => {
      state.previousRoute = action.payload;
    },
    
    // App state
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    // Theme and appearance
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadNotifications += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },
    
    // Search and filters
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.activeFilters = {};
      state.searchQuery = '';
    },
    
    // Refresh states
    setRefreshing: (state, action) => {
      const { screen, refreshing } = action.payload;
      if (state.refreshing.hasOwnProperty(screen)) {
        state.refreshing[screen] = refreshing;
      }
    },
    clearAllRefreshing: (state) => {
      Object.keys(state.refreshing).forEach(key => {
        state.refreshing[key] = false;
      });
    },
  },
});

export const {
  setGlobalLoading,
  clearGlobalLoading,
  setError,
  clearError,
  setSuccess,
  clearSuccess,
  showConfirmDialog,
  hideConfirmDialog,
  showImagePicker,
  hideImagePicker,
  setActiveTab,
  setPreviousRoute,
  setAppState,
  setOnlineStatus,
  setTheme,
  setFontSize,
  addNotification,
  markNotificationAsRead,
  clearAllNotifications,
  setSearchQuery,
  setActiveFilters,
  clearFilters,
  setRefreshing,
  clearAllRefreshing,
} = uiSlice.actions;
export default uiSlice.reducer;
