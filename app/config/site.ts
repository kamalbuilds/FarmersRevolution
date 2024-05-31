import { Chain, polygon, sepolia, telos } from "viem/chains";

export type SiteConfig = typeof siteConfig;

export type SiteConfigContracts = {
  chain: Chain;
  farmersToken: `0x${string}`;
  usdcToken: `0x${string}`;
  entryPoint: `0x${string}`;
  paymaster: `0x${string}`;
  accountFactory: `0x${string}`;
  accountAbstractionSuported: boolean;
};

export const siteConfig = {
  emoji: "🧑‍🌾",
  name: "FarmersRevolution",
  description: "Dapp that connects farmers with the right investors through the tokenization of their real-world assets (RWAs) like crops and farm products",
  links: {
    github: "https://github.com/kamalbuilds/FarmersRevolution",
  },
  contracts: [
    {
      // chain: { id: 56, name: "Binance Smart Chain" },
      chain: sepolia,
    },
    {
      // chain: { id: 23888, name: "Telos" },
      chain: telos,
    },
    {
      // chain: { id: 137, name: "Polygon" },
      chain: polygon,
    }
  ]
};

