import React from 'react';
import { Container, Paper } from '@mui/material';
import AuthForm from './AuthForm';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <AuthForm mode="register" />
      </Paper>
    </Container>
  );
};

export default RegisterPage; 