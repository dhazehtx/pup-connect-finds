import { Router } from 'express';
import { startIdVerification } from './providers/id/start';

const router = Router();

// Create an alias endpoint for verification that the frontend expects
router.post('/start', startIdVerification);

export default router;