import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface FieldErrors {
  email?: string;
  password?: string;
}

const LoginPage = () => {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!isValidEmail(email.trim())) {
      errors.email = t('validation.emailInvalid');
    }

    // Password validation
    if (!password) {
      errors.password = t('validation.passwordRequired');
    } else if (password.length < 6) {
      errors.password = t('validation.passwordMinLength');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear field error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
    if (loginError) setLoginError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
    if (loginError) setLoginError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        toast({
          title: t('login.success'),
          description: t('login.welcomeMessage'),
        });
        navigate('/dashboard');
      } else {
        const errorMsg = result.error?.message || tCommon('errors.generic');
        setLoginError(errorMsg);
        toast({
          title: t('login.error'),
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      // This should rarely happen since AuthContext handles errors
      toast({
        title: tCommon('errors.generic'),
        description: t('errors.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      {/* Language switcher in corner */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
        <LanguageSwitcher />
      </div>
      
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Plane className="h-10 w-10 text-primary" aria-label="Demo Travel Agency" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{tCommon('company.name')}</CardTitle>
            <CardDescription className="text-base">
              {t('login.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`h-11 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`h-11 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rtl:right-auto rtl:left-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 w-full text-base font-bold"
              disabled={isLoading}
            >
              {isLoading ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            <p className="mb-2 font-bold text-foreground">{t('login.demoAccounts')}</p>
            <div className="space-y-1 font-mono text-muted-foreground">
              <div><span className="font-bold text-foreground">{t('login.admin')}:</span> admin@demo.com</div>
              <div><span className="font-bold text-foreground">{t('login.employee')}:</span> employee@demo.com</div>
              <div className="pt-1 italic">{t('login.passwordHint')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
