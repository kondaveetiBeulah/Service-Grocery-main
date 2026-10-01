import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, StoreType, ProductCategory } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { storeService } from '../../services/storeService';

interface G2StoreDetailsScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G2StoreDetails'>;
}

// Only Supermarket store type
const STORE_TYPE: StoreType = 'Supermarket';

const CATEGORIES: ProductCategory[] = [
  'Dairy & Bread',
  'Fresh Fruits & Vegetables',
  'Snacks & Beverages',
  'Staples, Rice & Dals',
  'Personal Care',
  'Household Essentials',
  'Packaged Foods',
  'Instant Foods & Noodles',
  'Bakery & Sweets',
];

const PACKING_TIMES = [5, 7, 10, 12, 15];

export const G2StoreDetailsScreen: React.FC<G2StoreDetailsScreenProps> = ({ navigation }) => {
  const currentStore = storeService.getStoreDetails();
  const scrollRef = useRef<ScrollView>(null);

  const [storeName, setStoreName] = useState(currentStore.storeName);
  const [ownerName, setOwnerName] = useState(currentStore.ownerName);
  const [primaryPhone, setPrimaryPhone] = useState(currentStore.primaryPhone);
  const [alternatePhone, setAlternatePhone] = useState(currentStore.alternatePhone || '');
  const [email, setEmail] = useState(currentStore.email);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(currentStore.selectedCategories);
  const [packingTime, setPackingTime] = useState<number>(currentStore.avgPackingTimeMinutes);
  const [description, setDescription] = useState(currentStore.description);

  // Time slots
  const [slot1Open, setSlot1Open] = useState('06:30 AM');
  const [slot1Close, setSlot1Close] = useState('01:30 PM');
  const [slot2Open, setSlot2Open] = useState('04:30 PM');
  const [slot2Close, setSlot2Close] = useState('10:30 PM');

  const toggleCategory = (cat: ProductCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSaveAndNext = () => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;

    if (!storeName.trim() || !ownerName.trim() || !primaryPhone.trim() || !email.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required store profile fields to proceed.');
      return;
    }
    if (!indianPhoneRegex.test(primaryPhone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian primary contact number.');
      return;
    }
    if (alternatePhone.trim() && !indianPhoneRegex.test(alternatePhone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian alternate contact number.');
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Missing Categories', 'Please select at least one product category.');
      return;
    }
    if (!slot1Open.trim() || !slot1Close.trim() || !slot2Open.trim() || !slot2Close.trim()) {
      Alert.alert('Missing Time Slots', 'Please fill in opening and closing times for both shifts.');
      return;
    }

    storeService.updateStoreDetails({
      storeName,
      ownerName,
      primaryPhone,
      alternatePhone,
      email,
      storeType: STORE_TYPE,
      selectedCategories,
      avgPackingTimeMinutes: packingTime,
      packingStaffCount: 1,
      description,
      timeSlots: [
        { id: 'slot-1', label: 'Morning Slot', openTime: slot1Open, closeTime: slot1Close, enabled: true },
        { id: 'slot-2', label: 'Evening Slot', openTime: slot2Open, closeTime: slot2Close, enabled: true },
      ],
    });
    navigation.navigate('G3DocumentsUpload');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={1}
        title="Store Details & Operations"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* SECTION 1: BASIC STORE INFO */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>1. Store Profile</Text>

            <AppInput
              label="Store Trade Name"
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. Sri Lakshmi Fresh Supermart"
              required
            />

            <AppInput
              label="Proprietor / Owner Full Name"
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Venkatesh Rao"
              required
            />

            <AppInput
              label="Primary Contact Number"
              value={primaryPhone}
              onChangeText={setPrimaryPhone}
              keyboardType="phone-pad"
              placeholder="Enter your number"
              maxLength={10}
              required
            />

            <AppInput
              label="Alternate Contact Number (Optional)"
              value={alternatePhone}
              onChangeText={setAlternatePhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Enter your number"
            />

            <AppInput
              label="Official Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="store@domain.com"
              required
            />

            {/* Store Type — fixed to Supermarket */}
            <Text style={styles.fieldLabel}>Store Type:</Text>
            <View style={styles.storeTypeDisplay}>
              <Ionicons name="storefront" size={18} color={colors.primaryDark} />
              <Text style={styles.storeTypeText}>{STORE_TYPE}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            </View>
          </View>

          {/* SECTION 2: PRODUCT CATEGORIES */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>2. Categories Sold in Store</Text>
            <Text style={styles.sectionSub}>Select all categories available on your shelves:</Text>

            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => toggleCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 3: TIME SLOTS & PACKING SPEED */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>3. Daily Operating Time Slots</Text>
            <Text style={styles.sectionSub}>Set your two daily shifts for customer delivery:</Text>

            {/* Slot 1 */}
            <View style={styles.slotRow}>
              <View style={styles.slotBadge}>
                <Ionicons name="sunny-outline" size={16} color={colors.secondary} />
                <Text style={styles.slotBadgeText}>Shift 1 (Morning)</Text>
              </View>
              <View style={styles.timeInputsRow}>
                <AppInput
                  label="Opens"
                  value={slot1Open}
                  onChangeText={setSlot1Open}
                  containerStyle={styles.timeInput}
                  placeholder="e.g. 06:30 AM"
                />
                <Text style={styles.toText}>to</Text>
                <AppInput
                  label="Closes"
                  value={slot1Close}
                  onChangeText={setSlot1Close}
                  containerStyle={styles.timeInput}
                  placeholder="e.g. 01:30 PM"
                />
              </View>
            </View>

            {/* Slot 2 */}
            <View style={styles.slotRow}>
              <View style={styles.slotBadge}>
                <Ionicons name="moon-outline" size={16} color={colors.primary} />
                <Text style={styles.slotBadgeText}>Shift 2 (Evening)</Text>
              </View>
              <View style={styles.timeInputsRow}>
                <AppInput
                  label="Opens"
                  value={slot2Open}
                  onChangeText={setSlot2Open}
                  containerStyle={styles.timeInput}
                  placeholder="e.g. 04:30 PM"
                />
                <Text style={styles.toText}>to</Text>
                <AppInput
                  label="Closes"
                  value={slot2Close}
                  onChangeText={setSlot2Close}
                  containerStyle={styles.timeInput}
                  placeholder="e.g. 10:30 PM"
                />
              </View>
            </View>

            {/* Average Packing Time Picker */}
            <Text style={styles.fieldLabel}>Average Order Packing Time Target:</Text>
            <View style={styles.packingTimesRow}>
              {PACKING_TIMES.map((mins) => {
                const isSelected = packingTime === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.packPill, isSelected && styles.packPillSelected]}
                    onPress={() => setPackingTime(mins)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.packPillText, isSelected && styles.packPillTextSelected]}>
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 4: DESCRIPTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>4. Store Description</Text>
            <Text style={styles.sectionSub}>Tell customers what makes your store special:</Text>

            <View style={styles.descBox}>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder="e.g. Trusted local grocery store offering fresh farm-direct veggies, grains, and essentials."
                placeholderTextColor={colors.textMuted}
                scrollEnabled={false}
                onFocus={() => {
                  // Small delay to let keyboard appear, then scroll to bottom so description is visible
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title="Save & Proceed to Documents"
              onPress={handleSaveAndNext}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  storeTypeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  storeTypeText: {
    ...typography.bodyMediumBold,
    color: colors.primaryDark,
    flex: 1,
  },
  catGrid: {
    gap: spacing.xs + 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  catChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  catChipText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  catChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  slotRow: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  slotBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  toText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  packingTimesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  packPill: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  packPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  packPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  packPillTextSelected: {
    color: colors.primaryDark,
  },
  descBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 120,
  },
  descInput: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
