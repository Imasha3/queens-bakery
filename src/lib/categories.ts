import { db } from './firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { Product } from './products';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const DEFAULT_CATEGORIES = [
  'Cakes',
  'Savoury Items',
  'Desserts',
  'Flower Bouquets',
  'Party Packages',
];

/**
 * Fetch all categories from Firestore 'categories' collection.
 * If collection is empty, seeds default categories to ensure existing products work seamlessly.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories: Category[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.name) {
        categories.push({
          id: docSnap.id,
          name: data.name,
          description: data.description || '',
          image: data.image || '',
          imagePublicId: data.imagePublicId || '',
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      }
    });

    // Seed defaults if collection is empty
    if (categories.length === 0) {
      for (const catName of DEFAULT_CATEGORIES) {
        const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newCategory: Category = {
          id: catId,
          name: catName,
          description: `Queen's Bakery ${catName} collection`,
          image: '',
        };
        try {
          await setDoc(doc(db, 'categories', catId), {
            name: catName,
            description: newCategory.description,
            image: '',
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          // ignore seeding write error
        }
        categories.push(newCategory);
      }
    }

    // Sort alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));
    return categories;
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error);
    return DEFAULT_CATEGORIES.map((catName) => ({
      id: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: catName,
      description: `Queen's Bakery ${catName}`,
      image: '',
    }));
  }
}

/**
 * Normalize string for robust category matching (handling spelling & casing variations like Savoury/Savory)
 */
export function normalizeCategoryName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace('savoury', 'savory')
    .replace('dessertitems', 'desserts');
}

/**
 * Dynamically resolves the cover image for a category:
 * 1. Uses explicit category.image if set in Firestore categories collection.
 * 2. Fallbacks to the first active product image belonging to that category.
 * 3. Fallbacks to a safe bakery placeholder image if no product image exists.
 */
export function resolveCategoryCoverImage(category: Category, products: Product[]): string {
  // 1. Explicit cover image set in database category document
  if (category.image && typeof category.image === 'string' && category.image.trim() !== '') {
    return category.image.trim();
  }

  // 2. Fallback to first available active product image in this category
  const targetNorm = normalizeCategoryName(category.name);
  const matchingProduct = products.find((prod) => {
    const prodCatNorm = normalizeCategoryName(prod.category);
    const hasValidImage = typeof prod.image === 'string' && prod.image.trim() !== '';
    return prod.active && prodCatNorm === targetNorm && hasValidImage;
  });

  if (matchingProduct && matchingProduct.image) {
    return matchingProduct.image.trim();
  }

  // 3. Fallback placeholder images per category name
  const fallbackImages: Record<string, string> = {
    'cakes': '/category-cakes.jpg',
    'savoryitems': '/category-savoury.jpg',
    'savouryitems': '/category-savoury.jpg',
    'desserts': '/category-desserts.jpg',
    'flowerbouquets': '/category-bouquets.jpg',
    'partypackages': '/category-packages.jpg',
  };

  const key = normalizeCategoryName(category.name);
  return fallbackImages[key] || '/category-cakes.jpg';
}
