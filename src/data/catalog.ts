import type { CatalogProduct } from "@/types/store";

export const products: CatalogProduct[] = [
  {
    id: "prod_linen_shirt",
    name: "Camisa Linho Manga Longa",
    slug: "camisa-linho-manga-longa",
    sku: "KC-MAS-001",
    shortDescription: "Linho leve, corte atemporal e conforto para todos os momentos.",
    description:
      "Uma camisa de linho premium com construção leve e acabamento cuidadoso. A modelagem confortável acompanha produções casuais e ocasiões especiais sem perder a naturalidade.",
    price: 199.9,
    category: "Camisas",
    genderCategory: "MASCULINO",
    image: "/images/product-linen-shirt.png",
    badge: "Mais vendido",
    featured: true,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Marfim", "Areia"],
    stock: 18,
    material: "Linho e viscose",
  },
  {
    id: "prod_knit_blouse",
    name: "Blusa Tricot Canelado",
    slug: "blusa-tricot-canelado",
    sku: "KC-FEM-002",
    shortDescription: "Textura delicada e caimento elegante para compor sem esforço.",
    description:
      "Blusa canelada com toque macio, construção respirável e um desenho versátil que equilibra elegância e praticidade.",
    price: 139.9,
    promotionalPrice: 119.9,
    category: "Blusas",
    genderCategory: "FEMININO",
    image: "/images/product-knit-blouse.png",
    badge: "Promocao",
    featured: true,
    sizes: ["P", "M", "G"],
    colors: ["Marfim", "Terracota"],
    stock: 14,
    material: "Tricot de viscose",
  },
  {
    id: "prod_kids_hoodie",
    name: "Moletom Infantil com Capuz",
    slug: "moletom-infantil-com-capuz",
    sku: "KC-INF-003",
    shortDescription: "Conforto macio para brincar, descobrir e crescer.",
    description:
      "Moletom infantil confortável, resistente e fácil de combinar, pensado para acompanhar o ritmo das crianças.",
    price: 149.9,
    category: "Moletons",
    genderCategory: "INFANTIL",
    image: "/images/product-kids-hoodie.png",
    badge: "Novo",
    featured: true,
    sizes: ["4", "6", "8", "10", "12"],
    colors: ["Verde oliva", "Areia"],
    stock: 22,
    material: "Algodao",
  },
  {
    id: "prod_leather_sneaker",
    name: "Sapatênis Couro",
    slug: "sapatenis-couro-caramelo",
    sku: "KC-MAS-004",
    shortDescription: "Couro legítimo e construção confortável para a rotina.",
    description:
      "Sapatênis de couro com visual limpo, sola macia e acabamento versátil para acompanhar combinações casuais.",
    price: 249.9,
    category: "Calcados",
    genderCategory: "MASCULINO",
    image: "/images/product-leather-sneaker.png",
    featured: true,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Caramelo"],
    stock: 11,
    material: "Couro",
  },
  {
    id: "prod_olive_blazer",
    name: "Blazer Alfaiataria",
    slug: "blazer-alfaiataria-oliva",
    sku: "KC-FEM-005",
    shortDescription: "Alfaiataria contemporânea com presença e caimento preciso.",
    description:
      "Blazer de alfaiataria com estrutura suave, acabamento premium e tom oliva exclusivo da coleção Essência.",
    price: 299.9,
    category: "Alfaiataria",
    genderCategory: "FEMININO",
    image: "/images/product-olive-blazer.png",
    badge: "Novo",
    featured: true,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Oliva"],
    stock: 9,
    material: "Viscose estruturada",
  },
];

export const findProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
