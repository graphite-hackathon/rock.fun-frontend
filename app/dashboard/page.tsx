"use client";
import { GradientText, Text } from "@components/ui/text";
import React, { useEffect, useState } from "react";
import { MyGems } from "./my-gems";
import { AllGems } from "./all-gems";
import { Button, ButtonWrapper } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useGraphiteWallet } from "@/lib/hooks/useGraphiteWallet";
import { useWallet } from "@/lib/hooks/useWallet";
import { PiPlusCircleFill } from "react-icons/pi";
import { toast } from "react-toastify";
import { isMobile } from "@/lib/utils/global";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"my-gems" | "all-gems">("my-gems");

  const {
    isConnected,
    connectWallet,
    account,
    kycStatus,
    checkKyc,
    disconnectWallet,
  } = useWallet();
  const {
    isConnected: isGraphiteConnected,
    connectWallet: connectGraphiteWallet,
    account: graphiteAccount,
  } = useGraphiteWallet();

  useEffect(() => {
    if (isConnected && account) {
      checkKyc();
    }
  }, [isConnected, account, checkKyc]);

  return (
    <main
      id="dashboard"
      className="w-full h-full flex flex-col items-center desktop:px-24 mobile:px-4"
    >
      <GradientText className="text-4xl font-medium mt-20">
        Dashboard
      </GradientText>

      <span className="flex mobile:flex-col desktop:flex-row justify-between w-full items-center  mt-14">
        <div className="mobile:w-full flex flex-col">
          <span className=" items-center flex desktop:flex-row mobile:flex-col mobile:w-full gap-x-4">
            <Image
              className="w-24 h-24 rounded-full bg-neutral-700"
              src={"/gem-profile.jpg"}
            />
            <span className="mobile:w-full">
              <Text className="text-white text-xl mobile:text-center mobile:mt-4">
                {account
                  ? `${
                      isMobile()
                        ? `${account?.substring(0, 6)}...${account?.substring(
                            account.length - 4
                          )}`
                        : account
                    }`
                  : "~"}
              </Text>

              {isConnected && (
                <div className=" flex flex-col mobile:items-center mobile:text-center text-neutral-600 rounded-md text-center text-xs sm:text-sm">
                  {kycStatus && (
                    <Text className="text-neutral-400 tracking-wide flex flex-row mobile:text-center">
                      Account Status:{" "}
                      {kycStatus.isActivated
                        ? `Activated (KYC Level ${kycStatus.kycLevel})`
                        : `Not Activated (KYC Level ${
                            kycStatus.kycLevel || "N/A"
                          })`}{" "}
                      {kycStatus.reputation
                        ? `| Rep: ${kycStatus.reputation}`
                        : ""}
                    </Text>
                  )}
                  {kycStatus?.error && (
                    <Text className="text-red-400 ">
                      KYC Check: {kycStatus.error}
                    </Text>
                  )}
                </div>
              )}

              {account ? (
                <Button
                  text={"Disconnect"}
                  className="px-4 py-3 rounded-xl mt-2 mobile:w-full mobile:mt-4"
                  onClick={() => {
                    disconnectWallet();
                  }}
                />
              ) : (
                <Button
                  text="Connect Wallet"
                  className="px-4 py-3 rounded-xl mt-2 mobile:w-full mobile:mt-4"
                  onClick={() => {
                    if (window.ethereum) {
                      connectWallet();
                    } else {
                      toast.error(
                        "MetaMask (or compatible wallet) not found. Please install it.",
                        { theme: "dark" }
                      );
                    }
                  }}
                />
              )}
            </span>
          </span>

          <span className="mobile:hidden">
            {!isGraphiteConnected ? (
              <span className="flex desktop:flex-row desktop:gap-x-1 mt-4 mobile:flex-col">
                <Text className="text-sm text-neutral-400">
                  Connecting your Graphite Wallet gives you extra benefits in
                  the long run
                </Text>

                <ButtonWrapper
                  onClick={() => {
                    connectGraphiteWallet();
                  }}
                >
                  <Text className="text-primary text-sm">
                    Connect Graphite Wallet?
                  </Text>
                </ButtonWrapper>
              </span>
            ) : (
              <div className="mt-4 flex desktop:flex-row desktop:gap-x-1">
                <Text className="text-sm text-neutral-400">
                  Graphite Wallet connected:
                </Text>
                <Text className="text-primary text-sm">{graphiteAccount}</Text>
              </div>
            )}
          </span>
        </div>

        <ButtonWrapper
          className="flex flex-row h-fit mobile:mt-2 p-4 items-center justify-center gap-x-2 border-1 border-primary bg-gradient-to-b from-neutral-900  to-neutral-800/40 rounded-xl mobile:w-full"
          onClick={() => {
            window.open("/create", "_self");
          }}
        >
          <PiPlusCircleFill color="#D7DEBD" />
          <Text className="">Create Gem</Text>
        </ButtonWrapper>
      </span>

      {/* <span className="desktop:hidden">
            {!isGraphiteConnected ? (
              <Text className="flex desktop:flex-row desktop:gap-x-1 mt-4 flex-col text-xs">
         
                  Connecting your Graphite Wallet gives you extra benefits in
                  the long run
                

               
                  <p className="text-primary text-xs">
                    Connect Graphite Wallet?
                  </p>
           
              </Text>
            ) : (
              <div className="mt-4 flex desktop:flex-row desktop:gap-x-1">
                <Text className="text-sm text-neutral-400">
                  Graphite Wallet connected:
                </Text>
                 <Text className="text-primary text-sm">
                   {graphiteAccount}
                  </Text>
              </div>
            )}
          </span> */}
      <div className="flex flex-row w-full mt-10">
        <ButtonWrapper
          className="w-full"
          onClick={() => {
            setActiveTab("my-gems");
          }}
        >
          <Text
            className={`${
              activeTab === "my-gems"
                ? "text-black bg-gradient-to-r from-primary to-primary-dark/80"
                : "text-white bg-neutral-800"
            } w-full p-4 rounded-l-2xl text-center transition-all duration-700`}
          >
            My Gems
          </Text>
        </ButtonWrapper>

        <ButtonWrapper
          className="w-full"
          onClick={() => {
            setActiveTab("all-gems");
          }}
        >
          <Text
            className={`${
              activeTab === "all-gems"
                ? "text-black bg-gradient-to-l from-primary to-primary-dark/80"
                : "text-white bg-neutral-800"
            } w-full p-4 rounded-r-2xl text-center transition-all duration-700`}
          >
            All Gems
          </Text>
        </ButtonWrapper>
      </div>

      <div className="w-full">
        {activeTab === "my-gems" ? <MyGems /> : <AllGems />}
      </div>
    </main>
  );
}
