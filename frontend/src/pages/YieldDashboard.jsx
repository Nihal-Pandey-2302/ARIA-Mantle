import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
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
  VStack,
  Spinner
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { 
  YIELD_DISTRIBUTOR_ADDRESS, 
  YIELD_DISTRIBUTOR_ABI, 
  ARIA_NFT_ADDRESS, 
  ARIA_NFT_ABI,
  publicProvider 
} from '../constants';

const YieldDashboard = ({ provider, address }) => {
  const [yields, setYields] = useState([]);
  const [totalClaimable, setTotalClaimable] = useState('0');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (address) {
        loadYieldData();
    }
  }, [address]);

  const loadYieldData = async () => {
    try {
      // Use publicProvider for robust reads
      const readProvider = publicProvider || provider;
      if (!readProvider) return;

      const yieldContract = new ethers.Contract(
        YIELD_DISTRIBUTOR_ADDRESS,
        YIELD_DISTRIBUTOR_ABI,
        readProvider
      );
      
      const ariaNFTContract = new ethers.Contract(
        ARIA_NFT_ADDRESS,
        ARIA_NFT_ABI,
        readProvider
      );
      
      // Strategy: Find Transfer events to the user, then verify current ownership
      // This works around lack of ERC721Enumerable
      // Optimization: Restrict block range to avoid RPC 503 errors (scanning from 0 is too heavy)
      const currentBlock = await readProvider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000); // Scan last ~24h (Mantle block time is fast)
      
      const filter = ariaNFTContract.filters.Transfer(null, address);
      const events = await ariaNFTContract.queryFilter(filter, fromBlock);
      
      // Get unique token IDs from incoming transfers
      const uniqueTokenIds = [...new Set(events.map(e => e.args[2].toString()))];
      
      const yieldData = [];
      let total = 0n; // Use BigInt for calculation
      
      for (const tokenId of uniqueTokenIds) {
        // Double check ownership (user might have sold it)
        try {
            const currentOwner = await ariaNFTContract.ownerOf(tokenId);
            if (currentOwner.toLowerCase() !== address.toLowerCase()) continue;

            const pending = await yieldContract.pendingYield(tokenId, address);
            const stats = await yieldContract.getYieldStats(tokenId);
            
            // Get NFT metadata
            const tokenURI = await ariaNFTContract.tokenURI(tokenId);
            let metadata = { name: `SWA #${tokenId}` };
            try {
                // Check if it's an IPFS hash or full URL
                const url = tokenURI.startsWith('ipfs://') 
                    ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}` 
                    : tokenURI;
                metadata = await fetch(url).then(r => r.json());
            } catch (e) {
                console.warn("Failed to fetch metadata", e);
            }
            
            yieldData.push({
              tokenId: tokenId.toString(),
              name: metadata.name || `Asset #${tokenId.toString()}`,
              claimable: ethers.formatEther(pending),
              totalYield: ethers.formatEther(stats[0]), // stats.totalYield
              yieldRate: stats[2].toString(), // stats.yieldRate
              active: stats[3] // stats.active
            });
            
            total += BigInt(pending);
        } catch (err) {
            console.warn(`Error checking token ${tokenId}`, err);
        }
      }
      
      setYields(yieldData);
      setTotalClaimable(ethers.formatEther(total));
    } catch (error) {
        console.error("Failed to load yield data", error);
        toast({ title: "Failed to load yield data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (tokenId) => {
    if (!provider) return;
    try {
      const signer = await provider.getSigner();
      const yieldContract = new ethers.Contract(
        YIELD_DISTRIBUTOR_ADDRESS,
        YIELD_DISTRIBUTOR_ABI,
        signer
      );
      
      const tx = await yieldContract.claimYield(tokenId);
      toast({
        title: "Claim Submitted",
        description: "Waiting for confirmation...",
        status: "info"
      });
      await tx.wait();
      
      toast({
        title: "Yield Claimed Successfully!",
        status: "success",
      });
      loadYieldData(); // Refresh
    } catch (error) {
      toast({ title: "Failed to claim yield", description: error.message, status: "error" });
      console.error(error);
    }
  };

  if (loading) return (
      <Container maxW="container.xl" py={8} centerContent>
          <Spinner size="xl" />
          <Text mt={4}>Loading Yield Data...</Text>
      </Container>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Yield Dashboard 💰</Heading>
          <Text color="gray.400">Track and claim earnings from your Real-World Assets.</Text>
        </Box>

        <Box p={6} bg="purple.900" borderRadius="lg" border="1px" borderColor="purple.700">
            <Stat>
            <StatLabel color="purple.200">Total Claimable Yield</StatLabel>
            <StatNumber fontSize="3xl" color="white">{totalClaimable} ARIA</StatNumber>
            <StatHelpText color="purple.300">From {yields.length} RWA NFTs</StatHelpText>
            </Stat>
        </Box>
        
        <Box bg="gray.800" borderRadius="lg" p={6} overflowX="auto">
            <Heading size="md" mb={6}>Your Yield Streams</Heading>
            <Table variant="simple">
                <Thead>
                <Tr>
                    <Th>Asset Name</Th>
                    <Th>Token ID</Th>
                    <Th>Status</Th>
                    <Th>Claimable</Th>
                    <Th>Total Generated</Th>
                    <Th>Action</Th>
                </Tr>
                </Thead>
                <Tbody>
                {yields.map((y) => (
                    <Tr key={y.tokenId}>
                    <Td fontWeight="bold">{y.name}</Td>
                    <Td>#{y.tokenId}</Td>
                    <Td>
                        <Badge colorScheme={y.active ? 'green' : 'gray'}>
                        {y.active ? 'Active' : 'Paused'}
                        </Badge>
                    </Td>
                    <Td>{Number(y.claimable).toFixed(4)} ARIA</Td>
                    <Td>{Number(y.totalYield).toFixed(4)} ARIA</Td>
                    <Td>
                        <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={() => handleClaim(y.tokenId)}
                        isDisabled={parseFloat(y.claimable) <= 0}
                        >
                        Claim
                        </Button>
                    </Td>
                    </Tr>
                ))}
                
                {yields.length === 0 && (
                    <Tr>
                        <Td colSpan={6} textAlign="center" py={4} color="gray.500">
                            You don't own any yield-generating RWA NFTs yet.
                        </Td>
                    </Tr>
                )}
                </Tbody>
            </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default YieldDashboard;
