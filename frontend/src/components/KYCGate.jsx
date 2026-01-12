import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  useDisclosure,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { ARIA_NFT_ADDRESS, ARIA_NFT_ABI } from '../constants';

// Mock IPFS upload for Hackathon speed (or use real pinata if keys available)
const mockUploadKYC = async (data) => {
  console.log("Uploading KYC Data to IPFS:", data);
  return "QmMockHash" + Math.floor(Math.random() * 1000000);
};

const KYCGate = ({ isConnected, provider, userAddress, onVerified }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    investorType: '1', // 1 = Basic, 2 = Verified, 3 = Accredited
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleKYCSubmit = async () => {
    if (!formData.fullName || !formData.country) {
      toast({ title: 'Please fill all fields', status: 'error' });
      return;
    }
    setLoading(true);
    try {
      // 1. Upload to IPFS
      const ipfsHash = await mockUploadKYC(formData);

      // 2. Call Contract
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(ARIA_NFT_ADDRESS, ARIA_NFT_ABI, signer);

      const tx = await nftContract.registerKYC(ipfsHash, formData.investorType);
      await tx.wait();

      toast({ title: 'KYC Submitted & Verified!', status: 'success' });
      if (onVerified) onVerified();
      onClose();
    } catch (error) {
      console.error("KYC Error:", error);
      toast({ title: 'KYC Failed', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" variant="outline" size="sm">
        Verify Identity (KYC)
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mantle Compliance: KYC Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.500">
                To trade Real-World Assets on Mantle, you must verify your identity.
              </Text>
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  placeholder="John Doe" 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Country/Region</FormLabel>
                <Select 
                  onChange={(e) => setFormData({...formData, country: e.target.value})} 
                  placeholder="Select country"
                >
                  <option value="US">United States</option>
                  <option value="IN">India</option>
                  <option value="UK">United Kingdom</option>
                  <option value="SG">Singapore</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Investor Status</FormLabel>
                <Select 
                  value={formData.investorType}
                  onChange={(e) => setFormData({...formData, investorType: e.target.value})}
                >
                  <option value="1">Retail Investor (Basic)</option>
                  <option value="3">Accredited Investor (Advanced)</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleKYCSubmit} isLoading={loading}>
              Submit Verification
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KYCGate;
