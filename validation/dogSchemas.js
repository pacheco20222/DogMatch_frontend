import * as Yup from 'yup';

// Create dog validation schema
export const createDogSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Dog name must be at least 2 characters')
    .max(30, 'Dog name must be less than 30 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Dog name can only contain letters and spaces')
    .required('Dog name is required'),
  breed: Yup.string()
    .min(2, 'Breed must be at least 2 characters')
    .max(50, 'Breed must be less than 50 characters')
    .required('Breed is required'),
  age_years: Yup.number()
    .min(0, 'Age must be 0 or greater')
    .max(30, 'Age must be less than 30 years')
    .required('Age is required'),
  weight: Yup.number()
    .min(0.1, 'Weight must be greater than 0')
    .max(200, 'Weight must be less than 200 kg')
    .nullable(),
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Gender must be male or female')
    .required('Gender is required'),
  size: Yup.string()
    .oneOf(['small', 'medium', 'large', 'extra_large'], 'Size must be small, medium, large, or extra large')
    .required('Size is required'),
  energy_level: Yup.string()
    .oneOf(['low', 'medium', 'high'], 'Energy level must be low, medium, or high')
    .required('Energy level is required'),
  personality: Yup.string()
    .max(200, 'Personality traits must be less than 200 characters')
    .nullable(),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .required('Description is required'),
  good_with_kids: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option')
    .required('Please specify if dog is good with kids'),
  good_with_dogs: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option')
    .required('Please specify if dog is good with other dogs'),
  good_with_cats: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option')
    .required('Please specify if dog is good with cats'),
  is_vaccinated: Yup.boolean()
    .required('Please specify vaccination status'),
  is_neutered: Yup.boolean()
    .required('Please specify spay/neuter status'),
  special_needs: Yup.string()
    .max(200, 'Special needs description must be less than 200 characters')
    .nullable(),
  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters')
    .required('Location is required'),
  availability_status: Yup.string()
    .oneOf(['available', 'unavailable', 'pending'], 'Invalid availability status')
    .default('available'),
});

// Update dog validation schema (same as create but all fields optional except name)
export const updateDogSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Dog name must be at least 2 characters')
    .max(30, 'Dog name must be less than 30 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Dog name can only contain letters and spaces')
    .required('Dog name is required'),
  breed: Yup.string()
    .min(2, 'Breed must be at least 2 characters')
    .max(50, 'Breed must be less than 50 characters'),
  age: Yup.number()
    .min(0, 'Age must be 0 or greater')
    .max(30, 'Age must be less than 30 years'),
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Gender must be male or female'),
  size: Yup.string()
    .oneOf(['small', 'medium', 'large', 'extra_large'], 'Size must be small, medium, large, or extra large'),
  energy_level: Yup.string()
    .oneOf(['low', 'medium', 'high'], 'Energy level must be low, medium, or high'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  good_with_kids: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option'),
  good_with_dogs: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option'),
  good_with_cats: Yup.string()
    .oneOf(['yes', 'no', 'not_sure'], 'Please select an option'),
  is_vaccinated: Yup.boolean(),
  is_neutered: Yup.boolean(),
  special_needs: Yup.string()
    .max(200, 'Special needs description must be less than 200 characters')
    .nullable(),
  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  availability_status: Yup.string()
    .oneOf(['available', 'unavailable', 'pending'], 'Invalid availability status'),
});

// Dog photo upload validation schema
export const dogPhotoSchema = Yup.object().shape({
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

// Dog search/filter validation schema
export const dogSearchSchema = Yup.object().shape({
  breed: Yup.string()
    .max(50, 'Breed filter must be less than 50 characters')
    .nullable(),
  min_age: Yup.number()
    .min(0, 'Minimum age must be 0 or greater')
    .max(30, 'Minimum age must be less than 30 years')
    .nullable(),
  max_age: Yup.number()
    .min(0, 'Maximum age must be 0 or greater')
    .max(30, 'Maximum age must be less than 30 years')
    .nullable()
    .when('min_age', {
      is: (val) => val != null,
      then: (schema) => schema.min(Yup.ref('min_age'), 'Maximum age must be greater than minimum age'),
    }),
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Gender must be male or female')
    .nullable(),
  size: Yup.array()
    .of(Yup.string().oneOf(['small', 'medium', 'large', 'extra_large']))
    .nullable(),
  energy_level: Yup.array()
    .of(Yup.string().oneOf(['low', 'medium', 'high']))
    .nullable(),
  good_with_kids: Yup.boolean()
    .nullable(),
  good_with_dogs: Yup.boolean()
    .nullable(),
  good_with_cats: Yup.boolean()
    .nullable(),
  is_vaccinated: Yup.boolean()
    .nullable(),
  is_neutered: Yup.boolean()
    .nullable(),
  location: Yup.string()
    .max(100, 'Location filter must be less than 100 characters')
    .nullable(),
  radius: Yup.number()
    .min(1, 'Radius must be at least 1 mile')
    .max(100, 'Radius must be less than 100 miles')
    .nullable(),
});

// Dog availability update schema
export const dogAvailabilitySchema = Yup.object().shape({
  availability_status: Yup.string()
    .oneOf(['available', 'unavailable', 'pending'], 'Invalid availability status')
    .required('Availability status is required'),
  reason: Yup.string()
    .max(200, 'Reason must be less than 200 characters')
    .nullable(),
});
