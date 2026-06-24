import Stripe from "stripe";

/**
 * Istanza Stripe SDK lato server (usata in Server Actions e webhook).
 * Usa la secret key che non deve mai essere esposta al client.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20",
});

/**
 * Verifica la firma del webhook e ritorna l'evento.
 * Deve essere usato nel Route Handler del webhook per escludere
 * richieste non autenticate da Stripe.
 */
export function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    throw new Error(
      `Webhook signature verification failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
