import { Button } from '../ui/button'
import TableUpload from '../table-upload'
import { Folder, FileType, Play, Trash2 } from 'lucide-react'

export const HomePage = () => (
  <div className="flex flex-col h-full">
    <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-center p-4 min-h-full">
        <div className="w-4/5">
          <TableUpload />
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 flex items-center justify-center gap-4 w-full p-4 border-t bg-neutral-900">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => {
          /*  Handle output folder selection */
        }}
      >
        <Folder className="size-4" />
        Output Folder
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => {
          /* TODO: Handle output type selection */
        }}
      >
        <FileType className="size-4" />
        Output Type
      </Button>

      <Button
        variant="default"
        size="sm"
        className="gap-2"
        onClick={() => {
          /* TODO: Handle convert all */
        }}
      >
        <Play className="size-4" />
        Convert All
      </Button>

      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => {
          /* TODO: Handle clear all */
        }}
      >
        <Trash2 className="size-4" />
        Clear All
      </Button>
    </div>
  </div>
)
