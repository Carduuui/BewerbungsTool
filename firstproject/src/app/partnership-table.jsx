"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

export default function PartnershipTable({ data, onStatusChange, onDelete }) {
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemId: null,
    itemName: "",
  })

  const statusOptions = ["Option", "Abgeschickt", "Online Test","Bearbeitung", "Auswahltag", "Online Auswahltag", "Online Interview", "Angenommen", "Abgelehnt"]

  const getStatusBadge = (status) => {
    switch (status) {
      case "Angenommen":
        return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>
      case "Abgelehnt":
        return <Badge className="bg-red-600 hover:bg-red-700">{status}</Badge>
      case "Abgeschickt":
        return <Badge className="bg-blue-600 hover:bg-blue-700">{status}</Badge>
      case "Option":
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
      case "Online Test":
        return <Badge className="bg-yellow-600 hover:bg-yellow-600">{status}</Badge>
        case "Bearbeitung":
          return <Badge className="bg-yellow-600 hover:bg-yellow-800">{status}</Badge>
      case "Auswahltag":
        return <Badge className="bg-purple-600 hover:bg-purple-900">{status}</Badge>
      case "Online Auswahltag":
        return <Badge className="bg-purple-400 hover:bg-purple-900">{status}</Badge>
      case "Online Interview":
        return <Badge className="bg-purple-900 hover:bg-purple-900">{status}</Badge>
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
    }
  }

  const handleStatusClick = (rowId, currentStatus) => {
    const currentIndex = statusOptions.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statusOptions.length
    const newStatus = statusOptions[nextIndex]

    if (onStatusChange) {
      onStatusChange(rowId, newStatus)
    }
  }

  const handleDeleteClick = (rowId, companyName) => {
    setDeleteDialog({
      isOpen: true,
      itemId: rowId,
      itemName: companyName,
    })
  }

  const handleConfirmDelete = () => {
    if (onDelete && deleteDialog.itemId) {
      onDelete(deleteDialog.itemId)
    }
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemName: "",
    })
  }

  const handleCancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemName: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-700 hover:bg-gray-700 border-b border-gray-600">
                <TableHead className="text-white font-semibold min-w-[150px]">Unternehmen</TableHead>
                <TableHead className="text-white font-semibold min-w-[150px]">Partnerschule</TableHead>
                <TableHead className="text-white font-semibold min-w-[120px]">Unternehmen Standort</TableHead>
                <TableHead className="text-white font-semibold min-w-[120px]">Partnerschule Standort</TableHead>
                <TableHead className="text-white font-semibold min-w-[200px]">Kernkompetenz Unternehmen</TableHead>
                <TableHead className="text-white font-semibold min-w-[120px]">Bewerbungsstatus</TableHead>
                <TableHead className="text-white font-semibold w-20">Löschen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.customId || row.id}
                  className="bg-gray-800 hover:bg-gray-750 border-b border-gray-700 transition-colors"
                >
                  <TableCell className="text-white font-medium max-w-[150px] break-words whitespace-normal py-4">
                    <a href={row.link}>{row.unternehmen}</a>
                  </TableCell>
                  <TableCell className="text-gray-300 max-w-[150px] break-words whitespace-normal py-4">
                    {row.partnerschule}
                  </TableCell>
                  <TableCell className="text-gray-300 max-w-[120px] break-words whitespace-normal py-4">
                    {row.unternehmensStandort}
                  </TableCell>
                  <TableCell className="text-gray-300 max-w-[120px] break-words whitespace-normal py-4">
                    {row.partnerschuleStandort}
                  </TableCell>
                  <TableCell className="text-gray-300 max-w-[200px] break-words whitespace-normal py-4">
                    {row.kernkompetenz}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer py-4"
                    onClick={() => handleStatusClick(row.customId || row.id, row.bewerbungsstatus)}
                  >
                    {getStatusBadge(row.bewerbungsstatus)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Button
                      onClick={() => handleDeleteClick(row.customId || row.id, row.unternehmen)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bestätigungsdialog für das Löschen */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Eintrag löschen</DialogTitle>
            <DialogDescription className="text-gray-300">
              Sind Sie sicher, dass Sie den Eintrag für "{deleteDialog.itemName}" löschen möchten? Diese Aktion kann
              nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
