import { Router } from 'express';
import { initiateCmiPayment, handleCmiCallback, handleCmiSuccess, handleCmiFailure, recordPayment } from '../controllers/paymentController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/cmi/initiate', authenticate, initiateCmiPayment);
router.post('/cmi/callback', handleCmiCallback); // Public callback for CMI
router.post('/cmi/success', handleCmiSuccess);
router.post('/cmi/failure', handleCmiFailure);
router.post('/record', authenticate, recordPayment);

export default router;
