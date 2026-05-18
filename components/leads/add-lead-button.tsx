'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddLeadSheet } from '@/components/leads/add-lead-sheet'

export function AddLeadButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add Lead
      </Button>

      <AddLeadSheet
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
