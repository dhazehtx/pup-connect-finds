import { Request, Response, NextFunction } from 'express';

// AI Content Moderation Service
export class AIModerationService {
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/moderations';
  private static readonly BANNED_KEYWORDS = [
    'puppy mill', 'backyard breeder', 'sick puppy', 'fake papers',
    'no health records', 'cash only', 'meet in parking lot',
    'stolen dog', 'illegal breeding', 'underage puppy'
  ];

  // Content moderation using OpenAI API
  static async moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
    reasoning: string;
  }> {
    try {
      // Check for banned keywords first (fast local check)
      const keywordFlags = this.checkBannedKeywords(content);
      
      // If OpenAI API key is available, use AI moderation
      if (process.env.OPENAI_API_KEY) {
        const aiResult = await this.openAIModeration(content);
        
        return {
          flagged: keywordFlags.flagged || aiResult.flagged,
          categories: [...keywordFlags.categories, ...aiResult.categories],
          confidence: Math.max(keywordFlags.confidence, aiResult.confidence),
          reasoning: keywordFlags.reasoning + (aiResult.reasoning ? ' | ' + aiResult.reasoning : '')
        };
      }

      // Fallback to keyword-only moderation
      return keywordFlags;
    } catch (error) {
      console.error('Content moderation error:', error);
      // Return safe defaults on error
      return {
        flagged: false,
        categories: [],
        confidence: 0,
        reasoning: 'Moderation service temporarily unavailable'
      };
    }
  }

  // OpenAI API moderation
  private static async openAIModeration(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
    reasoning: string;
  }> {
    try {
      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.results[0];

      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      const maxScore = Math.max(...Object.values(result.category_scores) as number[]);

      return {
        flagged: result.flagged,
        categories: flaggedCategories,
        confidence: maxScore,
        reasoning: flaggedCategories.length > 0 
          ? `AI detected: ${flaggedCategories.join(', ')}` 
          : 'Content appears safe'
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      return {
        flagged: false,
        categories: [],
        confidence: 0,
        reasoning: 'AI moderation unavailable'
      };
    }
  }

  // Local keyword-based moderation
  private static checkBannedKeywords(content: string): {
    flagged: boolean;
    categories: string[];
    confidence: number;
    reasoning: string;
  } {
    const lowerContent = content.toLowerCase();
    const foundKeywords = this.BANNED_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );

    return {
      flagged: foundKeywords.length > 0,
      categories: foundKeywords.length > 0 ? ['inappropriate-content'] : [],
      confidence: foundKeywords.length > 0 ? 0.8 : 0,
      reasoning: foundKeywords.length > 0 
        ? `Banned keywords detected: ${foundKeywords.join(', ')}` 
        : 'No banned keywords found'
    };
  }

  // Image moderation (placeholder for future implementation)
  static async moderateImage(imageUrl: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
    reasoning: string;
  }> {
    // This could be implemented with Google Cloud Vision API, AWS Rekognition, etc.
    return {
      flagged: false,
      categories: [],
      confidence: 0,
      reasoning: 'Image moderation not yet implemented'
    };
  }
}

// Middleware for automatic content moderation
export const contentModerationMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Only moderate content creation/update endpoints
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    // List of endpoints that should be moderated
    const moderatedEndpoints = [
      '/api/posts',
      '/api/comments',
      '/api/listings',
      '/api/profiles'
    ];

    const shouldModerate = moderatedEndpoints.some(endpoint => 
      req.path.startsWith(endpoint)
    );

    if (!shouldModerate) {
      return next();
    }

    // Extract content fields to moderate
    const contentFields = ['content', 'description', 'bio', 'title', 'body'];
    const contentToModerate: string[] = [];

    for (const field of contentFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        contentToModerate.push(req.body[field]);
      }
    }

    if (contentToModerate.length === 0) {
      return next();
    }

    // Moderate combined content
    const combinedContent = contentToModerate.join(' ').substring(0, 2000); // Limit for API
    const moderationResult = await AIModerationService.moderateContent(combinedContent);

    if (moderationResult.flagged) {
      // Log the moderation hit for admin review
      console.warn('Content moderation flag:', {
        endpoint: req.path,
        userId: req.body.user_id || 'unknown',
        categories: moderationResult.categories,
        confidence: moderationResult.confidence,
        reasoning: moderationResult.reasoning,
        contentLength: combinedContent.length
      });

      // Return moderation error
      return res.status(400).json({
        error: 'Content violates community guidelines',
        details: 'Your content has been flagged by our moderation system. Please review our community guidelines and try again.',
        categories: moderationResult.categories,
        moderationId: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // Content passed moderation, continue
    next();
  } catch (error) {
    console.error('Content moderation middleware error:', error);
    // Don't block requests if moderation fails
    next();
  }
};

export default AIModerationService;