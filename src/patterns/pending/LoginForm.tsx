import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Stack,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  GitHub,
  Apple
} from '@mui/icons-material';

export interface LoginFormProps {
  onSubmit?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onSocialLogin?: (provider: 'google' | 'github' | 'apple') => void;
  variant?: 'default' | 'minimal' | 'social-first';
  showSocialLogins?: boolean;
  showRememberMe?: boolean;
  showSignUpLink?: boolean;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
  variant = 'default',
  showSocialLogins = true,
  showRememberMe = true,
  showSignUpLink = true,
  loading = false,
  error,
  title = 'Welcome back',
  subtitle = 'Sign in to your account'
}) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate
    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }
    
    if (!hasError && onSubmit) {
      onSubmit(email, password, rememberMe);
    }
  };

  const socialButtons = [
    { 
      provider: 'google' as const, 
      icon: <Google />, 
      label: 'Continue with Google',
      color: '#4285F4'
    },
    { 
      provider: 'github' as const, 
      icon: <GitHub />, 
      label: 'Continue with GitHub',
      color: theme.palette.mode === 'dark' ? '#fff' : '#24292e'
    },
    { 
      provider: 'apple' as const, 
      icon: <Apple />, 
      label: 'Continue with Apple',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000'
    }
  ];

  if (variant === 'minimal') {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {subtitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {showRememberMe && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Remember me"
                />
              )}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword?.();
                }}
                disabled={loading}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign in'}
            </Button>
          </Stack>
        </form>

        {showSignUpLink && (
          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link
              component="button"
              onClick={(e) => {
                e.preventDefault();
                onSignUp?.();
              }}
              disabled={loading}
            >
              Sign up
            </Link>
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'social-first') {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            {subtitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {showSocialLogins && (
            <>
              <Stack spacing={2}>
                {socialButtons.map((social) => (
                  <Button
                    key={social.provider}
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={social.icon}
                    onClick={() => onSocialLogin?.(social.provider)}
                    disabled={loading}
                    sx={{
                      borderColor: alpha(social.color, 0.5),
                      color: social.color,
                      '&:hover': {
                        borderColor: social.color,
                        bgcolor: alpha(social.color, 0.05),
                      }
                    }}
                  >
                    {social.label}
                  </Button>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                  or continue with email
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                autoComplete="email"
                size="small"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                disabled={loading}
                autoComplete="current-password"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Sign in'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              onClick={(e) => {
                e.preventDefault();
                onForgotPassword?.();
              }}
              disabled={loading}
              sx={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {showRememberMe && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
              )}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword?.();
                }}
                disabled={loading}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign in'}
            </Button>
          </Stack>
        </form>

        {showSocialLogins && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Stack spacing={2}>
              {socialButtons.map((social) => (
                <Button
                  key={social.provider}
                  fullWidth
                  variant="outlined"
                  startIcon={social.icon}
                  onClick={() => onSocialLogin?.(social.provider)}
                  disabled={loading}
                  sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  {social.label}
                </Button>
              ))}
            </Stack>
          </>
        )}

        {showSignUpLink && (
          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link
              component="button"
              onClick={(e) => {
                e.preventDefault();
                onSignUp?.();
              }}
              disabled={loading}
            >
              Sign up
            </Link>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};