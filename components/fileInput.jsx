import { useState, useEffect } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

export default function ImageInput({ 
  value = null, // File object atau URL string
  onChange, // Callback: (file: File | null, preview: string | null) => void
  label = 'Gambar',
  id = 'image-upload',
  className = '',
  maxSizeMB = 10,
  existingImageUrl = null, // URL gambar yang sudah ada (untuk edit mode)
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set preview dari existing image URL jika ada
  useEffect(() => {
    if (existingImageUrl && !selectedImage) {
      setPreview(existingImageUrl);
    }
  }, [existingImageUrl, selectedImage]);

  // Set preview dari value (file) jika ada
  useEffect(() => {
    if (value instanceof File) {
      setSelectedImage(value);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string' && value) {
      setPreview(value);
    } else if (!value) {
      setSelectedImage(null);
      setPreview(existingImageUrl || null);
    }
  }, [value, existingImageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }

      // Validasi ukuran file
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`Ukuran file maksimal ${maxSizeMB}MB`);
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result;
        setPreview(previewUrl);
        // Callback ke parent component
        if (onChange) {
          onChange(file, previewUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }

      // Validasi ukuran file
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`Ukuran file maksimal ${maxSizeMB}MB`);
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result;
        setPreview(previewUrl);
        // Callback ke parent component
        if (onChange) {
          onChange(file, previewUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setPreview(existingImageUrl || null);
    // Reset file input
    const fileInput = document.getElementById(id);
    if (fileInput) {
      fileInput.value = '';
    }
    // Callback ke parent component
    if (onChange) {
      onChange(null, existingImageUrl || null);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id={id}
          />
          <label htmlFor={id} className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Klik untuk upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  atau drag and drop gambar di sini
                </p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, WEBP hingga {maxSizeMB}MB
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-lg"
              aria-label="Hapus gambar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {selectedImage && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedImage.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {existingImageUrl && !selectedImage && (
            <p className="text-xs text-gray-500 text-center">
              Menggunakan gambar yang sudah ada
            </p>
          )}
        </div>
      )}
    </div>
  );
}