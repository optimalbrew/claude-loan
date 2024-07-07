import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Grid,
  InputAdornment
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#388e3c',
    },
  },
});

function App() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [years, setYears] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal: parseFloat(principal),
          annual_rate: parseFloat(annualRate),
          years: parseInt(years),
        }),
      });
      const data = await response.json();
      setMonthlyPayment(data.monthly_payment);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Loan Calculator
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Principal"
                    variant="outlined"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Interest Rate"
                    variant="outlined"
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Loan Duration"
                    variant="outlined"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">years</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? 'Calculating...' : 'Calculate'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
          {monthlyPayment !== null && (
            <Paper elevation={3} sx={{ mt: 3, p: 3, backgroundColor: 'secondary.light' }}>
              <Typography variant="h5" component="h2" gutterBottom align="center">
                Monthly Payment
              </Typography>
              <Typography variant="h4" component="p" align="center" color="secondary.dark">
                <AttachMoneyIcon fontSize="large" />
                {monthlyPayment.toFixed(2)}
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;