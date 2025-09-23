"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  ArrowRight, 
  Shield, 
  Clock, 
  DollarSign, 
  Network,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface AssetInfo {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  networks: string[];
  minAmount: string;
  maxAmount: string;
  fee: string;
  confirmationTime: string;
  status: 'active' | 'maintenance' | 'coming-soon';
}

const supportedAssets: AssetInfo[] = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: <Bitcoin className="h-8 w-8 text-orange-500" />,
    networks: ['Bitcoin Mainnet', 'Bitcoin Testnet'],
    minAmount: '0.001 BTC',
    maxAmount: '10 BTC',
    fee: '0.1% + Network Fee',
    confirmationTime: '10-60 minutes',
    status: 'active'
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">ETH</div>,
    networks: ['Ethereum Mainnet', 'Ethereum Testnet'],
    minAmount: '0.01 ETH',
    maxAmount: '100 ETH',
    fee: '0.1% + Gas Fee',
    confirmationTime: '2-5 minutes',
    status: 'active'
  }
];

const networkStatus = {
  bitcoin: {
    mainnet: { status: 'operational', blockHeight: 820000, avgConfirmationTime: '10 minutes' },
    testnet: { status: 'operational', blockHeight: 2500000, avgConfirmationTime: '10 minutes' }
  },
  ethereum: {
    mainnet: { status: 'operational', blockHeight: 18500000, avgConfirmationTime: '2 minutes' },
    testnet: { status: 'operational', blockHeight: 12000000, avgConfirmationTime: '2 minutes' }
  }
};

export default function BridgeAssetsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Bridge Assets' }
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
            Bridge Assets
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the supported cryptocurrencies and networks for trustless bridging 
            between Bitcoin and Ethereum ecosystems.
          </p>
        </motion.div>

        {/* Network Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center mb-4">
              <Bitcoin className="h-6 w-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-white">Bitcoin Network</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mainnet Status</span>
                <div className="flex items-center">
                  {getStatusIcon(networkStatus.bitcoin.mainnet.status)}
                  <span className={`ml-2 ${getStatusColor(networkStatus.bitcoin.mainnet.status)}`}>
                    {networkStatus.bitcoin.mainnet.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Testnet Status</span>
                <div className="flex items-center">
                  {getStatusIcon(networkStatus.bitcoin.testnet.status)}
                  <span className={`ml-2 ${getStatusColor(networkStatus.bitcoin.testnet.status)}`}>
                    {networkStatus.bitcoin.testnet.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">ETH</div>
              <h3 className="text-xl font-semibold text-white">Ethereum Network</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mainnet Status</span>
                <div className="flex items-center">
                  {getStatusIcon(networkStatus.ethereum.mainnet.status)}
                  <span className={`ml-2 ${getStatusColor(networkStatus.ethereum.mainnet.status)}`}>
                    {networkStatus.ethereum.mainnet.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Testnet Status</span>
                <div className="flex items-center">
                  {getStatusIcon(networkStatus.ethereum.testnet.status)}
                  <span className={`ml-2 ${getStatusColor(networkStatus.ethereum.testnet.status)}`}>
                    {networkStatus.ethereum.testnet.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supported Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Supported Assets
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {supportedAssets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  {asset.icon}
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">{asset.name}</h3>
                    <p className="text-gray-400">{asset.symbol}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      asset.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : asset.status === 'maintenance'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {asset.status === 'active' ? 'Active' : 
                       asset.status === 'maintenance' ? 'Maintenance' : 'Coming Soon'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Supported Networks</h4>
                    <div className="flex flex-wrap gap-2">
                      {asset.networks.map((network, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm text-gray-300">
                          {network}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-300">Min Amount</span>
                      </div>
                      <p className="text-white font-semibold">{asset.minAmount}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-300">Max Amount</span>
                      </div>
                      <p className="text-white font-semibold">{asset.maxAmount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-300">Bridge Fee</span>
                      </div>
                      <p className="text-white font-semibold">{asset.fee}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-300">Confirmation Time</span>
                      </div>
                      <p className="text-white font-semibold">{asset.confirmationTime}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bridge Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Bridge Requirements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
              <p className="text-gray-400 text-sm">
                All transactions are secured by Zero-Knowledge proofs and cryptographic verification
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Network className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Network</h3>
              <p className="text-gray-400 text-sm">
                Compatible with Bitcoin and Ethereum mainnet and testnet networks
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trustless</h3>
              <p className="text-gray-400 text-sm">
                No intermediaries required - direct peer-to-peer bridging with cryptographic guarantees
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Bridge Your Assets?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start bridging Bitcoin and Ethereum with our trustless, secure, and fast bridge protocol.
          </p>
          <a
            href="/bridge"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Bridging
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
