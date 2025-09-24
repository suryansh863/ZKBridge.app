"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Bitcoin, 
  ArrowRight, 
  DollarSign,
  Clock,
  TrendingUp,
  Info,
  RefreshCw
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface FeeCalculation {
  bridgeFee: number;
  networkFee: number;
  totalFee: number;
  estimatedTime: string;
  breakdown: {
    bridgeFeePercent: number;
    networkFeeAmount: number;
    priority: 'slow' | 'medium' | 'fast';
  };
}

const feeRates = {
  bitcoin: {
    slow: { fee: 5, time: '30-60 min' },
    medium: { fee: 12, time: '10-30 min' },
    fast: { fee: 25, time: '5-10 min' }
  },
  ethereum: {
    slow: { fee: 15, time: '2-5 min' },
    medium: { fee: 25, time: '1-2 min' },
    fast: { fee: 45, time: '30-60 sec' }
  }
};

export default function FeeCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('ETH');
  const [priority, setPriority] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateFees = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setCalculation(null);
      setIsCalculating(false);
      return;
    }

    const bridgeFeePercent = 0.1; // 0.1% bridge fee
    const bridgeFee = amountNum * (bridgeFeePercent / 100);
    
    let networkFee = 0;
    let estimatedTime = '';
    
    if (fromAsset === 'BTC') {
      networkFee = feeRates.bitcoin[priority].fee / 100000000; // Convert satoshis to BTC
      estimatedTime = feeRates.bitcoin[priority].time;
    } else if (fromAsset === 'ETH') {
      networkFee = feeRates.ethereum[priority].fee / 1000000000000000000; // Convert wei to ETH
      estimatedTime = feeRates.ethereum[priority].time;
    }

    const totalFee = bridgeFee + networkFee;

    setCalculation({
      bridgeFee,
      networkFee,
      totalFee,
      estimatedTime,
      breakdown: {
        bridgeFeePercent,
        networkFeeAmount: networkFee,
        priority
      }
    });
    
    setIsCalculating(false);
  }, [amount, fromAsset, priority]);

  useEffect(() => {
    if (amount && fromAsset && toAsset) {
      calculateFees();
    }
  }, [amount, fromAsset, toAsset, priority, calculateFees]);

  const formatAmount = (value: number, asset: string) => {
    if (asset === 'BTC') {
      return `${value.toFixed(8)} BTC`;
    } else if (asset === 'ETH') {
      return `${value.toFixed(6)} ETH`;
    }
    return `${value.toFixed(6)} ${asset}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'slow':
        return 'text-green-500 bg-green-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'fast':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Fee Calculator' }
          ]}
          className="mb-8"
        />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Fee Calculator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Calculate the exact fees for bridging your assets between Bitcoin and Ethereum networks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
          >
            <div className="flex items-center mb-6">
              <Calculator className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-white">Bridge Calculator</h2>
            </div>

            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Bridge
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.00000001"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">
                    {fromAsset}
                  </div>
                </div>
              </div>

              {/* From Asset */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Asset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFromAsset('BTC')}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      fromAsset === 'BTC'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Bitcoin className="h-6 w-6 text-orange-500 mr-2" />
                      <span className="text-white font-medium">Bitcoin</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setFromAsset('ETH')}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      fromAsset === 'ETH'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">ETH</div>
                      <span className="text-white font-medium">Ethereum</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* To Asset */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Asset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setToAsset('BTC')}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      toAsset === 'BTC'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Bitcoin className="h-6 w-6 text-orange-500 mr-2" />
                      <span className="text-white font-medium">Bitcoin</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setToAsset('ETH')}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      toAsset === 'ETH'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">ETH</div>
                      <span className="text-white font-medium">Ethereum</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['slow', 'medium', 'fast'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        priority === p
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-sm font-medium capitalize ${
                          priority === p ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                          {p}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {fromAsset === 'BTC' ? feeRates.bitcoin[p].time : feeRates.ethereum[p].time}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
          >
            <div className="flex items-center mb-6">
              <DollarSign className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-2xl font-bold text-white">Fee Breakdown</h2>
            </div>

            {isCalculating ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mr-3" />
                <span className="text-gray-300">Calculating fees...</span>
              </div>
            ) : calculation ? (
              <div className="space-y-6">
                {/* Total Fee */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Fee</h3>
                    <p className="text-3xl font-bold text-blue-400">
                      {formatAmount(calculation.totalFee, fromAsset)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {((calculation.totalFee / parseFloat(amount)) * 100).toFixed(3)}% of amount
                    </p>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Fee Breakdown</h4>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Bridge Fee</span>
                      <span className="text-white font-semibold">
                        {formatAmount(calculation.bridgeFee, fromAsset)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {calculation.breakdown.bridgeFeePercent}% of transaction amount
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Network Fee</span>
                      <span className="text-white font-semibold">
                        {formatAmount(calculation.networkFee, fromAsset)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {calculation.breakdown.priority} priority
                    </div>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-300">Estimated Bridge Time</span>
                  </div>
                  <p className="text-white font-semibold">{calculation.estimatedTime}</p>
                </div>

                {/* Priority Badge */}
                <div className="flex justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
                    {priority.toUpperCase()} Priority
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Info className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Enter an amount to calculate fees</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Fee Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Fee Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Bridge Fee</h3>
              <p className="text-gray-400 text-sm">
                0.1% of the transaction amount. This covers the cost of maintaining the bridge infrastructure and ZK proof generation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Network Fee</h3>
              <p className="text-gray-400 text-sm">
                Variable fee based on network congestion and your chosen priority level. Higher priority = faster confirmation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Hidden Fees</h3>
              <p className="text-gray-400 text-sm">
                All fees are transparent and calculated upfront. No surprise charges or additional costs during the bridging process.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
