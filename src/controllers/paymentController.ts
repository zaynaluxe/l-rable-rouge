import { Response } from 'express';
import pool from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { generateCmiHash, CmiParams } from '../utils/cmi.ts';

export const initiateCmiPayment = async (req: AuthRequest, res: Response) => {
  const { order_id, amount } = req.body;
  const user = req.user;

  if (!order_id || !amount) {
    return res.status(400).json({ error: 'ID de commande et montant requis.' });
  }

  const merchantId = process.env.CMI_MERCHANT_ID || '123456789';
  const storeKey = process.env.CMI_STORE_KEY || 'your_store_key_here';
  const baseUrl = process.env.CMI_BASE_URL || 'https://testpayment.cmi.co.ma/fim/est3Dgate';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const params: CmiParams = {
    clientid: merchantId,
    amount: amount.toString(),
    okUrl: `${appUrl}/api/payments/cmi/success`,
    failUrl: `${appUrl}/api/payments/cmi/failure`,
    TranType: 'PreAuth',
    callbackUrl: `${appUrl}/api/payments/cmi/callback`,
    shopurl: appUrl,
    currency: '504', // MAD
    rnd: Math.random().toString(36).substring(7),
    storetype: '3D_PAY_HOSTING',
    hashAlgorithm: 'ver3',
    lang: 'fr',
    encoding: 'UTF-8',
    oid: order_id.toString(),
    BillToName: user?.first_name || 'Client',
    BillToCompany: 'L\'Érable Rouge',
    email: user?.email || '',
    tel: user?.phone || '',
  };

  const hash = generateCmiHash(params, storeKey);

  res.json({
    url: baseUrl,
    params: {
      ...params,
      HASH: hash
    }
  });
};

export const handleCmiCallback = async (req: any, res: Response) => {
  const storeKey = process.env.CMI_STORE_KEY || 'your_store_key_here';
  const { Response: cmiResponse, oid, amount, TransId, ProcReturnCode, HASH } = req.body;

  // TODO: Implement hash validation for the callback
  // For now, we trust the callback if it comes from CMI
  
  try {
    const statut = (cmiResponse === 'Approved' && ProcReturnCode === '00') ? 'payé' : 'échoué';
    
    await pool.query(
      `INSERT INTO payments (order_id, methode, montant, statut, transaction_id) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (order_id) DO UPDATE 
       SET statut = EXCLUDED.statut, transaction_id = EXCLUDED.transaction_id, updated_at = CURRENT_TIMESTAMP`,
      [oid, 'carte', amount, statut, TransId]
    );

    // If it's a callback from CMI, we just respond with "ACTION=POSTAUTH" as per CMI spec
    res.send('ACTION=POSTAUTH');
  } catch (error) {
    console.error('CMI Callback Error:', error);
    res.status(500).send('ERROR');
  }
};

export const handleCmiSuccess = async (req: any, res: Response) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { oid, amount, TransId, Response: cmiResponse, ProcReturnCode } = req.body;

  if (oid && cmiResponse === 'Approved' && ProcReturnCode === '00') {
    try {
      await pool.query(
        `INSERT INTO payments (order_id, methode, montant, statut, transaction_id) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (order_id) DO UPDATE 
         SET statut = EXCLUDED.statut, transaction_id = EXCLUDED.transaction_id, updated_at = CURRENT_TIMESTAMP`,
        [oid, 'carte', amount, 'payé', TransId]
      );
    } catch (error) {
      console.error('Error recording payment on success redirect:', error);
    }
  }

  res.redirect(`${appUrl}/paiement/succes`);
};

export const handleCmiFailure = async (req: any, res: Response) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { oid, amount, TransId } = req.body;

  if (oid) {
    try {
      await pool.query(
        `INSERT INTO payments (order_id, methode, montant, statut, transaction_id) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (order_id) DO UPDATE 
         SET statut = EXCLUDED.statut, transaction_id = EXCLUDED.transaction_id, updated_at = CURRENT_TIMESTAMP`,
        [oid, 'carte', amount, 'échoué', TransId]
      );
    } catch (error) {
      console.error('Error recording payment on failure redirect:', error);
    }
  }

  res.redirect(`${appUrl}/paiement/echec`);
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  const { order_id, methode, montant, statut, transaction_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO payments (order_id, methode, montant, statut, transaction_id) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (order_id) DO UPDATE 
       SET statut = EXCLUDED.statut, transaction_id = EXCLUDED.transaction_id, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [order_id, methode, montant, statut, transaction_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Payment Record Error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement.' });
  }
};
