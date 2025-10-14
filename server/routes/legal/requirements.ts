import { Router } from 'express';

const router = Router();

// Legal requirements database - can be moved to actual DB later
const REQUIREMENTS = {
  TX: {
    pet_sitting: { requires_license: false, hard_block: false },
    dog_training: { requires_license: true, hard_block: true, info: "Texas requires professional certification for dog training services" },
    grooming: { requires_license: true, hard_block: false, info: "Grooming license recommended but not strictly enforced" },
    veterinary: { requires_license: true, hard_block: true, info: "Veterinary license required by Texas law" },
  },
  CA: {
    pet_sitting: { requires_license: false, hard_block: false },
    dog_training: { requires_license: true, hard_block: true, info: "California requires CPDT certification for professional trainers" },
    grooming: { requires_license: true, hard_block: true, info: "California requires grooming license" },
    veterinary: { requires_license: true, hard_block: true, info: "Veterinary license required by California law" },
  },
  NY: {
    pet_sitting: { requires_license: false, hard_block: false },
    dog_training: { requires_license: true, hard_block: false, info: "New York recommends professional certification" },
    grooming: { requires_license: true, hard_block: true, info: "New York requires grooming license" },
    veterinary: { requires_license: true, hard_block: true, info: "Veterinary license required by New York law" },
  },
};

// GET /api/legal/requirements?state=TX&category=dog_training
router.get('/requirements', (req, res) => {
  const { state, category } = req.query;

  if (!state || !category) {
    return res.status(400).json({ error: 'Missing state or category parameter' });
  }

  const stateCode = (state as string).toUpperCase();
  const serviceCategory = (category as string).toLowerCase().replace(/\s+/g, '_');

  const stateRules = REQUIREMENTS[stateCode as keyof typeof REQUIREMENTS];
  if (!stateRules) {
    // Default: no requirement for unknown states
    return res.json({ rule: { requires_license: false, hard_block: false } });
  }

  const rule = stateRules[serviceCategory as keyof typeof stateRules];
  if (!rule) {
    // Default: no requirement for unknown categories
    return res.json({ rule: { requires_license: false, hard_block: false } });
  }

  res.json({ rule });
});

export default router;
