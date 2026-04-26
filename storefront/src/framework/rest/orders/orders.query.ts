import {
  QueryParamsType,
  Order,
  OrdersQueryOptionsType,
} from "@framework/types";
import { mapPaginatorData } from "@framework/utils/data-mappers";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import { useMutation, useQuery } from "@/shims/rq-compat";
import { OrderService } from "./order.service";
import { messageCardAtom } from "@store/checkout";
import { useAtom } from "jotai";


export type PaginatedOrder = {
  data: Order[];
  paginatorInfo: any;
};

const fetchOrders = async ({
  queryKey,
}: QueryParamsType): Promise<{ orders: PaginatedOrder }> => {
  const [_key, params]: any = queryKey;

  const {
    page,
    limit = 15,
    orderBy = "updated_at",
    sortedBy = "DESC",
  } = params as OrdersQueryOptionsType;

  // @ts-ignore
  const queryParams = new URLSearchParams({
    searchJoin: "and",
    orderBy,
    sortedBy,
    limit: limit.toString(),
    ...(page && { page: page.toString() }),
  });
  const url = `${API_ENDPOINTS.ORDER}?${queryParams.toString()}`;
  const {
    data: { data, ...rest },
  } = await OrderService.fetchUrl(url);
  return {
    orders: {
      data,
      paginatorInfo: mapPaginatorData({ ...rest }),
    },
  };
};

const useOrdersQuery = (options: OrdersQueryOptionsType) => {
  return useQuery<{ orders: PaginatedOrder }, Error>(
    [API_ENDPOINTS.ORDER, options],
    fetchOrders,
    {
      keepPreviousData: true,
    }
  );
};

export { useOrdersQuery, fetchOrders };

export const fetchOrder = async (orderId: string) => {
  if (!orderId) {
    throw new Error('tracking number is required');
  }
  const { data } = await OrderService.findOne(`tracking-number/${orderId}`);
  return {
    order: data,
  };
};
export const useOrderQuery = ({
  tracking_number,
}: {
  tracking_number?: string;
}) => {
  return useQuery<{ order: Order }, Error>(
    ["order", tracking_number],
    () => fetchOrder(tracking_number as string),
    {
      enabled: Boolean(tracking_number),
    }
  );
};

export const fetchOrderStatuses = async () => {
  const {
    data: { data, ...rest },
  } = await OrderService.fetchUrl(API_ENDPOINTS.ORDER_STATUS);
  return {
    order_statuses: { data, paginatorInfo: mapPaginatorData({ ...rest }) },
  };
};
export const useOrderStatusesQuery = () => {
  return useQuery<any, Error>(API_ENDPOINTS.ORDER_STATUS, fetchOrderStatuses);
};

type OrderCreateInputType = {
  [key: string]: unknown;
};

export const useCreateOrderMutation = () => {
  return useMutation((input: OrderCreateInputType) =>
    OrderService.create(input)
  );
};
