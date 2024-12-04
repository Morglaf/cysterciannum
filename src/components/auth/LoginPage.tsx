import { useState } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { useAuth } from './AuthProvider';
import AuthForm from './AuthForm';

const LoginPage = () => {
  const { loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <AuthForm 
        mode={mode} 
        onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')} 
      />
    </Container>
  );
};

export default LoginPage; 