"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface NetworkData {
  name: string;
  icon: React.ReactNode;
  status: 'operational' | 'degraded' | 'outage';
  blockHeight: number;
  avgBlockTime: string;
  mempoolSize: number;
  feeRate: {
    slow: number;
    medium: number;
    fast: number;
  };
  lastUpdate: string;
  uptime: string;
}

const mockNetworkData: NetworkData[] = [
  {
    name: 'Bitcoin Mainnet',
    icon: <Bitcoin className="h-6 w-6 text-orange-500" />,
    status: 'operational',
    blockHeight: 820000,
    avgBlockTime: '10.2 minutes',
    mempoolSize: 15420,
    feeRate: {
      slow: 5,
      medium: 12,
      fast: 25
    },
    lastUpdate: '2 minutes ago',
    uptime: '99.9%'
  },
  {
    name: 'Bitcoin Testnet',
    icon: <Bitcoin className="h-6 w-6 text-orange-400" />,
    status: 'operational',
    blockHeight: 2500000,
    avgBlockTime: '9.8 minutes',
    mempoolSize: 2340,
    feeRate: {
      slow: 1,
      medium: 2,
      fast: 5
    },
    lastUpdate: '1 minute ago',
    uptime: '99.8%'
  },
  {
    name: 'Ethereum Mainnet',
    icon: <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">ETH</div>,
    status: 'operational',
    blockHeight: 18500000,
    avgBlockTime: '12.1 seconds',
    mempoolSize: 125000,
    feeRate: {
      slow: 15,
      medium: 25,
      fast: 45
    },
    lastUpdate: '30 seconds ago',
    uptime: '99.7%'
  },
  {
    name: 'Ethereum Testnet',
    icon: <div className="h-6 w-6 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xs">ETH</div>,
    status: 'operational',
    blockHeight: 12000000,
    avgBlockTime: '12.0 seconds',
    mempoolSize: 8500,
    feeRate: {
      slow: 1,
      medium: 2,
      fast: 3
    },
    lastUpdate: '15 seconds ago',
    uptime: '99.9%'
  }
];

const bridgeMetrics = {
  totalBridges: 15420,
  successRate: 99.2,
  avgBridgeTime: '8.5 minutes',
  totalVolume: '$2.4M',
  activeUsers: 3420
};

export default function NetworkStatusPage() {
  const [mounted, setMounted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500 bg-green-500/20';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'outage':
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
            { label: 'Network Status' }
          ]}
          className="mb-8"
        />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mr-4">
              Network Status
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time monitoring of Bitcoin and Ethereum networks, bridge performance, and system health.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-400">All Systems Operational</h2>
              <p className="text-green-300">All networks and bridge services are running normally</p>
            </div>
          </div>
        </motion.div>

        {/* Bridge Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <Activity className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{bridgeMetrics.totalBridges.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">Total Bridges</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{bridgeMetrics.successRate}%</h3>
            <p className="text-gray-400 text-sm">Success Rate</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{bridgeMetrics.avgBridgeTime}</h3>
            <p className="text-gray-400 text-sm">Avg Bridge Time</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <TrendingUp className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{bridgeMetrics.totalVolume}</h3>
            <p className="text-gray-400 text-sm">Total Volume</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <Activity className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">{bridgeMetrics.activeUsers.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">Active Users</p>
          </div>
        </motion.div>

        {/* Network Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {mockNetworkData.map((network, index) => (
            <motion.div
              key={network.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {network.icon}
                  <h3 className="text-xl font-semibold text-white ml-3">{network.name}</h3>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(network.status)}`}>
                  {getStatusIcon(network.status)}
                  <span className="ml-2 text-sm font-medium capitalize">{network.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Block Height</p>
                  <p className="text-white font-semibold">{network.blockHeight.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Avg Block Time</p>
                  <p className="text-white font-semibold">{network.avgBlockTime}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Mempool Size</p>
                  <p className="text-white font-semibold">{network.mempoolSize.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Uptime</p>
                  <p className="text-white font-semibold">{network.uptime}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">Fee Rates (sat/vB)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Slow</p>
                    <p className="text-white font-semibold">{network.feeRate.slow}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Medium</p>
                    <p className="text-white font-semibold">{network.feeRate.medium}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Fast</p>
                    <p className="text-white font-semibold">{network.feeRate.fast}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Last updated: {network.lastUpdate}</span>
                <a 
                  href="#" 
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Explorer
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Historical Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Historical Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">99.2% Uptime</h3>
              <p className="text-gray-400 text-sm">Last 30 days</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">8.5 min</h3>
              <p className="text-gray-400 text-sm">Average bridge time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">15,420</h3>
              <p className="text-gray-400 text-sm">Successful bridges</p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
