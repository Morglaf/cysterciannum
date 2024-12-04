import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from '@mui/material';

const AccountSettings: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleUpdateEmail = async () => {
    // TODO: Implémenter la mise à jour de l'email
    console.log('Update email:', email);
  };

  const handleDeleteAccount = async () => {
    // TODO: Implémenter la suppression du compte
    console.log('Delete account confirmed');
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('menu.account')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label={t('account.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateEmail}
            sx={{ mt: 2 }}
          >
            {t('account.updateEmail')}
          </Button>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDialog(true)}
          >
            {t('account.deleteAccount')}
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('account.deleteAccount')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('account.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountSettings; 