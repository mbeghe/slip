export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  colors: string[];
  imageUrls: string[];
  colorImages: Record<string, string[]>;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  colors?: string[];
  imageUrls?: string[];
  colorImages?: Record<string, string[]>;
  featured?: boolean;
  sortOrder?: number;
};
