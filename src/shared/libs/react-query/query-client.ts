/**
 * IMPORTS
 */
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
    // mutations: {
    //   retry: 0,
    // },
  },
});

export { queryClient };
