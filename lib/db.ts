// lib/db.ts
export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic White Shirt",
    category: "shirts",
    description: "Minimalist white button-down shirt",
    price: 89.99,
    image: "/api/placeholder/400/500",
    tags: ["formal", "white", "classic", "shirt"]
  },
  {
    id: "2",
    name: "Black Slim-Fit Suit",
    category: "suits",
    description: "Modern slim-fit black suit",
    price: 299.99,
    image: "/api/placeholder/400/500",
    tags: ["formal", "black", "suit", "slim-fit"]
  },
  // Add more products as needed
]

export function findProductsByTags(tags: string[]): Product[] {
  return products.filter(product => 
    tags.some(tag => product.tags.includes(tag.toLowerCase()))
  ).slice(0, 3)
}
