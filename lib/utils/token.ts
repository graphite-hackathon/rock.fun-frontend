import { IToken, ITokenMetadata } from "../interface/token.interface";

export async function getImageUrlFromIpfs(ipfsUri: string): Promise<string> {
  const fallbackImage = "/images/ndollar-icon.svg";
  const placeholderImage = "https://placehold.co/128x128";

  const ipfsHash = ipfsUri.replace("ipfs://", "");
  const url = `https://ipfs.io/ipfs/${ipfsHash}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const imageUrl: string = data.image;

    if (!imageUrl || imageUrl === placeholderImage) {
      return fallbackImage;
    }

    return imageUrl;
  } catch (err) {
    return fallbackImage;
  }
}

export async function getInfoFromIpfs(ipfsUri: string
  // baseToken: Omit<IToken, 'image' | 'description'>
): Promise<ITokenMetadata> {
  const fallbackImage = "/images/ndollar-icon.svg";
  const placeholderImage = "https://placehold.co/128x128";

  const ipfsHash = ipfsUri.replace("ipfs://", "");
  const url = `https://ipfs.io/ipfs/${ipfsHash}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let imageUrl = data.image;

    if (imageUrl?.startsWith("ipfs://")) {
      imageUrl = `https://ipfs.io/ipfs/${imageUrl.replace("ipfs://", "")}`;
    }

    if (!imageUrl || imageUrl === placeholderImage) {
      imageUrl = fallbackImage;
    }

    return {

      description: data.description,
      image: imageUrl,
      ...data, // spread everything else in case you want extra metadata later
    };
  } catch (err) {
    console.error("Failed to fetch IPFS metadata:", err);
    //@ts-ignore
    return {
            // ...baseToken,
      image: fallbackImage,
      description: "No description available.",
     
    };
  }
}