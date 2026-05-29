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
      benefits: ['Deep hydration for dry skin', 'Balances skin pH', 'Reduces redness', 'Soothes irritation'],
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
      benefits: ['Brightens complexion', 'Reduces pigmentation', 'Anti-inflammatory properties', 'Natural glow'],
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
      benefits: ['Soothes sunburn', 'Reduces acne inflammation', 'Hydrates skin', 'Heals minor wounds'],
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
      benefits: ['Reduces puffiness', 'Tightens pores', 'Antioxidant protection', 'Reduces dark circles'],
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
      benefits: ['Cools and refreshes skin', 'Reduces tan', 'Lightens complexion', 'Tightens skin'],
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
      benefits: ['Gentle exfoliation', 'Removes dead skin', 'Brightens skin', 'Controls oil'],
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
      benefits: ['Softens lips', 'Removes dead skin', 'Natural moisturization', 'Improves lip texture'],
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
      benefits: ['Targets acne', 'Antibacterial properties', 'Reduces inflammation', 'Prevents breakouts'],
      howToUse: 'Crush neem leaves to paste, add tea tree oil and honey. Apply directly on acne spots. Leave for 15-20 minutes. Rinse thoroughly.',
      frequency: 'Daily on affected areas',
      icon: <Leaf size={24} color="#059669" />,
      bestFor: ['Acne', 'Pimples', 'Breakouts'],
      bgColor: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: '9',
      title: 'Virgin Coconut Oil Moisturizer',
      category: 'Deep Hydration',
      ingredients: ['Virgin Coconut Oil'],
      benefits: ['Anti-inflammatory', 'Locks in moisture', 'Promotes dewy look', 'Restores skin barrier'],
      howToUse: 'Massage a small amount onto face. Let soak in for a few minutes before washing off with your regular cleanser.',
      frequency: 'Daily (if tolerated)',
      icon: <Droplet size={24} color="#0284c7" />,
      bestFor: ['Extremely Dry Skin', 'Makeup Removal', 'Flaky Skin'],
      bgColor: 'from-sky-100 to-blue-100',
      iconColor: 'text-sky-600',
    },
    {
      id: '10',
      title: 'Extra-Virgin Olive Oil Soother',
      category: 'Repair',
      ingredients: ['Extra-Virgin Olive Oil'],
      benefits: ['Rich in Vitamin E', 'Antioxidants & squalene', 'Repairs damaged skin', 'Intense moisture'],
      howToUse: 'Apply a few drops sparingly to dry areas like elbows, or add a few drops to your face mask.',
      frequency: 'As needed for intense dryness',
      icon: <Leaf size={24} color="#65a30d" />,
      bestFor: ['Dry Patches', 'Elbows/Knees', 'Damaged Barrier'],
      bgColor: 'from-lime-100 to-yellow-100',
      iconColor: 'text-lime-600',
    },
    {
      id: '11',
      title: 'Creamy Avocado Face Mask',
      category: 'Nourishing',
      ingredients: ['1/2 Ripe Avocado (mashed)'],
      benefits: ['Rich in antioxidants', 'Natural probiotics', 'Promotes healthy glowing skin', 'Deeply moisturizing'],
      howToUse: 'Apply mashed avocado evenly to clean face. Leave for 15-20 minutes, then rinse with lukewarm water.',
      frequency: '1-2 times per week',
      icon: <Sparkles size={24} color="#16a34a" />,
      bestFor: ['Dull Skin', 'Dry Skin', 'Mature Skin'],
      bgColor: 'from-green-100 to-lime-100',
      iconColor: 'text-green-600',
    },
    {
      id: '12',
      title: 'Soothing Oatmeal Bath',
      category: 'Body Care',
      ingredients: ['1 cup Colloidal Oatmeal (or finely ground oats)'],
      benefits: ['Rehydrates dry skin', 'Calms irritation', 'Soothes eczema', 'Locks in moisture'],
      howToUse: 'Add oatmeal to a warm bath. Soak for 10-15 minutes to naturally rehydrate dry, itchy skin.',
      frequency: '2-3 times per week',
      icon: <Heart size={24} color="#d97706" />,
      bestFor: ['Eczema', 'All-over Dryness', 'Itchy Skin'],
      bgColor: 'from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
    },
    {
      id: '13',
      title: 'Oatmeal & Honey Exfoliant',
      category: 'Exfoliation',
      ingredients: ['2 tbsp Oatmeal', '1 tbsp Raw Honey'],
      benefits: ['Gentle physical exfoliation', 'Soothes inflammation', 'Antibacterial', 'Leaves skin soft'],
      howToUse: 'Mix to a paste. Apply to face, gently rub in circular motions, and leave for 15 minutes before rinsing.',
      frequency: 'Once a week',
      icon: <Sparkles size={24} color="#b45309" />,
      bestFor: ['Sensitive Skin', 'Dry Skin', 'Uneven Texture'],
      bgColor: 'from-orange-100 to-amber-100',
      iconColor: 'text-orange-600',
    },
    {
      id: '14',
      title: 'Nourishing Oil Bath Soak',
      category: 'Barrier Repair',
      ingredients: ['2-3 tbsp Jojoba, Argan, or Avocado Oil'],
      benefits: ['Recreates natural skin barrier', 'Moisturizes deeply', 'Prevents moisture loss', 'Non-irritating'],
      howToUse: 'Add a few tablespoons of your chosen oil under running warm bathwater. Soak, then gently pat skin dry.',
      frequency: 'Weekly',
      icon: <Droplet size={24} color="#0369a1" />,
      bestFor: ['Compromised Skin Barrier', 'Winter Dryness', 'Whole Body'],
      bgColor: 'from-sky-100 to-indigo-100',
      iconColor: 'text-sky-600',
    },
    {
      id: '15',
      title: 'Cold Milk Compress',
      category: 'Soothing',
      ingredients: ['Cold Milk', 'Clean Washcloth'],
      benefits: ['Lactic acid hydrates', 'Soothes irritated skin', 'Gently exfoliates', 'Reduces redness'],
      howToUse: 'Soak a clean washcloth in cold milk and apply to irritated or sun-exposed areas for 5-10 minutes.',
      frequency: 'As needed for irritation',
      icon: <Sun size={24} color="#4f46e5" />,
      bestFor: ['Irritated Skin', 'Sunburn', 'Sensitive Skin'],
      bgColor: 'from-indigo-100 to-blue-100',
      iconColor: 'text-indigo-600',
    },
    {
      id: '16',
      title: 'Fruit Enzyme Peel',
      category: 'Brightening',
      ingredients: ['Mashed Papaya or Pineapple'],
      benefits: ['Natural alpha-hydroxy acids', 'Gentle chemical exfoliation', 'Brightens dullness', 'Smoothes texture'],
      howToUse: 'Apply mashed fruit to face. Leave for 5-10 minutes (less if sensitive). Rinse thoroughly.',
      frequency: 'Once every 1-2 weeks',
      icon: <Sparkles size={24} color="#ea580c" />,
      bestFor: ['Dull Skin', 'Rough Texture', 'Hyperpigmentation'],
      bgColor: 'from-orange-100 to-red-100',
      iconColor: 'text-orange-600',
    },
    {
      id: '17',
      title: 'Raw Honey Spot Treatment',
      category: 'Targeted Care',
      ingredients: ['Raw, Organic Honey'],
      benefits: ['Antimicrobial', 'Natural humectant', 'Heals dry patches', 'Reduces acne redness'],
      howToUse: 'Apply a small amount directly to dry patches or acne spots. Leave for 10-15 minutes, then rinse.',
      frequency: 'Daily as needed',
      icon: <Droplet size={24} color="#d97706" />,
      bestFor: ['Dry Patches', 'Acne Spots', 'Minor Cuts'],
      bgColor: 'from-amber-100 to-yellow-100',
      iconColor: 'text-amber-600',
    },
    {
      id: '18',
      title: 'Chamomile Tea Compress',
      category: 'Inflammation Relief',
      ingredients: ['2 Brewed & Cooled Chamomile Tea Bags'],
      benefits: ['Reduces inflammation', 'Alleviates itchy skin', 'Relaxes irritated tissue', 'Safe for under-eyes'],
      howToUse: 'Place cool, wet tea bags directly on irritated skin or under eyes for 10 to 30 minutes.',
      frequency: 'As needed',
      icon: <Coffee size={24} color="#65a30d" />,
      bestFor: ['Itchy Skin', 'Rashes', 'Puffy Eyes'],
      bgColor: 'from-lime-100 to-green-100',
      iconColor: 'text-lime-600',
    },
    {
      id: '19',
      title: 'Jasmine Tea Toner',
      category: 'Acne Treatment',
      ingredients: ['Brewed & Cooled Jasmine Tea'],
      benefits: ['Addresses acne', 'Reduces redness', 'Antioxidant properties', 'Refreshing'],
      howToUse: 'Apply cooled jasmine tea to face using a cotton pad after cleansing. Leave on or rinse after 15 mins.',
      frequency: 'Daily',
      icon: <Leaf size={24} color="#047857" />,
      bestFor: ['Acne-Prone Skin', 'Redness', 'Oily Skin'],
      bgColor: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: '20',
      title: 'Petroleum Jelly Slugging',
      category: 'Deep Moisture',
      ingredients: ['Pure Petroleum Jelly'],
      benefits: ['Prevents chafing', 'Traps moisture overnight', 'Heals severe dryness', 'Protects skin barrier'],
      howToUse: 'Apply a thin layer to damp skin before bed to lock in moisture (slugging). Avoid on acne-prone areas.',
      frequency: 'Nightly during winter/dry spells',
      icon: <Heart size={24} color="#1d4ed8" />,
      bestFor: ['Severely Dry Skin', 'Chapped Lips', 'Winter Skin'],
      bgColor: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
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
        <View className="flex-row flex-wrap gap-y-8 gap-x-[2.5%]">
          {remedies.map((remedy) => (
            <View key={remedy.id} className="w-full md:w-[48.75%] lg:w-[31.6%]">
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
    <View className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-purple-200">
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
            <Remedies onNavigate={(page: string) => {
              if (page === 'landing') router.push('/');
              else router.push(`/patient/${page}` as any);
            }} />
        </SafeAreaView>
    );
}
