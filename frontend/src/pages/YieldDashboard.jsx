import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Badge,
  Container,
  VStack
} from '@chakra-ui/react';
import { ethers } from 'ethers';

// Placeholder ABI - In real app, import from artifacts
const YIELD_ABI = [
  "function getClaimableYield(uint256 tokenId) external view returns (uint256)",
  "function claimYield(uint256 tokenId) external",
  "event YieldClaimed(uint256 indexed tokenId, address indexed owner, uint256 amount)"
];

const MOCK_YIELD_DATA = [
  { tokenId: 1, name: "Invoice #BLR8-658", asset: "USDC", apy: "12.5%", claimable: "47.32", contract: "0x123..." },
  { tokenId: 5, name: "Property Deed #22", asset: "ETH", apy: "5.2%", claimable: "0.045", contract: "0x456..." },
];

const YieldDashboard = ({ provider, address }) => {
  const [loading, setLoading] = useState({});
  const toast = useToast();

  const handleClaim = async (tokenId, amount) => {
    setLoading(prev => ({ ...prev, [tokenId]: true }));
    try {
      // Simulation for Hackathon Demo
      // In prod: const contract = new ethers.Contract(YIELD_DISTRIBUTOR_ADDRESS, YIELD_ABI, provider.getSigner());
      // await contract.claimYield(tokenId);
      
      await new Promise(r => setTimeout(r, 1500)); // Fake tx delay
      
      toast({
        title: "Yield Claimed Successfully!",
        description: `You received ${amount} to your wallet.`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({ title: "Claim Failed", status: "error" });
    } finally {
      setLoading(prev => ({ ...prev, [tokenId]: false }));
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Yield Dashboard 💰</Heading>
          <Text color="gray.400">Track and claim earnings from your Real-World Assets.</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box p={6} bg="purple.900" borderRadius="lg" border="1px" borderColor="purple.700">
            <Stat>
              <StatLabel color="purple.200">Total Yield Earned</StatLabel>
              <StatNumber fontSize="3xl" color="white">$1,247.32</StatNumber>
              <StatHelpText color="purple.300">Lifetime Earnings</StatHelpText>
            </Stat>
          </Box>
          <Box p={6} bg="blue.900" borderRadius="lg" border="1px" borderColor="blue.700">
             <Stat>
              <StatLabel color="blue.200">Claimable Balance</StatLabel>
              <StatNumber fontSize="3xl" color="white">$182.12</StatNumber>
              <StatHelpText color="blue.300">Available Now</StatHelpText>
            </Stat>
          </Box>
          <Box p={6} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.700">
             <Stat>
              <StatLabel color="gray.400">Active Assets</StatLabel>
              <StatNumber fontSize="3xl" color="white">3</StatNumber>
              <StatHelpText>Generating Yield</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        <Box bg="gray.800" borderRadius="lg" p={6} overflowX="auto">
          <Heading size="md" mb={6}>Your Yield Streams</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Asset Name</Th>
                <Th>Token ID</Th>
                <Th>APY / ROI</Th>
                <Th>Claimable</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {MOCK_YIELD_DATA.map((item) => (
                <Tr key={item.tokenId}>
                  <Td fontWeight="bold">{item.name}</Td>
                  <Td>#{item.tokenId}</Td>
                  <Td>
                    <Badge colorScheme="green">{item.apy}</Badge>
                  </Td>
                  <Td>{item.claimable} {item.asset}</Td>
                  <Td>
                    <Button 
                      size="sm" 
                      colorScheme="purple" 
                      onClick={() => handleClaim(item.tokenId, item.claimable + ' ' + item.asset)}
                      isLoading={loading[item.tokenId]}
                    >
                      Claim Rewards
                    </Button>
                  </Td>
                </Tr>
              ))}
              <Tr>
                 <Td fontWeight="bold" color="gray.500">Supply Chain Batch #99</Td>
                 <Td>#8</Td>
                 <Td><Badge>0%</Badge></Td>
                 <Td>0.00</Td>
                 <Td><Button size="sm" isDisabled>No Yield</Button></Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default YieldDashboard;
