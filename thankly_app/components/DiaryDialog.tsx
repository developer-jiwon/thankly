'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DiaryView } from "./DiaryView"

interface DiaryDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  appreciations: Array<{ id: number; text: string; date: string }>
  deleteAppreciation?: (id: number) => void
}

export function DiaryDialog({ isOpen, onClose, selectedDate, appreciations, deleteAppreciation }: DiaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-2 sm:mx-auto overflow-y-auto simple-scroll max-h-[90vh] p-4 sm:p-6">
        <DiaryView
          selectedDate={selectedDate}
          appreciations={appreciations}
          deleteAppreciation={deleteAppreciation}
        />
      </DialogContent>
    </Dialog>
  )
}

