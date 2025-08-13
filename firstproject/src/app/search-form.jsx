"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Mail } from "lucide-react"

export default function SearchForm({ onSearch, 
  onDownload, onEmailSend, tableData = [] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDownload = () =>{
    if(onDownload){
      onDownload()
    }
  }

  const handleEmailSend = () =>{
    if(onEmailSend){
      onEmailSend()
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-2 mb-6">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Unternehmen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          <Search className="w-4 h-4 mr-2" />
          Suchen
        </Button>
        <Button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4"
          disabled={tableData.length === 0}
          title="Tabelle als CSV herunterladen"
        >
        <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={handleEmailSend}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4"
          disabled={tableData.length === 0}
          title="Tabelle per E-Mail senden"
        >
        <Mail className="w-4 h-4 mr-2" />
          E-Mail
        </Button>
      </div>
    </div>
  )
}
