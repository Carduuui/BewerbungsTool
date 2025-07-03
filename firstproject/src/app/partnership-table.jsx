"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PartnershipTable({data}) {
      const getStatusBadge = (status) => {
        switch (status) {
          case "Angenommen":
            return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>
          case "Abgelehnt":
            return <Badge className="bg-red-600 hover:bg-red-700">{status}</Badge>
          case "In Bearbeitung":
            return <Badge className="bg-yellow-600 hover:bg-yellow-700">{status}</Badge>
          case "Wartend":
            return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
          default:
            return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
        }
      }
      
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-700 hover:bg-gray-700 border-b border-gray-600">
              <TableHead className="text-white font-semibold">Unternehmen</TableHead>
              <TableHead className="text-white font-semibold">Partnerschule</TableHead>
              <TableHead className="text-white font-semibold">Unternehmen Standort</TableHead>
              <TableHead className="text-white font-semibold">Partnerschule Standort</TableHead>
              <TableHead className="text-white font-semibold">Kernkompetenz Unternehmen</TableHead>
              <TableHead className="text-white font-semibold">Bewerbungsstatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className="bg-gray-800 hover:bg-gray-750 border-b border-gray-700 transition-colors"
              >
                <TableCell className="text-white font-medium">{row.unternehmen}</TableCell>
                <TableCell className="text-gray-300">{row.partnerschule}</TableCell>
                <TableCell className="text-gray-300">{row.unternehmensStandort}</TableCell>
                <TableCell className="text-gray-300">{row.partnerschuleStandort}</TableCell>
                <TableCell className="text-gray-300">{row.kernkompetenz}</TableCell>
                <TableCell>{getStatusBadge(row.bewerbungsstatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}