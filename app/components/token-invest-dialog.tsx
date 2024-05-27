import { SiteConfigContracts } from "@/config/site";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";
import useError from "@/hooks/useError";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { erc20Abi, formatEther, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export function TokenInvestDialog(props: {
  token: string;
  tokenInvestmentAmount: string;
  tokenInvestmentToken: `0x${string}`;
  tokenInvestmentTokenSymbol: string;
  contracts: SiteConfigContracts;
  onInvest?: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function onSubmit() {
    try {
      setIsFormSubmitting(true);
      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Check chain
      if (chainId !== props.contracts.chain.id) {
        throw new Error(`You need to connect to ${props.contracts.chain.name}`);
      }

      // Send request to approve transfer and invest
      if (props.contracts.accountAbstractionSuported) {
        // TODO: Implement
      } else {
        const approveAmount = parseEther("1000000000");
        const { request: approveRequest } = await publicClient.simulateContract(
          {
            address: props.tokenInvestmentToken,
            abi: erc20Abi,
            functionName: "approve",
            args: [props.contracts.farmersToken, approveAmount],
            chain: props.contracts.chain,
            account: address,
          }
        );
        const approveTxHash = await walletClient.writeContract(approveRequest);
        await publicClient.waitForTransactionReceipt({
          hash: approveTxHash,
        });
        const { request: investRequest } = await publicClient.simulateContract({
          address: props.contracts.farmersToken,
          abi: FarmersTokenAbi,
          functionName: "makeInvestment",
          args: [BigInt(props.token)],
          chain: props.contracts.chain,
          account: address,
        });
        const investTxHash = await walletClient.writeContract(investRequest);
        await publicClient.waitForTransactionReceipt({
          hash: investTxHash as `0x${string}`,
        });
      }

      // Show success message
      toast({
        title: "Investment made 👌",
      });
      props.onInvest?.();
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <AlertDialogTrigger asChild>
        <Button variant="default" size="sm">
          Invest
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to invest{" "}
            {formatEther(BigInt(props.tokenInvestmentAmount || 0))}{" "}
            {props.tokenInvestmentTokenSymbol} in this token?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={isFormSubmitting} onClick={onSubmit}>
            {isFormSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Invest
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
