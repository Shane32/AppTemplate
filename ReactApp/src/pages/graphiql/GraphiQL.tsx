import { useEffect } from "react";
import OriginalGraphiQL from "graphiql";
import "graphiql/graphiql.css";
import useAuth from "../../hooks/useAuth";

const GraphiQL = () => {
  const authContext = useAuth();

  useEffect(() => {
    const rootElem = document.getElementById("root");
    if (rootElem) {
      rootElem.style.height = "100vh";
      rootElem.style.display = "flex";
      rootElem.style.flexDirection = "column";
    }

    return () => {
      if (rootElem) {
        rootElem.style.height = "";
        rootElem.style.display = "";
        rootElem.style.flexDirection = "";
      }
    };
  }, []);

  // Fetcher function using async/await for token retrieval and request execution
  const fetcher = async (graphQLParams: unknown) => {
    const token = await authContext.authManager.getAccessToken(); // Fetch the token asynchronously
    const response = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: "post",
      headers: {
        /* eslint-disable */
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        /* eslint-enable */
      },
      body: JSON.stringify(graphQLParams),
    });

    if (response.status >= 200 && response.status < 300) {
      return await response.json(); // Parse JSON response body
    } else {
      throw response; // Throw the response as an error if the status code is not OK
    }
  };

  // Render the GraphiQL interface with the custom fetcher
  return <OriginalGraphiQL fetcher={fetcher} />;
};

export default GraphiQL;
