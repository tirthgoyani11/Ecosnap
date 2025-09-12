/**
 * Environment Configuration Validator
 * Helps diagnose API configuration issues
 */

interface EnvValidation {
  isValid: boolean;
  service: string;
  status: 'configured' | 'missing' | 'invalid';
  message: string;
}

export class EnvironmentValidator {
  /**
   * Validate all environment variables
   */
  static validateEnvironment(): EnvValidation[] {
    const validations: EnvValidation[] = [];

    // Check Supabase configuration
    validations.push(this.validateSupabase());
    
    // Check Gemini AI configuration  
    validations.push(this.validateGemini());
    
    // Check Unsplash configuration
    validations.push(this.validateUnsplash());
    
    // Check Carbon Interface configuration
    validations.push(this.validateCarbon());

    return validations;
  }

  /**
   * Validate Supabase configuration
   */
  private static validateSupabase(): EnvValidation {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return {
        isValid: false,
        service: 'Supabase',
        status: 'missing',
        message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY required'
      };
    }

    if (!url.startsWith('https://') || !key.startsWith('eyJ')) {
      return {
        isValid: false,
        service: 'Supabase',
        status: 'invalid',
        message: 'Invalid Supabase URL or anon key format'
      };
    }

    return {
      isValid: true,
      service: 'Supabase',
      status: 'configured',
      message: 'Supabase configured correctly'
    };
  }

  /**
   * Validate Gemini AI configuration
   */
  private static validateGemini(): EnvValidation {
    const key = import.meta.env.VITE_GEMINI_API_KEY;

    if (!key) {
      return {
        isValid: false,
        service: 'Gemini AI',
        status: 'missing',
        message: 'VITE_GEMINI_API_KEY required for AI features'
      };
    }

    if (!key.startsWith('AIza')) {
      return {
        isValid: false,
        service: 'Gemini AI',
        status: 'invalid',
        message: 'Invalid Gemini API key format'
      };
    }

    return {
      isValid: true,
      service: 'Gemini AI',
      status: 'configured',
      message: 'Gemini AI configured correctly'
    };
  }

  /**
   * Validate Unsplash configuration
   */
  private static validateUnsplash(): EnvValidation {
    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!key) {
      return {
        isValid: false,
        service: 'Unsplash',
        status: 'missing',
        message: 'VITE_UNSPLASH_ACCESS_KEY required for product images'
      };
    }

    return {
      isValid: true,
      service: 'Unsplash',
      status: 'configured',
      message: 'Unsplash configured correctly'
    };
  }

  /**
   * Validate Carbon Interface configuration
   */
  private static validateCarbon(): EnvValidation {
    const key = import.meta.env.VITE_CARBON_INTERFACE_KEY;

    if (!key) {
      return {
        isValid: false,
        service: 'Carbon Interface',
        status: 'missing',
        message: 'VITE_CARBON_INTERFACE_KEY optional for carbon footprint calculations'
      };
    }

    return {
      isValid: true,
      service: 'Carbon Interface',
      status: 'configured',
      message: 'Carbon Interface configured correctly'
    };
  }

  /**
   * Log environment status to console
   */
  static logEnvironmentStatus(): void {
    console.log('🔧 Environment Configuration Status:');
    const validations = this.validateEnvironment();
    
    validations.forEach(validation => {
      const icon = validation.isValid ? '✅' : '⚠️';
      const status = validation.status.toUpperCase();
      console.log(`${icon} ${validation.service}: ${status} - ${validation.message}`);
    });

    const configuredCount = validations.filter(v => v.isValid).length;
    console.log(`\n📊 Services configured: ${configuredCount}/${validations.length}`);
    
    if (configuredCount < validations.length) {
      console.warn('⚠️ Some services not configured - app will use fallbacks');
    }
  }

  /**
   * Get fallback strategy for missing services
   */
  static getFallbackStrategy(): string[] {
    const validations = this.validateEnvironment();
    const strategies: string[] = [];

    validations.forEach(validation => {
      if (!validation.isValid) {
        switch (validation.service) {
          case 'Supabase':
            strategies.push('Use local storage for caching');
            break;
          case 'Gemini AI':
            strategies.push('Use rule-based eco scoring');
            break;
          case 'Unsplash':
            strategies.push('Use placeholder images');
            break;
          case 'Carbon Interface':
            strategies.push('Use estimated carbon calculations');
            break;
        }
      }
    });

    return strategies;
  }
}

export default EnvironmentValidator;
