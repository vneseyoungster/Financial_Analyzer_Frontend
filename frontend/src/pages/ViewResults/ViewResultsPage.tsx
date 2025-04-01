import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FinancialCharts from '../../components/Visualization/FinancialCharts';
import { UploadedFile, FINANCIAL_CATEGORIES } from '../../components/FileUpload/CategoryFileUpload';

// Constants - add if using API directly in this component
// const API_BASE_URL = 'http://localhost:1234';

// Types for processing results
interface ProcessingResultFile {
  ocr: string;
  parsing: string;
  analysis: string;
  json?: string;
}

export interface FinancialMetric {
  value: number | string;
  from?: string;
  to?: string;
}

interface ProcessingResult {
  success: boolean;
  ocr_text: string;
  parsing_results: string;
  financial_analysis: string;
  financial_data?: Record<string, FinancialMetric>;
  files: ProcessingResultFile;
  error?: string;
}

const ViewResultsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = () => {
      setIsLoading(true);

      // Check if processing is complete
      const isComplete = sessionStorage.getItem('processingComplete');
      if (!isComplete) {
        // If not processed, redirect to upload page
        navigate('/upload-documents');
        return;
      }
      setProcessingComplete(true);

      try {
        // Get uploaded files
        const filesJson = sessionStorage.getItem('uploadedFiles');
        if (filesJson) {
          const files = JSON.parse(filesJson) as UploadedFile[];
          setUploadedFiles(files);
        }

        // Get processing results
        const resultsJson = sessionStorage.getItem('processingResults');
        if (resultsJson) {
          const results = JSON.parse(resultsJson) as ProcessingResult[];
          setProcessingResults(results);
        } else {
          setError('No processing results found. Please try again.');
        }
      } catch (error) {
        console.error('Error loading results:', error);
        setError('Failed to load results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [navigate]);

  const handleStartOver = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem('uploadedFilesMetadata');
    sessionStorage.removeItem('processingComplete');
    sessionStorage.removeItem('processingResults');
    
    // Clear window object storage
    if (window.uploadedFiles) {
      window.uploadedFiles = [];
    }
    
    // Navigate back to upload page
    navigate('/upload-documents');
  }, [navigate]);

  // Extract and combine all financial data from results
  const getFinancialData = useCallback(() => {
    const combinedData: Record<string, FinancialMetric> = {};
    
    processingResults.forEach(result => {
      if (result.success && result.financial_data) {
        Object.entries(result.financial_data).forEach(([key, value]) => {
          // If metric already exists, prefer the one with a value
          if (!combinedData[key] || 
              (combinedData[key].value === undefined && value.value !== undefined)) {
            combinedData[key] = value;
          }
        });
      }
    });
    
    return combinedData;
  }, [processingResults]);

  // Get count of uploaded files by category
  const getUploadedFilesStats = useCallback(() => {
    if (uploadedFiles.length === 0) return { 
      count: 0, 
      categories: [],
      successCount: 0,
      errorCount: 0
    };
    
    const categories = uploadedFiles.map(file => {
      const category = FINANCIAL_CATEGORIES.find(cat => cat.id === file.category);
      return category ? category.name : file.category;
    });
    
    return {
      count: uploadedFiles.length,
      categories,
      successCount: processingResults.filter(r => r.success).length,
      errorCount: processingResults.filter(r => !r.success).length
    };
  }, [uploadedFiles, processingResults]);

  // Format currency values
  const formatCurrency = (value: number | string): string => {
    if (typeof value === 'string') {
      // Try to convert string to number, removing any formatting
      const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      if (isNaN(numericValue)) return value;
      value = numericValue;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const stats = getUploadedFilesStats();
  const financialData = getFinancialData();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Financial Analysis Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review insights from your financial documents
          </Typography>
        </Box>
        
        {error ? (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            Analysis complete! Review your financial insights below.
          </Alert>
        )}
        
        <Box sx={{ width: '100%', flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Upload Status Summary
                </Typography>
                <Typography variant="body1">
                  Successfully analyzed {stats.successCount} of {stats.count} {stats.count === 1 ? 'document' : 'documents'}
                </Typography>
                {stats.errorCount > 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {stats.errorCount} {stats.errorCount === 1 ? 'document' : 'documents'} had errors during processing
                  </Typography>
                )}
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleStartOver}
                  sx={{ mt: 2 }}
                >
                  Upload New Documents
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <FinancialCharts 
                loading={isLoading} 
                data={{ 
                  // Pass through existing sample data
                  periods: [], 
                  cashFlowOperating: [],
                  cashInflows: {
                    operatingActivities: [],
                    investingActivities: [],
                    financingActivities: []
                  },
                  cashOutflows: {
                    operatingActivities: [],
                    investingActivities: [],
                    financingActivities: []
                  },
                  netIncomeComponents: {
                    labels: [],
                    values: []
                  },
                  // Pass the financial metrics data from processing results
                  financialMetrics: financialData
                }}
              />
            </Grid>
            
            {Object.keys(financialData).length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Financial Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Display extracted financial data metrics */}
                    {['revenue', 'income', 'profit', 'assets', 'cash_flow', 'operating_cost']
                      .filter(key => financialData[key])
                      .map((key, index) => (
                        <Grid item xs={12} md={4} key={key}>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Typography>
                            <Typography variant="h5">
                              {typeof financialData[key]?.value === 'number' || 
                               (typeof financialData[key]?.value === 'string' && 
                                !isNaN(parseFloat(financialData[key]?.value as string)))
                                ? formatCurrency(financialData[key]?.value as number | string)
                                : financialData[key]?.value || 'N/A'}
                            </Typography>
                            {financialData[key]?.from && financialData[key]?.to && (
                              <Typography variant="body2" color="text.secondary">
                                {financialData[key]?.from} to {financialData[key]?.to}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    
                    {/* Show other miscellaneous metrics */}
                    {Object.entries(financialData)
                      .filter(([key]) => !['revenue', 'income', 'profit', 'assets', 'cash_flow', 'operating_cost'].includes(key))
                      .map(([key, value]) => (
                        <Grid item xs={12} md={4} key={key}>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Typography>
                            <Typography variant="h5">
                              {typeof value.value === 'number' || 
                               (typeof value.value === 'string' && !isNaN(parseFloat(value.value as string)))
                                ? formatCurrency(value.value as number | string)
                                : value.value || 'N/A'}
                            </Typography>
                            {value.from && value.to && (
                              <Typography variant="body2" color="text.secondary">
                                {value.from} to {value.to}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
            
            {/* Document Processing Details */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Document Processing Details
                </Typography>
                
                {processingResults.map((result, index) => (
                  <Accordion key={index} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>
                          {uploadedFiles[index]?.file.name || `Document ${index + 1}`}
                        </Typography>
                        <Chip 
                          label={result.success ? "Success" : "Failed"} 
                          color={result.success ? "success" : "error"} 
                          size="small" 
                          sx={{ ml: 2 }} 
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {result.error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {result.error}
                        </Alert>
                      ) : (
                        <>
                          {/* OCR Text Preview */}
                          <Typography variant="subtitle2">OCR Text Preview:</Typography>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              my: 2, 
                              maxHeight: '200px', 
                              overflow: 'auto',
                              bgcolor: 'background.default',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem'
                            }}
                          >
                            {result.ocr_text?.substring(0, 500)}
                            {result.ocr_text?.length > 500 && '...'}
                          </Paper>
                          
                          {/* Financial Data */}
                          {result.financial_data && Object.keys(result.financial_data).length > 0 && (
                            <>
                              <Typography variant="subtitle2">Extracted Financial Data:</Typography>
                              <List dense>
                                {Object.entries(result.financial_data).map(([key, value]) => (
                                  <ListItem key={key}>
                                    <ListItemText 
                                      primary={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                                      secondary={
                                        <>
                                          Value: {value.value}
                                          {value.from && value.to && ` (${value.from} to ${value.to})`}
                                        </>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          AI Financial Report Analyzer &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default ViewResultsPage; 