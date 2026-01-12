import React, { useState, useEffect } from 'react';
import { Badge, HStack, Icon, Text } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons'; // Or a ShieldCheck from lucide-react
import { ethers } from 'ethers';
import { ARIA_NFT_ADDRESS, ARIA_NFT_ABI } from '../constants';
import KYCGate from './KYCGate';

const KYGCStatusCheck = ({ address, provider }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkKYC = async () => {
    if (!address || !provider) return;
    try {
      // Use a read-only provider if signer not available yet, but provider should be good
      const contract = new ethers.Contract(ARIA_NFT_ADDRESS, ARIA_NFT_ABI, provider);
      
      // kycStatus is a mapping(address => enum KYCLevel)
      // Level 0 = None, >0 = Verified
      const status = await contract.kycStatus(address);
      // status is a BigInt (0, 1, 2, 3)
      setIsVerified(status > 0n);
    } catch (err) {
      console.error("KYC Check Error:", err);
    }
  };

  useEffect(() => {
    checkKYC();
    // Re-check periodically or could rely on an event listener
    const interval = setInterval(checkKYC, 10000); 
    return () => clearInterval(interval);
  }, [address, provider]);

  if (isVerified) {
    return (
      <Badge 
        colorScheme="green" 
        variant="solid" 
        px={3} 
        py={1.5} 
        borderRadius="full"
        display="flex"
        alignItems="center"
        gap={2}
        boxShadow="0 0 10px rgba(72, 187, 120, 0.4)"
      >
        <Icon as={CheckCircleIcon} boxSize={3} />
        <Text fontWeight="bold" fontSize="xs">KYC VERIFIED</Text>
      </Badge>
    );
  }

  return (
    <KYCGate 
      isConnected={!!address} 
      provider={provider} 
      userAddress={address} 
      onVerified={checkKYC} // Callback to refresh status instantly
    />
  );
};

export default KYGCStatusCheck;
