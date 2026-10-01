import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { storeService } from '../../services/storeService';

interface G5LocationDeliveryScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G5LocationDelivery'>;
}

export const G5LocationDeliveryScreen: React.FC<G5LocationDeliveryScreenProps> = ({ navigation }) => {
  const store = storeService.getStoreDetails();

  const [addressMode, setAddressMode] = useState<'live' | 'manual'>('live');
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9352,
    longitude: 77.6245,
  });

  const [address1, setAddress1] = useState(store.address.addressLine1);
  const [address2, setAddress2] = useState(store.address.addressLine2 || '');
  const [landmark, setLandmark] = useState(store.address.landmark || '');
  const [city, setCity] = useState(store.address.city);
  const [pincode, setPincode] = useState(store.address.pincode);
  const [pickupNotes, setPickupNotes] = useState(store.pickupInstructions || '');

  // Delivery settings
  const [radiusKm, setRadiusKm] = useState<number>(store.deliveryRadiusKm);
  const [minOrder, setMinOrder] = useState<string>(store.minOrderValue.toString());
  const [expressEnabled, setExpressEnabled] = useState(store.expressDeliveryEnabled);
  const [scheduledEnabled, setScheduledEnabled] = useState(store.scheduledDeliveryEnabled);
  const [slotDuration, setSlotDuration] = useState('60');
  const [maxOrdersSlot, setMaxOrdersSlot] = useState(store.maxOrdersPerSlot.toString());

  const radiusOptions = [1, 2, 3, 4.5, 6, 7];

  const handleFetchLiveLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location permission in settings to auto-fill your store address.'
        );
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo) {
        if (geo.street || geo.name) {
          setAddress1(`${geo.name || ''} ${geo.street || ''}`.trim() || 'Store Location');
        }
        if (geo.district || geo.subregion) {
          setAddress2(geo.district || geo.subregion || '');
        }
        if (geo.city) {
          setCity(geo.city);
        }
        if (geo.postalCode) {
          setPincode(geo.postalCode);
        }
        if (geo.name || geo.street) {
          setLandmark(`Near ${geo.name || geo.street || ''}`);
        }
      }

      Alert.alert(
        'Location Auto-filled',
        `Store address successfully populated using GPS coordinates (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}).`
      );
    } catch (err) {
      Alert.alert('Location Error', 'Unable to fetch GPS location. You can enter the address manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveAndProceed = () => {
    if (!address1.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required address fields to proceed.');
      return;
    }
    if (scheduledEnabled && (!slotDuration.trim() || !maxOrdersSlot.trim())) {
      Alert.alert('Missing Fields', 'Please fill in all scheduled delivery fields to proceed.');
      return;
    }

    storeService.updateStoreDetails({
      address: {
        addressLine1: address1,
        addressLine2: address2,
        landmark,
        city,
        pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      pickupInstructions: pickupNotes,
      deliveryRadiusKm: radiusKm,
      minOrderValue: parseInt(minOrder, 10) || 99,
      expressDeliveryEnabled: expressEnabled,
      scheduledDeliveryEnabled: scheduledEnabled,
      slotDurationMinutes: parseInt(slotDuration, 10) || 60,
      maxOrdersPerSlot: parseInt(maxOrdersSlot, 10) || 25,
    });
    navigation.navigate('G6CatalogSetup');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={3}
        title="Location & Delivery"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* LOCATION INPUT MODE SELECTOR */}
          <View style={styles.modeSelectorCard}>
            <Text style={styles.modeSelectorTitle}>Select Address Method:</Text>
            <View style={styles.modeTabsRow}>
              <TouchableOpacity
                style={[styles.modeTab, addressMode === 'live' && styles.modeTabActive]}
                onPress={() => {
                  setAddressMode('live');
                  handleFetchLiveLocation();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="navigate"
                  size={16}
                  color={addressMode === 'live' ? colors.textInverse : colors.primary}
                />
                <Text style={[styles.modeTabText, addressMode === 'live' && styles.modeTabTextActive]}>
                  Use Live Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, addressMode === 'manual' && styles.modeTabActive]}
                onPress={() => setAddressMode('manual')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={addressMode === 'manual' ? colors.textInverse : colors.textSecondary}
                />
                <Text style={[styles.modeTabText, addressMode === 'manual' && styles.modeTabTextActive]}>
                  Enter Address Manually
                </Text>
              </TouchableOpacity>
            </View>

            {addressMode === 'live' && (
              <TouchableOpacity
                style={styles.autoFetchBanner}
                onPress={handleFetchLiveLocation}
                disabled={isLocating}
                activeOpacity={0.7}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                ) : (
                  <Ionicons name="locate" size={18} color={colors.primaryDark} />
                )}
                <Text style={styles.autoFetchBannerText}>
                  {isLocating ? 'Detecting GPS coordinates...' : 'Auto-fill with Current GPS Location'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* MOCK MAP PREVIEW CONTAINER */}
          <View style={styles.mapContainer}>
            <View style={styles.mapCanvas}>
              {/* Map grid aesthetic */}
              <View style={styles.mapGridPattern} />
              
              {/* Center Pin Indicator */}
              <View style={styles.pinWrapper}>
                <View style={styles.pinCallout}>
                  <Text style={styles.pinCalloutText}>{store.storeName}</Text>
                  <Text style={styles.pinCoords}>{coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E</Text>
                </View>
                <Ionicons name="location" size={40} color={colors.primary} />
                <View style={styles.pinShadow} />
              </View>

              {/* Delivery Radius Circle overlay representation */}
              <View style={[styles.radiusOverlay, { width: radiusKm * 40 + 80, height: radiusKm * 40 + 80 }]} />

              <TouchableOpacity
                style={styles.recenterBtn}
                onPress={handleFetchLiveLocation}
                activeOpacity={0.7}
              >
                <Ionicons name="locate" size={20} color={colors.primaryDark} />
                <Text style={styles.recenterText}>Current Pin Location</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* STORE PHYSICAL ADDRESS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Physical Store Address</Text>

            <AppInput
              label="Shop / Building / Street (Line 1)"
              value={address1}
              onChangeText={setAddress1}
              placeholder="e.g. Shop #14 & 15, Ground Floor"
              required
            />

            <AppInput
              label="Area / Layout (Line 2)"
              value={address2}
              onChangeText={setAddress2}
              placeholder="e.g. 80 Feet Road, 4th Block"
            />

            <AppInput
              label="Nearby Landmark"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Maharaja Signal"
            />

            <View style={styles.cityPinRow}>
              <AppInput
                label="City"
                value={city}
                onChangeText={setCity}
                containerStyle={styles.halfInput}
                placeholder="e.g. Bengaluru"
                required
              />
              <AppInput
                label="Pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                containerStyle={styles.halfInput}
                placeholder="e.g. 560034"
                required
              />
            </View>

            <AppInput
              label="Pickup Instructions for Delivery Riders"
              value={pickupNotes}
              onChangeText={setPickupNotes}
              multiline
              numberOfLines={2}
              placeholder="e.g. Enter Gate B. Packing & Handover counter is next to Billing Counter 2."
              helperText="Riders will see this guide when arriving at your store."
            />
          </View>

          {/* DELIVERY CONFIGURATION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Delivery Radius & Capacity</Text>

            <Text style={styles.fieldLabel}>
              Delivery Service Radius: <Text style={styles.bold}>{radiusKm} km</Text>
            </Text>
            <View style={styles.radiusPillsRow}>
              {radiusOptions.map((km) => {
                const isSelected = radiusKm === km;
                return (
                  <TouchableOpacity
                    key={km}
                    style={[styles.radiusPill, isSelected && styles.radiusPillSelected]}
                    onPress={() => setRadiusKm(km)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.radiusText, isSelected && styles.radiusTextSelected]}>
                      {km} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppInput
              label="Minimum Order Value for Delivery (₹)"
              value={minOrder}
              onChangeText={setMinOrder}
              keyboardType="number-pad"
              placeholder="99"
              helperText="Orders below this amount will not be routed to your store."
            />

            {/* Delivery Modes */}
            <View style={styles.modesWrap}>
              <ToggleSwitch
                label="Express Instant Delivery (10–20 mins)"
                description="Instant packing orders routed right away when store is open."
                value={expressEnabled}
                onValueChange={setExpressEnabled}
              />

              <View style={styles.modeDivider} />

              <ToggleSwitch
                label="Scheduled Delivery Slots"
                description="Allows customers to book future grocery delivery slots."
                value={scheduledEnabled}
                onValueChange={setScheduledEnabled}
              />
            </View>

            {scheduledEnabled && (
              <View style={styles.scheduledSettings}>
                <AppInput
                  label="Slot Duration (Minutes)"
                  value={slotDuration}
                  onChangeText={setSlotDuration}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                  placeholder="e.g. 60"
                />
                <AppInput
                  label="Max Orders Per Slot"
                  value={maxOrdersSlot}
                  onChangeText={setMaxOrdersSlot}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                  placeholder="e.g. 25"
                />
              </View>
            )}
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title="Save & Proceed to Catalog"
              onPress={handleSaveAndProceed}
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
  },
  modeSelectorCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modeSelectorTitle: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.full,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    fontSize: 11,
  },
  modeTabTextActive: {
    color: colors.textInverse,
  },
  autoFetchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  autoFetchBannerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  mapContainer: {
    height: 180,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: '#94A3B8',
  },
  radiusOverlay: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '30',
  },
  pinWrapper: {
    alignItems: 'center',
    zIndex: 10,
  },
  pinCallout: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 2,
    elevation: 3,
  },
  pinCalloutText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  pinCoords: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: -4,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    elevation: 2,
  },
  recenterText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
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
    marginBottom: spacing.md,
  },
  cityPinRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  bold: {
    color: colors.primaryDark,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  radiusPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  radiusPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radiusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  radiusTextSelected: {
    color: colors.primaryDark,
  },
  modesWrap: {
    marginTop: spacing.xs,
  },
  modeDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  scheduledSettings: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
