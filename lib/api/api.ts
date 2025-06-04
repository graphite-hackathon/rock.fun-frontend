import client from "./client";
import type { IGem, CreateGemDto, PaginatedGemsResponse, ApiResponse } from "../interface/gem.interface";

export const gemApi = {
  createGemRecord: (gemData: CreateGemDto): Promise<ApiResponse<IGem>> =>
    client.post("/api/v1/gems/create", gemData).then(response => response.data),

  getGemsByCreator: (creatorAddress: string): Promise<ApiResponse<IGem[]>> =>
    client.get(`/api/v1/gems/creator/${creatorAddress}`).then(response => response.data),

  getGemByContractAddress: (contractAddress: string): Promise<ApiResponse<IGem | null>> =>
    client.get(`/api/v1/gems/contract/${contractAddress}`).then(response => response.data),

  getAllGems: (page?: number, limit?: number): Promise<ApiResponse<PaginatedGemsResponse>> => {
    const params: Record<string, any> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    return client.get("/api/v1/gems", { params }).then(response => response.data);
  }
};
