"use client";

import { useEffect } from "react";
import { features } from "@/data/content";

type ModelContext = {
  registerTool: (
    tool: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

export function useAulaEnlaceTools() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool(
        {
          name: "vote_for_aulaenlace_feature",
          title: "Votar por una función",
          description:
            "Registra o reemplaza el voto local por una función propuesta de AulaEnlace.",
          inputSchema: {
            type: "object",
            properties: {
              featureId: { type: "string", enum: features.map((feature) => feature.id) },
            },
            required: ["featureId"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input: unknown) {
            const featureId = (input as { featureId?: string })?.featureId;
            if (!features.some((feature) => feature.id === featureId))
              throw new Error("Función no válida.");
            window.dispatchEvent(new CustomEvent("aulaenlace:vote", { detail: featureId }));
            return { featureId, status: "registered-locally" };
          },
        },
        { signal: lifecycle.signal },
      );
    };

    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
}
