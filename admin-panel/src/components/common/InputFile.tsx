import React, { ChangeEvent, useRef, useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface InputFileProps {
  onChange: (file: File) => void;
  label: string;
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  touched?: boolean;
}

const InputFile: React.FC<InputFileProps> = ({
  onChange,
  label,
  accept = 'image/*',
  disabled = false,
  loading = false,
  error,
  touched,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
        disabled={disabled || loading}
      />
      <Button
        variant="outlined"
        component="span"
        startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || loading}
        fullWidth
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          height: '56px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {fileName || label}
      </Button>
      {touched && error && (
        <Typography color="error" variant="caption" display="block" sx={{ mt: 1, ml: 1.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default InputFile;
