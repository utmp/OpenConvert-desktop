'use client'
import { Progress } from '@renderer/components/ui/progress'
import { useEffect, useState } from 'react'
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview
} from '@renderer/lib/use-file-upload'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar
} from '@renderer/components/ui/alert'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import {
  CloudUpload,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  RefreshCwIcon,
  Trash2,
  TriangleAlert,
  Upload,
  VideoIcon,
  XIcon
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface FileUploadItem extends FileWithPreview {
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface TableUploadProps {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  className?: string
  onFilesChange?: (files: FileWithPreview[]) => void
  simulateUpload?: boolean
}

export default function TableUpload({
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = '*',
  multiple = true,
  className,
  onFilesChange,
  simulateUpload = true
}: TableUploadProps) {
  // State declarations
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([])
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})

  // Create preview URL for images using FileReader for Electron compatibility
  const createImagePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target?.result as string || null)
        }
        reader.onerror = () => {
          console.error('Failed to read file:', file.name)
          resolve(null)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Failed to create file preview:', error)
        resolve(null)
      }
    })
  }

  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps
    }
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: [],
    onFilesChange: (newFiles) => {
      // Convert to upload items when files change, preserving existing status
      const newUploadFiles = newFiles.map((file) => {
        // Check if this file already exists in uploadFiles
        const existingFile = uploadFiles.find((existing) => existing.id === file.id)

        if (existingFile) {
          // Preserve existing file status and progress
          return {
            ...existingFile,
            ...file // Update any changed properties from the file
          }
        } else {
          // New file - set to uploading
          return {
            ...file,
            progress: 0,
            status: 'uploading' as const
          }
        }
      })
      setUploadFiles(newUploadFiles)
      onFilesChange?.(newFiles)
    }
  })

  // Generate previews for new image files
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: Record<string, string> = {}
      
      for (const fileItem of uploadFiles) {
        if (fileItem.file.type.startsWith('image/') && !imagePreviews[fileItem.id]) {
          // Ensure we have a File object, not just FileMetadata
          if (fileItem.file instanceof File) {
            const preview = await createImagePreview(fileItem.file)
            if (preview) {
              newPreviews[fileItem.id] = preview
            }
          }
        }
      }
      
      if (Object.keys(newPreviews).length > 0) {
        setImagePreviews(prev => ({ ...prev, ...newPreviews }))
      }
    }
    
    generatePreviews()
  }, [uploadFiles, imagePreviews])

  // Simulate upload progress
  useEffect(() => {
    if (!simulateUpload) return

    const interval = setInterval(() => {
      setUploadFiles((prev) =>
        prev.map((file) => {
          if (file.status !== 'uploading') return file

          const increment = Math.random() * 15 + 5 // 5-20% increment
          const newProgress = Math.min(file.progress + increment, 100)

          if (newProgress >= 100) {
            // Randomly decide if upload succeeds or fails
            const shouldFail = Math.random() < 0.1 // 10% chance to fail
            return {
              ...file,
              progress: 100,
              status: shouldFail ? ('error' as const) : ('completed' as const),
              error: shouldFail ? 'Upload failed. Please try again.' : undefined
            }
          }

          return { ...file, progress: newProgress }
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [simulateUpload])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // No cleanup needed for data URLs
      setImagePreviews({})
    }
  }, [])

  const removeUploadFile = (fileId: string) => {
    // Clean up image preview
    if (imagePreviews[fileId]) {
      const newPreviews = { ...imagePreviews }
      delete newPreviews[fileId]
      setImagePreviews(newPreviews)
    }
    
    setUploadFiles((prev) => prev.filter((file) => file.id !== fileId))
    removeFile(fileId)
  }

  const retryUpload = (fileId: string) => {
    setUploadFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, progress: 0, status: 'uploading' as const, error: undefined }
          : file
      )
    )
  }

  const getFileIcon = (file: File | FileMetadata) => {
    const type = file.type // Both File and FileMetadata have type property
    if (type.startsWith('image/')) return <ImageIcon className="size-4" />
    if (type.startsWith('video/')) return <VideoIcon className="size-4" />
    if (type.startsWith('audio/')) return <HeadphonesIcon className="size-4" />
    if (type.includes('pdf')) return <FileTextIcon className="size-4" />
    if (type.includes('word') || type.includes('doc')) return <FileTextIcon className="size-4" />
    if (type.includes('excel') || type.includes('sheet'))
      return <FileSpreadsheetIcon className="size-4" />
    if (type.includes('zip') || type.includes('rar')) return <FileArchiveIcon className="size-4" />
    return <FileTextIcon className="size-4" />
  }

  const getFileTypeLabel = (file: File | FileMetadata) => {
    const type = file.type // Both File and FileMetadata have type property
    if (type.startsWith('image/')) return 'Image'
    if (type.startsWith('video/')) return 'Video'
    if (type.startsWith('audio/')) return 'Audio'
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('word') || type.includes('doc')) return 'Word'
    if (type.includes('excel') || type.includes('sheet')) return 'Excel'
    if (type.includes('zip') || type.includes('rar')) return 'Archive'
    if (type.includes('json')) return 'JSON'
    if (type.includes('text')) return 'Text'
    return 'File'
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {uploadFiles.length === 0 && (
        <div
          className={cn(
            'relative rounded-lg border border-dashed p-12 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps()} className="sr-only" />

          <div className="flex flex-col items-center justify-center gap-6">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors',
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              )}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <p className="text-base font-medium">
                Drop files here or{' '}
                <button>
                  browse files
                </button>
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: {formatBytes(maxSize)} • Maximum files: {maxFiles}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Files Table */}
      {uploadFiles.length > 0 && (
       <div className="mt-4 space-y-3">
          {uploadFiles.map((fileItem) => {
            // Use data URL preview instead of blob URL
            const isImage = fileItem.file.type.startsWith('image/')
            const previewUrl = isImage ? imagePreviews[fileItem.id] : null
            
            return (
              <div key={fileItem.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-2.5">
                  {/* File Icon or Image Preview */}
                  <div className="flex-shrink-0">
                    {previewUrl && isImage ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt={fileItem.file.name}
                          className="h-12 w-12 rounded-lg border object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', previewUrl)
                            // Hide the image and show fallback icon
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {/* Fallback icon that shows if image fails to load */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-muted-foreground absolute top-0 left-0" 
                             style={{ display: 'none' }}>
                          {getFileIcon(fileItem.file)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-muted-foreground">
                        {getFileIcon(fileItem.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mt-0.75">
                      <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
                        <span className="text-sm">{fileItem.file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(fileItem.file.size)} • {getFileTypeLabel(fileItem.file)}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        {/* Remove Button */}
                        <Button
                          onClick={() => removeUploadFile(fileItem.id)}
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:opacity-100 hover:bg-transparent"
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={fileItem.progress} className="h-1" />
                      </div>
                    )}

                    {/* Error Message */}
                    {fileItem.status === 'error' && fileItem.error && (
                      <Alert variant="destructive" appearance="light" className="items-center gap-1.5 mt-2 px-2 py-1">
                        <AlertIcon>
                          <TriangleAlert className="size-4!" />
                        </AlertIcon>
                        <AlertTitle className="text-xs">{fileItem.error}</AlertTitle>
                        <AlertToolbar>
                          <Button
                            onClick={() => retryUpload(fileItem.id)}
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:opacity-100 hover:bg-transparent"
                          >
                            <RefreshCwIcon className="size-3.5" />
                          </Button>
                        </AlertToolbar>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  )
}