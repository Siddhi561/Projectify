import { Router } from 'express';
import passport from 'passport';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authLimiter } from '../../core/middleware/rateLimiter.js';
import { signupSchema, loginSchema, forgotPasswordSchema } from './auth.schema.js';
import {
  signupController,
  loginController,
  getMeController,
  logoutController,
  refreshController,
  googleCallbackController,
} from './auth.controller.js';

const router = Router();

router.use(authLimiter);

//email/password 
router.post('/signup', validate(signupSchema), signupController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh', refreshController);

router.get('/me', authenticate, getMeController);

router.get('/google', passport.authenticate(
    'google',{
        scope:['profile','email'],
        session:false, //we are using jwt
    }
),);


router.get('/google/callback', passport.authenticate('google',{
    session:false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
}),
googleCallbackController);

export {router as authRouter};


