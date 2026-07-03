import { createMemoryBusinessSpine } from "@/core/business";
import { runRepositoryContract } from "./repository-contract";

runRepositoryContract("in-memory", async () => ({
  repos: createMemoryBusinessSpine(),
}));
