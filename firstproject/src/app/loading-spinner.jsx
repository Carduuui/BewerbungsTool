"use client"

export default function LoadingSpinner({ message = "Wird geladen..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg border border-gray-700">
      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
      </div>

      {/* Loading Text */}
      <div className="mt-4 text-center">
        <p className="text-white font-medium">{message}</p>
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  )
}
