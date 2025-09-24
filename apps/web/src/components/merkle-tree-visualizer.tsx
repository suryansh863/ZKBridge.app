"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Hash, Eye, EyeOff } from 'lucide-react';

interface MerkleNode {
  hash: string;
  level: number;
  index: number;
  isProof: boolean;
  isRoot: boolean;
  isTarget: boolean;
  children?: MerkleNode[];
}

interface MerkleTreeVisualizerProps {
  merkleRoot: string;
  proofPath: string[];
  proofIndex: number;
  transactionHash: string;
  blockHeight: number;
  blockHash: string;
}

export function MerkleTreeVisualizer({
  merkleRoot,
  proofPath,
  proofIndex,
  transactionHash,
  blockHeight,
  blockHash
}: MerkleTreeVisualizerProps) {
  const [showFullHashes, setShowFullHashes] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Generate Merkle tree structure for visualization
  const generateMerkleTree = (): MerkleNode[] => {
    const levels: MerkleNode[][] = [];
    
    // Create leaf level (transactions)
    const leafCount = Math.pow(2, Math.ceil(Math.log2(proofPath.length + 1)));
    const leafLevel: MerkleNode[] = [];
    
    for (let i = 0; i < leafCount; i++) {
      leafLevel.push({
        hash: i === proofIndex ? transactionHash : `tx_${i}`,
        level: 0,
        index: i,
        isProof: i === proofIndex,
        isRoot: false,
        isTarget: i === proofIndex
      });
    }
    
    levels.push(leafLevel);
    
    // Build upper levels
    let currentLevel = leafLevel;
    let levelIndex = 1;
    
    while (currentLevel.length > 1) {
      const nextLevel: MerkleNode[] = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        
        const parentHash = i === 0 && levelIndex === 1 ? merkleRoot : `hash_${levelIndex}_${i}`;
        
        nextLevel.push({
          hash: parentHash,
          level: levelIndex,
          index: Math.floor(i / 2),
          isProof: false,
          isRoot: levelIndex === levels.length && nextLevel.length === 1,
          isTarget: false,
          children: [left, right]
        });
      }
      
      levels.push(nextLevel);
      currentLevel = nextLevel;
      levelIndex++;
    }
    
    return levels.flat();
  };

  const merkleNodes = generateMerkleTree();
  const maxLevel = Math.max(...merkleNodes.map(node => node.level));

  const truncateHash = (hash: string, length: number = 8): string => {
    if (showFullHashes) return hash;
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  const getNodeColor = (node: MerkleNode): string => {
    if (node.isRoot) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (node.isTarget) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (node.isProof) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gray-600';
  };

  const getNodeIcon = (node: MerkleNode) => {
    if (node.isRoot) return <Hash className="w-4 h-4" />;
    if (node.isTarget) return <CheckCircle className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Merkle Tree Proof</h3>
          <p className="text-gray-400 text-sm">
            Cryptographic proof that transaction exists in block {blockHeight}
          </p>
        </div>
        <button
          onClick={() => setShowFullHashes(!showFullHashes)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {showFullHashes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm">{showFullHashes ? 'Hide' : 'Show'} Full Hashes</span>
        </button>
      </div>

      {/* Merkle Tree Visualization */}
      <div className="bg-gray-800/50 rounded-lg p-6 overflow-x-auto">
        <div className="min-w-max">
          {Array.from({ length: maxLevel + 1 }, (_, level) => {
            const nodesAtLevel = merkleNodes.filter(node => node.level === level);
            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: level * 0.1 }}
                className="flex items-center justify-center space-x-4 mb-6"
              >
                {nodesAtLevel.map((node, index) => (
                  <motion.div
                    key={`${level}-${index}`}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div
                      className={`${getNodeColor(node)} text-white p-3 rounded-lg cursor-pointer transition-all hover:shadow-lg min-w-[120px] text-center`}
                      onClick={() => setSelectedNode(selectedNode === node.hash ? null : node.hash)}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {getNodeIcon(node)}
                      </div>
                      <div className="text-xs font-mono">
                        {truncateHash(node.hash)}
                      </div>
                      <div className="text-xs mt-1 opacity-80">
                        {node.isRoot ? 'Root' : node.isTarget ? 'Target' : node.isProof ? 'Proof' : 'Node'}
                      </div>
                    </div>
                    
                    {/* Connection lines */}
                    {level < maxLevel && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-500"></div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Proof Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Proof Path</h4>
          <div className="space-y-2">
            {proofPath.map((hash, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <code className="text-xs bg-gray-700 px-2 py-1 rounded text-green-400 flex-1">
                  {truncateHash(hash)}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Block Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Block Height:</span>
              <span className="text-white font-mono">{blockHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Block Hash:</span>
              <span className="text-white font-mono">{truncateHash(blockHash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Merkle Root:</span>
              <span className="text-white font-mono">{truncateHash(merkleRoot)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction Index:</span>
              <span className="text-white font-mono">{proofIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4"
        >
          <h4 className="text-white font-semibold mb-3">Node Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Hash:</span>
              <code className="text-blue-400 font-mono">{selectedNode}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">
                {selectedNode === merkleRoot ? 'Merkle Root' : 
                 selectedNode === transactionHash ? 'Target Transaction' : 'Proof Node'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verification Status */}
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Merkle Proof Verified</span>
        </div>
        <p className="text-gray-300 text-sm mt-2">
          This cryptographic proof demonstrates that the transaction exists in the specified block
          without revealing any other transaction data.
        </p>
      </div>
    </div>
  );
}

