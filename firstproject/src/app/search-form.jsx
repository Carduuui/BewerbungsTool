"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchForm({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handle_search()
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
      </div>
    </div>
  )
}
