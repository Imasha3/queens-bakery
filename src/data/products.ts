export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  options?: {
    sizes?: string[];
    flavours?: string[];
    styles?: string[];
    allowCustomMessage?: boolean;
  };
}

export const productsData: Product[] = [
  {
    id: "pastel-drip-cake",
    slug: "pastel-drip-cake",
    name: "Pastel Drip Celebration Cake",
    category: "Cakes",
    description: "Elegantly finished custom buttercream cake with pastel rainbow drip, perfect for birthdays and celebrations.",
    longDescription: "Our signature Pastel Drip Celebration Cake is handcrafted to perfection. Featuring layers of moist, fluffy sponge cake filled with luscious buttercream, it is finished with a stunning pastel pink and purple drip glaze, edible gold leaf flakes, and a crowning arrangement of fresh macarons and meringue kisses. Customize it with your choice of size, flavour, and a hand-written message.",
    image: "/product-rainbow-cake.jpg",
    images: ["/product-rainbow-cake.jpg", "/category-cakes.jpg"],
    options: {
      sizes: ["1kg", "1.5kg", "2kg", "3kg"],
      flavours: ["Vanilla Bean Sponge", "Chocolate Fudge Cake", "Classic Ribbon Cake", "Red Velvet Cream Cheese"],
      allowCustomMessage: true
    }
  },
  {
    id: "chocolate-luxury-gateau",
    slug: "chocolate-luxury-gateau",
    name: "Luxury Chocolate Gateau",
    category: "Cakes",
    description: "Rich dark chocolate sponge layered with premium dark chocolate ganache, decorated with chocolate curls.",
    longDescription: "Indulge in pure chocolate bliss with our Luxury Chocolate Gateau. Made from premium Belgian chocolate, this cake features dark cocoa sponge layers soaked in vanilla syrup, filled with thick chocolate fudge ganache, and topped with delicate chocolate curls. Ideal for any chocolate lover's celebration.",
    image: "/category-cakes.jpg",
    images: ["/category-cakes.jpg", "/product-rainbow-cake.jpg"],
    options: {
      sizes: ["1kg", "1.5kg", "2kg"],
      flavours: ["Belgian Dark Chocolate", "Fudge Ganache", "Mocha Chocolate Fusion"],
      allowCustomMessage: true
    }
  },
  {
    id: "gourmet-savoury-platter",
    slug: "gourmet-savoury-platter",
    name: "Gourmet Savoury Platter",
    category: "Savoury Items",
    description: "An assortment of crispy pastries, rolls, and patties. Serves 6-8 people. Ideal for party bites.",
    longDescription: "Make hosting easy with our Gourmet Savoury Platter. This platter contains a premium mix of 24 bite-sized pieces, including flaky chicken patties, spiced mutton Chinese rolls, and creamy vegetable puffs. Baked fresh on the day of delivery, these savouries are perfect for gatherings, high teas, or office meetings.",
    image: "/product-savoury-platter.jpg",
    images: ["/product-savoury-platter.jpg", "/category-savoury.jpg"]
  },
  {
    id: "crispy-chicken-patties",
    slug: "crispy-chicken-patties",
    name: "Crispy Chicken Patties (12pcs)",
    category: "Savoury Items",
    description: "Spiced minced chicken filled in flaky puff pastry shells, baked to golden brown perfection.",
    longDescription: "Our Crispy Chicken Patties are a crowd favourite. Generously stuffed with a savory, lightly spiced minced chicken filling and wrapped in layers of hand-rolled puff pastry, each patty is baked to a crisp golden finish. Delivered warm and ready to satisfy your savoury cravings.",
    image: "/category-savoury.jpg",
    images: ["/category-savoury.jpg", "/product-savoury-platter.jpg"]
  },
  {
    id: "glazed-strawberry-tarts",
    slug: "glazed-strawberry-tarts",
    name: "Glazed Strawberry Tarts (6pcs)",
    category: "Desserts",
    description: "Mini shortcrust tarts filled with smooth creme patissiere and topped with fresh glazed strawberries.",
    longDescription: "Delicate and refreshing, our Glazed Strawberry Tarts are a sweet masterpiece. We fill buttery, crisp shortcrust pastry shells with rich, vanilla-infused French creme patissiere and arrange ripe, fresh local strawberries on top. Finished with a light apricot glaze for a stunning glow.",
    image: "/product-strawberry-tarts.jpg",
    images: ["/product-strawberry-tarts.jpg", "/category-desserts.jpg"]
  },
  {
    id: "blueberry-cheesecake-cups",
    slug: "blueberry-cheesecake-cups",
    name: "Blueberry Cheesecake Cups (6pcs)",
    category: "Desserts",
    description: "Individual creamy cold-set cheesecake cups topped with rich blueberry compote and biscuit crumble.",
    longDescription: "These Blueberry Cheesecake Cups offer the perfect balance of creamy and tangy flavours. Layers of buttery Graham cracker crumbs, velvet cream cheese mousse, and sweet homemade wild blueberry topping are packed into individual luxury cups. A mess-free and elegant dessert choice for party catering.",
    image: "/category-desserts.jpg",
    images: ["/category-desserts.jpg", "/product-strawberry-tarts.jpg"]
  },
  {
    id: "pink-rose-gift-set",
    slug: "pink-rose-gift-set",
    name: "Pink Rose & Cupcakes Gift Set",
    category: "Flower Bouquets",
    description: "A gorgeous bouquet of pink roses and white lilies, paired with a box of 6 handcrafted cupcakes.",
    longDescription: "The ultimate gifting bundle. This set pairs a hand-tied bouquet of fresh pink roses, white lilies, and eucalyptus leaves wrapped in premium kraft paper with a matching box of six floral-styled vanilla and chocolate cupcakes. Perfect for anniversaries, birthdays, or showing appreciation.",
    image: "/product-gift-set.jpg",
    images: ["/product-gift-set.jpg", "/category-bouquets.jpg"],
    options: {
      styles: ["Classic Kraft Wrapping", "Premium Boxed Flower arrangement", "Vase Arrangement (+ Bouquet)"]
    }
  },
  {
    id: "white-lily-bouquet",
    slug: "white-lily-bouquet",
    name: "Bespoke White Lily Bouquet",
    category: "Flower Bouquets",
    description: "A premium arrangement of fresh white oriental lilies, eucalyptus leaves, and baby's breath.",
    longDescription: "Exude pure elegance with our Bespoke White Lily Bouquet. Featuring premium, large white oriental lilies chosen for their sweet scent and striking petals, this bouquet is accented with fresh eucalyptus foliage and clouds of baby's breath. Professionally wrapped in custom charcoal mesh and satin ribbons.",
    image: "/category-bouquets.jpg",
    images: ["/category-bouquets.jpg", "/product-gift-set.jpg"],
    options: {
      styles: ["Minimalist White Wrap", "Luxury Charcoal Mesh Wrap"]
    }
  },
  {
    id: "mini-celebration-package",
    slug: "mini-celebration-package",
    name: "Mini Celebration Package",
    category: "Party Packages",
    description: "Features a 1kg Buttercream Cake, 12 Chicken Patties, and 12 Mini Strawberry Tarts.",
    longDescription: "Our Mini Celebration Package is designed to feed a small group of 6-10 people. It bundles together our popular 1kg Buttercream cake (customizable flavour), 12 pieces of savory chicken patties, and 12 sweet glazed strawberry tarts. A simple, unified party solution delivered in standard Queen's Bakery premium boxes.",
    image: "/category-packages.jpg",
    images: ["/category-packages.jpg", "/hero-bakery.jpg"],
    options: {
      flavours: ["Vanilla Bean Sponge", "Chocolate Fudge Cake", "Classic Ribbon Cake"],
      allowCustomMessage: true
    }
  },
  {
    id: "deluxe-party-bundle",
    slug: "deluxe-party-bundle",
    name: "Deluxe Party Platter Package",
    category: "Party Packages",
    description: "A mega combo featuring a 1.5kg Drip Cake, 24 Savoury items, 24 Cupcakes, and a Rose Bouquet.",
    longDescription: "The ultimate showstopper package for larger parties of 15-25 guests. It includes a beautiful 1.5kg Drip Celebration Cake, a savoury catering platter of 24 assorted pastries/rolls, 24 decorative frosted cupcakes, and a fresh hand-tied pink rose bouquet. Hand-delivered in Negombo, Seeduwa, Ja-Ela and surrounding areas.",
    image: "/hero-bakery.jpg",
    images: ["/hero-bakery.jpg", "/category-packages.jpg"],
    options: {
      flavours: ["Vanilla Bean Sponge", "Chocolate Fudge Cake", "Classic Ribbon Cake", "Red Velvet Cream Cheese"],
      allowCustomMessage: true
    }
  }
];
