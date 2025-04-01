import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Alert,
  Stack,
  styled,
  alpha,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { uploadCategoryDocument } from '../../services/api';

// Define financial document categories
export const FINANCIAL_CATEGORIES = [
  {
    id: 'operating-cost',
    name: 'Operating Cost',
    description: 'Upload an image of your operating costs statement',
    icon: <ImageIcon />,
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Upload an image of your balance sheet',
    icon: <ImageIcon />,
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Upload an image of your cash flow statement',
    icon: <ImageIcon />,
  },
  {
    id: 'profit',
    name: 'Profit',
    description: 'Upload an image of your profit statement',
    icon: <ImageIcon />,
  },
];

// Define types
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  category: string;
  uploadProgress?: number;
  downloadURL?: string;
  processed?: boolean;
  error?: string;
  fileId?: string;
}

interface CategoryFileUploadProps {
  onComplete: (files: UploadedFile[]) => void;
}

// Styled components
const UploadZone = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  height: '100%',
  minHeight: 180,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

const CategoryFileUpload: React.FC<CategoryFileUploadProps> = ({ onComplete }) => {
  const theme = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [uploading, setUploading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Setup dropzone for each category
  const onDrop = (category: string) => async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type - only images
    if (!file.type.startsWith('image/')) {
      setGeneralError('Only image files are accepted. Please upload an image file.');
      return;
    }

    const fileId = `${category}-${Date.now()}`;
    const filePreview = URL.createObjectURL(file);

    setUploadedFiles(prev => ({
      ...prev,
      [category]: {
        id: fileId,
        file,
        preview: filePreview,
        category,
        uploadProgress: 0
      }
    }));

    setGeneralError(null);
  };

  // Generic dropzone for each category
  const getDropzoneProps = (category: string) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: onDrop(category),
      accept: {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif']
      },
      maxFiles: 1,
    });

    return { getRootProps, getInputProps, isDragActive };
  };

  // Handle file removal
  const handleRemoveFile = (category: string) => {
    const fileToRemove = uploadedFiles[category];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[category];
      return newFiles;
    });
  };

  // Upload all files
  const handleUploadAll = async () => {
    setUploading(true);
    setGeneralError(null);
    
    try {
      // Skip Firebase upload - just prepare the files and call onComplete
      const files = Object.values(uploadedFiles);
      
      // Add a slight delay to simulate processing
      setTimeout(() => {
        setUploading(false);
        onComplete(files);
      }, 1000);
    } catch (error) {
      console.error('Error preparing files:', error);
      setGeneralError('There was a problem preparing your files. Please try again.');
      setUploading(false);
    }
  };

  // Check if all categories have files
  const allCategoriesUploaded = FINANCIAL_CATEGORIES.every(
    category => !!uploadedFiles[category.id]
  );

  // Check if at least one file has been uploaded
  const atLeastOneFileUploaded = Object.keys(uploadedFiles).length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload Financial Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please upload images for each of the following financial document categories. 
          You can upload up to 4 different images - one for each category.
        </Typography>
      </Box>

      {generalError && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {generalError}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {FINANCIAL_CATEGORIES.map((category) => {
          const file = uploadedFiles[category.id];
          const { getRootProps, getInputProps, isDragActive } = getDropzoneProps(category.id);
          
          return (
            <Grid item xs={12} md={6} key={category.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  border: file ? '1px solid' : 'none',
                  borderColor: file ? 'primary.main' : 'transparent',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  
                  {file ? (
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={file.preview}
                        alt={`${category.name} preview`}
                        sx={{ borderRadius: 1, objectFit: 'cover' }}
                      />
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Chip 
                          label={file.file.name.length > 15 
                            ? `${file.file.name.substring(0, 15)}...` 
                            : file.file.name
                          }
                          size="small"
                          sx={{ 
                            backgroundColor: alpha('#fff', 0.8),
                            backdropFilter: 'blur(4px)',
                          }}
                        />
                      </Box>
                      
                      {/* Upload indicator */}
                      {file.uploadProgress !== undefined && (
                        <>
                          {file.uploadProgress === 100 && !file.error && (
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: alpha(theme.palette.success.light, 0.9),
                                color: theme.palette.success.contrastText,
                                borderRadius: '16px',
                                padding: '4px 8px',
                              }}
                            >
                              <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">Uploaded</Typography>
                            </Box>
                          )}
                          
                          {file.uploadProgress > 0 && file.uploadProgress < 100 && (
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                width: `${file.uploadProgress}%`,
                                height: '4px',
                                backgroundColor: 'primary.main',
                                transition: 'width 0.3s ease-in-out'
                              }} 
                            />
                          )}
                        </>
                      )}
                      
                      {file.error && (
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mt: 1, 
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center' 
                          }}
                          icon={<ErrorIcon fontSize="small" />}
                        >
                          {file.error}
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <UploadZone 
                      {...getRootProps()} 
                      sx={{ 
                        bgcolor: isDragActive 
                          ? alpha('#2196f3', 0.08) 
                          : alpha('#f5f5f5', 0.8),
                        borderColor: isDragActive ? 'primary.main' : 'divider',
                        minHeight: 180
                      }}
                    >
                      <input {...getInputProps()} />
                      <CloudUploadIcon 
                        color="primary" 
                        sx={{ fontSize: 40, mb: 1 }} 
                      />
                      <Typography variant="body2" align="center" sx={{ mb: 1 }}>
                        {isDragActive
                          ? 'Drop image here...'
                          : 'Drag & drop an image, or click to select'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        {category.description}
                      </Typography>
                    </UploadZone>
                  )}
                </CardContent>
                
                {file && (
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemoveFile(category.id)}
                      disabled={uploading}
                      sx={{ ml: 'auto' }}
                    >
                      Remove
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        sx={{ mt: 4, width: '100%' }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!atLeastOneFileUploaded || uploading}
          onClick={handleUploadAll}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {uploading 
            ? 'Processing...' 
            : allCategoriesUploaded 
              ? 'Continue with All Documents' 
              : 'Continue with Selected Documents'
          }
        </Button>
      </Stack>
    </Box>
  );
};

export default CategoryFileUpload; 