import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
import { ArrowLeft, ExternalLink, Leaf, Shield, ShoppingCart, Star } from 'lucide-react-native';
import { useState } from 'react';

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
      name: 'Gentle Foaming Cleanser',
      brand: 'The Ordinary',
      price: 'PKR 2,500',
      priceUSD: '$12',
      rating: 4.5,
      reviews: 1243,
      isHalal: true,
      isOrganic: true,
      category: 'Cleanser',
      buyLinks: {
        daraz: 'https://daraz.pk',
        amazon: 'https://amazon.com',
      },
      benefits: ['Removes excess oil', 'Gentle on sensitive skin', 'pH balanced'],
      image: 'skincare cleanser',
    },
    {
      id: '2',
      name: 'Niacinamide 10% + Zinc 1% Serum',
      brand: 'The Ordinary',
      price: 'PKR 3,200',
      priceUSD: '$15',
      rating: 4.8,
      reviews: 3421,
      isHalal: true,
      isOrganic: false,
      category: 'Serum',
      buyLinks: {
        daraz: 'https://daraz.pk',
        amazon: 'https://amazon.com',
      },
      benefits: ['Reduces oil production', 'Minimizes pores', 'Brightens skin'],
      image: 'skincare serum',
    },
    {
      id: '3',
      name: 'Hyaluronic Acid Moisturizer',
      brand: 'Neutrogena Hydro Boost',
      price: 'PKR 2,800',
      priceUSD: '$13',
      rating: 4.6,
      reviews: 892,
      isHalal: true,
      isOrganic: true,
      category: 'Moisturizer',
      buyLinks: {
        daraz: 'https://daraz.pk',
        amazon: 'https://amazon.com',
      },
      benefits: ['Deep hydration', 'Non-greasy formula', 'Suitable for all skin types'],
      image: 'skincare moisturizer',
    },
    {
      id: '4',
      name: 'Mineral Sunscreen SPF 50',
      brand: 'La Roche-Posay',
      price: 'PKR 4,500',
      priceUSD: '$20',
      rating: 4.9,
      reviews: 2156,
      isHalal: true,
      isOrganic: false,
      category: 'Sunscreen',
      buyLinks: {
        daraz: 'https://daraz.pk',
        amazon: 'https://amazon.com',
      },
      benefits: ['Broad spectrum protection', 'No white cast', 'Water resistant'],
      image: 'sunscreen',
    },
    {
      id: '5',
      name: 'Vitamin C Brightening Serum',
      brand: 'Klairs Freshly Juiced',
      price: 'PKR 3,800',
      priceUSD: '$18',
      rating: 4.7,
      reviews: 1567,
      isHalal: true,
      isOrganic: true,
      category: 'Serum',
      buyLinks: {
        daraz: 'https://daraz.pk',
        amazon: 'https://amazon.com',
        local: 'https://local-store.pk',
      },
      benefits: ['Fades pigmentation', 'Evens skin tone', 'Antioxidant protection'],
      image: 'vitamin c serum',
    },
    {
      id: '6',
      name: 'Tea Tree Spot Treatment',
      brand: 'The Body Shop',
      price: 'PKR 1,800',
      priceUSD: '$9',
      rating: 4.4,
      reviews: 743,
      isHalal: true,
      isOrganic: true,
      category: 'Treatment',
      buyLinks: {
        daraz: 'https://daraz.pk',
        local: 'https://local-store.pk',
      },
      benefits: ['Targets acne', 'Reduces inflammation', 'Natural ingredients'],
      image: 'tea tree treatment',
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <TouchableOpacity
          onPress={() => onNavigate('landing')}
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="text-gray-600 font-medium ml-2">Back to Home</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold mb-3 text-gray-900">Recommended Products</Text>
          <Text className="text-gray-600">
            Halal-certified and affordable products curated for your {skinType.toLowerCase()} skin
          </Text>
        </View>

        {/* Filters */}
        <View className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <View className="flex-row items-center justify-between mb-4 flex-wrap gap-2">
            <Text className="text-gray-700">Filter by:</Text>
            <TouchableOpacity
              onPress={() => onNavigate('remedies')}
              className="flex-row items-center gap-2 px-4 py-2 bg-green-50 rounded-full"
            >
              <Leaf size={16} color="#15803d" />
              <Text className="text-green-700 font-medium ml-1">Try Natural Remedies</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <FilterBadge label="All Products" active={activeFilters.category === null && !activeFilters.halalOnly && !activeFilters.organicOnly && !activeFilters.underPKR3000} onPress={clearFilters} />
            <FilterBadge label="Halal Only" active={activeFilters.halalOnly} onPress={() => toggleFilter('halalOnly')} />
            <FilterBadge label="Organic" active={activeFilters.organicOnly} onPress={() => toggleFilter('organicOnly')} />
            <FilterBadge label="Under PKR 3,000" active={activeFilters.underPKR3000} onPress={() => toggleFilter('underPKR3000')} />
            <FilterBadge label="Cleansers" active={activeFilters.category === 'Cleanser'} onPress={() => setCategory('Cleanser')} />
            <FilterBadge label="Serums" active={activeFilters.category === 'Serum'} onPress={() => setCategory('Serum')} />
            <FilterBadge label="Moisturizers" active={activeFilters.category === 'Moisturizer'} onPress={() => setCategory('Moisturizer')} />
          </View>
        </View>

        {/* Products Grid */}
        <View className="flex-row flex-wrap gap-6 mb-12">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <View key={product.id} className="w-full md:w-[48%] lg:w-[31%]">
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
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-1">
      {/* Product Image Placeholder */}
      <View className="aspect-square bg-purple-100 items-center justify-center">
        <ShoppingCart size={48} color="#d8b4fe" />
      </View>

      <View className="p-6">
        {/* Badges */}
        <View className="flex-row gap-2 mb-3 flex-wrap">
          {product.isHalal && (
            <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <Shield size={12} color="#15803d" />
              <Text className="text-green-700 text-xs font-medium ml-1">Halal</Text>
            </View>
          )}
          {product.isOrganic && (
            <View className="px-2 py-1 bg-blue-100 rounded-full">
              <Text className="text-blue-700 text-xs font-medium">Organic</Text>
            </View>
          )}
        </View>

        {/* Brand & Name */}
        <Text className="text-gray-600 mb-1 font-medium">{product.brand}</Text>
        <Text className="text-lg font-bold mb-2 text-gray-900">{product.name}</Text>

        {/* Rating */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="flex-row items-center gap-1">
            <Star size={16} fill="#facc15" color="#facc15" />
            <Text className="font-medium">{product.rating}</Text>
          </View>
          <Text className="text-gray-500">({product.reviews})</Text>
        </View>

        {/* Benefits */}
        <View className="mb-4 gap-1">
          {product.benefits.slice(0, 2).map((benefit, index) => (
            <View key={index} className="flex-row items-start gap-2">
              <Text className="text-purple-500 mt-1">•</Text>
              <Text className="text-gray-600 flex-1">{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900">{product.price}</Text>
          {product.priceUSD && (
            <Text className="text-gray-500 text-sm">≈ {product.priceUSD}</Text>
          )}
        </View>

        {/* Buy Links */}
        <View className="gap-2">
          {product.buyLinks.daraz && (
            <TouchableOpacity
              onPress={() => onOpenLink(product.buyLinks.daraz!)}
              className="flex-row items-center justify-center gap-2 w-full px-4 py-2 bg-orange-500 rounded-full"
            >
              <Text className="text-white font-medium">Buy on Daraz</Text>
              <ExternalLink size={16} color="white" />
            </TouchableOpacity>
          )}
          {product.buyLinks.amazon && (
            <TouchableOpacity
              onPress={() => onOpenLink(product.buyLinks.amazon!)}
              className="flex-row items-center justify-center gap-2 w-full px-4 py-2 border-2 border-gray-300 rounded-full"
            >
              <Text className="text-gray-700 font-medium">Buy on Amazon</Text>
              <ExternalLink size={16} color="#374151" />
            </TouchableOpacity>
          )}
          {product.buyLinks.local && (
            <TouchableOpacity
              onPress={() => onOpenLink(product.buyLinks.local!)}
              className="flex-row items-center justify-center gap-2 w-full px-4 py-2 border-2 border-purple-300 rounded-full"
            >
              <Text className="text-purple-600 font-medium">Local Store</Text>
              <ExternalLink size={16} color="#9333ea" />
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
      className={`px-4 py-2 rounded-full ${active
        ? 'bg-purple-500'
        : 'bg-gray-100'
        }`}
      onPress={onPress}
    >
      <Text className={`font-medium ${active ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
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
                    else router.push(`/${page}` as any);
                }}
            />
        </SafeAreaView>
    );
}
