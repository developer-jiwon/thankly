'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DiaryView } from "./DiaryView"
import { MinimalDialog } from './MinimalDialog'
import { useState } from 'react'

interface DiaryDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  appreciations: Array<{ id: number; text: string; date: string }>
  deleteAppreciation?: (id: number) => void
}

export function DiaryDialog({ isOpen, onClose, selectedDate, appreciations, deleteAppreciation }: DiaryDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [appreciationToDelete, setAppreciationToDelete] = useState<number | null>(null)

  const handleDeleteClick = (id: number) => {
    setAppreciationToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (appreciationToDelete && deleteAppreciation) {
      deleteAppreciation(appreciationToDelete)
      setShowDeleteDialog(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-2 sm:mx-auto overflow-y-auto simple-scroll max-h-[90vh] p-4 sm:p-6">
        <DiaryView
          selectedDate={selectedDate}
          appreciations={appreciations}
          deleteAppreciation={handleDeleteClick}
        />
        <MinimalDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this appreciation?"
        />
      </DialogContent>
    </Dialog>
  )
}

