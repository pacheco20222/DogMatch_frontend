import { createSelector } from 'reselect';

// Base selectors
const getAuthState = (state) => state.auth;
const getUserState = (state) => state.user;
const getDogsState = (state) => state.dogs;
const getMatchesState = (state) => state.matches;
const getEventsState = (state) => state.events;
const getChatsState = (state) => state.chats;
const getSocketState = (state) => state.socket;
const getUIState = (state) => state.ui;

// Auth selectors
export const selectAuthUser = createSelector(
  [getAuthState],
  (auth) => auth.user
);

export const selectAuthToken = createSelector(
  [getAuthState],
  (auth) => auth.accessToken
);

export const selectIsAuthenticated = createSelector(
  [getAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [getAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [getAuthState],
  (auth) => auth.error
);

// User selectors
export const selectUserProfile = createSelector(
  [getUserState],
  (user) => user.profile
);

export const selectUserLoading = createSelector(
  [getUserState],
  (user) => user.loading
);

export const selectUserError = createSelector(
  [getUserState],
  (user) => user.error
);

// Dogs selectors
export const selectMyDogs = createSelector(
  [getDogsState],
  (dogs) => dogs.myDogs
);

export const selectDiscoverDogs = createSelector(
  [getDogsState],
  (dogs) => dogs.discoverDogs
);

export const selectDogsLoading = createSelector(
  [getDogsState],
  (dogs) => dogs.loading
);

export const selectDogsError = createSelector(
  [getDogsState],
  (dogs) => dogs.error
);

export const selectMyDogsCount = createSelector(
  [selectMyDogs],
  (myDogs) => myDogs.length
);

export const selectDiscoverDogsCount = createSelector(
  [selectDiscoverDogs],
  (discoverDogs) => discoverDogs.length
);

// Matches selectors
export const selectMatches = createSelector(
  [getMatchesState],
  (matches) => matches.matches
);

export const selectPendingSwipes = createSelector(
  [getMatchesState],
  (matches) => matches.pendingSwipes
);

export const selectMatchesLoading = createSelector(
  [getMatchesState],
  (matches) => matches.loading
);

export const selectMatchesError = createSelector(
  [getMatchesState],
  (matches) => matches.error
);

export const selectMatchesCount = createSelector(
  [selectMatches],
  (matches) => matches.length
);

export const selectPendingSwipesCount = createSelector(
  [selectPendingSwipes],
  (pendingSwipes) => pendingSwipes.length
);

// Events selectors
export const selectEvents = createSelector(
  [getEventsState],
  (events) => events.events
);

export const selectMyEvents = createSelector(
  [getEventsState],
  (events) => events.myEvents
);

export const selectMyRegistrations = createSelector(
  [getEventsState],
  (events) => events.myRegistrations
);

export const selectEventsLoading = createSelector(
  [getEventsState],
  (events) => events.loading
);

export const selectEventsError = createSelector(
  [getEventsState],
  (events) => events.error
);

export const selectEventsCount = createSelector(
  [selectEvents],
  (events) => events.length
);

export const selectMyEventsCount = createSelector(
  [selectMyEvents],
  (myEvents) => myEvents.length
);

// Chats selectors
export const selectConversations = createSelector(
  [getChatsState],
  (chats) => chats.conversations
);

export const selectMessages = createSelector(
  [getChatsState],
  (chats) => chats.messages
);

export const selectChatsLoading = createSelector(
  [getChatsState],
  (chats) => chats.loading
);

export const selectChatsError = createSelector(
  [getChatsState],
  (chats) => chats.error
);

export const selectConversationsCount = createSelector(
  [selectConversations],
  (conversations) => conversations.length
);

// Socket selectors
export const selectSocketConnected = createSelector(
  [getSocketState],
  (socket) => socket.isConnected
);

export const selectSocketError = createSelector(
  [getSocketState],
  (socket) => socket.connectionError
);

export const selectSocketId = createSelector(
  [getSocketState],
  (socket) => socket.socketId
);

// UI selectors
export const selectUILoading = createSelector(
  [getUIState],
  (ui) => ui.loading
);

export const selectUIError = createSelector(
  [getUIState],
  (ui) => ui.error
);

// Combined selectors for common use cases
export const selectDashboardStats = createSelector(
  [selectMatchesCount, selectMyDogsCount, selectEventsCount, selectConversationsCount],
  (matchesCount, dogsCount, eventsCount, conversationsCount) => ({
    matches: matchesCount,
    dogs: dogsCount,
    events: eventsCount,
    conversations: conversationsCount
  })
);

export const selectUserCanCreateEvents = createSelector(
  [selectUserProfile],
  (profile) => profile?.can_create_events || false
);

export const selectUserCanCreateDogs = createSelector(
  [selectUserProfile],
  (profile) => profile?.can_create_dogs || false
);

// Selector for getting a specific dog by ID
export const selectDogById = createSelector(
  [selectMyDogs, (state, dogId) => dogId],
  (myDogs, dogId) => myDogs.find(dog => dog.id === dogId)
);

// Selector for getting a specific event by ID
export const selectEventById = createSelector(
  [selectEvents, (state, eventId) => eventId],
  (events, eventId) => events.find(event => event.id === eventId)
);

// Selector for getting a specific match by ID
export const selectMatchById = createSelector(
  [selectMatches, (state, matchId) => matchId],
  (matches, matchId) => matches.find(match => match.id === matchId)
);

// Selector for getting messages for a specific conversation
export const selectMessagesByConversationId = createSelector(
  [selectMessages, (state, conversationId) => conversationId],
  (messages, conversationId) => messages.filter(message => message.conversation_id === conversationId)
);
