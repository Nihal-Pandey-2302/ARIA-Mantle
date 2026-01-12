// src/pages/HomePage.jsx - WITH IPFS LINK SUPPORT
import { useState, useCallback } from 'react';
import { VStack, Alert, AlertIcon, Heading, useToast, Box, Spinner, Text } from '@chakra-ui/react';
import FileUpload from '../components/FileUpload';
import LiveWorkflowVisualizer from '../components/LiveWorkflowVisualizer';
import AIReportCard from '../components/AIReportCard';
import NftActions from '../components/NftActions';
import { BACKEND_URL, ARIA_NFT_INTERFACE, publicProvider } from '../constants';

export default function HomePage({ address, provider, signer }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState('idle');
  const [isConfirming, setIsConfirming] = useState(false);
  const toast = useToast();

  const waitForTxConfirmation = useCallback(async (txHash) => {
    // Use publicProvider for robust reading, fallback to wallet provider if needed
    const readProvider = publicProvider || provider;
    
    if (!readProvider) {
      toast({ title: "Provider not ready", description: "No connection to blockchain.", status: "error" });
      return;
    }

    setIsConfirming(true);
    setWorkflowStatus('confirming');

    try {
      const formattedTxHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
      console.log("Waiting for transaction (polling):", formattedTxHash);

      // Manual polling for receipt (more robust for cross-provider/RPC delays)
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 60; // 60 * 2s = 120s timeout

      while (!receipt && attempts < maxAttempts) {
        attempts++;
        
        // 1. Try Public Provider
        try {
          receipt = await readProvider.getTransactionReceipt(formattedTxHash);
        } catch (err) {
          console.warn(`Public Provider check failed (Attempt ${attempts}):`, err.message);
        }

        // 2. If no receipt yet, try Wallet Provider (MetaMask)
        if (!receipt && provider && provider !== readProvider) {
          try {
             const walletReceipt = await provider.getTransactionReceipt(formattedTxHash);
             if (walletReceipt) receipt = walletReceipt;
          } catch (err) {
             console.warn("Wallet Provider check failed:", err.message);
          }
        }
        
        if (!receipt) {
            if (attempts % 5 === 0) console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s
        }
      }

      console.log("Transaction receipt:", receipt);

      if (!receipt || receipt.status === 0) {
        throw new Error("Transaction failed, reverted, or timed out.");
      }

      // Parse logs to get tokenId
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = ARIA_NFT_INTERFACE.parseLog(log);
          if (parsedLog && parsedLog.name === "Transfer") {
            tokenId = parsedLog.args[2].toString();
            console.log("Found tokenId:", tokenId);
            break;
          }
        } catch (e) {
            // Ignore parse errors for other events
        }
      }

      if (tokenId) {
        setApiResult(prev => ({ ...prev, confirmedTokenId: tokenId }));
        setWorkflowStatus('minted');
        toast({ title: "Mint Confirmed!", description: `Your NFT (ID: ${tokenId}) is now on-chain.`, status: "success", duration: 5000 });
      } else {
        console.warn("Could not find Token ID in transaction receipt");
        setWorkflowStatus('minted');
        toast({ title: "Mint Confirmed!", description: "Transaction successful! Check the explorer for token ID.", status: "success", duration: 5000 });
      }

    } catch (e) {
      console.error("Transaction confirmation error:", e);
      setError(`Transaction failed: ${e.message}`);
      setWorkflowStatus('error');
      toast({ 
        title: "Transaction Failed", 
        description: (
          <Box>
            <Text>{e.message || "Please check the block explorer for details"}</Text>
          </Box>
        ),
        status: "error", 
        duration: 7000 
      });
    } finally {
      setIsConfirming(false);
    }
  }, [provider, toast]);

  const handleAnalyzeAndMint = useCallback(async (documentType) => {
    if (!selectedFile) return toast({ title: "No file selected", status: "warning" });
    if (!address) return toast({ title: "Please connect your wallet", status: "warning" });
    if (!documentType) return toast({ title: "No document type selected", status: "warning" });

    setLoading(true);
    setError(null);
    setApiResult(null);
    setWorkflowStatus('analyzing');

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('owner_address', address);
      formData.append('document_type', documentType);

      console.log("Sending request to backend...");
      console.log("Document type:", documentType);
      
      const response = await fetch(`${BACKEND_URL}/analyze_and_mint`, { 
        method: 'POST', 
        body: formData 
      });
      
      const result = await response.json();
      console.log("Backend response:", result);

      if (!response.ok) throw new Error(result.error || 'Failed to analyze and mint');
      if (!result.txId) throw new Error('No transaction hash received from backend');

      setApiResult(result);
      toast({ 
        title: "Mint Transaction Sent!", 
        description: "Waiting for blockchain confirmation...", 
        status: "info", 
        duration: 3000 
      });

      await waitForTxConfirmation(result.txId);

    } catch (err) {
      console.error('Error in handleAnalyzeAndMint:', err);
      setError(err.message);
      setWorkflowStatus('error');
      toast({ title: "Error", description: err.message, status: "error", duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [selectedFile, address, toast, waitForTxConfirmation]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setApiResult(null);
    setError(null);
    setWorkflowStatus('idle');
    setIsConfirming(false);
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box p={6} shadow="lg" borderWidth="1px" borderRadius="xl" width="100%" bg="gray.800">
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          🚀 Mint Your Verified RWA NFT
        </Heading>

        <FileUpload
          selectedFile={selectedFile}
          setSelectedFile={handleFileSelect}
          onAnalyzeAndMint={handleAnalyzeAndMint}
          isLoading={loading || isConfirming}
          isMinted={workflowStatus === 'minted'}
        />

        {(loading || apiResult || isConfirming) && <LiveWorkflowVisualizer status={workflowStatus} />}

        {isConfirming && (
          <VStack mt={4} spacing={2}>
            <Spinner size="lg" color="blue.500" />
            <Text>Confirming transaction on the blockchain...</Text>
          </VStack>
        )}

        {error && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {apiResult && (workflowStatus === 'minted' || apiResult.confirmedTokenId) && (
          <>
            <AIReportCard report={apiResult.ai_report_display} ipfsLink={apiResult.ipfs_link} />
            {/* ✅ UPDATED: Pass ipfsLink to NftActions */}
            <NftActions
              txId={apiResult.txId}
              address={address}
              tokenId={apiResult.confirmedTokenId}
              signer={signer}
              ipfsLink={apiResult.ipfs_link}
              documentType={apiResult.document_type}
              documentIcon={apiResult.document_icon}
              documentName={apiResult.document_name}
            />
          </>
        )}
      </Box>
    </VStack>
  );
}