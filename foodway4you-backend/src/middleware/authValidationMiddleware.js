import { body } from 'express-validator';


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

//  REGISTER VALIDATION
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .trim()
    .matches(phoneRegex)
    .withMessage('Enter a valid Indian phone number (e.g. +919876543210 or 9876543210)'),

  body('password')
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters').bail()
    .matches(passwordRegex)
    .withMessage('Password must include uppercase, lowercase, number and special character'),

  body('role')
    .optional()
    .isIn(['customer', 'restaurant', 'rider','admin'])
    .withMessage('Invalid role selected') 
];

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email required'),

  body('password')
    .notEmpty().withMessage('Password is required')
];




export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Valid email format is required')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(phoneRegex)
    .withMessage('Enter a valid Indian phone number'),

  body('avatar')
    .optional()
    .isString().withMessage('Avatar must be a valid string URL'),

  body('fcmToken')
    .optional()
    .isString().withMessage('FCM Token must be a string')
];