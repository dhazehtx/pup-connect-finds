import { Router } from 'express';

const router = Router();

// Demo endpoint to simulate fraud detection triggers
router.post('/simulate', async (req, res) => {
  const { scenario, userId } = req.body;
  
  try {
    // Simulate different fraud scenarios
    switch (scenario) {
      case 'banned_keywords':
        // Simulate response with banned keywords detection
        res.setHeader('X-Fraud-Score', '45');
        res.setHeader('X-Profile-Status', 'flagged');
        return res.json({
          success: true,
          message: 'Banned keywords detected in content',
          risk_factors: ['banned_keywords'],
          fraud_score: 45
        });
        
      case 'duplicate_listing':
        // Simulate duplicate listing detection
        res.setHeader('X-Fraud-Score', '70');
        res.setHeader('X-Profile-Status', 'under_review');
        return res.json({
          success: true,
          message: 'Duplicate listing content detected',
          risk_factors: ['duplicate_listing', 'rapid_listing_creation'],
          fraud_score: 70
        });
        
      case 'account_suspension':
        // Simulate account suspension
        return res.status(403).json({
          error: 'Account Suspended',
          message: 'Your account has been suspended due to suspicious activity.',
          profile_status: 'suspended',
          fraud_score: 95
        });
        
      case 'ip_mismatch':
        // Simulate IP mismatch detection
        res.setHeader('X-Fraud-Score', '35');
        res.setHeader('X-Profile-Status', 'flagged');
        return res.json({
          success: true,
          message: 'Login from unusual location detected',
          risk_factors: ['ip_mismatch'],
          fraud_score: 35
        });
        
      default:
        return res.status(400).json({
          error: 'Invalid scenario',
          available_scenarios: ['banned_keywords', 'duplicate_listing', 'account_suspension', 'ip_mismatch']
        });
    }
  } catch (error) {
    console.error('Error in fraud simulation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current fraud score for user (demo purposes)
router.get('/score/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Simulate getting fraud score from database
  const mockScores = {
    'demo-user-1': { score: 15, status: 'active', last_incident: 'none' },
    'demo-user-2': { score: 55, status: 'flagged', last_incident: 'banned_keywords' },
    'demo-user-3': { score: 78, status: 'under_review', last_incident: 'duplicate_listing' },
    'demo-user-4': { score: 95, status: 'suspended', last_incident: 'payment_fraud' }
  };
  
  const userScore = mockScores[userId as keyof typeof mockScores] || {
    score: Math.floor(Math.random() * 100),
    status: 'active',
    last_incident: 'none'
  };
  
  res.json({
    user_id: userId,
    fraud_score: userScore.score,
    profile_status: userScore.status,
    last_incident: userScore.last_incident,
    risk_level: userScore.score >= 70 ? 'high' : userScore.score >= 50 ? 'medium' : 'low'
  });
});

export default router;