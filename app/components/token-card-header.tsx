"use client";

import { SiteConfigContracts } from "@/config/site";
import { addressToShortAddress } from "@/lib/converters";
import { FarmersTokenMetadata } from "@/types/farmers-token-metadata";
import { formatEther, isAddressEqual, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { TokenInvestDialog } from "./token-invest-dialog";
import { TokenReturnInvestmentDialog } from "./token-return-investment-dialog";
import { TokenSellDialog } from "./token-sell-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function TokenCardHeader(props: {
  token: string;
  tokenMetadata: FarmersTokenMetadata;
  tokenOwner: `0x${string}`;
  tokenInvestmentAmount: string;
  tokenInvestmentToken: `0x${string}`;
  tokenInvestmentTokenSymbol: string;
  tokenInvestor: `0x${string}`;
  tokenReturnAmount: string;
  tokenReturnDate: string;
  contracts: SiteConfigContracts;
  onUpdate: () => void;
}) {
  const { address } = useAccount();

  const isReturnButtonVisible =
    props.tokenReturnDate === "0" &&
    isAddressEqual(props.tokenOwner, address || zeroAddress);

  const isInvestButtonVisible =
    isAddressEqual(props.tokenInvestor, zeroAddress) &&
    !isAddressEqual(props.tokenOwner, address || zeroAddress);

  const isSellButtonVisible =
    props.tokenReturnDate === "0" &&
    isAddressEqual(props.tokenInvestor, address || zeroAddress);

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-2xl bg-primary">
            {props.tokenMetadata.category === "Cattle"
              ? "🐂"
              : props.tokenMetadata.category === "Grains"
              ? "🌾"
              : props.tokenMetadata.category === "Poultry"
              ? "🐔"
              : props.tokenMetadata.category === "Coffee"
              ? "☕"
              : "⭐"}
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col gap-4">
        {/* Category and Status */}
        <p className="text-xl font-bold">
          {props.tokenMetadata.category}
          {isAddressEqual(props.tokenInvestor, zeroAddress) && (
            <span className="font-normal text-primary"> — Available</span>
          )}
          {!isAddressEqual(props.tokenInvestor, zeroAddress) &&
            props.tokenReturnDate === "0" && (
              <span className="font-normal text-destructive"> — Invested</span>
            )}
          {!isAddressEqual(props.tokenInvestor, zeroAddress) &&
            props.tokenReturnDate !== "0" && (
              <span className="font-normal text-muted-foreground">
                {" "}
                — Closed
              </span>
            )}
        </p>
        <div className="flex flex-col gap-3">
          {/* Description */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Description:</p>
            <p className="text-sm">{props.tokenMetadata.description}</p>
          </div>
          {/* Identifier */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Identifier:</p>
            <p className="text-sm break-all">
              {props.tokenMetadata.identifier}
            </p>
          </div>
          {/* Created */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Created:</p>
            <p className="text-sm break-all">
              {new Date(props.tokenMetadata.created || 0).toLocaleString()}
            </p>
          </div>
          {/* Creator */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Farmer:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${props.tokenOwner}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(props.tokenOwner)}
              </a>
            </p>
          </div>
          {/* Chain */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Chain:</p>
            <p className="text-sm break-all">{props.contracts.chain.name}</p>
          </div>
          {/* Required investment */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">
              Required investment:
            </p>
            <p className="text-sm break-all">
              {formatEther(BigInt(props.tokenInvestmentAmount || 0))}{" "}
              {props.tokenInvestmentTokenSymbol}
            </p>
          </div>
          {/* Expected return */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Expected return:</p>
            <p className="text-sm break-all">
              {formatEther(
                BigInt(props.tokenMetadata.expectedReturnAmount || 0)
              )}{" "}
              {props.tokenInvestmentTokenSymbol}
            </p>
          </div>
          {/* Expected return period */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">
              Expected return period:
            </p>
            <p className="text-sm break-all">
              {props.tokenMetadata.expectedReturnPeriod === "1m" && "1 month"}
              {props.tokenMetadata.expectedReturnPeriod === "3m" && "3 months"}
              {props.tokenMetadata.expectedReturnPeriod === "6m" && "4 months"}
              {props.tokenMetadata.expectedReturnPeriod === "1y" && "1 year"}
            </p>
          </div>
          {/* Investor */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Investor:</p>
            <p className="text-sm break-all">
              {isAddressEqual(props.tokenInvestor, zeroAddress) ? (
                "None"
              ) : (
                <a
                  href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${props.tokenInvestor}`}
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {addressToShortAddress(props.tokenInvestor)}
                </a>
              )}
            </p>
          </div>
          {/* Return */}
          {props.tokenReturnAmount !== "0" && (
            <div className="flex flex-col md:flex-row md:gap-3">
              <p className="text-sm text-muted-foreground">Return:</p>
              <p className="text-sm break-all">
                {formatEther(BigInt(props.tokenReturnAmount || "0"))}{" "}
                {props.tokenInvestmentTokenSymbol}
              </p>
            </div>
          )}
          {/* Return date  */}
          {props.tokenReturnDate !== "0" && (
            <div className="flex flex-col md:flex-row md:gap-3">
              <p className="text-sm text-muted-foreground">Return date:</p>
              <p className="text-sm break-all">
                {new Date(
                  Number(props.tokenReturnDate) * 1000 || 0
                ).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        {isReturnButtonVisible && (
          <TokenReturnInvestmentDialog
            token={props.token}
            tokenInvestmentToken={props.tokenInvestmentToken}
            tokenInvestmentTokenSymbol={props.tokenInvestmentTokenSymbol}
            contracts={props.contracts}
            onReturn={() => props.onUpdate()}
          />
        )}
        {isInvestButtonVisible && (
          <TokenInvestDialog
            token={props.token}
            tokenInvestmentAmount={props.tokenInvestmentAmount}
            tokenInvestmentToken={props.tokenInvestmentToken}
            tokenInvestmentTokenSymbol={props.tokenInvestmentTokenSymbol}
            contracts={props.contracts}
            onInvest={() => props.onUpdate()}
          />
        )}
        {isSellButtonVisible && <TokenSellDialog />}
      </div>
    </div>
  );
}
