import { useCallback, useEffect } from "react";
import { GraphiQL as OriginalGraphiQL } from "graphiql";
import type { GraphiQLProps } from "graphiql";
import type { Environment } from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import GraphQLWorker from "monaco-graphql/esm/graphql.worker.js?worker";
import "graphiql/style.css";
import useAuth from "../../hooks/useAuth";

// This module is lazy loaded, so editor workers are only configured when the
// GraphiQL page is opened. Vite emits the worker bundles as local assets.
window.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "graphql") return new GraphQLWorker();
    if (label === "json") return new JsonWorker();
    return new EditorWorker();
  },
} satisfies Environment;

const GraphiQL = () => {
  const { authManager } = useAuth();

  useEffect(() => {
    const rootElem = document.getElementById("root");
    if (!rootElem) return;

    const { height, display, flexDirection } = rootElem.style;
    rootElem.style.height = "100vh";
    rootElem.style.display = "flex";
    rootElem.style.flexDirection = "column";

    return () => {
      rootElem.style.height = height;
      rootElem.style.display = display;
      rootElem.style.flexDirection = flexDirection;
    };
  }, []);

  const fetcher = useCallback<GraphiQLProps["fetcher"]>(
    async (graphQLParams) => {
      const token = await authManager.getIdToken();
      const response = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphQLParams),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    [authManager],
  );

  return <OriginalGraphiQL fetcher={fetcher} />;
};

export default GraphiQL;
