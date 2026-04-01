
import { useEffect, useRef, useState, useCallback } from 'react'
import QrScanner from 'qr-scanner'
import { Camera, CameraOff, AlertCircle, CheckCircle, X } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onClose, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [scanResult, setScanResult] = useState<string>('')

  // Check camera permissions
  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setHasPermission(permission.state === 'granted')
      return permission.state === 'granted'
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      console.log('Permissions API not supported, trying to access camera directly')
      return null
    }
  }

  // Start QR scanner
  const startScanner = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setError('')
      setIsScanning(true)

      // Check if we have camera permission
      const hasCameraPermission = await checkCameraPermission()
      
      if (hasCameraPermission === false) {
        throw new Error('Camera permission denied. Please allow camera access and try again.')
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data)
          setScanResult(result.data)
          
          // Extract transaction ID from the result
          const txIdMatch = result.data.match(/\b[a-fA-F0-9]{64}\b/)
          if (txIdMatch) {
            onScan(txIdMatch[0])
            stopScanner()
          } else {
            // Check if it's a Bitcoin explorer URL
            const urlPatterns = [
              /blockstream\.info\/testnet\/tx\/([a-fA-F0-9]{64})/,
              /blockchain\.info\/tx\/([a-fA-F0-9]{64})/,
              /mempool\.space\/testnet\/tx\/([a-fA-F0-9]{64})/,
              /btc\.com\/btc-testnet\/tx\/([a-fA-F0-9]{64})/,
            ]
            
            let foundTxId = null
            for (const pattern of urlPatterns) {
              const match = result.data.match(pattern)
              if (match) {
                foundTxId = match[1]
                break
              }
            }
            
            if (foundTxId) {
              onScan(foundTxId)
              stopScanner()
            } else {
              setError('No Bitcoin transaction ID found in QR code. Please scan a valid Bitcoin transaction QR code.')
            }
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      )

      // Start scanning
      await qrScannerRef.current.start()
      
    } catch (error: any) {
      console.error('QR Scanner error:', error)
      setError(error.message || 'Failed to start camera. Please check your camera permissions.')
      setIsScanning(false)
      onError?.(error.message || 'Failed to start QR scanner')
    }
  }, [onError, onScan])

  // Stop QR scanner
  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      // Try to access camera to trigger permission request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      })
      
      // Stop the stream immediately as we just needed to request permission
      stream.getTracks().forEach(track => track.stop())
      
      setHasPermission(true)
      await startScanner()
      
    } catch (error: any) {
      console.error('Camera permission error:', error)
      setError('Camera permission denied. Please allow camera access in your browser settings.')
      setHasPermission(false)
    }
  }

  // Initialize scanner when component mounts
  useEffect(() => {
    if (hasPermission === null) {
      checkCameraPermission().then((permission) => {
        if (permission === true) {
          startScanner()
        }
      })
    }
  }, [hasPermission, startScanner])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Scan QR Code
          </h3>
          <button
            onClick={() => {
              stopScanner()
              onClose()
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Camera permission request */}
          {hasPermission === false && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-400 font-medium">Camera Permission Required</p>
              </div>
              <p className="text-red-300/80 text-sm mb-3">
                Please allow camera access to scan QR codes. This helps you quickly input Bitcoin transaction IDs.
              </p>
              <button
                onClick={requestCameraPermission}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Allow Camera Access
              </button>
            </div>
          )}

          {/* Camera error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-400 font-medium">Camera Error</p>
              </div>
              <p className="text-red-300/80 text-sm">{error}</p>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => {
                    setError('')
                    startScanner()
                  }}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success message */}
          {scanResult && !error && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <p className="text-green-400 font-medium">QR Code Scanned!</p>
              </div>
              <p className="text-green-300/80 text-sm">Processing transaction ID...</p>
            </div>
          )}

          {/* Camera view */}
          {hasPermission !== false && !error && (
            <div className="relative">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
              
              {/* Scanner status */}
              <div className="mt-3 text-center">
                {isScanning ? (
                  <div className="flex items-center justify-center text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                    <span className="text-sm">Scanning for QR codes...</span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Position QR code within the frame</p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-gray-300 text-sm font-medium mb-2">📱 How to use:</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Point your camera at a Bitcoin transaction QR code</li>
              <li>• Works with transaction IDs and Bitcoin explorer URLs</li>
              <li>• Make sure the QR code is well-lit and in focus</li>
              <li>• The scanner will automatically extract the transaction ID</li>
            </ul>
          </div>

          {/* Alternative options */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm text-center mb-3">Or try these alternatives:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                📋 Paste Manually
              </button>
              <button
                onClick={onClose}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                🎯 Use Samples
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
