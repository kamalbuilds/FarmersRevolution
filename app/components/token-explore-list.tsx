"use client";

import { SiteConfigContracts } from "@/config/site";
import { FarmersTokenAbi } from "@/contracts/abi/farmersToken";
import { useEffect, useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import { useInfiniteReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { TokenCard } from "./token-card";

const LIMIT = 42;

export function TokenExploreList(props: { contracts: SiteConfigContracts }) {
  const [tokens, setTokens] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `explore_list_${props.contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: props.contracts.farmersToken,
            abi: FarmersTokenAbi,
            functionName: "getParams",
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
    setTokens(undefined);
    if (data) {
      const tokens: string[] = [];
      const dataFirstPage = (data as any).pages[0];
      for (let i = 0; i < dataFirstPage.length; i++) {
        const dataPageElement = dataFirstPage[i];
        if (
          dataPageElement.result.investmentAmount.toString() !== "0" &&
          isAddressEqual(
            dataPageElement.result.investor || zeroAddress,
            zeroAddress
          )
        ) {
          tokens.push(String(i));
        }
      }
      setTokens(tokens);
    }
  }, [data]);

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
