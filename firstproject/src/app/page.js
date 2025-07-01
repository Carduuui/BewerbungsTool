'use client'
import {useState} from "react";
import styles from "./globals.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const sampleData = [
    {
      id: 1,
      unternehmen: "Weist EDV GmbH",
      partnerschule: "TH Brandenburg",
      unternehmensStandort: "Brandenburg an der Havel",
      partnerschuleStandort: "Brandenburg an der Havel",
      kernkompetenz: "IT-Dienstleistungen, Software-Entwicklung",
      bewerbungsstatus: "Angenommen",
    },
    {
      id: 2,
      unternehmen: "b-plus technologies GmbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Automatisierungstechnik, Industrie 4.0",
      bewerbungsstatus: "In Bearbeitung",
    },
    {
      id: 3,
      unternehmen: "conatec GmbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Beratung, Digitalisierung",
      bewerbungsstatus: "Abgelehnt",
    },
    {
      id: 4,
      unternehmen: "GFH mbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Finanzdienstleistungen",
      bewerbungsstatus: "Wartend",
    },
    {
      id: 5,
      unternehmen: "Siemens AG",
      partnerschule: "TU München",
      unternehmensStandort: "München",
      partnerschuleStandort: "München",
      kernkompetenz: "Elektrotechnik, Automatisierung",
      bewerbungsstatus: "Angenommen",
    },
  ]
  
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

  const prompt = "Write quote of the day.";

  const [output, setOutput] = useState('This is a nextjs project');
  const [loading, setLoading] = useState(false);

  const generateText = async () => {
    
    setLoading(true);

    try{
      const response = await fetch("/api/generate", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt})
      });

      const data = await response.json();

      if(response.ok){
        setOutput(data.output);
      }
      else{
        setOutput(data.error);
        const text = await response.text();
        console.error("Server error:", response.status, text);
      }
    }
    catch(err){
      console.error(err)
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <div>    
      {loading ? (<p className="text-blue-500">Loading...</p>):(<p onClick={generateText}>{output}</p>)}
          <div className="min-h-screen bg-gray-900 p-6">
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
                  {sampleData.map((row) => (
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
    </div>
  );
}