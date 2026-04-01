
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
    // Simulate a test scan with valid Bitcoin Testnet transactions
    setTimeout(() => {
      const validTxIds = [
        '9a08f351187c3541e27877d918e4a591f36d649ed5a1202fb04cbc80f2f692b4',
        '9c638c839218cb5feb683034fb3c33dc68c5c79a83b143f482b88dc9d0be5193',
        '3bcd2c6e3c6630589c96dea2f5caff1ae9053e6cbd1d3e4f9b65fbf8eeafb452'
      ]
      const randomTxId = validTxIds[Math.floor(Math.random() * validTxIds.length)]
      onScan(randomTxId)
      setIsLoading(false)
    }, 1000)
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


