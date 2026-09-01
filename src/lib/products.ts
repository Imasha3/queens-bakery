import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';

export interface ProductOptions {
  sizes?: string[];
  flavours?: string[];
  styles?: string[];
  allowCustomMessage?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  active?: boolean;
  options?: ProductOptions;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Helper to normalize raw Firestore doc data into a well-typed Product object.
 * Safely resolves primary image and images array across any schema variants.
 */
function normalizeProductDoc(id: string, data: any): Product {
  // Clean and filter gallery images array
  const rawImages: any[] = Array.isArray(data.images) ? data.images : [];
  const validImages: string[] = rawImages
    .filter((img) => typeof img === 'string' && img.trim() !== '')
    .map((img) => img.trim());

  // Determine primary image string safely
  let primaryImage = '';
  if (typeof data.image === 'string' && data.image.trim() !== '') {
    primaryImage = data.image.trim();
  } else if (typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
    primaryImage = data.imageUrl.trim();
  } else if (typeof data.img === 'string' && data.img.trim() !== '') {
    primaryImage = data.img.trim();
  } else if (validImages.length > 0) {
    primaryImage = validImages[0];
  }

  // Ensure primary image is included in images array if not already present
  const finalImages = [...validImages];
  if (primaryImage && !finalImages.includes(primaryImage)) {
    finalImages.unshift(primaryImage);
  }

  return {
    id,
    slug: data.slug || id,
    name: data.name || '',
    category: data.category || 'Cakes',
    description: data.description || '',
    longDescription: data.longDescription || data.description || '',
    image: primaryImage,
    images: finalImages,
    active: data.active !== false,
    options: {
      sizes: Array.isArray(data.options?.sizes) ? data.options.sizes : [],
      flavours: Array.isArray(data.options?.flavours) ? data.options.flavours : [],
      styles: Array.isArray(data.options?.styles) ? data.options.styles : [],
      allowCustomMessage: Boolean(data.options?.allowCustomMessage),
    },
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * Fetch all active products from the Firestore 'products' collection.
 */
export async function fetchActiveProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products: Product[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const product = normalizeProductDoc(docSnap.id, data);
      if (product.active) {
        products.push(product);
      }
    });

    // Sort alphabetically by name
    products.sort((a, b) => a.name.localeCompare(b.name));
    return products;
  } catch (error) {
    console.error('Error fetching active products from Firestore:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug from the Firestore 'products' collection.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!slug) return null;

  try {
    // Query Firestore by slug field
    const q = query(collection(db, 'products'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const product = normalizeProductDoc(docSnap.id, docSnap.data());
      return product;
    }

    // Fallback: If not found by slug, attempt to lookup by doc ID
    const allSnapshot = await getDocs(collection(db, 'products'));
    let foundProduct: Product | null = null;

    allSnapshot.forEach((docSnap) => {
      if (docSnap.id === slug || docSnap.data().slug === slug) {
        foundProduct = normalizeProductDoc(docSnap.id, docSnap.data());
      }
    });

    return foundProduct;
  } catch (error) {
    console.error(`Error fetching product by slug '${slug}' from Firestore:`, error);
    return null;
  }
}
