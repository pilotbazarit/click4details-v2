import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeSeoMetadata: (data) => commandApi.post("/api/seo-metadata", data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        },
    }),

    updateSeoMetadata: (entityType, entityId, data) => commandApi.put(
        `/api/seo-metadata/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
        data,
        {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }
    ),
};

const Queries = {
    getSeoMetadata: (params = {}) =>
        commandApi.get("/api/seo-metadata", { params }),

    getSeoMetadataByEntity: (entityType, entityId, params = {}) =>
        commandApi.get(
            `/api/seo-metadata/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
            { params }
        ),
};

const SeoMetadataService = {
    Commands,
    Queries,
};

export default SeoMetadataService;
