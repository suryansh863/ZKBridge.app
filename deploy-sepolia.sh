#!/bin/bash

# ZKBridge Sepolia Deployment Script
echo "🚀 ZKBridge Sepolia Deployment Script"
echo "======================================"

# Check if RPC URL is provided
if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ Error: SEPOLIA_RPC_URL environment variable not set"
    echo "Please set it with: export SEPOLIA_RPC_URL='https://sepolia.infura.io/v3/YOUR_PROJECT_ID'"
    exit 1
fi

# Check if private key is provided
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Please set it with: export PRIVATE_KEY='your_private_key'"
    exit 1
fi

echo "✅ Environment variables set"
echo "🔗 RPC URL: $SEPOLIA_RPC_URL"
echo "🔑 Wallet: $(echo $PRIVATE_KEY | cut -c1-10)..."
echo ""

# Navigate to contracts directory
cd contracts

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️  Compiling contracts..."
npx hardhat compile --silent

echo "🚀 Deploying to Sepolia..."
npx hardhat run scripts/deploy.ts --network sepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "📋 Next steps:"
    echo "1. Update frontend configuration with contract addresses"
    echo "2. Test the bridge functionality"
    echo "3. Verify contracts on Etherscan (optional)"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above for details."
    exit 1
fi
