import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Coffee, Droplet, Heart, Leaf, Sparkles, Sun } from 'lucide-react-native';
export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

type RemediesProps = {
  onNavigate: (page: Page) => void;
};

type Remedy = {
  id: string;
  title: string;
  category: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  frequency: string;
  icon: React.ReactNode;
  bestFor: string[];
  bgColor: string;
  iconColor: string;
};

function Remedies({ onNavigate }: RemediesProps) {
  const remedies: Remedy[] = [
    {
      id: '1',
      title: 'Rose Water & Glycerin Toner',
      category: 'Hydration',
      ingredients: ['2 tbsp Rose Water', '1 tsp Glycerin', '1 cup Distilled Water'],
      benefits: [
        'Deep hydration for dry skin',
        'Balances skin pH',
        'Reduces redness',
        'Soothes irritation',
      ],
      howToUse: 'Mix all ingredients in a spray bottle. Spray on face after cleansing. Pat gently and follow with moisturizer.',
      frequency: 'Twice daily (morning & night)',
      icon: <Droplet size={24} color="#2563eb" />,
      bestFor: ['Dry Skin', 'Sensitive Skin', 'Normal Skin'],
      bgColor: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
    },
    {
      id: '2',
      title: 'Turmeric & Honey Face Mask',
      category: 'Brightening',
      ingredients: ['1 tsp Turmeric Powder', '2 tbsp Raw Honey', '1 tbsp Yogurt (optional)'],
      benefits: [
        'Brightens complexion',
        'Reduces pigmentation',
        'Anti-inflammatory properties',
        'Natural glow',
      ],
      howToUse: 'Mix ingredients into a paste. Apply evenly on face, avoiding eyes. Leave for 10-15 minutes. Rinse with lukewarm water.',
      frequency: '2-3 times per week',
      icon: <Sparkles size={24} color="#ca8a04" />,
      bestFor: ['Dull Skin', 'Pigmentation', 'Uneven Skin Tone'],
      bgColor: 'from-yellow-100 to-orange-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: '3',
      title: 'Aloe Vera Gel Treatment',
      category: 'Soothing',
      ingredients: ['Fresh Aloe Vera Gel (from plant)', 'Or Pure 100% Aloe Vera Gel'],
      benefits: [
        'Soothes sunburn',
        'Reduces acne inflammation',
        'Hydrates skin',
        'Heals minor wounds',
      ],
      howToUse: 'Extract fresh gel from aloe vera leaf. Apply directly to clean skin. Leave overnight or for 20 minutes. Rinse if needed.',
      frequency: 'Daily (can be used as needed)',
      icon: <Leaf size={24} color="#16a34a" />,
      bestFor: ['Acne', 'Sunburn', 'Irritated Skin'],
      bgColor: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
    },
    {
      id: '4',
      title: 'Green Tea Ice Cubes',
      category: 'Anti-Aging',
      ingredients: ['2 Green Tea Bags', '1 cup Boiling Water', 'Ice Cube Tray'],
      benefits: [
        'Reduces puffiness',
        'Tightens pores',
        'Antioxidant protection',
        'Reduces dark circles',
      ],
      howToUse: 'Brew strong green tea, let cool, pour into ice tray and freeze. Wrap ice cube in cloth and massage on face in circular motions for 2-3 minutes.',
      frequency: 'Every morning',
      icon: <Coffee size={24} color="#0d9488" />,
      bestFor: ['Puffy Eyes', 'Large Pores', 'Anti-Aging'],
      bgColor: 'from-teal-100 to-green-100',
      iconColor: 'text-teal-600',
    },
    {
      id: '5',
      title: 'Cucumber & Milk Face Pack',
      category: 'Cooling',
      ingredients: ['1/2 Cucumber (grated)', '2 tbsp Milk', '1 tsp Gram Flour (Besan)'],
      benefits: [
        'Cools and refreshes skin',
        'Reduces tan',
        'Lightens complexion',
        'Tightens skin',
      ],
      howToUse: 'Blend cucumber to paste, mix with milk and besan. Apply on face and neck. Leave for 15-20 minutes. Rinse with cool water.',
      frequency: '2-3 times per week',
      icon: <Sun size={24} color="#84cc16" />,
      bestFor: ['Sun Tan', 'Hot Weather', 'Oily Skin'],
      bgColor: 'from-lime-100 to-green-100',
      iconColor: 'text-lime-600',
    },
    {
      id: '6',
      title: 'Gram Flour & Yogurt Scrub',
      category: 'Exfoliation',
      ingredients: ['2 tbsp Gram Flour (Besan)', '1 tbsp Yogurt', 'Pinch of Turmeric'],
      benefits: [
        'Gentle exfoliation',
        'Removes dead skin',
        'Brightens skin',
        'Controls oil',
      ],
      howToUse: 'Mix ingredients to make a paste. Apply on damp face. Gently massage in circular motions for 2-3 minutes. Rinse with lukewarm water.',
      frequency: '1-2 times per week',
      icon: <Sparkles size={24} color="#f59e0b" />,
      bestFor: ['Oily Skin', 'Blackheads', 'Dull Skin'],
      bgColor: 'from-amber-100 to-yellow-100',
      iconColor: 'text-amber-600',
    },
    {
      id: '7',
      title: 'Coconut Oil & Sugar Lip Scrub',
      category: 'Lip Care',
      ingredients: ['1 tsp Coconut Oil', '1 tsp Sugar', '1 drop Honey'],
      benefits: [
        'Softens lips',
        'Removes dead skin',
        'Natural moisturization',
        'Improves lip texture',
      ],
      howToUse: 'Mix ingredients. Gently massage on lips for 1-2 minutes. Rinse with water. Apply lip balm or coconut oil.',
      frequency: '2-3 times per week',
      icon: <Heart size={24} color="#ec4899" />,
      bestFor: ['Dry Lips', 'Chapped Lips', 'Dark Lips'],
      bgColor: 'from-pink-100 to-rose-100',
      iconColor: 'text-pink-600',
    },
    {
      id: '8',
      title: 'Neem & Tea Tree Spot Treatment',
      category: 'Acne Treatment',
      ingredients: ['5-6 Neem Leaves (crushed)', '2 drops Tea Tree Oil', '1 tsp Honey'],
      benefits: [
        'Targets acne',
        'Antibacterial properties',
        'Reduces inflammation',
        'Prevents breakouts',
      ],
      howToUse: 'Crush neem leaves to paste, add tea tree oil and honey. Apply directly on acne spots. Leave for 15-20 minutes. Rinse thoroughly.',
      frequency: 'Daily on affected areas',
      icon: <Leaf size={24} color="#059669" />,
      bestFor: ['Acne', 'Pimples', 'Breakouts'],
      bgColor: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
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
            <Leaf size={32} color="#16a34a" />
            <Text className="text-3xl font-bold">Natural Home Remedies</Text>
          </View>
          <Text className="text-gray-600">
            Traditional Pakistani skincare remedies using natural ingredients for healthy, glowing skin
          </Text>
        </View>

        {/* Quick Tips */}
        <View className="bg-purple-600 rounded-2xl p-6 mb-8 shadow-lg shadow-purple-100">
          <Text className="text-lg font-bold mb-4 text-white">💡 Important Tips</Text>
          <View className="flex-col md:flex-row gap-4">
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Always do a patch test before applying any remedy to your face</Text>
            </View>
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Use fresh, organic ingredients whenever possible</Text>
            </View>
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Consistency is key - results may take 2-4 weeks</Text>
            </View>
          </View>
        </View>

        {/* Remedies Grid */}
        <View className="flex-col md:flex-row flex-wrap gap-6">
          {remedies.map((remedy) => (
            <View key={remedy.id} className="w-full md:w-[48%]">
              <RemedyCard remedy={remedy} />
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View className="mt-12 bg-purple-500 rounded-3xl p-8 md:p-12 items-center">
          <Text className="text-2xl font-bold mb-4 text-white text-center">Want Personalized Product Recommendations?</Text>
          <Text className="mb-6 text-white text-center opacity-90">
            Get AI-powered skin analysis and curated Halal product recommendations
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('landing')}
            className="px-8 py-4 bg-white rounded-full"
          >
            <Text className="text-purple-600 font-bold">Start Skin Analysis</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function RemedyCard({ remedy }: { remedy: Remedy }) {
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <View className="bg-gradient-to-r p-6" style={{ backgroundColor: '#a7f3d0' }}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
            {remedy.icon}
          </View>
          <View className="px-3 py-1 bg-white/80 rounded-full">
            <Text className="text-gray-700 text-sm font-medium">{remedy.category}</Text>
          </View>
        </View>
        <Text className="text-lg font-bold text-gray-900">{remedy.title}</Text>
      </View>

      {/* Content */}
      <View className="p-6">
        {/* Ingredients */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-2 font-bold">Ingredients:</Text>
          <View className="gap-1">
            {remedy.ingredients.map((ingredient, index) => (
              <View key={index} className="flex-row items-start gap-2">
                <Text className="text-green-500 mt-1">✓</Text>
                <Text className="text-gray-600 flex-1">{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-2 font-bold">Benefits:</Text>
          <View className="flex-row flex-wrap gap-2">
            {remedy.benefits.map((benefit, index) => (
              <View
                key={index}
                className="px-3 py-1 bg-purple-50 rounded-full"
              >
                <Text className="text-purple-700 text-sm">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How to Use */}
        <View className="mb-4 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-900 mb-2 font-bold">How to Use:</Text>
          <Text className="text-gray-600">{remedy.howToUse}</Text>
        </View>

        {/* Frequency */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-1 font-bold">Frequency:</Text>
          <Text className="text-purple-600 font-medium">{remedy.frequency}</Text>
        </View>

        {/* Best For */}
        <View>
          <Text className="text-gray-900 mb-2 font-bold">Best For:</Text>
          <View className="flex-row flex-wrap gap-2">
            {remedy.bestFor.map((condition, index) => (
              <View
                key={index}
                className="px-3 py-1 bg-green-50 rounded-full"
              >
                <Text className="text-green-700 text-sm">{condition}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function RemediesPage() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Remedies onNavigate={(page: string) => router.push(`/${page}` as any)} />
        </SafeAreaView>
    );
}
