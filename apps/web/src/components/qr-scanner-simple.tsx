
import { useEffect, useRef, useState } from 'react'
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react'
import QrScanner from 'qr-scanner'

interface QRScannerSimpleProps {
  onScan: (result: string) => void
  onClose: () => void
  onError?: (error: string) => void
}

export function QRScannerSimple({ onScan, onClose, onError }: QRScannerSimpleProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const startScanner = async () => {
      try {
        scannerRef.current = new QrScanner(
          videoElement,
          (result) => {
            if (result.data) {
              onScan(result.data)
              onClose()
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            onDecodeError: (error) => {
              // Ignore decoding errors as they happen constantly between scans
            }
          }
        )

        await scannerRef.current.start()
        setHasPermission(true)
      } catch (err: any) {
        console.error('QR Scanner Error:', err)
        setHasPermission(false)
        setScannerError(err.message || 'Could not access camera')
        if (onError) onError(err.message)
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
      }
    }
  }, [onScan, onClose, onError])

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center">
              <Camera className="w-5 h-5 mr-3 text-blue-500" />
              Scan Bitcoin TXID
            </h3>
            <p className="text-xs text-gray-500 mt-1">Position the QR code within the frame</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative aspect-square bg-black group">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-blue-500/50 rounded-2xl relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-slow"></div>
            </div>
          </div>

          {hasPermission === false && (
            <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h4 className="text-white font-bold mb-2">Camera Access Denied</h4>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">{scannerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {hasPermission === null && (
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-400">Initializing camera...</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-start space-x-3 text-xs text-gray-500">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-500 font-bold">i</span>
            </div>
            <p>Scanning works best in well-lit environments. Ensure the QR code contains a valid 64-character Bitcoin transaction ID.</p>
          </div>
        </div>
      </div>
    </div>
  )
}


