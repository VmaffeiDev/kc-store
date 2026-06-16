export const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5541984190059";

export const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/kec_store_/";

export const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Olá! Gostaria de saber mais sobre os produtos da K&C STORE.",
)}`;
