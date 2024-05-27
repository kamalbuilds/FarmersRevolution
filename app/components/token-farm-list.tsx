"use client";

import { SiteConfigContracts } from "@/config/site";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";
import { useEffect, useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { TokenCard } from "./token-card";

const LIMIT = 42;

export function TokenFarmList(props: { contracts: SiteConfigContracts }) {
  const { address } = useAccount();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | undefined
  >();
  const [tokens, setTokens] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `token_farm_list_${props.contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: props.contracts.farmersToken,
            abi: FarmersTokenAbi,
            functionName: "ownerOf",
            args: [BigInt(pageParam + i)],
            chainId: props.contracts.chain.id,
          } as const)
      );
    },
    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        return lastPageParam + 1;
      },
    },
  });

  useEffect(() => {
    setSmartAccountAddress(undefined);
    if (address) {
      if (props.contracts.accountAbstractionSuported) {
        // TODO: Implement
      } else {
        setSmartAccountAddress(address);
      }
    }
  }, [address, props.contracts]);

  useEffect(() => {
    setTokens(undefined);
    if (address && data && smartAccountAddress) {
      const tokens: string[] = [];
      const dataFirstPage = (data as any).pages[0];
      for (let i = 0; i < dataFirstPage.length; i++) {
        const dataPageElement = dataFirstPage[i];
        if (
          isAddressEqual(
            dataPageElement.result || zeroAddress,
            smartAccountAddress
          )
        ) {
          tokens.push(String(i));
        }
      }
      setTokens(tokens);
    }
  }, [address, data, smartAccountAddress]);

  return (
    <EntityList
      entities={tokens?.toReversed()}
      renderEntityCard={(token, index) => (
        <TokenCard key={index} token={token} contracts={props.contracts} />
      )}
      noEntitiesText={`No tokens on ${props.contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
