"use client";

import { siteConfig } from "@/config/site";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";
import useError from "@/hooks/useError";
import { uploadJsonToIpfs } from "@/lib/ipfs";
import { chainToSiteConfigContracts } from "@/lib/siteConfig";
import { FarmersTokenMetadata } from "@/types/farmers-token-metadata";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

export function TokenCreateForm() {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    category: z.string(),
    description: z.string().min(1),
    identifier: z.string().min(1),
    chain: z.string(),
    investmentToken: z.string().length(42),
    investmentAmount: z.coerce.number().gt(0),
    expectedReturnAmount: z.coerce.number().gt(0),
    expectedReturnPeriod: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: undefined,
      description: "",
      identifier: "",
      chain: undefined,
      investmentToken: "",
      investmentAmount: 0,
      expectedReturnAmount: 0,
      expectedReturnPeriod: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);

      // Define contracts
      const contracts = chainToSiteConfigContracts(values.chain);

      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Check chain
      if (chainId !== contracts.chain.id) {
        throw new Error(`You need to connect to ${contracts.chain.name}`);
      }

      // Parse values
      let investmentToken;
      if (!isAddress(values.investmentToken)) {
        throw new Error("Token address is incorrect");
      } else {
        investmentToken = values.investmentToken as `0x${string}`;
      }
      let investmentAmount = parseEther(String(values.investmentAmount));

      // Upload metadata to IPFS
      const metadata: FarmersTokenMetadata = {
        created: new Date().getTime(),
        category: values.category,
        description: values.description,
        identifier: values.identifier,
        expectedReturnAmount: parseEther(
          String(values.expectedReturnAmount)
        ).toString(),
        expectedReturnPeriod: values.expectedReturnPeriod,
        records: [],
      };
      const metadataUri = await uploadJsonToIpfs(metadata);

      // Send request to create a token
      if (contracts.accountAbstractionSuported) {
        // TODO: Implement
      } else {
        const txHash = await walletClient.writeContract({
          address: contracts.farmersToken,
          abi: FarmersTokenAbi,
          functionName: "create",
          args: [investmentAmount, investmentToken, metadataUri],
          chain: contracts.chain,
        });
        await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
      }

      // Show success message
      toast({
        title: "Token created 👌",
      });
      router.push("/farm");
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cattle">🐂 Cattle</SelectItem>
                  <SelectItem value="Grains">🌾 Grains</SelectItem>
                  <SelectItem value="Poultry">🐔 Poultry</SelectItem>
                  <SelectItem value="Coffee">☕ Coffee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="An Aberdeen Angus calf from a farm located in Spain, Province of Cáceres..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="42..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(siteConfig.contracts).map(
                    (contracts, index) => (
                      <SelectItem
                        key={index}
                        value={contracts.chain.id.toString()}
                      >
                        {contracts.chain.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="investmentToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required investment token</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x0000000000000000000000000000000000000000"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="investmentAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required investment amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="320"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expectedReturnAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected return amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="480"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expectedReturnPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected return period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1m">1 month</SelectItem>
                  <SelectItem value="3m">3 months</SelectItem>
                  <SelectItem value="6m">6 months</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </form>
    </Form>
  );
}
