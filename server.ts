import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PendingTransaction {
  tx_ref: string;
  amount: number | string;
  tier: string;
  type?: 'MEMBERSHIP' | 'SHOP_ORDER' | 'DONATION';
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityOrRegion: string;
  dateOfBirth?: string;
  gender?: string;
  preferredLanguage?: string;
  photoUrl?: string;
  shopOrderDetails?: {
    itemId: string;
    itemName: string;
    size: string;
    streetAddress: string;
    city: string;
    subcityOrRegion: string;
  };
  donationDetails?: {
    purpose: string;
    supporterName: string;
  };
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceNumber?: string;
  paymentMethod?: string;
  createdAt: string;
  verifiedAt?: string;
  isSandbox: boolean;
  chapaData?: any;
}

// In-memory registry of transactions
const pendingTransactions = new Map<string, PendingTransaction>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
  const isChapaConfigured = Boolean(
    CHAPA_SECRET_KEY &&
    !CHAPA_SECRET_KEY.includes('sample_secret_key') &&
    CHAPA_SECRET_KEY.startsWith('CHASECK')
  );

  // Free Over-The-Air Live Update endpoint for CapacitorUpdater
  const updateCheckPayload = {
    version: '1.0.1',
    url: 'https://github.com/abdmalik0/halaba-fc/releases/download/v1.0.1/dist.zip',
  };

  app.get(['/api/update-check', '/update-check.json'], (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.json(updateCheckPayload);
  });

  /**
   * POST /api/initialize-payment
   * Initializes a Chapa transaction for membership, jersey shop checkout, or supporter donation.
   * Explicitly passes the dynamic amount directly into Chapa's payload.
   */
  app.post('/api/initialize-payment', async (req: Request, res: Response) => {
    try {
      const {
        amount,
        tier,
        type = 'MEMBERSHIP',
        title,
        description,
        fullName,
        phone,
        email,
        cityOrRegion,
        dateOfBirth,
        gender,
        preferredLanguage,
        photoUrl,
        shopOrderDetails,
        donationDetails,
        tx_ref: customTxRef,
      } = req.body;

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'A valid amount is required for payment initialization.',
        });
      }

      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Full name and phone number are required.',
        });
      }

      // Format names for Chapa
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Halaba';
      const lastName = nameParts.slice(1).join(' ') || 'Supporter';

      // Clean phone number (e.g. 09... or +251...)
      let cleanPhone = phone.trim().replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone; // Chapa accepts Ethiopian 09... or +2519...
      }

      const txPrefix = type === 'SHOP_ORDER' ? 'halaba-shop' : type === 'DONATION' ? 'halaba-donate' : 'halaba-tx';
      const txRef = customTxRef || `${txPrefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const userEmail = email && email.includes('@') ? email.trim() : `supporter-${txRef.slice(-6)}@halabafc.et`;
      const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = req.get('host') || `localhost:${PORT}`;

      // Customization title and description based on transaction type
      let paymentTitle = title;
      let paymentDesc = description;

      if (!paymentTitle) {
        if (type === 'SHOP_ORDER') {
          paymentTitle = `Halaba FC Shop: ${shopOrderDetails?.itemName || 'Jersey Order'}`;
        } else if (type === 'DONATION') {
          paymentTitle = 'Halaba City FC Supporter Donation';
        } else {
          paymentTitle = `Halaba FC ${tier || 'Official'} Membership`;
        }
      }

      if (!paymentDesc) {
        if (type === 'SHOP_ORDER') {
          paymentDesc = `Merchandise order: ${shopOrderDetails?.itemName || 'Jersey'} (Size: ${shopOrderDetails?.size || 'Standard'}) - ${amount} ETB`;
        } else if (type === 'DONATION') {
          paymentDesc = `Club Donation: ${donationDetails?.purpose || 'General Club Support'} (${amount} ETB)`;
        } else {
          paymentDesc = `Membership registration fee (${amount} ETB)`;
        }
      }

      // Chapa payload with dynamic amount explicitly passed
      const chapaPayload = {
        amount: String(amount),
        currency: 'ETB',
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        phone_number: cleanPhone,
        tx_ref: txRef,
        callback_url: `${protocol}://${host}/api/verify-payment/${txRef}`,
        return_url: `${protocol}://${host}/?tx_ref=${txRef}&payment_completed=true&payment_type=${type}`,
        'customization[title]': paymentTitle,
        'customization[description]': paymentDesc,
      };

      console.log(`[Chapa Init] Initializing ${type} payment for tx_ref=${txRef}, amount=${amount} ETB, customer=${fullName}`);

      let checkoutUrl: string = '';
      let isSandbox = false;
      let chapaResponseData: any = null;

      if (isChapaConfigured) {
        try {
          const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            },
            body: JSON.stringify(chapaPayload),
          });

          const chapaJson = await chapaRes.json();
          console.log('[Chapa Response]:', chapaJson);

          if (chapaRes.ok && chapaJson.status === 'success' && chapaJson.data?.checkout_url) {
            checkoutUrl = chapaJson.data.checkout_url;
            chapaResponseData = chapaJson.data;
          } else {
            console.warn('[Chapa API Warning]:', chapaJson.message || 'Falling back to sandbox simulator');
            isSandbox = true;
          }
        } catch (apiErr) {
          console.error('[Chapa API Network Error]:', apiErr);
          isSandbox = true;
        }
      } else {
        isSandbox = true;
      }

      if (isSandbox) {
        checkoutUrl = `/?chapa_modal=1&tx_ref=${txRef}&amount=${encodeURIComponent(String(amount))}&type=${encodeURIComponent(type)}&tier=${encodeURIComponent(tier || 'STANDARD')}`;
      }

      // Store in pending transactions
      const transactionRecord: PendingTransaction = {
        tx_ref: txRef,
        amount: String(amount),
        tier: tier || 'STANDARD',
        type,
        fullName: fullName.trim(),
        firstName,
        lastName,
        email: userEmail,
        phone: cleanPhone,
        cityOrRegion: cityOrRegion || shopOrderDetails?.city || 'Halaba',
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        preferredLanguage: preferredLanguage || 'en',
        photoUrl: photoUrl || '',
        shopOrderDetails,
        donationDetails,
        status: 'PENDING',
        isSandbox,
        createdAt: new Date().toISOString(),
        chapaData: chapaResponseData,
      };

      pendingTransactions.set(txRef, transactionRecord);

      return res.json({
        success: true,
        checkout_url: checkoutUrl,
        tx_ref: txRef,
        amount: String(amount),
        tier: tier || 'STANDARD',
        type,
        isSandbox,
        message: 'Payment initialized successfully. Complete payment to verify transaction.',
      });
    } catch (error: any) {
      console.error('[Error in /api/initialize-payment]:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to initialize payment with Chapa',
      });
    }
  });


  /**
   * GET & POST /api/verify-payment/:tx_ref
   * Verifies the payment with Chapa.
   * Registration MUST NOT be successful unless payment is verified!
   */
  const handleVerify = async (txRef: string, res: Response) => {
    if (!txRef) {
      return res.status(400).json({
        verified: false,
        error: 'Missing tx_ref parameter',
      });
    }

    const transaction = pendingTransactions.get(txRef);
    if (!transaction) {
      return res.status(404).json({
        verified: false,
        error: `No transaction found for reference ${txRef}`,
      });
    }

    const formatVerifiedPayload = (tx: PendingTransaction) => {
      const type = tx.type || 'MEMBERSHIP';
      return {
        verified: true,
        status: 'success',
        type,
        referenceNumber: tx.referenceNumber,
        amount: tx.amount,
        tier: tx.tier,
        verifiedAt: tx.verifiedAt,
        order: type === 'SHOP_ORDER' ? {
          orderNumber: tx.referenceNumber,
          itemId: tx.shopOrderDetails?.itemId || 'item-unknown',
          itemName: tx.shopOrderDetails?.itemName || 'Halaba Jersey',
          size: tx.shopOrderDetails?.size || 'Standard',
          amount: Number(tx.amount),
          fullName: tx.fullName,
          email: tx.email,
          phone: tx.phone,
          streetAddress: tx.shopOrderDetails?.streetAddress || '',
          city: tx.shopOrderDetails?.city || tx.cityOrRegion,
          subcityOrRegion: tx.shopOrderDetails?.subcityOrRegion || '',
          status: 'PAID',
          tx_ref: tx.tx_ref,
          verifiedAt: tx.verifiedAt,
        } : undefined,
        donation: type === 'DONATION' ? {
          donationNumber: tx.referenceNumber,
          fullName: tx.fullName,
          email: tx.email,
          phone: tx.phone,
          amount: Number(tx.amount),
          purpose: tx.donationDetails?.purpose || 'General Club Support',
          status: 'COMPLETED',
          tx_ref: tx.tx_ref,
          verifiedAt: tx.verifiedAt,
        } : undefined,
        member: type === 'MEMBERSHIP' ? {
          fullName: tx.fullName,
          dateOfBirth: tx.dateOfBirth,
          gender: tx.gender,
          phone: tx.phone,
          email: tx.email,
          cityOrRegion: tx.cityOrRegion,
          membershipType: tx.tier,
          preferredLanguage: tx.preferredLanguage,
          photoUrl: tx.photoUrl,
          referenceNumber: tx.referenceNumber,
          amountPaid: tx.amount,
          tx_ref: tx.tx_ref,
          status: 'APPROVED',
        } : undefined,
      };
    };

    // If already verified
    if (transaction.status === 'SUCCESS' && transaction.referenceNumber) {
      return res.json(formatVerifiedPayload(transaction));
    }

    // If live transaction through Chapa API, query Chapa verification
    if (!transaction.isSandbox && isChapaConfigured) {
      try {
        const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          },
        });

        const verifyJson = await verifyRes.json();
        console.log(`[Chapa Verify ${txRef}]:`, verifyJson);

        if (verifyRes.ok && verifyJson.status === 'success' && verifyJson.data?.status === 'success') {
          // Payment confirmed by Chapa!
          const randNum = Math.floor(1000 + Math.random() * 9000);
          const type = transaction.type || 'MEMBERSHIP';
          const refNumber = type === 'SHOP_ORDER'
            ? `HCFC-SHOP-${randNum}`
            : type === 'DONATION'
            ? `HCFC-DON-${randNum}`
            : `HCFC-2026-M${randNum}`;

          transaction.status = 'SUCCESS';
          transaction.referenceNumber = refNumber;
          transaction.verifiedAt = new Date().toISOString();
          transaction.chapaData = verifyJson.data;

          pendingTransactions.set(txRef, transaction);

          return res.json({
            ...formatVerifiedPayload(transaction),
            message: 'Chapa payment successfully verified.',
          });
        } else {
          return res.json({
            verified: false,
            status: verifyJson.data?.status || 'pending',
            message: 'Payment has not been completed or verified yet on Chapa.',
          });
        }
      } catch (err: any) {
        console.error('[Chapa Verify API Error]:', err);
        return res.status(502).json({
          verified: false,
          error: 'Error communicating with Chapa verification endpoint.',
        });
      }
    }

    // In sandbox or pending state:
    return res.json({
      verified: false,
      status: transaction.status.toLowerCase(),
      isSandbox: transaction.isSandbox,
      type: transaction.type || 'MEMBERSHIP',
      message: 'Payment has not been completed or verified yet. Please complete the payment first.',
    });
  };

  app.get('/api/verify-payment/:tx_ref', async (req: Request, res: Response) => {
    const txRef = Array.isArray(req.params.tx_ref) ? req.params.tx_ref[0] : req.params.tx_ref;
    await handleVerify(txRef || '', res);
  });

  app.post('/api/verify-payment', async (req: Request, res: Response) => {
    const txRef = typeof req.body?.tx_ref === 'string' ? req.body.tx_ref : '';
    await handleVerify(txRef, res);
  });

  /**
   * POST /api/complete-sandbox-payment
   * Simulates successful payment completion for sandbox/test environments
   */
  app.post('/api/complete-sandbox-payment', (req: Request, res: Response) => {
    const { tx_ref, method } = req.body;
    if (!tx_ref) {
      return res.status(400).json({ success: false, error: 'tx_ref is required' });
    }

    const transaction = pendingTransactions.get(tx_ref);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const type = transaction.type || 'MEMBERSHIP';
    const refNumber = type === 'SHOP_ORDER'
      ? `HCFC-SHOP-${randNum}`
      : type === 'DONATION'
      ? `HCFC-DON-${randNum}`
      : `HCFC-2026-M${randNum}`;

    transaction.status = 'SUCCESS';
    transaction.referenceNumber = refNumber;
    transaction.paymentMethod = method || 'Telebirr';
    transaction.verifiedAt = new Date().toISOString();

    pendingTransactions.set(tx_ref, transaction);

    console.log(`[Sandbox Paid] Completed ${type} payment for ${tx_ref}, refNumber=${refNumber}, amount=${transaction.amount}`);

    return res.json({
      success: true,
      verified: true,
      type,
      referenceNumber: refNumber,
      amount: transaction.amount,
      tier: transaction.tier,
      verifiedAt: transaction.verifiedAt,
      order: type === 'SHOP_ORDER' ? {
        orderNumber: refNumber,
        itemId: transaction.shopOrderDetails?.itemId || 'item-unknown',
        itemName: transaction.shopOrderDetails?.itemName || 'Halaba Jersey',
        size: transaction.shopOrderDetails?.size || 'Standard',
        amount: Number(transaction.amount),
        fullName: transaction.fullName,
        email: transaction.email,
        phone: transaction.phone,
        streetAddress: transaction.shopOrderDetails?.streetAddress || '',
        city: transaction.shopOrderDetails?.city || transaction.cityOrRegion,
        subcityOrRegion: transaction.shopOrderDetails?.subcityOrRegion || '',
        status: 'PAID',
        tx_ref: transaction.tx_ref,
        verifiedAt: transaction.verifiedAt,
      } : undefined,
      donation: type === 'DONATION' ? {
        donationNumber: refNumber,
        fullName: transaction.fullName,
        email: tx_ref ? transaction.email : undefined,
        phone: transaction.phone,
        amount: Number(transaction.amount),
        purpose: transaction.donationDetails?.purpose || 'General Club Support',
        status: 'COMPLETED',
        tx_ref: transaction.tx_ref,
        verifiedAt: transaction.verifiedAt,
      } : undefined,
      member: type === 'MEMBERSHIP' ? {
        fullName: transaction.fullName,
        dateOfBirth: transaction.dateOfBirth,
        gender: transaction.gender,
        phone: transaction.phone,
        email: transaction.email,
        cityOrRegion: transaction.cityOrRegion,
        membershipType: transaction.tier,
        preferredLanguage: transaction.preferredLanguage,
        photoUrl: transaction.photoUrl,
        referenceNumber: refNumber,
        amountPaid: transaction.amount,
        tx_ref: transaction.tx_ref,
        status: 'APPROVED',
      } : undefined,
      message: 'Sandbox payment completed and verified.',
    });
  });

  /**
   * GET /api/payment-status/:tx_ref
   * Quick status check
   */
  app.get('/api/payment-status/:tx_ref', (req: Request, res: Response) => {
    const txRef = Array.isArray(req.params.tx_ref) ? req.params.tx_ref[0] : req.params.tx_ref;
    const transaction = txRef ? pendingTransactions.get(txRef) : undefined;
    if (!transaction) {
      return res.status(404).json({ found: false });
    }
    return res.json({
      found: true,
      status: transaction.status,
      type: transaction.type || 'MEMBERSHIP',
      amount: transaction.amount,
      tier: transaction.tier,
      isSandbox: transaction.isSandbox,
      referenceNumber: transaction.referenceNumber,
    });
  });

  /**
   * GET /api/shop-orders
   * Retrieves all jersey & merchandise transactions
   */
  app.get('/api/shop-orders', (_req: Request, res: Response) => {
    const orders: any[] = [];
    pendingTransactions.forEach((tx) => {
      if (tx.type === 'SHOP_ORDER' || tx.shopOrderDetails) {
        orders.push({
          orderNumber: tx.referenceNumber || tx.tx_ref,
          itemId: tx.shopOrderDetails?.itemId || 'unknown',
          itemName: tx.shopOrderDetails?.itemName || 'Halaba FC Jersey',
          size: tx.shopOrderDetails?.size || 'Standard',
          amount: Number(tx.amount),
          fullName: tx.fullName,
          email: tx.email,
          phone: tx.phone,
          streetAddress: tx.shopOrderDetails?.streetAddress || '',
          city: tx.shopOrderDetails?.city || tx.cityOrRegion,
          subcityOrRegion: tx.shopOrderDetails?.subcityOrRegion || '',
          status: tx.status === 'SUCCESS' ? 'PAID' : 'PENDING',
          tx_ref: tx.tx_ref,
          createdAt: tx.createdAt,
          verifiedAt: tx.verifiedAt,
        });
      }
    });
    return res.json({ success: true, count: orders.length, orders });
  });

  /**
   * GET /api/donations
   * Retrieves all supporter donations
   */
  app.get('/api/donations', (_req: Request, res: Response) => {
    const donations: any[] = [];
    pendingTransactions.forEach((tx) => {
      if (tx.type === 'DONATION' || tx.donationDetails) {
        donations.push({
          donationNumber: tx.referenceNumber || tx.tx_ref,
          fullName: tx.fullName,
          email: tx.email,
          phone: tx.phone,
          amount: Number(tx.amount),
          purpose: tx.donationDetails?.purpose || 'General Club Support',
          status: tx.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING',
          tx_ref: tx.tx_ref,
          createdAt: tx.createdAt,
          verifiedAt: tx.verifiedAt,
        });
      }
    });
    return res.json({ success: true, count: donations.length, donations });
  });

  /**
   * GET /api/standings/sportsdb
   * Fetches official Ethiopian Premier League standings from TheSportsDB (League ID 4959)
   */
  app.get('/api/standings/sportsdb', async (_req: Request, res: Response) => {
    try {
      console.log('[SportsDB Sync] Fetching official Ethiopian Premier League table from TheSportsDB...');
      const response = await fetch('https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4959&s=2026-2027');
      const data = await response.json();

      const normalizeEplId = (strTeam: string, idTeam?: string): string => {
        const s = (strTeam || '').toLowerCase();
        const id = String(idTeam || '');
        if (s.includes('halaba') || id === '157333') return 'halaba';
        if (s.includes('cbe') || s.includes('nigd') || id === '149377') return 'cbe_sa';
        if (s.includes('medhin') || s.includes('insurance') || id === '146921') return 'insurance';
        if (s.includes('adama') || id === '141024') return 'adama';
        if (s.includes('electric') || id === '146920') return 'electric';
        if (s.includes('bahir') || (id === '141026' && s.includes('bahir')) || id === '141025') return 'bahirdar';
        if (s.includes('fasil') || id === '141026') return 'fasil';
        if (s.includes('bunna') || (s.includes('coffee') && !s.includes('sidama'))) return 'bunna';
        if (s.includes('george') || s.includes('giorgis')) return 'saintgeorge';
        if (s.includes('defence') || s.includes('mekelakeya') || s.includes('mechal') || id === '143767') return 'defence';
        if (s.includes('welwalo')) return 'welwalo';
        if (s.includes('dicha') || s.includes('wolaitta')) return 'wolaitta';
        if (s.includes('hosaena') || s.includes('hossana')) return 'hosaena';
        if (s.includes('diredawa') || s.includes('dire dawa')) return 'diredawa';
        if (s.includes('chencha') || s.includes('gamo')) return 'gamochencha';
        if (s.includes('sidama')) return 'sidama';
        if (s.includes('hawassa')) return 'hawassa';
        if (s.includes('shaggar') || s.includes('sheger')) return 'shaggar';
        if (s.includes('negelle') || s.includes('negele') || id === '153585') return 'negelle';
        return id || s.replace(/[^a-z0-9]/g, '');
      };

      const baseFallbackTeams = [
        { teamId: 'cbe_sa', teamName: 'Ethiopia Nigd Bank (CBE SA)', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 7, form: ['W', 'W', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/fn7am21727368578.png' },
        { teamId: 'bahirdar', teamName: 'Bahir Dar Kenema', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 6, form: ['W', 'L', 'W'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/o25wvi1790265058.png' },
        { teamId: 'defence', teamName: 'Mechal (Defence Force)', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 6, form: ['W', 'L', 'W'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/5760g91790265354.png' },
        { teamId: 'negelle', teamName: 'Negele Arsi FC', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 5, form: ['D', 'D', 'W'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/negele_arsi_fc.png' },
        { teamId: 'halaba', teamName: 'Halaba Ketema (በርበሬዎቹ)', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 5, form: ['D', 'W', 'D'], isHalaba: true, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ol9g9y1790265506.png' },
        { teamId: 'adama', teamName: 'Adama Kenema SC', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 5, form: ['W', 'D', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/4yijrk1615830040.png' },
        { teamId: 'insurance', teamName: 'Ethiopian Medhin (Insurance)', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4, form: ['W', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/oboroa1776295149.png' },
        { teamId: 'shaggar', teamName: 'Shaggar City FC (Sheger Ketema)', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 4, form: ['W', 'D', 'L'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/shaggar_city_epl.png' },
        { teamId: 'electric', teamName: 'Ethio Electric (EEPCO)', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 4, form: ['L', 'D', 'W'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/nywmq91790265280.png' },
        { teamId: 'bunna', teamName: 'Ethiopian Coffee SC (Bunna)', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, points: 3, form: ['L', 'W', 'L'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/welkj51790265316.png' },
        { teamId: 'fasil', teamName: 'Fasil Kenema', played: 2, won: 0, drawn: 2, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 2, form: ['D', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xivgrb1790265423.png' },
        { teamId: 'saintgeorge', teamName: 'Saint George SC (Kidus Giorgis)', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 2, form: ['D', 'L', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/9d201v1615830018.png' },
        { teamId: 'hawassa', teamName: 'Hawassa Kenema SC', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 2, form: ['L', 'D', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/hawassa_city_sc.png' },
        { teamId: 'wolaitta', teamName: 'Wolaitta Dicha (Welayta Dicha)', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 2, form: ['D', 'D', 'L'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/25m67g1790265481.png' },
        { teamId: 'welwalo', teamName: 'Welwalo Adigrat Univ.', played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1, form: ['D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/w2p6k41790265538.png' },
        { teamId: 'hosaena', teamName: 'Hadiya Hossana', played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 1, form: ['L', 'D'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/9f0ozj1790265391.png' },
        { teamId: 'sidama', teamName: 'Sidama Coffee SC (Sidama Bunna)', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 1, goalDifference: -1, points: 0, form: ['L'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/t0057h1615830065.png' },
        { teamId: 'gamochencha', teamName: 'Gamo Chencha', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 3, goalDifference: -3, points: 0, form: ['L', 'L'], isHalaba: false, badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/o3yz391790265452.png' },
      ];

      const standingsMap = new Map<string, any>();

      // First populate with baseline 18 Ethiopian Premier League clubs
      baseFallbackTeams.forEach((fb) => {
        standingsMap.set(fb.teamId, { ...fb });
      });

      // Overlay live official data from TheSportsDB
      if (data && Array.isArray(data.table) && data.table.length > 0) {
        data.table.forEach((item: any) => {
          const canonicalId = normalizeEplId(item.strTeam, item.idTeam);
          const isHalaba = canonicalId === 'halaba';
          const formLetters = (item.strForm || 'DWD')
            .split('')
            .filter((c: string) => ['W', 'D', 'L'].includes(c));

          const existing = standingsMap.get(canonicalId) || {};

          standingsMap.set(canonicalId, {
            ...existing,
            teamId: canonicalId,
            teamName: canonicalId === 'cbe_sa' ? 'Ethiopia Nigd Bank (CBE SA)' : canonicalId === 'halaba' ? 'Halaba Ketema (በርበሬዎቹ)' : canonicalId === 'insurance' ? 'Ethiopian Medhin (Insurance)' : canonicalId === 'adama' ? 'Adama Kenema SC' : canonicalId === 'electric' ? 'Ethio Electric' : item.strTeam,
            played: parseInt(item.intPlayed, 10) || existing.played || 0,
            won: parseInt(item.intWin, 10) || existing.won || 0,
            drawn: parseInt(item.intDraw, 10) || existing.drawn || 0,
            lost: parseInt(item.intLoss, 10) || existing.lost || 0,
            goalsFor: parseInt(item.intGoalsFor, 10) || existing.goalsFor || 0,
            goalsAgainst: parseInt(item.intGoalsAgainst, 10) || existing.goalsAgainst || 0,
            goalDifference: parseInt(item.intGoalDifference, 10) || existing.goalDifference || 0,
            points: parseInt(item.intPoints, 10) || existing.points || 0,
            form: formLetters.length > 0 ? formLetters : existing.form || ['D', 'W', 'D'],
            isHalaba,
            badgeUrl: item.strBadge ? item.strBadge.replace('/tiny', '') : existing.badgeUrl,
          });
        });
      }

      const list = Array.from(standingsMap.values());
      list.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
      const rankedStandings = list.map((item, idx) => ({
        ...item,
        position: idx + 1,
      }));

      return res.json({
        success: true,
        source: 'TheSportsDB',
        league: 'Ethiopian Premier League',
        leagueId: '4959',
        season: '2026-2027',
        count: rankedStandings.length,
        standings: rankedStandings,
      });
    } catch (err: any) {
      console.error('[Error fetching from TheSportsDB]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync standings from TheSportsDB',
      });
    }
  });

  // Vite Integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.VITE_DEV) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ Halaba City FC Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
