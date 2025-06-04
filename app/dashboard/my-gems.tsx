import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { gemApi } from "@/lib/api/api";
import { useWallet } from "@/lib/hooks/useWallet";
import type { IGem } from "@/lib/interface/gem.interface";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LottieView from "lottie-react";
import gemAnimation from "@assets/animations/gem.json"


export const MyGems = () => {
  const { account, isConnected } = useWallet();
  const [myGems, setMyGems] = useState<IGem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyGems = async () => {
      if (isConnected && account) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await gemApi.getGemsByCreator(account!);
          if (response.data) {
            setMyGems(response.data);
            if (response.data.length === 0) {
              toast.info("You haven't created any gems yet.", {
                theme: "dark",
              });
            }
          } else {
            throw new Error(response.message || "Failed to fetch gems");
          }
        } catch (e: any) {
          console.error("Error fetching my gems:", e);
          const errorMessage =
            e.response?.data?.message ||
            e.message ||
            "Could not fetch your gems.";
          setError(errorMessage);
          console.log(error)
          toast.error(errorMessage, { theme: "dark" });
           setMyGems([])
        } finally {
          setIsLoading(false);
        }
      } else {
        setMyGems([]); // Clear if not connected or no account
      }
    };

    fetchMyGems();
  }, [isConnected, account]);

  if (!isConnected) {
    return <div className="text-center p-4 text-gray-400">Please connect your wallet to see your created gems.</div>;
  }

  if (isLoading) {
    return <div className="text-center p-4 text-gray-400">Loading your gems...</div>;
  }

  //   if (error) {
  //   return <div className="text-center p-4 text-red-400">Error: {error}</div>;
  // }
  return (
    <main className="w-full flex flex-col gap-y-10 mt-5 pb-20">
          {myGems.length === 0 && !isLoading && (
        <div className="flex flex-col items-center">
          <LottieView
					autoPlay
					loop={true}
					style={{
						zIndex: 1000,
						width: 300,
						height: 300,
						top: 0,
						left: 0,
						right: 0,
					}}
					animationData={gemAnimation}
				/>
                <Text className="text-center text-gray-500 mt-8">No gems found.</Text>
        </div>

      )}

      {
        myGems.length > 0 && (<ul className="flex flex-col gap-y-4">
  {myGems.map((gem, index) => (
        <li
          key={index}
          className="flex desktop:flex-row mobile:flex-col gap-x-4 w-full desktop:items-center mobile:items-start justify-between"
        >
          <span className="flex flex-row items-center">
            {index + 1}.
            <Image
              className="w-20 h-20 rounded-full"
              src={gem.imageUrl ? gem.imageUrl : "/gem-icon.jpg"}
            />
            <Text>{gem.name}</Text>
          </span>

          <Text>{gem.symbol}</Text>
          <Text>{gem.decimals}</Text>
          <Text>{gem.contractAddress}</Text>
        </li>
      ))}
        </ul>)
      }
    
    </main>
  );
};
