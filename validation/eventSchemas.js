import * as Yup from 'yup';

// Create event validation schema
export const createEventSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title must be less than 200 characters')
    .required('Event title is required'),
  description: Yup.string()
    .min(20, 'Event description must be at least 20 characters')
    .max(2000, 'Event description must be less than 2000 characters')
    .required('Event description is required'),
  category: Yup.string()
    .oneOf(['meetup', 'training', 'adoption', 'competition', 'social', 'educational'], 'Invalid event category')
    .required('Event category is required'),
  event_date: Yup.string()
    .required('Event date is required')
    .test('is-future-date', 'Event date must be in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  event_time: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .required('Event time is required'),
  location: Yup.string()
    .min(5, 'Location must be at least 5 characters')
    .max(300, 'Location must be less than 300 characters')
    .required('Location is required'),
  max_participants: Yup.number()
    .min(1, 'Maximum participants must be at least 1')
    .max(1000, 'Maximum participants must be less than 1000')
    .nullable(),
  price: Yup.number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price must be less than 100,000')
    .required('Price is required'),
  special_requirements: Yup.string()
    .max(500, 'Special requirements must be less than 500 characters')
    .nullable(),
  contact_email: Yup.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .nullable(),
  contact_phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .nullable(),
  vaccination_required: Yup.boolean()
    .default(true),
  requires_approval: Yup.boolean()
    .default(false),
});

// Update event validation schema (same as create but all fields optional except title)
export const updateEventSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Event title must be at least 3 characters')
    .max(100, 'Event title must be less than 100 characters')
    .required('Event title is required'),
  description: Yup.string()
    .min(20, 'Event description must be at least 20 characters')
    .max(1000, 'Event description must be less than 1000 characters'),
  category: Yup.string()
    .oneOf(['meetup', 'training', 'adoption', 'competition', 'social', 'educational'], 'Invalid event category'),
  event_date: Yup.date()
    .min(new Date(), 'Event date must be in the future'),
  start_time: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  end_time: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .when('start_time', {
      is: (val) => val != null,
      then: (schema) => schema.test('end-after-start', 'End time must be after start time', function(value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        
        const start = new Date(`2000-01-01T${start_time}`);
        const end = new Date(`2000-01-01T${value}`);
        return end > start;
      }),
    }),
  location: Yup.string()
    .min(5, 'Location must be at least 5 characters')
    .max(200, 'Location must be less than 200 characters'),
  capacity: Yup.number()
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must be less than 1000'),
  price: Yup.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price must be less than $10,000'),
  requirements: Yup.string()
    .max(500, 'Requirements must be less than 500 characters')
    .nullable(),
  contact_email: Yup.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .nullable(),
  contact_phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .nullable(),
  website: Yup.string()
    .url('Please enter a valid website URL')
    .max(200, 'Website URL must be less than 200 characters')
    .nullable(),
  is_public: Yup.boolean(),
  requires_approval: Yup.boolean(),
});

// Event registration validation schema
export const eventRegistrationSchema = Yup.object().shape({
  dog_id: Yup.number()
    .positive('Please select a valid dog')
    .nullable(),
  notes: Yup.string()
    .max(300, 'Notes must be less than 300 characters')
    .nullable(),
  special_requests: Yup.string()
    .max(300, 'Special requests must be less than 300 characters')
    .nullable(),
  emergency_contact_name: Yup.string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(50, 'Emergency contact name must be less than 50 characters')
    .nullable(),
  emergency_contact_phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .nullable(),
  dietary_restrictions: Yup.string()
    .max(200, 'Dietary restrictions must be less than 200 characters')
    .nullable(),
  medical_conditions: Yup.string()
    .max(200, 'Medical conditions must be less than 200 characters')
    .nullable(),
});

// Event search/filter validation schema
export const eventSearchSchema = Yup.object().shape({
  category: Yup.array()
    .of(Yup.string().oneOf(['meetup', 'training', 'adoption', 'competition', 'social', 'educational']))
    .nullable(),
  min_price: Yup.number()
    .min(0, 'Minimum price cannot be negative')
    .max(10000, 'Minimum price must be less than $10,000')
    .nullable(),
  max_price: Yup.number()
    .min(0, 'Maximum price cannot be negative')
    .max(10000, 'Maximum price must be less than $10,000')
    .nullable()
    .when('min_price', {
      is: (val) => val != null,
      then: (schema) => schema.min(Yup.ref('min_price'), 'Maximum price must be greater than minimum price'),
    }),
  date_from: Yup.date()
    .min(new Date(), 'Date from must be in the future')
    .nullable(),
  date_to: Yup.date()
    .min(new Date(), 'Date to must be in the future')
    .nullable()
    .when('date_from', {
      is: (val) => val != null,
      then: (schema) => schema.min(Yup.ref('date_from'), 'Date to must be after date from'),
    }),
  location: Yup.string()
    .max(100, 'Location filter must be less than 100 characters')
    .nullable(),
  radius: Yup.number()
    .min(1, 'Radius must be at least 1 mile')
    .max(100, 'Radius must be less than 100 miles')
    .nullable(),
  is_free: Yup.boolean()
    .nullable(),
  has_capacity: Yup.boolean()
    .nullable(),
});

// Event photo upload validation schema
export const eventPhotoSchema = Yup.object().shape({
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
  caption: Yup.string()
    .max(100, 'Caption must be less than 100 characters')
    .nullable(),
});

// Event status update schema
export const eventStatusSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(['draft', 'published', 'cancelled', 'completed'], 'Invalid event status')
    .required('Event status is required'),
  reason: Yup.string()
    .max(200, 'Reason must be less than 200 characters')
    .nullable(),
});
