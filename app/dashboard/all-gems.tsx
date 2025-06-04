import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { gemApi } from "@/lib/api/api";
// import { useWallet } from "@/lib/hooks/useWallet";
import type { IGem } from "@/lib/interface/gem.interface";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import LottieView from "lottie-react";
import gemAnimation from "@assets/animations/gem.json"
{
  /* 
      	<LottieView
					autoPlay
					loop={false}
					style={{
						zIndex: 1000,
						width: "100%",
						height: "50%",
						top: 0,
						left: 0,
						right: 0,
					}}
					animationData={successAnimation}
				/> */
}

export const AllGems = () => {
  // const { activeNetworkConfig } = useWallet(); // For explorer link consistency
  const [allGems, setAllGems] = useState<IGem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Or make this configurable

  const fetchAllGems = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await gemApi.getAllGems(page, itemsPerPage);
        if (response.data && response.data.gems) {
          setAllGems(response.data.gems);
          setTotalPages(response.data.pages || 1);
          setCurrentPage(response.data.page || 1);
          if (response.data.gems.length === 0 && page === 1) {
            toast.info("No gems have been created by anyone yet.", {
              theme: "dark",
            });
          }
        } else {
          throw new Error(response.message || "Failed to fetch all gems");
        }
      } catch (e: any) {
        console.error("Error fetching all gems:", e);
        const errorMessage =
          e.response?.data?.message || e.message || "Could not fetch all gems.";
        setError(errorMessage);
        console.log(error)
        toast.error("No gems found, please try again later", { theme: "dark" });
        setAllGems([])
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchAllGems(currentPage);
  }, [currentPage, fetchAllGems]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading && allGems.length === 0) {
    // Show loading only on initial load or if no data yet
    return (
      <div className="text-center p-4 text-gray-400">
        Loading all created gems...
      </div>
    );
  }

  // if (error) {
  //   return <div className="text-center p-4 text-red-400">Error: {error}</div>;
  // }

  return (
    <main className="w-full h-fit flex flex-col gap-y-10 mt-5 pb-20">
      {allGems.length === 0 && !isLoading && (
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
      {allGems.length > 0 && (
        <>
        <ul className="flex flex-col gap-y-4">
          {allGems.map((gem, index) => (
            <li
              key={index}
                    className="desktop:grid desktop:grid-cols-4 mobile:flex  mobile:flex-col w-[90%] desktop:items-center mobile:items-start mobile:justify-between"
            >
              <span className="flex flex-row items-center">
                {index + 1}.
                <Image
                  className="w-20 h-20 rounded-full object-cover"
                  src={gem.imageUrl ? gem.imageUrl : "/gem-icon.jpg"}
                />
                <Text>{gem.name}</Text>
              </span>

              <Text className="mobile:mt-4">{gem.symbol}</Text>
              <Text>{gem.decimals}</Text>
              <Text>{gem.contractAddress}</Text>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
        
      )}
    </main>
  );
};
