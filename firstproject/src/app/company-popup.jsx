"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export default function CompanyPopup({ isOpen, onClose, data, onAddToTable, onDontAdd }) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Neues Unternehmen gefunden</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Unternehmen</label>
              <p className="text-white font-semibold">{data.unternehmen}</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Unternehmen Standort</label>
              <p className="text-white font-semibold">{data.unternehmensStandort}</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Partnerschule</label>
              <p className="text-white font-semibold">{data.partnerschule}</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Partnerschule Standort</label>
              <p className="text-white font-semibold">{data.partnerschuleStandort}</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Kernkompetenz Unternehmen</label>
              <p className="text-white font-semibold">{data.kernkompetenz || "Nicht angegeben"}</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-300">Distanz</label>
              <p className="text-white font-semibold">{data.distanz}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onAddToTable} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Zur Tabelle hinzufügen
            </Button>

            <Button
              onClick={onDontAdd}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Nicht hinzufügen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
