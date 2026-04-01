const fs = require('fs');

// Fix BTCRelay missing notEmergency and Natspec
let btc = fs.readFileSync('contracts/contracts/BTCRelay.sol', 'utf8');
btc = btc.replace(/@param height The block height/g, '@param blockHash The block hash');
btc = btc.replace(/notEmergency\n/g, '');
fs.writeFileSync('contracts/contracts/BTCRelay.sol', btc);

// Fix ProofVerifier Natspec
let proofVerifier = fs.readFileSync('contracts/contracts/ProofVerifier.sol', 'utf8');
proofVerifier = proofVerifier.replace(/@param verificationKey The new verification key/g, '@param verifierContract The new verification contract');
fs.writeFileSync('contracts/contracts/ProofVerifier.sol', proofVerifier);
