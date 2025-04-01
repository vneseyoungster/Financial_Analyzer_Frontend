import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  CircularProgress,
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UploadedFile, FINANCIAL_CATEGORIES } from '../../components/FileUpload/CategoryFileUpload';
import axios from 'axios';

// Constants
const API_BASE_URL = 'http://192.168.1.119:5001';  // Update to match the Flask server port

// Types
interface ProcessingResult {
  success: boolean;
  ocr_text: string;
  parsing_results: string;
  financial_analysis: string;
  financial_data?: Record<string, unknown>;
  files: {
    ocr: string;
    parsing: string;
    analysis: string;
    json?: string;
  };
  error?: string;
}

interface ProcessingError {
  fileName: string;
  message: string;
}

interface FileMetadata {
  id: string;
  category: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
}

const ProcessingDocumentsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const processedRef = useRef(false); // Add a ref to track if we've already processed
  
  // State management
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [errors, setErrors] = useState<ProcessingError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process a single file
  const processFile = useCallback(async (file: UploadedFile): Promise<ProcessingResult> => {
    // Create a unique identifier for this file
    const fileIdentifier = `${file.category}-${file.file.name || 'unknown'}`;
    
    // Check if we've already processed this file (for extra safety)
    if (file.processed) {
      console.log(`Skipping already processed file: ${fileIdentifier}`);
      return {
        success: true,
        ocr_text: 'Already processed', 
        parsing_results: '',
        financial_analysis: '',
        files: { ocr: '', parsing: '', analysis: '' },
        error: ''
      };
    }
    
    // Mark file as processed
    file.processed = true;
    
    const formData = new FormData();
    
    // Add the file to the form data
    if (file.file instanceof File) {
      console.log(`Appending file to form data: ${file.file.name} (${file.file.type}), size: ${file.file.size} bytes`);
      formData.append('document', file.file);
      
      // Log FormData contents for debugging
      for (const pair of formData.entries()) {
        console.log(`FormData contains: ${pair[0]}, ${pair[1]}`);
      }
    } else {
      throw new Error('No valid file available for processing');
    }
    
    // Add category as a form field
    if (file.category) {
      formData.append('category', file.category);
    }
    
    try {
      console.log(`Sending file ${file.file.name} to ${API_BASE_URL}/api/process-document`);
      
      // Log request details for debugging
      console.log('Request details:', {
        url: `${API_BASE_URL}/api/process-document`,
        method: 'POST',
        contentType: 'multipart/form-data',
        fileSize: file.file.size,
        fileName: file.file.name,
        fileType: file.file.type
      });
      
      const response = await axios.post<ProcessingResult>(
        `${API_BASE_URL}/api/process-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout
        }
      );
      
      console.log('Processing response received:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error details:', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config
        });
        
        const errorMessage = error.response?.data?.error || 
                            `Network error processing ${file.file.name}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }, []);

  // Process all files
  const processAllFiles = useCallback(async () => {
    // Get files from window.uploadedFiles
    const files = window.uploadedFiles;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('No files to process');
      return;
    }

    console.log(`Starting to process ${files.length} files:`, 
      files.map(file => 
        `${file.category}-${file.file.name || 'unknown'}`
      )
    );

    try {
      setIsProcessing(true);
      setProcessingProgress(10); // Start progress
      
      // Set uploadedFiles for UI display
      setUploadedFiles(files);
      
      // Filter out already processed files
      const unprocessedFiles = files.filter(file => !file.processed);
      
      if (unprocessedFiles.length === 0) {
        console.log('No new files to process, all files were already processed');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/view-results');
        }, 1000);
        return;
      }
      
      console.log(`Processing ${unprocessedFiles.length} unprocessed files`);
      
      // Process files one by one for better control and progress tracking
      const results: ProcessingResult[] = [];
      let processed = 0;
      
      for (const file of unprocessedFiles) {
        try {
          console.log(`Processing file ${file.category}-${file.file.name}`);
          const result = await processFile(file);
          results.push(result);
          
          // Update progress
          processed++;
          const progressPercentage = 10 + (processed / unprocessedFiles.length) * 90;
          setProcessingProgress(progressPercentage);
          
        } catch (error) {
          console.error(`Error processing file:`, error);
          // Add error result
          results.push({
            success: false,
            ocr_text: '',
            parsing_results: '',
            financial_analysis: '',
            files: { ocr: '', parsing: '', analysis: '' },
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          // Still update progress
          processed++;
          const progressPercentage = 10 + (processed / unprocessedFiles.length) * 90;
          setProcessingProgress(progressPercentage);
        }
      }
      
      // Update state with results
      setResults(results);
      setErrors([]);
      setIsProcessing(false);
      setProcessingComplete(true);
      setProcessingProgress(100);
      
      // Store results in sessionStorage for results page
      sessionStorage.setItem('processingResults', JSON.stringify(results));
      sessionStorage.setItem('processingComplete', 'true');
      
      // Auto-navigate to results after a delay
      setTimeout(() => {
        navigate('/view-results');
      }, 2000);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrors([{ 
        fileName: 'Processing error', 
        message: error instanceof Error ? error.message : 'Failed to process files' 
      }]);
      setIsProcessing(false);
    }
  }, [processFile, navigate, setIsProcessing, setProcessingProgress, setResults, setErrors, setProcessingComplete]);

  // Initialize processing on component mount
  useEffect(() => {
    // Test the API connection
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection...');
        const testResponse = await axios.get(`${API_BASE_URL}/`);
        console.log('API test response:', testResponse.status, testResponse.data);
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    
    testApiConnection();
    
    // Add additional check to prevent duplicate processing
    if (processedRef.current) {
      console.log('Files have already been processed in this session, skipping duplicate processing');
      return;
    }
    
    const initializeProcessing = async () => {
      // Mark as processed immediately to prevent race conditions
      processedRef.current = true;
      
      // Check if we have files in the window object
      const files = window.uploadedFiles;
      
      if (files && Array.isArray(files) && files.length > 0) {
        console.log(`Found ${files.length} files in window.uploadedFiles, starting processing`);
        
        // Set the uploaded files for display
        setUploadedFiles(files);
        
        // Start processing the files
        await processAllFiles();
        return;
      }
      
      // If we don't have files, check session storage as fallback
      const sessionData = sessionStorage.getItem('uploadedFilesMetadata');
      if (sessionData) {
        try {
          console.log('Files not found in window object, trying session storage');
          // We'll redirect to upload page since we can't process without the actual File objects
          navigate('/upload-documents');
        } catch (error) {
          console.error('Error initializing from session storage:', error);
          navigate('/upload-documents');
        }
      } else {
        // No files to process, redirect to upload
        console.log('No files found for processing, redirecting to upload page');
        navigate('/upload-documents');
      }
    };

    initializeProcessing();
  }, [processAllFiles, navigate]);

  // Get categories of the uploaded files
  const getCategories = useCallback(() => {
    return uploadedFiles.map(file => {
      const category = FINANCIAL_CATEGORIES.find(cat => cat.id === file.category);
      return category ? category.name : file.category;
    });
  }, [uploadedFiles]);

  // Handle manual navigation to results
  const handleManualContinue = useCallback(() => {
    navigate('/view-results');
  }, [navigate]);

  // Early return while processing
  if (!uploadedFiles.length && !errors.length) {
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
            Processing Documents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Our AI is analyzing your financial documents
          </Typography>
        </Box>
        
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {errors.length === 1 
              ? `Error: ${errors[0].message}` 
              : `${errors.length} errors occurred during processing. See results page for details.`}
          </Alert>
        )}
        
        {processingComplete ? (
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            Processing complete! Preparing your results...
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            Your documents are being processed. This may take several minutes depending on document complexity...
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center', p: 5, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress 
            variant="determinate" 
            value={processingProgress} 
            size={80} 
            thickness={4}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">
              {processingComplete 
                ? 'Analysis Complete!' 
                : `Processing... ${Math.round(processingProgress)}%`}
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            {processingComplete 
              ? `All documents have been analyzed${errors.length ? ' with some errors' : ' successfully'}.` 
              : 'Our AI is extracting data, performing OCR, and analyzing your financial documents.'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {processingComplete
              ? 'You will be redirected to the results page in a moment.'
              : 'This typically takes 2-5 minutes per document, depending on complexity.'}
          </Typography>
          
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Processing categories:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getCategories().map((category, index) => (
                  <Typography key={index} variant="body2">
                    • {category} {processingProgress >= ((index + 1) / uploadedFiles.length) * 100 ? '✓' : ''}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          
          {processingComplete && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleManualContinue}
              sx={{ mt: 3 }}
              disabled={isProcessing}
            >
              View Results
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessingDocumentsPage; 