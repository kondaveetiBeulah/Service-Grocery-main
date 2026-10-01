import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ProductCategory, ProductItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { BarcodeScannerModal } from '../../components/catalog/BarcodeScannerModal';
import { catalogService } from '../../services/catalogService';

type AddEditRouteProp = RouteProp<RootStackParamList, 'AddEditProduct'>;
type AddEditNavProp = NativeStackNavigationProp<RootStackParamList, 'AddEditProduct'>;

interface G18AddEditProductScreenProps {
  route: AddEditRouteProp;
  navigation: AddEditNavProp;
}

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

const UNITS: ProductItem['unit'][] = ['g', 'kg', 'ml', 'L', 'pc', 'pack'];

export const G18AddEditProductScreen: React.FC<G18AddEditProductScreenProps> = ({ route, navigation }) => {
  const { productId, isMaster } = route.params || {};
  const existingProduct = productId ? catalogService.getProductById(productId) : undefined;

  // Form State
  const [barcode, setBarcode] = useState(existingProduct?.barcode || '');
  const [name, setName] = useState(existingProduct?.name || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [category, setCategory] = useState<ProductCategory>(existingProduct?.category || 'Dairy & Bread');
  const [packSize, setPackSize] = useState(existingProduct?.packSize || '500 g');
  const [unit, setUnit] = useState<ProductItem['unit']>(existingProduct?.unit || 'g');
  const [soldByWeight, setSoldByWeight] = useState(existingProduct?.soldByWeight || false);
  const [mrp, setMrp] = useState(existingProduct?.mrp?.toString() || '100');
  const [sellingPrice, setSellingPrice] = useState(existingProduct?.sellingPrice?.toString() || '95');
  const [isAvailable, setIsAvailable] = useState(existingProduct ? existingProduct.isAvailable : true);
  const [maxPerOrder, setMaxPerOrder] = useState(existingProduct?.maxPerOrder?.toString() || '6');
  const [isVeg, setIsVeg] = useState(existingProduct ? existingProduct.isVeg : true);
  const [aisleLocation, setAisleLocation] = useState(existingProduct?.aisleLocation || 'Aisle 1 - Main Shelf');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(
    existingProduct?.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'
  );

  // Modals
  const [scannerVisible, setScannerVisible] = useState(false);
  const [priceError, setPriceError] = useState('');

  const handlePriceChange = (newSellingPrice: string) => {
    setSellingPrice(newSellingPrice);
    const numSp = parseFloat(newSellingPrice);
    const numMrp = parseFloat(mrp);
    if (!isNaN(numSp) && !isNaN(numMrp) && numSp > numMrp) {
      setPriceError(`Selling Price (₹${numSp}) CANNOT exceed MRP (₹${numMrp})!`);
    } else {
      setPriceError('');
    }
  };

  const handleMrpChange = (newMrp: string) => {
    setMrp(newMrp);
    const numSp = parseFloat(sellingPrice);
    const numMrp = parseFloat(newMrp);
    if (!isNaN(numSp) && !isNaN(numMrp) && numSp > numMrp) {
      setPriceError(`Selling Price (₹${numSp}) CANNOT exceed MRP (₹${numMrp})!`);
    } else {
      setPriceError('');
    }
  };

  const handleSaveProduct = () => {
    const numMrp = parseFloat(mrp);
    const numSp = parseFloat(sellingPrice);

    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter a product title.');
      return;
    }

    if (isNaN(numMrp) || isNaN(numSp) || numMrp <= 0 || numSp <= 0) {
      Alert.alert('Invalid Price', 'Please enter valid numerical prices.');
      return;
    }

    // STRICT BUSINESS RULE: sellingPrice <= mrp
    if (numSp > numMrp) {
      setPriceError(`Selling Price (₹${numSp}) cannot exceed MRP (₹${numMrp})`);
      Alert.alert(
        'Pricing Rule Violation',
        `Selling Price (₹${numSp}) cannot be greater than Maximum Retail Price (MRP ₹${numMrp}). Please fix to proceed.`
      );
      return;
    }

    const result = catalogService.saveProduct({
      id: existingProduct?.id,
      sku: existingProduct?.sku || `SKU-LOCAL-${Date.now().toString().slice(-4)}`,
      name,
      brand,
      category,
      packSize,
      unit,
      mrp: numMrp,
      sellingPrice: numSp,
      isAvailable,
      soldByWeight,
      maxPerOrder: parseInt(maxPerOrder, 10) || 4,
      isVeg,
      isMasterCatalog: existingProduct ? existingProduct.isMasterCatalog : false,
      reviewStatus: existingProduct ? existingProduct.reviewStatus : 'Pending Review',
      imageUrl,
      barcode: barcode || undefined,
      aisleLocation,
      description,
    });

    if (result.success) {
      Alert.alert(
        'Product Saved',
        existingProduct
          ? `${name} updated successfully.`
          : `${name} submitted to catalog (Status: Pending Review).`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Save Failed', result.error || 'Failed to save product.');
    }
  };

  const isMasterItem = existingProduct?.isMasterCatalog ?? isMaster;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title={existingProduct ? `Edit ${isMasterItem ? 'Master SKU' : 'Product'}` : 'Add New Product'}
        subtitle={isMasterItem ? 'Store-specific pricing and stock fields' : 'Custom Store Catalog Item'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Master Item Notice */}
          {isMasterItem && (
            <View style={styles.masterNotice}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} />
              <View style={styles.masterNoticeTextWrap}>
                <Text style={styles.masterNoticeTitle}>OneBuddy Master SKU</Text>
                <Text style={styles.masterNoticeSub}>
                  Core title, brand, category, and HD images are managed by OneBuddy. You can customize your store selling price, stock availability, aisle shelf, and order limits.
                </Text>
              </View>
            </View>
          )}

          {/* SECTION 1: PRODUCT IDENTITY */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Product Identification</Text>

            <AppInput
              label="Barcode / EAN (13-Digit)"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="e.g. 8901262010014"
              keyboardType="number-pad"
              editable={!isMasterItem}
              rightAffix={
                !isMasterItem ? (
                  <TouchableOpacity onPress={() => setScannerVisible(true)} style={styles.scanBtn}>
                    <Ionicons name="barcode-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ) : undefined
              }
            />

            <AppInput
              label="Product Title / Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Fresh Farm Tomato (Hybrid)"
              editable={!isMasterItem}
              required
            />

            <AppInput
              label="Brand Name"
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. Farm Fresh Direct / Amul"
              editable={!isMasterItem}
              required
            />

            <Text style={styles.fieldLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catWrap}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPill, isSelected && styles.catPillActive]}
                    onPress={() => !isMasterItem && setCategory(cat)}
                    activeOpacity={isMasterItem ? 1 : 0.7}
                  >
                    <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.row}>
              <AppInput
                label="Pack Size"
                value={packSize}
                onChangeText={setPackSize}
                placeholder="e.g. 500 g"
                editable={!isMasterItem}
                containerStyle={styles.flex2}
                required
              />

              <View style={[styles.unitCol, styles.flex1]}>
                <Text style={styles.fieldLabel}>Unit:</Text>
                <View style={styles.unitPills}>
                  {UNITS.slice(0, 3).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitPill, unit === u && styles.unitPillActive]}
                      onPress={() => !isMasterItem && setUnit(u)}
                    >
                      <Text style={[styles.unitPillText, unit === u && styles.unitPillTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <ToggleSwitch
              label="Sold by Weight (Scales / Dynamic Weight)"
              description="E.g. Loose vegetables, fruits, dry fruits needing physical weighing."
              value={soldByWeight}
              onValueChange={setSoldByWeight}
              disabled={isMasterItem}
            />
          </View>

          {/* SECTION 2: PRICING & MRP VALIDATION (CRITICAL INVARIANT) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pricing & Order Limits</Text>

            <View style={styles.row}>
              <AppInput
                label="MRP (₹)"
                value={mrp}
                onChangeText={handleMrpChange}
                keyboardType="numeric"
                containerStyle={styles.flex1}
                editable={!isMasterItem}
                placeholder="e.g. 100"
                required
              />

              <AppInput
                label="Selling Price (₹)"
                value={sellingPrice}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                containerStyle={styles.flex1}
                error={priceError}
                helperText="Must be <= MRP"
                placeholder="e.g. 95"
                required
              />
            </View>

            {/* Invariant Alert Pill */}
            <View style={[styles.pricingRuleBox, priceError ? styles.ruleBoxError : styles.ruleBoxSuccess]}>
              <Ionicons
                name={priceError ? 'close-circle' : 'shield-checkmark'}
                size={18}
                color={priceError ? colors.error : colors.success}
              />
              <Text style={[styles.pricingRuleText, { color: priceError ? colors.error : colors.primaryDark }]}>
                {priceError || 'Rule Satisfied: Selling Price is within allowed MRP ceiling.'}
              </Text>
            </View>

            <View style={styles.row}>
              <AppInput
                label="Max Units Per Order"
                value={maxPerOrder}
                onChangeText={setMaxPerOrder}
                keyboardType="number-pad"
                placeholder="e.g. 6"
                containerStyle={styles.flex1}
              />

              <AppInput
                label="Aisle / Shelf Location"
                value={aisleLocation}
                onChangeText={setAisleLocation}
                placeholder="e.g. Aisle 2 - Rack B"
                containerStyle={styles.flex1}
                helperText="Helps staff locate item in 7s"
              />
            </View>

            {/* Binary Availability Switch */}
            <ToggleSwitch
              label="Stock Availability (In Stock)"
              description="Turn OFF when item is out of stock in your store."
              value={isAvailable}
              onValueChange={setIsAvailable}
            />
          </View>

          {/* SECTION 3: DIETARY & IMAGES */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dietary & Image</Text>

            <View style={styles.vegRadioRow}>
              <TouchableOpacity
                style={[styles.vegOption, isVeg && styles.vegOptionActive]}
                onPress={() => !isMasterItem && setIsVeg(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.vegSquare, styles.vegSquareGreen]}>
                  <View style={[styles.vegCircle, styles.vegCircleGreen]} />
                </View>
                <Text style={[styles.vegText, isVeg && styles.vegTextActive]}>100% Vegetarian</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.vegOption, !isVeg && styles.vegOptionActiveRed]}
                onPress={() => !isMasterItem && setIsVeg(false)}
                activeOpacity={0.7}
              >
                <View style={[styles.vegSquare, styles.vegSquareRed]}>
                  <View style={[styles.vegCircle, styles.vegCircleRed]} />
                </View>
                <Text style={[styles.vegText, !isVeg && styles.vegTextActive]}>Non-Vegetarian / Egg</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Product Image:</Text>
            <View style={styles.imagePickerRow}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              <View style={styles.imageActionWrap}>
                <Text style={styles.imageNotice}>
                  {isMasterItem ? 'Verified Master SKU HD Image' : 'Standard 1:1 Clean Product Photo'}
                </Text>
                {!isMasterItem && (
                  <TouchableOpacity
                    style={styles.changeImgBtn}
                    onPress={() => Alert.alert('Upload Photo', 'Simulated mock photo uploader.')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={16} color={colors.primary} />
                    <Text style={styles.changeImgText}>Change Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <AppInput
              label="Product Description / Details"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholder="e.g. Fresh farm sourced, rich in vitamins."
              editable={!isMasterItem}
            />
          </View>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <AppButton
              title={existingProduct ? 'Save Product Changes' : 'Submit Product to Catalog'}
              onPress={handleSaveProduct}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barcode Scanner */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanResult={(code) => setBarcode(code)}
      />
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
  masterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  masterNoticeTextWrap: {
    flex: 1,
  },
  masterNoticeTitle: {
    ...typography.bodySmallBold,
    color: colors.primaryDark,
  },
  masterNoticeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  scanBtn: {
    padding: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  catWrap: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  catPill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  catPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  catPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  unitCol: {
    marginBottom: spacing.lg,
  },
  unitPills: {
    flexDirection: 'row',
    gap: 4,
  },
  unitPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  unitPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unitPillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  unitPillTextActive: {
    color: colors.primaryDark,
  },
  pricingRuleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  ruleBoxSuccess: {
    backgroundColor: colors.primaryLight + '50',
  },
  ruleBoxError: {
    backgroundColor: colors.errorLight,
  },
  pricingRuleText: {
    ...typography.caption,
    fontWeight: '700',
    flex: 1,
  },
  vegRadioRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  vegOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  vegOptionActive: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  vegOptionActiveRed: {
    borderColor: '#B91C1C',
    backgroundColor: '#FEF2F2',
  },
  vegSquare: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  vegSquareGreen: {
    borderColor: '#15803D',
  },
  vegSquareRed: {
    borderColor: '#B91C1C',
  },
  vegCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vegCircleGreen: {
    backgroundColor: '#15803D',
  },
  vegCircleRed: {
    backgroundColor: '#B91C1C',
  },
  vegText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  vegTextActive: {
    color: colors.textPrimary,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  imageActionWrap: {
    flex: 1,
  },
  imageNotice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  changeImgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  changeImgText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
