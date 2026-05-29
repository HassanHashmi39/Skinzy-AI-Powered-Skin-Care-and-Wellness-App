import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, Leaf, Shield, ShoppingCart, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

export type SkinAnalysisResult = {
  skinType: string;
  skinTone: string;
  detectedDisease?: string;
  conditionLevel?: string;
  issues: {
    acne: number;
    pigmentation: number;
    dryness: number;
    oiliness: number;
    darkCircles: number;
    sensitivity: number;
  };
  recommendations: any[]; // Changed to any[] to support objects
};

const PRODUCT_IMAGE_MAPPING: { [key: string]: string } = {
  mandelac: 'https://theskinfit.com/cdn/shop/files/Jenpharm_MandelAC_Serum_20ml_2.png?v=1768385233&width=1920',
  spectrablock: 'https://jenpharm.com/cdn/shop/files/3_8.jpg?v=1767272401',
  vince_vitc: 'https://beautyvoc.com.pk/cdn/shop/files/VitaminCFacewash.jpg?v=1762189678',
  youth_serum: 'https://dermasation.com/cdn/shop/files/Retinol-face-serum_78d94f24-d199-4200-9223-71f5ff8b9d8e.jpg?v=1758120365',
  dermive: 'https://jenpharm.com/cdn/shop/files/Dermive-oil-free.png?v=1767271488',
  ordinary_cleanser: 'https://ashriskin.com/cdn/shop/files/3_Barcode_8802010947083_f75792b7-e6fe-4d55-b60c-0b17f81079db.jpg?v=1768568240',
  cerave_sa: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88917/l/24.jpg',
  derma_shine: 'https://www.ameena.pk/cdn/shop/files/1000024973.webp?v=1763400571',
  niacinamide: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/mcl/mcl21268/l/8.jpg',
  'local product': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=600',
};

type ProductRecommendationsProps = {
  result: SkinAnalysisResult | null;
  onNavigate: (page: Page) => void;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceUSD?: string;
  rating: number;
  reviews: number;
  isHalal: boolean;
  isOrganic: boolean;
  category: string;
  buyLinks: {
    daraz?: string;
    amazon?: string;
    local?: string;
  };
  benefits: string[];
  image: string;
};

function ProductRecommendations({ result, onNavigate }: ProductRecommendationsProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Use default skin type if no result available
  const skinType = result?.skinType || 'Normal';

  // State for filters
  const [activeFilters, setActiveFilters] = useState<{
    halalOnly: boolean;
    organicOnly: boolean;
    underPKR3000: boolean;
    category: string | null;
  }>({
    halalOnly: false,
    organicOnly: false,
    underPKR3000: false,
    category: null,
  });

  const toggleFilter = (filter: 'halalOnly' | 'organicOnly' | 'underPKR3000') => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const setCategory = (category: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      halalOnly: false,
      organicOnly: false,
      underPKR3000: false,
      category: null,
    });
  };

  // Generate Pakistani products from analysis (Requirement 3)
  const pakistaniProducts: Product[] = result?.recommendations
    ? result.recommendations.map((p, index) => ({
      id: `pk-${index}`,
      name: p.name || 'Serum',
      brand: p.brand || 'Dermatologist Recommended',
      price: p.price || 'Rs. 1,200',
      rating: 4.8,
      reviews: 156,
      isHalal: true,
      isOrganic: true,
      category: 'Recommended',
      buyLinks: { daraz: 'https://daraz.pk' },
      benefits: ['Dermatologist recommended for ' + (result?.detectedDisease || 'your skin')],
      image: 'local product',
    }))
    : [];

  // Combine with existing products or prioritize pakistani ones
  const products: Product[] = [...pakistaniProducts,
  {
    id: '1',
    name: 'MandelAC Serum (Mandelic Acid)',
    brand: 'Jenpharm Pakistani',
    price: 'PKR 1,598',
    rating: 4.8,
    reviews: 2432,
    isHalal: true,
    isOrganic: false,
    category: 'Serum',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Targets acne', 'Gentle exfoliation', 'Dermatologist recommended'],
    image: 'mandelac',
  },
  {
    id: '2',
    name: 'Spectra Block SPF 60',
    brand: 'Jenpharm Pakistani',
    price: 'PKR 1000',
    rating: 4.9,
    reviews: 4120,
    isHalal: true,
    isOrganic: false,
    category: 'Sunscreen',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['High SPF protection', 'Non-greasy', 'Safe for sensitive skin'],
    image: 'spectrablock',
  },
  {
    id: '3',
    name: 'Vitamin C Brightening Wash',
    brand: 'Vince Pakistani',
    price: 'PKR 899',
    rating: 4.5,
    reviews: 1840,
    isHalal: true,
    isOrganic: true,
    category: 'Cleanser',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Deep cleansing', 'Skin brightening', 'Budget friendly'],
    image: 'vince_vitc',
  },
  {
    id: '4',
    name: 'Youth Serum (Retinol)',
    brand: 'Organic Traveller PK',
    price: 'PKR 2,150',
    rating: 4.7,
    reviews: 950,
    isHalal: true,
    isOrganic: true,
    category: 'Serum',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Anti-aging', 'Cell renewal', 'Vibrant skin'],
    image: 'youth_serum',
  },
  {
    id: '5',
    name: 'Dermive Oil Free Moisturizer',
    brand: 'Jenpharm Pakistani',
    price: 'PKR 1,098',
    rating: 4.8,
    reviews: 3200,
    isHalal: true,
    isOrganic: false,
    category: 'Moisturizer',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Non-comedogenic', 'Hydrating', 'Matte finish'],
    image: 'dermive',
  },
  {
    id: '6',
    name: 'Gentle Foaming Cleanser',
    brand: 'The Ordinary',
    price: 'PKR 2,500',
    rating: 4.5,
    reviews: 1243,
    isHalal: true,
    isOrganic: true,
    category: 'Cleanser',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Removes excess oil', 'Gentle on sensitive skin', 'pH balanced'],
    image: 'ordinary_cleanser',
  },
  {
    id: '7',
    name: 'SA Smoothing Cleanser',
    brand: 'CeraVe (Imported)',
    price: 'PKR 3,800',
    rating: 4.9,
    reviews: 8560,
    isHalal: true,
    isOrganic: false,
    category: 'Cleanser',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Exfoliating', 'For rough & bumpy skin', 'With ceramides'],
    image: 'cerave_sa',
  },
  {
    id: '8',
    name: 'Anti-Aging Day Cream',
    brand: 'Derma Shine PK',
    price: 'PKR 950',
    rating: 4.4,
    reviews: 620,
    isHalal: true,
    isOrganic: false,
    category: 'Moisturizer',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Reduces fine lines', 'Deeply hydrates', 'SPF 15 included'],
    image: 'derma_shine',
  },
  {
    id: '9',
    name: 'Vitamin B3 Niacinamide',
    brand: 'Organic Traveller PK',
    price: 'PKR 1,850',
    rating: 4.8,
    reviews: 1100,
    isHalal: true,
    isOrganic: true,
    category: 'Serum',
    buyLinks: { daraz: 'https://daraz.pk' },
    benefits: ['Pore tightening', 'Oil control', 'Brightens tone'],
    image: 'niacinamide',
  },
  ];

  const filteredProducts = products.filter((product) => {
    if (activeFilters.halalOnly && !product.isHalal) return false;
    if (activeFilters.organicOnly && !product.isOrganic) return false;
    if (activeFilters.underPKR3000 && parseFloat(product.price.replace(/[^0-9.]/g, '')) > 3000) return false;
    if (activeFilters.category && product.category !== activeFilters.category) return false;
    return true;
  });

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-20 md:pt-4">
      <View className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <TouchableOpacity
          onPress={() => onNavigate('landing')}
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="text-gray-600 font-medium ml-2">Back to Home</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-3">
            <ShoppingCart size={32} color="#9333ea" />
            <Text className="text-3xl font-bold text-gray-900">Recommended Products</Text>
          </View>
          <Text className="text-gray-600">
            Halal-certified and affordable products curated for your {skinType.toLowerCase()} skin
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-purple-50">
          <View className="flex-row items-center justify-between mb-5 flex-wrap gap-3">
            <View>
              <Text className="text-gray-900 font-bold text-lg">Personalized Filters</Text>
              <Text className="text-gray-500 text-xs">Narrow down your perfect match</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('remedies')}
              className="flex-row items-center gap-2 px-5 py-2.5 bg-purple-600 rounded-full shadow-sm shadow-purple-200 transition-all hover:bg-purple-900"
            >
              <Leaf size={16} color="white" />
              <Text className="text-white font-bold ml-1">Try Natural Remedies</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <FilterBadge label="All" active={activeFilters.category === null && !activeFilters.halalOnly && !activeFilters.organicOnly && !activeFilters.underPKR3000} onPress={clearFilters} />
            <FilterBadge label="Halal Only" active={activeFilters.halalOnly} onPress={() => toggleFilter('halalOnly')} />
            <FilterBadge label="Organic" active={activeFilters.organicOnly} onPress={() => toggleFilter('organicOnly')} />
            <FilterBadge label="Under 3k" active={activeFilters.underPKR3000} onPress={() => toggleFilter('underPKR3000')} />
            <View className="w-px h-8 bg-gray-200 mx-1 hidden md:flex" />
            <FilterBadge label="Cleansers" active={activeFilters.category === 'Cleanser'} onPress={() => setCategory('Cleanser')} />
            <FilterBadge label="Serums" active={activeFilters.category === 'Serum'} onPress={() => setCategory('Serum')} />
            <FilterBadge label="Moisturizers" active={activeFilters.category === 'Moisturizer'} onPress={() => setCategory('Moisturizer')} />
          </View>
        </View>

        <View className="flex-row flex-wrap gap-y-8 gap-x-[2.5%] mb-12">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <View key={product.id} className="w-full md:w-[48.75%] lg:w-[31.6%]">
                <ProductCard product={product} onOpenLink={handleOpenLink} />
              </View>
            ))
          ) : (
            <View className="w-full py-12 items-center">
              <Text className="text-gray-600 mb-4">No products match your filters</Text>
              <TouchableOpacity
                onPress={clearFilters}
                className="px-6 py-2 bg-purple-500 rounded-full"
              >
                <Text className="text-white font-medium">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Complete Routine CTA */}
        <View className="bg-purple-500 rounded-3xl p-8 md:p-12 items-center">
          <Text className="text-2xl font-bold mb-4 text-white text-center">Ready to Start Your Routine?</Text>
          <Text className="mb-6 text-white text-center opacity-90">
            Save these products and create a personalized skincare routine with reminders
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('routine')}
            className="px-8 py-4 bg-white rounded-full"
          >
            <Text className="text-purple-600 font-bold">Create My Routine</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function ProductCard({ product, onOpenLink }: { product: Product, onOpenLink: (url: string) => void }) {
  const imageUrl = PRODUCT_IMAGE_MAPPING[product.image] || null;

  return (
    <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-purple-200">
      {/* Product Image Container */}
      <View className="h-48 md:h-52 lg:h-56 bg-purple-50 items-center justify-center relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center">
            <ShoppingCart size={40} color="#d8b4fe" />
            <Text className="text-purple-300 text-[10px] mt-2 font-bold uppercase tracking-widest">Skinzy Pick</Text>
          </View>
        )}

        {/* Top Badges overlay */}
        <View className="absolute top-4 left-4 flex-row gap-2 flex-wrap">
          {product.isHalal && (
            <View className="flex-row items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
              <Shield size={10} color="#9333EA" />
              <Text className="text-purple-700 text-[10px] font-black uppercase ml-1">Halal</Text>
            </View>
          )}
        </View>
      </View>

      <View className="p-5 flex-1 flex-col">
        {/* Brand & Name */}
        <View className="flex-1">
          <Text className="text-purple-600 text-[10px] font-black uppercase tracking-widest mb-1">{product.brand}</Text>
          <Text className="text-lg font-bold mb-2 text-gray-900 leading-6" numberOfLines={2}>{product.name}</Text>

          {/* Rating */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill={s <= Math.floor(product.rating) ? "#facc15" : "transparent"} color="#facc15" />
              ))}
            </View>
            <Text className="text-gray-400 text-xs">({product.reviews})</Text>
          </View>

          {/* Benefits */}
          <View className="mb-4 gap-1.5">
            {product.benefits.slice(0, 2).map((benefit, index) => (
              <View key={index} className="flex-row items-center gap-2 bg-gray-50 p-1.5 rounded-lg">
                <View className="w-1 h-1 bg-purple-400 rounded-full" />
                <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price & Buy Section */}
        <View className="mt-auto pt-4 border-t border-gray-50">
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">Price</Text>
              <Text className="text-xl font-black text-gray-900">{product.price}</Text>
            </View>
            {product.isOrganic && (
              <View className="px-2 py-1 bg-green-50 rounded-md">
                <Text className="text-green-700 text-[10px] font-bold uppercase">Organic</Text>
              </View>
            )}
          </View>

          {/* Buy Link */}
          {product.buyLinks.daraz && (
            <TouchableOpacity
              onPress={() => onOpenLink(product.buyLinks.daraz!)}
              className="flex-row items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-95"
            >
              <Text className="text-white font-black uppercase text-xs tracking-widest">Buy on Daraz</Text>
              <ExternalLink size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function FilterBadge({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      className={`px-5 py-2 rounded-full transition-all ${active
        ? 'bg-purple-600 shadow-md shadow-purple-100'
        : 'bg-white border border-gray-200 hover:border-purple-200 hover:bg-purple-50'
        }`}
      onPress={onPress}
    >
      <Text className={`font-bold text-xs uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ProductRecommendationsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const result: SkinAnalysisResult | null = params.result ? JSON.parse(params.result as string) : null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProductRecommendations
        result={result}
        onNavigate={(page: string) => {
          if (page === 'results') router.back();
          else if (page === 'landing') router.push('/');
          else router.push(`/patient/${page}` as any);
        }}
      />
    </SafeAreaView>
  );
}
