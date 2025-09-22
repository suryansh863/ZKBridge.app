"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn, validateBitcoinAddress, formatAddress } from '@/lib/utils';

const addressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  label: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface BitcoinAddressVerifierProps {
  onAddressVerified?: (address: string, isValid: boolean) => void;
}

export function BitcoinAddressVerifier({ onAddressVerified }: BitcoinAddressVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    type: string;
    network: string;
    details: any;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const address = watch('address');

  const onSubmit = async (data: AddressFormData) => {
    setIsVerifying(true);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isValid = validateBitcoinAddress(data.address);
      
      const result = {
        isValid,
        type: isValid ? getAddressType(data.address) : 'Invalid',
        network: isValid ? getNetwork(data.address) : 'Unknown',
        details: isValid ? {
          format: getAddressType(data.address),
          network: getNetwork(data.address),
          checksum: data.address.slice(-4),
          length: data.address.length,
        } : null,
      };
      
      setVerificationResult(result);
      onAddressVerified?.(data.address, isValid);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        isValid: false,
        type: 'Error',
        network: 'Unknown',
        details: null,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getAddressType = (addr: string): string => {
    if (addr.startsWith('1')) return 'P2PKH (Legacy)';
    if (addr.startsWith('3')) return 'P2SH (Script Hash)';
    if (addr.startsWith('bc1')) return 'Bech32 (Native SegWit)';
    return 'Unknown';
  };

  const getNetwork = (addr: string): string => {
    if (addr.startsWith('1') || addr.startsWith('3') || addr.startsWith('bc1')) {
      return 'Bitcoin Mainnet';
    }
    if (addr.startsWith('m') || addr.startsWith('n') || addr.startsWith('tb1')) {
      return 'Bitcoin Testnet';
    }
    return 'Unknown Network';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          "p-6 rounded-3xl",
          "glass-card border border-white/20",
          "shadow-2xl"
        )}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-bitcoin to-bitcoin/80 bg-clip-text text-transparent">
            Bitcoin Address Verification
          </h3>
          <p className="text-muted-foreground">
            Verify Bitcoin address format and network compatibility
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Address Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/80">
              Bitcoin Address
            </label>
            <div className="relative">
              <input
                {...register('address')}
                type="text"
                placeholder="Enter Bitcoin address (1..., 3..., bc1...)"
                className={cn(
                  "w-full p-4 rounded-2xl font-mono text-sm",
                  "glass border border-white/10",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-300",
                  errors.address && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                )}
              />
              {address && validateBitcoinAddress(address) && (
                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
            {errors.address && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Optional Label */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/80">
              Label (Optional)
            </label>
            <input
              {...register('label')}
              type="text"
              placeholder="My Bitcoin Wallet"
              className={cn(
                "w-full p-4 rounded-2xl",
                "glass border border-white/10",
                "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                "transition-all duration-300"
              )}
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isVerifying || !address}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300",
              "flex items-center justify-center gap-2",
              !isVerifying && address
                ? "bg-gradient-to-r from-bitcoin to-bitcoin/80 text-white hover:from-bitcoin/90 hover:to-bitcoin/70 shadow-lg hover:shadow-xl hover:scale-105 bitcoin-glow"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying Address...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Verify Address
              </>
            )}
          </button>
        </form>

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "mt-8 p-6 rounded-2xl border",
                verificationResult.isValid
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                <h4 className="text-lg font-semibold">
                  {verificationResult.isValid ? 'Valid Bitcoin Address' : 'Invalid Address'}
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address Type</span>
                  <span className="font-medium">{verificationResult.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="font-medium">{verificationResult.network}</span>
                </div>
                
                {verificationResult.details && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {formatAddress(address, 8)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(address)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {verificationResult.details && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showDetails ? 'Hide' : 'Show'} Details
                    </button>
                    
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 space-y-2 pt-3 border-t border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Format</span>
                            <span className="font-mono text-xs">{verificationResult.details.format}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Length</span>
                            <span className="font-mono text-xs">{verificationResult.details.length} characters</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Checksum</span>
                            <span className="font-mono text-xs">{verificationResult.details.checksum}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {verificationResult.isValid && (
                <div className="mt-4 flex gap-2">
                  <button className={cn(
                    "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                    "glass border border-white/20",
                    "hover:border-white/30 hover:scale-105"
                  )}>
                    <ExternalLink className="h-4 w-4 inline mr-2" />
                    View on Explorer
                  </button>
                  <button className={cn(
                    "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                    "bg-gradient-to-r from-bitcoin to-bitcoin/80 text-white",
                    "hover:from-bitcoin/90 hover:to-bitcoin/70 hover:scale-105"
                  )}>
                    Use in Bridge
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className={cn(
          "mt-6 p-4 rounded-2xl",
          "glass border border-blue-500/20",
          "bg-blue-500/5"
        )}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">Supported Address Types</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <span className="font-mono">1...</span> - Legacy P2PKH addresses</li>
                <li>• <span className="font-mono">3...</span> - P2SH Script Hash addresses</li>
                <li>• <span className="font-mono">bc1...</span> - Native SegWit Bech32 addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

