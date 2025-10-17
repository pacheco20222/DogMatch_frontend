import * as Yup from 'yup';

// Send message validation schema
export const sendMessageSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message content is required'),
  message_type: Yup.string()
    .oneOf(['text', 'image', 'location', 'system'], 'Invalid message type')
    .default('text'),
  reply_to: Yup.number()
    .positive('Invalid reply message ID')
    .nullable(),
  metadata: Yup.object().shape({
    // For image messages
    image_url: Yup.string()
      .url('Invalid image URL')
      .nullable(),
    image_caption: Yup.string()
      .max(200, 'Image caption must be less than 200 characters')
      .nullable(),
    
    // For location messages
    latitude: Yup.number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude')
      .nullable(),
    longitude: Yup.number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude')
      .nullable(),
    location_name: Yup.string()
      .max(100, 'Location name must be less than 100 characters')
      .nullable(),
    
    // For system messages
    system_type: Yup.string()
      .oneOf(['match_created', 'event_reminder', 'profile_update'], 'Invalid system message type')
      .nullable(),
  }).nullable(),
});

// Edit message validation schema
export const editMessageSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message content is required'),
  metadata: Yup.object().shape({
    image_caption: Yup.string()
      .max(200, 'Image caption must be less than 200 characters')
      .nullable(),
    location_name: Yup.string()
      .max(100, 'Location name must be less than 100 characters')
      .nullable(),
  }).nullable(),
});

// Message search validation schema
export const messageSearchSchema = Yup.object().shape({
  query: Yup.string()
    .min(1, 'Search query must be at least 1 character')
    .max(100, 'Search query must be less than 100 characters')
    .required('Search query is required'),
  match_id: Yup.number()
    .positive('Invalid match ID')
    .nullable(),
  message_type: Yup.string()
    .oneOf(['text', 'image', 'location', 'system'], 'Invalid message type')
    .nullable(),
  date_from: Yup.date()
    .nullable(),
  date_to: Yup.date()
    .nullable()
    .when('date_from', {
      is: (val) => val != null,
      then: (schema) => schema.min(Yup.ref('date_from'), 'Date to must be after date from'),
    }),
  sender_id: Yup.number()
    .positive('Invalid sender ID')
    .nullable(),
});

// Typing indicator validation schema
export const typingIndicatorSchema = Yup.object().shape({
  match_id: Yup.number()
    .positive('Invalid match ID')
    .required('Match ID is required'),
  is_typing: Yup.boolean()
    .required('Typing status is required'),
});

// Message reaction validation schema
export const messageReactionSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  reaction: Yup.string()
    .oneOf(['like', 'love', 'laugh', 'wow', 'sad', 'angry'], 'Invalid reaction type')
    .required('Reaction type is required'),
});

// Message report validation schema
export const reportMessageSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  reason: Yup.string()
    .oneOf([
      'harassment',
      'spam',
      'inappropriate_content',
      'threats',
      'hate_speech',
      'other'
    ], 'Please select a reason')
    .required('Please select a reason for reporting this message'),
  details: Yup.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(300, 'Details must be less than 300 characters')
    .required('Please provide details about the issue'),
});

// Message pin validation schema
export const pinMessageSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  is_pinned: Yup.boolean()
    .required('Pin status is required'),
});

// Message star validation schema
export const starMessageSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  is_starred: Yup.boolean()
    .required('Star status is required'),
});

// Conversation settings validation schema
export const conversationSettingsSchema = Yup.object().shape({
  match_id: Yup.number()
    .positive('Invalid match ID')
    .required('Match ID is required'),
  notifications: Yup.boolean()
    .default(true),
  sound: Yup.boolean()
    .default(true),
  vibration: Yup.boolean()
    .default(true),
  auto_download_media: Yup.boolean()
    .default(true),
  show_read_receipts: Yup.boolean()
    .default(true),
  show_typing_indicator: Yup.boolean()
    .default(true),
});

// Message forwarding validation schema
export const forwardMessageSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  target_match_ids: Yup.array()
    .of(Yup.number().positive('Invalid match ID'))
    .min(1, 'At least one target conversation is required')
    .max(10, 'Maximum 10 conversations allowed')
    .required('Target conversations are required'),
  add_note: Yup.string()
    .max(200, 'Note must be less than 200 characters')
    .nullable(),
});

// Message deletion validation schema
export const deleteMessageSchema = Yup.object().shape({
  message_id: Yup.number()
    .positive('Invalid message ID')
    .required('Message ID is required'),
  delete_for_everyone: Yup.boolean()
    .default(false),
});

// Conversation mute validation schema
export const muteConversationSchema = Yup.object().shape({
  match_id: Yup.number()
    .positive('Invalid match ID')
    .required('Match ID is required'),
  mute_until: Yup.date()
    .min(new Date(), 'Mute until date must be in the future')
    .nullable(),
  is_permanent: Yup.boolean()
    .default(false),
});
