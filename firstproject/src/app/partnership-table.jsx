"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function PartnershipTable({ data, onStatusChange, onDelete }) {
  const statusOptions = ["Option", "Abgeschickt", "Angenommen", "Abgelehnt"]

  const getStatusBadge = (status) => {
    switch (status) {
      case "Angenommen":
        return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>
      case "Abgelehnt":
        return <Badge className="bg-red-600 hover:bg-red-700">{status}</Badge>
      case "Abgeschickt":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">{status}</Badge>
      case "Option":
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
    }
  }

  // Funktion zum Wechseln des Status
  const handleStatusClick = (rowId, currentStatus) => {
    const currentIndex = statusOptions.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statusOptions.length // Kreislauf durch die Optionen
    const newStatus = statusOptions[nextIndex]

    // Callback an Parent-Komponente weitergeben
    if (onStatusChange) {
      onStatusChange(rowId, newStatus)
    }
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
                      onClick={() => onDelete(row.customId || row.id)}
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
    </div>
  )
}
