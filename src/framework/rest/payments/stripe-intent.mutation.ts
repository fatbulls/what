import { CoreApi } from '@framework/utils/core-api';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useMutation } from 'react-query';

 type StripeIntentPayload = {
   amount: number;
   currency?: string;
   metadata?: Record<string, any>;
   payment_method_types?: string[];
 };

 type StripeIntentResponse = {
   client_secret: string;
   payment_intent_id: string;
   status: string;
 };

 class StripeIntentApi extends CoreApi {
   constructor() {
     super(API_ENDPOINTS.STRIPE_PAYMENT_INTENT);
   }

   createIntent(input: StripeIntentPayload): Promise<StripeIntentResponse> {
     return this.create(input);
   }

   findOrder(paymentIntentId: string) {
     return this.http.get(`${API_ENDPOINTS.STRIPE_PAYMENT_INTENT}/${paymentIntentId}/order`).then((res) => res.data);
   }
 }

 const stripeIntentApi = new StripeIntentApi();

 export const useCreateStripePaymentIntentMutation = () => {
   return useMutation((input: StripeIntentPayload) =>
     stripeIntentApi.createIntent(input)
   );
 };

 export const fetchStripeOrderByIntent = (paymentIntentId: string) =>
   stripeIntentApi.findOrder(paymentIntentId);
