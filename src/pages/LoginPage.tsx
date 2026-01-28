import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import logoElHikma from '@/assets/logo-elhikma.png';

interface FieldErrors {
  email?: string;
  password?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
      errors.email = "L'email est requis";
    } else if (!isValidEmail(email.trim())) {
      errors.email = "Format d'email invalide";
    }

    // Password validation
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear field error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
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
          title: 'Connexion réussie',
          description: 'Bienvenue sur votre tableau de bord',
        });
        navigate('/dashboard');
      } else {
        // Show specific error message from the login result
        toast({
          title: 'Erreur de connexion',
          description: result.error?.message || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // This should rarely happen since AuthContext handles errors
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue lors de la connexion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 p-2">
            <img
              src={logoElHikma}
              alt="El Hikma Tourisme Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">El Hikma Tourisme</CardTitle>
            <CardDescription className="text-base">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
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
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`h-11 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-bold text-muted-foreground mb-2">
              Comptes de démonstration :
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Admin :</span> admin@elhikma.dz / Admin@123
              </p>
              <p>
                <span className="font-medium">Employé :</span> sarah@elhikma.dz / Employee@123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
