"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Zap,
  Shield
} from 'lucide-react';
import { useEthereum } from '@/hooks/useEthereum';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

interface EthereumBridgeInterfaceProps {
  onTransactionStart?: (data: any) => void;
  onTransactionComplete?: (data: any) => void;
}

export function EthereumBridgeInterface({ 
  onTransactionStart, 
  onTransactionComplete 
}: EthereumBridgeInterfaceProps) {
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [btcTxHash, setBtcTxHash] = useState('');
  const [merkleProof, setMerkleProof] = useState('');
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

  const {
    isConnected,
    address,
    ethBalance,
    wrappedBTCBalance,
    allowance,
    bridgeTransactions,
    gasEstimate,
    isLoading,
    isClaiming,
    isBurning,
    isApproving,
    error,
    setError,
    claimBitcoinOnEthereum,
    burnWrappedBTCForBitcoin,
    estimateGas,
  } = useEthereum();

  // Auto-estimate gas when amount changes
  useEffect(() => {
    if (amount && isConnected) {
      estimateGasForBurn();
    }
  }, [amount, isConnected]);

  const estimateGasForBurn = async () => {
    if (!amount) return;
    
    setIsEstimatingGas(true);
    try {
      await estimateGas('burnWrappedBTC', [parseFloat(amount) * 1e8]);
    } catch (error) {
      console.error('Gas estimation failed:', error);
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleClaimBitcoin = async () => {
    if (!btcTxHash || !merkleProof || !btcAddress || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await claimBitcoinOnEthereum(btcTxHash, merkleProof, btcAddress, amount);
      onTransactionStart?.({ type: 'claim', amount, btcTxHash });
    } catch (error) {
      console.error('Failed to claim Bitcoin:', error);
    }
  };

  const handleBurnWrappedBTC = async () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(wrappedBTCBalance)) {
      setError('Insufficient wrapped BTC balance');
      return;
    }

    try {
      await burnWrappedBTCForBitcoin(amount);
      onTransactionStart?.({ type: 'burn', amount });
    } catch (error) {
      console.error('Failed to burn wrapped BTC:', error);
    }
  };

  const formatBalance = (balance: string, decimals: number = 4) => {
    return parseFloat(balance).toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 text-center">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-300 mb-6">
          Connect your Ethereum wallet to start bridging Bitcoin
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Your Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">ETH Balance</p>
              <p className="text-xl font-semibold text-white">{formatBalance(ethBalance)} ETH</p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">ETH</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Wrapped BTC</p>
              <p className="text-xl font-semibold text-white">{formatBalance(wrappedBTCBalance)} ZKBTC</p>
            </div>
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">BTC</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Claim Bitcoin Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Claim Bitcoin on Ethereum</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bitcoin Transaction Hash
            </label>
            <input
              type="text"
              value={btcTxHash}
              onChange={(e) => setBtcTxHash(e.target.value)}
              placeholder="Enter Bitcoin transaction hash"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Merkle Proof
            </label>
            <textarea
              value={merkleProof}
              onChange={(e) => setMerkleProof(e.target.value)}
              placeholder="Enter Merkle proof data"
              rows={3}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bitcoin Address
              </label>
              <input
                type="text"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="Enter Bitcoin address"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (BTC)
              </label>
              <input
                type="number"
                step="0.00000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleClaimBitcoin}
            disabled={isLoading || !btcTxHash || !merkleProof || !btcAddress || !amount}
            className={cn(
              "w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300",
              isLoading || !btcTxHash || !merkleProof || !btcAddress || !amount
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
            )}
          >
            {isClaiming ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Claiming Bitcoin...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Claim Bitcoin
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Burn Wrapped BTC Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center mb-4">
          <ArrowRightLeft className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Burn Wrapped BTC for Bitcoin</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Burn (ZKBTC)
            </label>
            <input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00000000"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Available: {formatBalance(wrappedBTCBalance)} ZKBTC
            </p>
          </div>

          {/* Gas Estimation */}
          {gasEstimate && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-300">Gas Estimation</span>
              </div>
              <div className="text-sm text-gray-400">
                <p>Gas Limit: {gasEstimate.gasLimit.toString()}</p>
                <p>Gas Price: {gasEstimate.gasPrice.toString()} wei</p>
                <p>Total Cost: {gasEstimate.totalCost} ETH</p>
              </div>
            </div>
          )}

          {/* Allowance Check */}
          {parseFloat(amount) > parseFloat(allowance) && amount && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-400">Approval Required</span>
              </div>
              <p className="text-sm text-yellow-300">
                You need to approve the bridge contract to spend your wrapped BTC first.
              </p>
            </div>
          )}

          <button
            onClick={handleBurnWrappedBTC}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className={cn(
              "w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300",
              isLoading || !amount || parseFloat(amount) <= 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
            )}
          >
            {isBurning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Burning ZKBTC...
              </>
            ) : isApproving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-5 w-5 mr-2" />
                Burn ZKBTC for Bitcoin
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Bridge Transactions */}
      {bridgeTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Bridge Transactions</h3>
          <div className="space-y-3">
            {bridgeTransactions.slice(0, 5).map((tx, index) => (
              <div key={tx.bridgeId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  {tx.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {tx.amount} BTC {tx.status === 'completed' ? 'claimed' : 'pending'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://etherscan.io/tx/${tx.btcTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-400 font-medium">Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-sm mt-2"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
}

