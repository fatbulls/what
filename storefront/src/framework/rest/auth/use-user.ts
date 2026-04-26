import { CoreApi } from "@framework/utils/core-api";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import { authorizationAtom } from "@store/authorization-atom";
import { useAtom } from "jotai";
import { QueryKey, useQuery, UseQueryOptions } from "@/shims/rq-compat";

const CustomerService = new CoreApi(API_ENDPOINTS.CUSTOMER);
export const fetchMe = async () => {
  const { data } = await CustomerService.findAll();
  return { me: data };
};

export const useCustomerQuery = (
  options: UseQueryOptions<any, Error, any, QueryKey>
) => {
  return useQuery<any, Error>(API_ENDPOINTS.CUSTOMER, fetchMe, options);
};

const useUser = () => {
  const [isAuthorized, setAuthorized] = useAtom(authorizationAtom);
  const { data, isLoading, error } = useCustomerQuery({
    enabled: isAuthorized,
    retry: false,
    // If /me returns 401/403, the stored auth is stale (token expired, revoked,
    // or cross-origin cookie lost). Clear the jotai flag so the UI shows signed-
    // out state instead of silently rendering forms that will fail on submit.
    onError: (err: any) => {
      const status = err?.response?.status ?? err?.status;
      const message = String(err?.message || "").toLowerCase();
      if (
        status === 401 ||
        status === 403 ||
        message.includes("unauthorized") ||
        message.includes("authentication")
      ) {
        setAuthorized(false);
        try {
          localStorage.removeItem("medusa_auth_token");
        } catch {}
      }
    },
  });
  return { me: data?.me, loading: isLoading, error };
};

export default useUser;
