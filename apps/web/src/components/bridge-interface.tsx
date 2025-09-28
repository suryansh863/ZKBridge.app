"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Wallet, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Loader2
} from 'lucide-react';
import { cn, formatAddress, validateBitcoinAddress, validateEthereumAddress } from '@/lib/utils';

// Form validation schema
const bridgeSchema = z.object({
  fromChain: z.enum(['bitcoin', 'ethereum']),
  toChain: z.enum(['bitcoin', 'ethereum']),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
});

type BridgeFormData = z.infer<typeof bridgeSchema>;

interface BridgeInterfaceProps {
  onTransactionStart?: (data: BridgeFormData) => void;
}

export function BridgeInterface({ onTransactionStart }: BridgeInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<BridgeFormData>({
    resolver: zodResolver(bridgeSchema),
    defaultValues: {
      fromChain: 'bitcoin',
      toChain: 'ethereum',
      amount: '',
      recipientAddress: '',
    },
  });

  const watchedValues = watch();
  const { fromChain, toChain, amount, recipientAddress } = watchedValues;

  const swapChains = () => {
    const newFromChain = toChain;
    const newToChain = fromChain;
    setValue('fromChain', newFromChain);
    setValue('toChain', newToChain);
    setValue('recipientAddress', ''); // Reset recipient address when swapping
  };

  const onSubmit = async (data: BridgeFormData) => {
    setIsProcessing(true);
    setStep('processing');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep('success');
      onTransactionStart?.(data);
      
      // Reset form after success
      setTimeout(() => {
        reset();
        setStep('input');
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      // Handle error silently in production
      setStep('input');
      setIsProcessing(false);
    }
  };

  const validateAddress = (address: string, chain: string) => {
    if (!address) return null;
    if (chain === 'bitcoin') return validateBitcoinAddress(address);
    if (chain === 'ethereum') return validateEthereumAddress(address);
    return false;
  };

  const addressValidation = validateAddress(recipientAddress, toChain);
  const estimatedAmount = amount ? (parseFloat(amount) * 0.98).toFixed(6) : '0.00';

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-bitcoin to-ethereum bg-clip-text text-transparent">
            Bridge Your Assets
          </h2>
          <p className="text-xl text-muted-foreground">
            Transfer between Bitcoin and Ethereum networks securely
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={cn(
            "relative p-8 rounded-3xl",
            "glass-card border border-white/20",
            "shadow-2xl"
          )}
        >
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.form
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* From Chain */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80">From</label>
                  <div className={cn(
                    "flex items-center space-x-4 p-4 rounded-2xl",
                    "glass border border-white/10",
                    "hover:border-white/20 transition-all duration-300"
                  )}>
                    <div className={cn(
                      "p-3 rounded-xl",
                      fromChain === 'bitcoin' ? 'bg-bitcoin/20' : 'bg-ethereum/20'
                    )}>
                      {fromChain === 'bitcoin' ? (
                        <div className="w-6 h-6 rounded-full bg-bitcoin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-ethereum" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium capitalize text-foreground">
                        {fromChain === 'bitcoin' ? 'Bitcoin Network' : 'Ethereum Network'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fromChain === 'bitcoin' ? 'BTC' : 'ETH'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="font-medium">0.00 {fromChain === 'bitcoin' ? 'BTC' : 'ETH'}</div>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80">Amount</label>
                  <div className="relative">
                    <input
                      {...register('amount')}
                      type="number"
                      step="0.000001"
                      placeholder="0.00"
                      className={cn(
                        "w-full p-4 pr-20 rounded-2xl text-lg font-medium",
                        "glass border border-white/10",
                        "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                        "transition-all duration-300",
                        errors.amount && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                      )}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      {fromChain === 'bitcoin' ? 'BTC' : 'ETH'}
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.amount.message}
                    </p>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: 0.001 {fromChain === 'bitcoin' ? 'BTC' : 'ETH'}</span>
                    <span>Max: 10.0 {fromChain === 'bitcoin' ? 'BTC' : 'ETH'}</span>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={swapChains}
                    className={cn(
                      "p-3 rounded-full border transition-all duration-300",
                      "glass-card hover:scale-110 interactive",
                      "border-white/20 hover:border-white/30"
                    )}
                    aria-label="Swap chains"
                  >
                    <ArrowRightLeft className="h-5 w-5 text-foreground" />
                  </button>
                </div>

                {/* To Chain */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80">To</label>
                  <div className={cn(
                    "flex items-center space-x-4 p-4 rounded-2xl",
                    "glass border border-white/10",
                    "hover:border-white/20 transition-all duration-300"
                  )}>
                    <div className={cn(
                      "p-3 rounded-xl",
                      toChain === 'bitcoin' ? 'bg-bitcoin/20' : 'bg-ethereum/20'
                    )}>
                      {toChain === 'bitcoin' ? (
                        <div className="w-6 h-6 rounded-full bg-bitcoin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-ethereum" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium capitalize text-foreground">
                        {toChain === 'bitcoin' ? 'Bitcoin Network' : 'Ethereum Network'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {toChain === 'bitcoin' ? 'BTC' : 'ETH'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">You&apos;ll receive</div>
                      <div className="font-medium">
                        {estimatedAmount} {toChain === 'bitcoin' ? 'BTC' : 'ETH'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Address */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80">Recipient Address</label>
                  <div className="relative">
                    <input
                      {...register('recipientAddress')}
                      type="text"
                      placeholder={`Enter ${toChain} address`}
                      className={cn(
                        "w-full p-4 rounded-2xl font-mono text-sm",
                        "glass border border-white/10",
                        "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                        "transition-all duration-300",
                        errors.recipientAddress && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
                        addressValidation === true && "border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20"
                      )}
                    />
                    {addressValidation === true && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {addressValidation === false && recipientAddress && (
                      <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.recipientAddress && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.recipientAddress.message}
                    </p>
                  )}
                  {addressValidation === false && recipientAddress && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Invalid {toChain} address format
                    </p>
                  )}
                </div>

                {/* Bridge Button */}
                <button 
                  type="submit"
                  disabled={!isValid || addressValidation !== true || isProcessing}
                  className={cn(
                    "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300",
                    "flex items-center justify-center gap-2",
                    isValid && addressValidation === true && !isProcessing
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-105 crypto-glow"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5" />
                      Start Bridge Transaction
                    </>
                  )}
                </button>

                {/* Info */}
                <div className={cn(
                  "p-4 rounded-2xl",
                  "glass border border-blue-500/20",
                  "bg-blue-500/5"
                )}>
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-foreground">Bridge Information</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Estimated time: 10-30 minutes</li>
                        <li>• Bridge fee: 2% (0.02 {fromChain === 'bitcoin' ? 'BTC' : 'ETH'})</li>
                        <li>• Network fees apply</li>
                        <li>• Transaction is irreversible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="mb-8">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Processing Bridge Transaction</h3>
                  <p className="text-muted-foreground">
                    Your transaction is being processed securely...
                  </p>
                </div>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Validating {fromChain} transaction</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Generating ZK proof</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm">Broadcasting to {toChain} network</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="mb-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Bridge Transaction Successful!</h3>
                  <p className="text-muted-foreground">
                    Your assets have been successfully bridged
                  </p>
                </div>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/10">
                    <span className="text-sm font-medium">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{formatAddress('0x1234567890abcdef...', 6)}</span>
                      <button className="p-1 hover:bg-white/10 rounded">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/10">
                    <span className="text-sm font-medium">Amount Received</span>
                    <span className="font-semibold">{estimatedAmount} {toChain === 'bitcoin' ? 'BTC' : 'ETH'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}