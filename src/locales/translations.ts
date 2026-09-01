export type Language = "en" | "si";

export interface Review {
  name: string;
  location: string;
  review: string;
}

export interface TranslationSchema {
  nav: {
    home: string;
    products: string;
    creations: string;
    customOrders: string;
    delivery: string;
    contact: string;
    cart: string;
    requestPrice: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    explore: string;
    requestPrice: string;
  };
  categories: {
    title: string;
    savoury: string;
    savouryDesc: string;
    cakes: string;
    cakesDesc: string;
    desserts: string;
    dessertsDesc: string;
    bouquets: string;
    bouquetsDesc: string;
    packages: string;
    packagesDesc: string;
    exploreBtn: string;
  };
  products: {
    title: string;
    viewDetails: string;
    addToInquiry: string;
    addedToInquiry: string;
    inquireBtn: string;
    noProducts: string;
    inquirySent: string;
  };
  howToOrder: {
    title: string;
    step1: string;
    step1Desc: string;
    step2: string;
    step2Desc: string;
    step3: string;
    step3Desc: string;
    step4: string;
    step4Desc: string;
    step5: string;
    step5Desc: string;
  };
  delivery: {
    title: string;
    note: string;
    locations: string[];
  };
  custom: {
    title: string;
    description: string;
    points: string[];
    button: string;
  };
  trust: {
    title: string;
    reviews: Review[];
  };
  social: {
    title: string;
    subtitle: string;
  };
  whatsapp: {
    title: string;
    description: string;
    button: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    followUs: string;
    rights: string;
  };
  inquiryModal: {
    title: string;
    subtitle: string;
    dateLabel: string;
    locationLabel: string;
    selectLocation: string;
    nameLabel: string;
    contactLabel: string;
    notesLabel: string;
    submitBtn: string;
    successMsg: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: {
      home: "Home",
      products: "Products",
      creations: "Our Creations",
      customOrders: "Custom Orders",
      delivery: "Delivery & How to Order",
      contact: "Contact",
      cart: "Inquiry Cart",
      requestPrice: "Request Price",
    },
    hero: {
      title: "Queen's Bakery",
      subtitle: "A Taste of Paradise",
      description: "Beautifully crafted cakes, savouries, desserts, flower bouquets and celebration treats.",
      explore: "Explore Products",
      requestPrice: "Request Price & Availability",
    },
    categories: {
      title: "Explore Our Categories",
      savoury: "Savoury Items",
      savouryDesc: "Delectable pastries, patties, rolls and bite-sized savoury treats perfect for any gathering.",
      cakes: "Cakes",
      cakesDesc: "Elegantly designed custom celebration cakes, drip cakes, and gateaux crafted to perfection.",
      desserts: "Desserts",
      dessertsDesc: "Creamy puddings, tarts, cupcakes and sweet delicacies to satisfy your cravings.",
      bouquets: "Flower Bouquets",
      bouquetsDesc: "Freshly arranged floral bouquets paired beautifully with our bakes for a complete gift.",
      packages: "Party Packages",
      packagesDesc: "Curated combinations of cakes, savouries, and desserts tailored for your celebrations.",
      exploreBtn: "Explore Category",
    },
    products: {
      title: "Popular Choices",
      viewDetails: "View Details",
      addToInquiry: "Add to Inquiry",
      addedToInquiry: "Added to Inquiry",
      inquireBtn: "Inquire Now",
      noProducts: "No products selected.",
      inquirySent: "Thank you! Your inquiry has been simulated successfully.",
    },
    howToOrder: {
      title: "How to Order",
      step1: "Browse and select your items",
      step1Desc: "Explore our categories and add your preferred items to the inquiry list.",
      step2: "Choose your required date",
      step2Desc: "Specify the exact date you need your order prepared.",
      step3: "Select your delivery location",
      step3Desc: "Choose one of our active delivery areas in Sri Lanka.",
      step4: "Request price and availability",
      step4Desc: "Submit your inquiry form. There are no public prices; everything is quoted per request.",
      step5: "Receive confirmation",
      step5Desc: "Our team reviews the schedule and location to send you a customized quotation.",
    },
    delivery: {
      title: "Current Delivery Areas",
      note: "Delivery availability depends on the requested date and location.",
      locations: [
        "Negombo",
        "Seeduwa",
        "Katunayake",
        "Ja-Ela",
        "Minuwangoda",
        "Dankotuwa",
        "Wennappuwa",
        "Marawila"
      ]
    },
    custom: {
      title: "Custom Orders & Celebrations",
      description: "Make your special day unforgettable with our custom creations. We tailor cakes, flower combinations, and bulk orders specifically to your requirements.",
      points: [
        "Custom Cakes with custom shapes & sizes",
        "Celebration Orders & party platters",
        "Fresh Flower Bouquets paired with treats",
        "Bulk & Corporate Event catering"
      ],
      button: "Request a Custom Order"
    },
    trust: {
      title: "Why Customers Love Queen's Bakery",
      reviews: [
        {
          name: "Dinithi Alwis",
          location: "Negombo",
          review: "The custom chocolate gateau we ordered was absolutely delicious and looked stunning! The team was super professional even though there are no fixed prices, the quote they sent was very reasonable for the quality."
        },
        {
          name: "Shane Perera",
          location: "Ja-Ela",
          review: "Ordering from Seeduwa was seamless. They confirmed delivery availability for our anniversary date within hours. The savoury platter and flower bouquet combination was a huge hit."
        },
        {
          name: "Amara Jayasekara",
          location: "Wennappuwa",
          review: "I love their premium dark theme packaging! The custom cake was exactly what we envisioned, not too sweet, perfect texture. Highly recommend the WhatsApp quick chat for guidance."
        }
      ]
    },
    social: {
      title: "Follow Queen's Bakery",
      subtitle: "Connect with us and see our latest creations on social media."
    },
    whatsapp: {
      title: "Need help choosing your order?",
      description: "Chat directly with our team on WhatsApp for personalized suggestions, custom cake designs, and immediate availability checks.",
      button: "Chat on WhatsApp"
    },
    footer: {
      tagline: "Elegant, warm, modern bakery style. Creating paradise in every bite.",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      rights: "All rights reserved. Designed with love in Sri Lanka."
    },
    inquiryModal: {
      title: "Submit Price & Availability Inquiry",
      subtitle: "Your Selected Items:",
      dateLabel: "Requested Date",
      locationLabel: "Delivery Location",
      selectLocation: "Select a location",
      nameLabel: "Your Name",
      contactLabel: "Contact Number",
      notesLabel: "Special Instructions / Notes",
      submitBtn: "Submit Inquiry Request",
      successMsg: "Inquiry submitted! Since this is a demo, we've successfully simulated sending this to Queen's Bakery. In a real system, an admin would review this and contact you with a quotation."
    }
  },
  si: {
    nav: {
      home: "මුල් පිටුව",
      products: "නිෂ්පාදන",
      creations: "අපගේ නිර්මාණ",
      customOrders: "විශේෂ ඇණවුම්",
      delivery: "බෙදාහැරීම සහ ඇණවුම් කරන ආකාරය",
      contact: "සම්බන්ධතා",
      cart: "විමසීම් ලැයිස්තුව",
      requestPrice: "මිල විමසන්න",
    },
    hero: {
      title: "ක්වීන්ස් බේකරි (Queen's Bakery)",
      subtitle: "පාරාදීසයක රසය",
      description: "ලස්සනට සකස් කරන ලද කේක්, සේවරි කෑම වර්ග, ඩෙසර්ට්, මල් කළඹ සහ උත්සව සඳහා විශේෂ කෑම වර්ග.",
      explore: "නිෂ්පාදන ගවේෂණය කරන්න",
      requestPrice: "මිල සහ තිබේදැයි විමසන්න",
    },
    categories: {
      title: "අපගේ කාණ්ඩ ගවේෂණය කරන්න",
      savoury: "සේවරි කෑම වර්ග (Savoury)",
      savouryDesc: "ඕනෑම උත්සවයකට පරිපූර්ණ වූ රසවත් පැටිස්, රෝල්ස් සහ කුඩා සේවරි කෑම වර්ග.",
      cakes: "කේක් (Cakes)",
      cakesDesc: "උසස්ම තත්ත්වයෙන් සකසන ලද විශේෂ කේක් සහ ඩ්‍රිප් කේක්.",
      desserts: "ඩෙසර්ට් (Desserts)",
      dessertsDesc: "ඔබේ පැණිරස අවශ්‍යතා සපුරාලීම සඳහා ක්‍රීමි පුඩිං, ටාට් සහ කප්කේක්.",
      bouquets: "මල් කළඹ (Flower Bouquets)",
      bouquetsDesc: "අපගේ බේක් කරන ලද කෑම සමඟ තෑගි දීමට ලස්සනට සකසන ලද නැවුම් මල් කළඹ.",
      packages: "පාර්ටි පැකේජ (Party Packages)",
      packagesDesc: "උත්සව සඳහා විශේෂයෙන් සකස් කරන ලද කේක්, සේවරි සහ ඩෙසර්ට් එකතුවන්.",
      exploreBtn: "කාණ්ඩය ගවේෂණය කරන්න",
    },
    products: {
      title: "ප්‍රසිද්ධ තේරීම්",
      viewDetails: "විස්තර බලන්න",
      addToInquiry: "විමසීම් ලැයිස්තුවට එක් කරන්න",
      addedToInquiry: "ලැයිස්තුවට එක් කරන ලදී",
      inquireBtn: "දැන් විමසන්න",
      noProducts: "නිෂ්පාදන තෝරාගෙන නොමැත.",
      inquirySent: "ස්තූතියි! ඔබගේ විමසීම සාර්ථකව අනුකරණය කරන ලදී.",
    },
    howToOrder: {
      title: "ඇණවුම් කරන්නේ කෙසේද?",
      step1: "ඔබට අවශ්‍ය දේ තෝරන්න",
      step1Desc: "අපගේ නිෂ්පාදන ගවේෂණය කර ඔබට අවශ්‍ය දේ විමසීම් ලැයිස්තුවට එක් කරන්න.",
      step2: "අවශ්‍ය දිනය තෝරන්න",
      step2Desc: "ඔබට ඇණවුම අවශ්‍ය නිශ්චිත දිනය සඳහන් කරන්න.",
      step3: "බෙදාහැරීමේ ස්ථානය තෝරන්න",
      step3Desc: "ලංකාවේ අප සේවා සපයන බෙදාහැරීමේ ප්‍රදේශයක් තෝරන්න.",
      step4: "මිල සහ තිබේදැයි විමසන්න",
      step4Desc: "විමසීම් පෝරමය ඉදිරිපත් කරන්න. අපට ප්‍රසිද්ධ මිල ගණන් නොමැත, සියල්ල ඔබගේ ඉල්ලීම මත ලබා දේ.",
      step5: "තහවුරු කිරීමක් ලබා ගන්න",
      step5Desc: "අපගේ කණ්ඩායම දිනය සහ ස්ථානය පරීක්ෂා කර ඔබට විශේෂිත මිල ගණන් පත්‍රිකාවක් එවනු ඇත.",
    },
    delivery: {
      title: "දැනට බෙදාහරින ප්‍රදේශ",
      note: "බෙදාහැරීමේ හැකියාව ඉල්ලුම් කරන දිනය සහ ස්ථානය මත රඳා පවතී.",
      locations: [
        "මීගමුව (Negombo)",
        "සීදුව (Seeduwa)",
        "කටුනායක (Katunayake)",
        "ජา-ඇල (Ja-Ela)",
        "මිණුවන්ගොඩ (Minuwangoda)",
        "දංකොටුව (Dankotuwa)",
        "වෙන්නප්පුව (Wennappuwa)",
        "මාරවිල (Marawila)"
      ]
    },
    custom: {
      title: "විශේෂ සහ උත්සව ඇණවුම්",
      description: "අපගේ විශේෂ නිර්මාණ සමඟින් ඔබගේ විශේෂ දිනය අමතක නොවන එකක් බවට පත් කරන්න. ඔබගේ අවශ්‍යතා වලට ගැලපෙන පරිදි කේක්, මල් කළඹ සහ තොග ඇණවුම් අප සකසා දෙන්නෙමු.",
      points: [
        "ඔබට කැමති හැඩයට සහ ප්‍රමාණයට කේක්",
        "උත්සව සඳහා විශේෂ කෑම තැටි (Platters)",
        "කෑම වර්ග සමඟ නැවුම් මල් කළඹ",
        "තොග සහ ආයතනික උත්සව සඳහා ආහාර සැපයීම"
      ],
      button: "විශේෂ ඇණවුමක් ඉල්ලුම් කරන්න"
    },
    trust: {
      title: "පාරිභෝගිකයින් අපට ආදරය කරන්නේ ඇයි?",
      reviews: [
        {
          name: "දිනිති අල්විස්",
          location: "මීගමුව",
          review: "අපි ඇණවුම් කළ කේක් එක හරිම රසයි වගේම ගොඩක් ලස්සනයි! ස්ථාවර මිල ගණන් නොතිබුණත්, ඔවුන් එවූ මිල ගණන් ගුණාත්මකභාවය අනුව ඉතා සාධාරණයි."
        },
        {
          name: "ෂේන් පෙරේරා",
          location: "ජා-ඇල",
          review: "සීදුවේ සිට ඇණවුම් කිරීම ඉතා පහසු විය. අපගේ සංවත්සර දිනය සඳහා බෙදා හැරීමේ හැකියාව පැය කිහිපයකින් ඔවුන් තහවුරු කළා. සේවරි තැටිය සහ මල් කළඹ එකතුව විශිෂ්ටයි."
        },
        {
          name: "අමරා ජයසේකර",
          location: "වෙන්නප්පුව",
          review: "මම ඔවුන්ගේ ප්‍රීමියම් කළු පැහැති ඇසුරුම් වලට ගොඩක් කැමතියි! කේක් එක අපි බලාපොරොත්තු වූ විදිහටම තිබුණා, පැණිරස ගොඩක් නැහැ, නියම රස. සහය සඳහා වට්ස්ඇප් චැට් එක භාවිත කරන්න."
        }
      ]
    },
    social: {
      title: "ක්වීන්ස් බේකරි සමඟ සම්බන්ධ වන්න",
      subtitle: "අප සමඟ සම්බන්ධ වී සමාජ මාධ්‍ය ඔස්සේ අපගේ නවතම නිර්මාණ බලන්න."
    },
    whatsapp: {
      title: "තෝරා ගැනීමට උපකාර අවශ්‍යද?",
      description: "පෞද්ගලීකරණය කළ යෝජනා, විශේෂ කේක් මෝස්තර සහ ලබා ගත හැකි දිනයන් ක්ෂණිකව පරීක්ෂා කිරීමට වට්ස්ඇප් හරහා අපගේ කණ්ඩායම සමඟ කෙලින්ම සම්බන්ධ වන්න.",
      button: "වට්ස්ඇප් හරහා කතා කරන්න"
    },
    footer: {
      tagline: "සුඛෝපභෝගී, උණුසුම්, නවීන බේකරි කලාව. සෑම කටකටම පාරාදීසයක රසය.",
      quickLinks: "ක්‍ෂණික සබැඳි",
      followUs: "අපව අනුගමනය කරන්න",
      rights: "සියලුම හිමිකම් ඇවිරිණි. ශ්‍රී ලංකාවේ ආදරයෙන් නිර්මාණය කරන ලදී."
    },
    inquiryModal: {
      title: "මිල සහ තිබේදැයි විමසීම",
      subtitle: "ඔබ තෝරාගත් ද්‍රව්‍ය:",
      dateLabel: "අවශ්‍ය දිනය",
      locationLabel: "බෙදාහැරීමේ ස්ථානය",
      selectLocation: "ස්ථානය තෝරන්න",
      nameLabel: "ඔබගේ නම",
      contactLabel: "දුරකථන අංකය",
      notesLabel: "විශේෂ උපදෙස් / සටහන්",
      submitBtn: "විමසීම ඉදිරිපත් කරන්න",
      successMsg: "විමසීම ඉදිරිපත් කරන ලදී! මෙය ආදර්ශනයක් බැවින්, අපි සාර්ථකව ක්වීන්ස් බේකරි වෙත යැවීම අනුකරණය කළෙමු. සැබෑ පද්ධතියකදී, අපගේ කණ්ඩායම මෙය පරීක්ෂා කර ඔබව සම්බන්ධ කර ගනු ඇත."
    }
  }
};
