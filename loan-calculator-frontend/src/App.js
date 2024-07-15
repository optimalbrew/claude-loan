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
  const [purch_price, setPurchPrice] = useState('1850000');
  const [down_payment, setDownPayment] = useState('10.0');
  const [annual_rate_first, setAnnualRateFirst] = useState('7.0');
  const [annual_rate_map, setAnnualRateMap] = useState('3.0');
  const [duration, setDuration] = useState('20');
  const [prop_tax_and_ins, setPropTaxIns] = useState('1.5');
  const [hoa, setHOA] = useState('450.0');
  
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:9000', {
      //const response = await fetch('https://***********.execute-api.us-west-2.amazonaws.com/default/mortage_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purch_price: parseFloat(purch_price),
          down_payment: parseFloat(down_payment),
          annual_rate_first: parseFloat(annual_rate_first),
          duration: parseInt(duration),
          annual_rate_map: parseFloat(annual_rate_map),
          prop_tax_and_ins: parseFloat(prop_tax_and_ins),
          hoa: parseFloat(hoa),
        }),
        credentials: 'omit',
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
            MAP Payment Calculator
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    variant="outlined"
                    type="number"
                    value={purch_price}
                    onChange={(e) => setPurchPrice(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Down Payment"
                    variant="outlined"
                    type="number"
                    value={down_payment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Interest Rate Conventional"
                    variant="outlined"
                    type="number"
                    value={annual_rate_first}
                    onChange={(e) => setAnnualRateFirst(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Interest Rate MAP"
                    variant="outlined"
                    type="number"
                    value={annual_rate_map}
                    onChange={(e) => setAnnualRateMap(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Loan Duration (years)"
                    variant="outlined"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end"></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Tax and Insurance"
                    variant="outlined"
                    type="number"
                    value={prop_tax_and_ins}
                    onChange={(e) => setPropTaxIns(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="HOA (monthly)"
                    variant="outlined"
                    type="number"
                    value={hoa}
                    onChange={(e) => setHOA(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
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