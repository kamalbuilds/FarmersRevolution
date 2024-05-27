"use client";

import { SiteConfigContracts } from "@/config/site";
import { FarmersTokenMetadata } from "@/types/farmers-token-metadata";
import EntityList from "./entity-list";
import { TokenAddRecordDialog } from "./token-add-record-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAccount } from "wagmi";
import { isAddressEqual, zeroAddress } from "viem";

export function TokenCardRecords(props: {
  token: string;
  tokenMetadata: FarmersTokenMetadata;
  tokenOwner: `0x${string}`;
  tokenInvestmentTokenSymbol: string;
  tokenReturnDate: string;
  contracts: SiteConfigContracts;
  onUpdate: () => void;
}) {
  const { address } = useAccount();

  const isAddRecordButtonVisible =
    props.tokenReturnDate === "0" &&
    isAddressEqual(props.tokenOwner, address || zeroAddress);

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-10">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-base bg-secondary">✍️</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col gap-4">
        <p className="text-lg font-bold">Records</p>
        <EntityList
          entities={props.tokenMetadata.records || []}
          renderEntityCard={(record, index) => (
            <TokenCardRecord
              key={index}
              record={record}
              tokenMetadata={props.tokenMetadata}
              tokenInvestmentTokenSymbol={props.tokenInvestmentTokenSymbol}
            />
          )}
          noEntitiesText="No records 😐"
        />
        {isAddRecordButtonVisible && (
          <TokenAddRecordDialog
            token={props.token}
            tokenMetadata={props.tokenMetadata}
            contracts={props.contracts}
            onAdd={() => props.onUpdate()}
          />
        )}
      </div>
    </div>
  );
}

function TokenCardRecord(props: {
  record: { date: number; value: string };
  tokenMetadata?: FarmersTokenMetadata;
  tokenInvestmentTokenSymbol?: string;
}) {
  const TOKENS_PER_CATTLE_KG = 7;

  return (
    <div className="flex flex-row gap-2">
      <p className="text-sm text-muted-foreground">
        {new Date(props.record.date).toLocaleString()} —
      </p>
      <p className="text-sm">
        {props.record.value}{" "}
        {props.tokenMetadata?.category === "Cattle" ? (
          <>
            kg (~{Number(props.record.value) * TOKENS_PER_CATTLE_KG}{" "}
            {props.tokenInvestmentTokenSymbol || "tokens"})
          </>
        ) : (
          <>points</>
        )}
      </p>
    </div>
  );
}
