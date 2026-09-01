export interface GalleryItemData {
  id: string;
  images: string[];
  aspectRatio: string; // Tailwind aspect ratio class for masonry look
}

export const galleryData: GalleryItemData[] = [
  {
    id: "creation-1",
    images: ["/product-rainbow-cake.jpg", "/category-cakes.jpg"],
    aspectRatio: "aspect-[3/4]"
  },
  {
    id: "creation-2",
    images: ["/category-savoury.jpg", "/product-savoury-platter.jpg"],
    aspectRatio: "aspect-[1/1]"
  },
  {
    id: "creation-3",
    images: ["/product-strawberry-tarts.jpg", "/category-desserts.jpg"],
    aspectRatio: "aspect-[4/3]"
  },
  {
    id: "creation-4",
    images: ["/product-gift-set.jpg", "/category-bouquets.jpg"],
    aspectRatio: "aspect-[3/4]"
  },
  {
    id: "creation-5",
    images: ["/category-packages.jpg", "/hero-bakery.jpg"],
    aspectRatio: "aspect-[1/1]"
  },
  {
    id: "creation-6",
    images: ["/hero-bakery.jpg", "/product-rainbow-cake.jpg", "/category-desserts.jpg"],
    aspectRatio: "aspect-[4/3]"
  },
  {
    id: "creation-7",
    images: ["/category-cakes.jpg"],
    aspectRatio: "aspect-[3/4]"
  },
  {
    id: "creation-8",
    images: ["/product-savoury-platter.jpg"],
    aspectRatio: "aspect-[1/1]"
  },
  {
    id: "creation-9",
    images: ["/product-strawberry-tarts.jpg"],
    aspectRatio: "aspect-[4/3]"
  },
  {
    id: "creation-10",
    images: ["/category-bouquets.jpg"],
    aspectRatio: "aspect-[3/4]"
  },
  {
    id: "creation-11",
    images: ["/category-desserts.jpg"],
    aspectRatio: "aspect-[1/1]"
  },
  {
    id: "creation-12",
    images: ["/category-packages.jpg"],
    aspectRatio: "aspect-[4/3]"
  }
];
