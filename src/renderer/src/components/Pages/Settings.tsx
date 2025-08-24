// SettingsPage.tsx
import { useState, useEffect } from 'react'
import { ModeToggle } from "../mode-toggle"
import { useSettings,SettingsProvider } from '@renderer/contexts/SettingsContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Slider } from "../ui/slider"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Settings, Palette, HardDrive, File, Save, RotateCcw, CheckCircle } from 'lucide-react'
import { toast } from 'sonner' 

export const SettingsPage = () => {
  const { settings, updateSettings, resetSettings, isLoading } = useSettings()
  const [localMaxFiles, setLocalMaxFiles] = useState(settings.maxFiles)
  const [localMaxFileSize, setLocalMaxFileSize] = useState(settings.maxFileSize)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when settings change from context
  useEffect(() => {
    setLocalMaxFiles(settings.maxFiles)
    setLocalMaxFileSize(settings.maxFileSize)
  }, [settings])

  // Check for changes
  useEffect(() => {
    const hasLocalChanges = 
      localMaxFiles !== settings.maxFiles || 
      localMaxFileSize !== settings.maxFileSize
    setHasChanges(hasLocalChanges)
  }, [localMaxFiles, localMaxFileSize, settings])

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`
    }
    return `${sizeInMB} MB`
  }

  const handleMaxFilesChange = (value) => {
    setLocalMaxFiles(value[0])
  }

  const handleMaxFileSizeChange = (value) => {
    setLocalMaxFileSize(value[0])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate save delay
      
      updateSettings({
        maxFiles: localMaxFiles,
        maxFileSize: localMaxFileSize
      })
      
      setHasChanges(false)
      
      // Show success message
      toast?.success?.('Settings saved successfully!') || 
      console.log('Settings saved successfully!')
      
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast?.error?.('Failed to save settings') || 
      console.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    resetSettings()
    setHasChanges(false)
    toast?.success?.('Settings reset to defaults') || 
    console.log('Settings reset to defaults')
  }

  const handleResetLocal = () => {
    setLocalMaxFiles(settings.maxFiles)
    setLocalMaxFileSize(settings.maxFileSize)
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your application preferences
          </p>
        </div>
      </div>
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize the look and feel of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Color Scheme</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark themes
              </p>
            </div>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            <CardTitle>File Upload</CardTitle>
          </div>
          <CardDescription>
            Configure file upload limitations and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Files Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Maximum Files</Label>
                <p className="text-sm text-muted-foreground">
                  Set the maximum number of files that can be uploaded at once
                </p>
              </div>
              <Badge variant="outline" className="font-mono">
                {localMaxFiles} files
              </Badge>
            </div>
            <div className="px-2">
              <Slider
                value={[localMaxFiles]}
                onValueChange={handleMaxFilesChange}
                max={200}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>200</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Max File Size Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Maximum File Size</Label>
                <p className="text-sm text-muted-foreground">
                  Set the maximum size for individual files
                </p>
              </div>
              <Badge variant="outline" className="font-mono">
                {formatFileSize(localMaxFileSize)}
              </Badge>
            </div>
            <div className="px-2">
              <Slider
                value={[localMaxFileSize]}
                onValueChange={handleMaxFileSizeChange}
                max={1024}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 MB</span>
                <span>1 GB</span>
              </div>
            </div>
          </div>

          {/* Manual Input Alternative */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="maxFiles">Max Files (Manual)</Label>
              <div className="relative">
                <File className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="maxFiles"
                  type="number"
                  min={1}
                  max={200}
                  value={localMaxFiles}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1
                    setLocalMaxFiles(Math.min(200, Math.max(1, value)))
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSize">Max Size (MB)</Label>
              <div className="relative">
                <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="maxSize"
                  type="number"
                  min={1}
                  max={1024}
                  value={localMaxFileSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1
                    setLocalMaxFileSize(Math.min(1024, Math.max(1, value)))
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex items-center justify-end gap-3 p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground mr-auto">
            You have unsaved changes
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLocal}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Settings
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}