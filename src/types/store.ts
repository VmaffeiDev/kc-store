export type GenderCategory = "MASCULINO" | "FEMININO" | "INFANTIL" | "UNISSEX";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: string;
  genderCategory: GenderCategory;
  image: string;
  badge?: "Novo" | "Promocao" | "Mais vendido";
  featured?: boolean;
  sizes: string[];
  colors: string[];
  stock: number;
  material: string;
};

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
};
