"use client";

import { SiteConfigContracts } from "@/config/site";
import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { FarmersTokenMetadata } from "@/types/farmers-token-metadata";
import { uploadJsonToIpfs } from "@/lib/ipfs";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";

export function TokenAddRecordDialog(props: {
  token: string;
  tokenMetadata: FarmersTokenMetadata;
  contracts: SiteConfigContracts;
  onAdd?: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    value: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
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

      // Upload metadata to IPFS
      const metadata = structuredClone(props.tokenMetadata);
      metadata.records = [
        ...(props.tokenMetadata.records || []),
        { date: new Date().getTime(), value: values.value },
      ];
      const metadataUri = await uploadJsonToIpfs(metadata);

      // Send request to update the token
      if (props.contracts.accountAbstractionSuported) {
        // TODO: Implement
      } else {
        const txHash = await walletClient.writeContract({
          address: props.contracts.farmersToken,
          abi: FarmersTokenAbi,
          functionName: "setURI",
          args: [BigInt(props.token), metadataUri],
          chain: props.contracts.chain,
        });
        await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
      }

      // Show success message
      toast({
        title: "Record added 👌",
      });
      props.onAdd?.();
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
        <Button variant="outline" size="sm">
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a record</DialogTitle>
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
                  <FormLabel>Any value (e.g. weight or crop in kg)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5"
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
