import { auth, defineMcp } from "@lovable.dev/mcp-js";
import createAssetRequest from "./tools/create-asset-request";
import listAssetRequests from "./tools/list-requests";
import listDocuments from "./tools/list-documents";
import listLibraryAssets from "./tools/list-library-assets";
import listProjects from "./tools/list-projects";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "brix-design-studio",
  title: "brixdesignstudio",
  version: "1.0.0",
  instructions: "Tools for Brix Design Studio Portal. Read projects, documents, assets, and requests, or create an asset request for the signed in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProjects, listLibraryAssets, listDocuments, listAssetRequests, createAssetRequest],
});
