"use client";
import { Button } from "@/components/ui/button";
import { useGraphiteWallet } from "@/lib/hooks/useGraphiteWallet";
import { deployGemWithMetaMask, DeployGemParams } from "@/lib/services/contract.service";
import { TextInput } from "@components/ui/input";
import { GradientText, Text } from "@components/ui/text";
import React from "react";
import { toast } from 'react-toastify'
import { NetworkConfig, GRAPHITE_MAINNET_CONFIG, GRAPHITE_TESTNET_CONFIG, DEFAULT_TARGET_NETWORK_ID } from '@config/network.config'

export default function page() {
 
  const TARGET_GRAPHITE_CHAIN_ID_MAINNET = GRAPHITE_MAINNET_CONFIG.chainIdHex;
const TARGET_GRAPHITE_CHAIN_ID_TESTNET = GRAPHITE_TESTNET_CONFIG.chainIdHex;

  return (
    <main
      id="create"
      className="w-full h-full flex flex-col items-center desktop:px-24 px-4"
    >
      <GradientText className="text-4xl font-medium mt-20 text-center">
        Create your gem
      </GradientText>

      <div className="grid desktop:grid-cols-1 w-full gap-x-7 mt-20 gap-y-5 desktop:w-[50%]">
        <TextInput
          title="Token Name"
          placeholder="Input token name (e.g., GemToken)"
        />
        <TextInput
          title="Token Symbol"
          placeholder="Input token symbol (e.g., GEMT)"
        />
        <TextInput
          title="Total Supply"
          placeholder="Input token supply (1000000)"
        />
        <TextInput title="Decimals" placeholder="Default is 18 (e.g., 7)" />
      </div>

      {}
      <Button
        className="mt-14 mb-7 desktop:w-[50%] w-full"
        text="Finish creating your gem"
        onClick={() => {
          
        }}
      />

      <Text className="text-neutral-600 mb-10 text-center">
        To deploy, please make sure your Graphite Wallet has been imported to
        Metamask and your account is activated
      </Text>
    </main>
  );
}
