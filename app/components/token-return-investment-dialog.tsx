"use client";

import { SiteConfigContracts } from "@/config/site";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";
import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { erc20Abi, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export function TokenReturnInvestmentDialog(props: {
  token: string;
  tokenInvestmentToken: `0x${string}`;
  tokenInvestmentTokenSymbol: string;
  contracts: SiteConfigContracts;
  onReturn?: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    value: z.coerce.number().gt(0),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      // Send request to approve transfer and return investment
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
          functionName: "returnInvestment",
          args: [BigInt(props.token), parseEther(String(values.value))],
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
        title: "Investment returned 👌",
      });
      props.onReturn?.();
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Return Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Return investment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of {props.tokenInvestmentTokenSymbol} you want to
                    return to the investor
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5"
                      type="number"
                      disabled={isFormSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
