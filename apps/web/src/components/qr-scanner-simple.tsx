"use client"

import { useState } from 'react'
import { Camera, X } from 'lucide-react'

interface QRScannerSimpleProps {
  onScan: (result: string) => void
  onClose: () => void
  onError?: (error: string) => void
}

export function QRScannerSimple({ onScan, onClose, onError }: QRScannerSimpleProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTestScan = () => {
    setIsLoading(true)
    // Simulate a test scan
    setTimeout(() => {
      const testTxId = 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16'
      onScan(testTxId)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-sm mb-4">
              QR Scanner Component Loaded Successfully!
            </p>
            <p className="text-gray-500 text-xs mb-4">
              This is a simplified version for testing. The full QR scanner will be implemented next.
            </p>
            
            <button
              onClick={handleTestScan}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Scan (Demo)'}
            </button>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-300 text-sm font-medium">Alternative options:</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Copy transaction ID from your Bitcoin wallet</li>
              <li>• Paste Bitcoin explorer URL</li>
              <li>• Use sample transactions above</li>
            </ul>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


