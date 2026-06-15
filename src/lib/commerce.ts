export function availableStock(
  stock: number,
  activeReservations: Array<{ quantity: number }>,
) {
  return Math.max(
    0,
    stock -
      activeReservations.reduce(
        (total, reservation) => total + reservation.quantity,
        0,
      ),
  );
}

export function calculateDiscount(
  subtotal: number,
  type: "PERCENTAGE" | "FIXED",
  value: number,
  minimumValue = 0,
) {
  if (subtotal < minimumValue) return 0;
  const raw = type === "PERCENTAGE" ? subtotal * (value / 100) : value;
  return Math.min(subtotal, Math.max(0, raw));
}

export function totalDeliveryDays(carrierDays: number, handlingDays = 5) {
  return Math.max(1, carrierDays) + Math.max(0, handlingDays);
}
