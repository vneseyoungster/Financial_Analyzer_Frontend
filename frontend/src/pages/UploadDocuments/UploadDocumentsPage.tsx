import React, { createContext, useContext } from 'react';
import { Container, Box, Typography, Paper, useTheme } from '@mui/material';
import CategoryFileUpload, { UploadedFile } from '../../components/FileUpload/CategoryFileUpload';
import { useNavigate } from 'react-router-dom';

// Create a global context to store File objects that can't be serialized
export const FileContext = createContext<UploadedFile[]>([]);

// Create a provider component
export const FileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  
  return (
    <FileContext.Provider value={files}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to use the FileContext
export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

// Export a setter function to update the files
export const useSetFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useSetFiles must be used within a FileProvider');
  }
  return (files: UploadedFile[]) => {
    // @ts-ignore - We know this exists but TypeScript doesn't recognize it
    context.setFiles(files);
  };
};

const UploadDocumentsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Use sessionStorage only for metadata
  const handleUploadComplete = (files: UploadedFile[]) => {
    // Store files in memory instead of uploading to Firebase
    // We'll use window.uploadedFiles as a simple global store
    // In a real app, you'd use Context API or a state management library
    window.uploadedFiles = files;
    
    // Store minimal metadata in sessionStorage for page refreshes
    const metadataForStorage = files.map(file => ({
      id: file.id,
      category: file.category,
      originalFileName: file.file.name,
      fileType: file.file.type,
      fileSize: file.file.size,
    }));
    
    sessionStorage.setItem('uploadedFilesMetadata', JSON.stringify(metadataForStorage));
    
    // Navigate to the processing page
    navigate('/processing-documents');
  };

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
            Upload Financial Documents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Start by uploading images of your financial documents
          </Typography>
        </Box>
        
        <CategoryFileUpload onComplete={handleUploadComplete} />
      </Paper>
    </Box>
  );
};

// Add this to make TypeScript happy
declare global {
  interface Window {
    uploadedFiles: UploadedFile[];
  }
}

export default UploadDocumentsPage; 