/**
 * WhatsApp Order Redirect Utility
 *
 * Constructs a formatted WhatsApp message URL using the wa.me deep link.
 * Called after a successful order submission to redirect the user
 * to WhatsApp with a pre-filled message containing their order details.
 */

const WHATSAPP_NUMBER = "+9779842056985";

// ── Types ─────────────────────────────────────────────────────────────────
export interface CartItemForWhatsApp {
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number; // in paise
}

// ── Main Function ─────────────────────────────────────────────────────────
/**
 * Build a WhatsApp redirect URL with a formatted order message.
 *
 * @param orderId      - The unique order ID returned from the API
 * @param customerName - Customer's full name
 * @param cartItems    - Array of cart items with product details
 * @param totalPrice   - Total order price in paise
 * @returns Full `https://wa.me/...?text=...` URL ready for window.open()
 *
 * @example
 * ```ts
 * const url = buildWhatsAppUrl("ord-123", "Rahul", cartItems, 399800);
 * window.open(url, "_blank");
 * ```
 */
export function buildWhatsAppUrl(
  orderId: string,
  customerName: string,
  cartItems: CartItemForWhatsApp[],
  totalPrice: number
): string {
  // Format price from paise to rupees
  const formatRupees = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN")}`;

  // Build the item list with clear formatting
  const itemLines = cartItems
    .map(
      (item, i) =>
        `  ${i + 1}. ${item.productName}\n` +
        `     Color: ${item.color} | Size: ${item.size}\n` +
        `     Qty: ${item.quantity} × ${formatRupees(item.price)} = ${formatRupees(item.price * item.quantity)}`
    )
    .join("\n\n");

  // Compose the full message
  const message = [
    `🛍️ *NEW ORDER — Sarina Shoe Center*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📋 *Order ID:* ${orderId}`,
    `👤 *Customer:* ${customerName}`,
    ``,
    `📦 *Items:*`,
    itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total: ${formatRupees(totalPrice)}*`,
    ``,
    `Please confirm payment to process this order. 🙏`,
  ].join("\n");

  // URL-encode and construct the wa.me link
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp in a new tab/window with the order message.
 * Falls back to current tab if popup is blocked.
 */
export function redirectToWhatsApp(
  orderId: string,
  customerName: string,
  cartItems: CartItemForWhatsApp[],
  totalPrice: number
): void {
  const url = buildWhatsAppUrl(orderId, customerName, cartItems, totalPrice);
  const newWindow = window.open(url, "_blank");

  // Fallback if popup blocker prevents the new window
  if (!newWindow) {
    window.location.href = url;
  }
}
