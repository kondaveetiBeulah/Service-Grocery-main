import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { ProgressBar } from '../../components/common/ProgressBar';
import { storeService } from '../../services/storeService';

interface G3DocumentsUploadScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G3DocumentsUpload'>;
}

export const G3DocumentsUploadScreen: React.FC<G3DocumentsUploadScreenProps> = ({ navigation }) => {
  const documents = storeService.getDocuments();

  // Document numbers
  const [fssaiNum, setFssaiNum] = useState('11223344556677');
  const [fssaiExpiry, setFssaiExpiry] = useState('2028-12-31');
  const [gstNum, setGstNum] = useState('29ABCDE1234F1Z5');
  const [shopLicNum, setShopLicNum] = useState('BBMP/TR/2025/9981');
  const [shopLicExpiry, setShopLicExpiry] = useState('2027-03-31');
  const [panNum, setPanNum] = useState('ABCDE1234F');

  // Store photos list (empty initially, user picks from gallery)
  const [storePhotos, setStorePhotos] = useState<string[]>([]);

  // Upload Progress Simulator
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const simulateUpload = (docType: string) => {
    setUploadingDocId(docType);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingDocId(null);
          Alert.alert('Upload Successful', `${docType} document successfully attached and encrypted.`);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  const handleAddPhoto = async () => {
    if (storePhotos.length >= 10) {
      Alert.alert('Limit Reached', 'Maximum 10 store photos allowed.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo gallery to upload store photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setStorePhotos(prev => [...prev, selectedUri]);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick photo from gallery. Please try again.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setStorePhotos(storePhotos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!fssaiNum.trim() || !fssaiExpiry.trim() || !gstNum.trim() || !shopLicNum.trim() || !panNum.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required document fields to proceed.');
      return;
    }
    if (storePhotos.length === 0) {
      Alert.alert('Missing Photos', 'Please upload at least one store photo.');
      return;
    }
    navigation.navigate('G4DocumentReview');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={2}
        title="Business Licenses & Upload"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.bannerText}>
            All licenses are 256-bit encrypted and strictly used for compliance verification.
          </Text>
        </View>

        {/* 1. FSSAI LICENSE */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIcon}>
              <Ionicons name="nutrition-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.docTitleWrap}>
              <Text style={styles.docTitle}>1. FSSAI Food License</Text>
              <Text style={styles.docSubtitle}>14-digit registration or state license</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Attached</Text>
            </View>
          </View>

          <AppInput
            label="14-Digit FSSAI License Number"
            value={fssaiNum}
            onChangeText={setFssaiNum}
            keyboardType="number-pad"
            maxLength={14}
            placeholder="e.g. 11223344556677"
            required
          />

          <AppInput
            label="License Expiry Date (YYYY-MM-DD)"
            value={fssaiExpiry}
            onChangeText={setFssaiExpiry}
            placeholder="2028-12-31"
            required
          />

          <View style={styles.fileRow}>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => setPreviewImageUri('https://images.unsplash.com/photo-1554415707-9e49016a3036?w=600')}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.previewBtnText}>Preview Certificate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replaceBtn}
              onPress={() => simulateUpload('FSSAI')}
              activeOpacity={0.7}
            >
              <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.replaceBtnText}>Replace / Re-upload</Text>
            </TouchableOpacity>
          </View>

          {uploadingDocId === 'FSSAI' && (
            <ProgressBar current={uploadProgress} total={100} label="Uploading..." showPercent />
          )}
        </View>

        {/* 2. GST CERTIFICATE */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIcon}>
              <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.docTitleWrap}>
              <Text style={styles.docTitle}>2. GST Registration (GSTIN)</Text>
              <Text style={styles.docSubtitle}>15-digit alphanumeric GSTIN</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Attached</Text>
            </View>
          </View>

          <AppInput
            label="15-Digit GSTIN Number"
            value={gstNum}
            onChangeText={setGstNum}
            autoCapitalize="characters"
            maxLength={15}
            placeholder="e.g. 29ABCDE1234F1Z5"
            required
          />

          <View style={styles.fileRow}>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => setPreviewImageUri('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600')}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.previewBtnText}>Preview GST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replaceBtn}
              onPress={() => simulateUpload('GST')}
              activeOpacity={0.7}
            >
              <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. TRADE / SHOP LICENSE */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIcon}>
              <Ionicons name="business-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.docTitleWrap}>
              <Text style={styles.docTitle}>3. Shop & Establishment License</Text>
              <Text style={styles.docSubtitle}>Municipal trade / Gumasta license</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Attached</Text>
            </View>
          </View>

          <AppInput
            label="License Reference Number"
            value={shopLicNum}
            onChangeText={setShopLicNum}
            placeholder="e.g. BBMP/TR/2025/9981"
            required
          />

          <AppInput
            label="License Expiry Date (YYYY-MM-DD)"
            value={shopLicExpiry}
            onChangeText={setShopLicExpiry}
            placeholder="2027-03-31"
          />
        </View>

        {/* 4. BUSINESS / PROPRIETOR PAN */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIcon}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.docTitleWrap}>
              <Text style={styles.docTitle}>4. Proprietor PAN Card</Text>
              <Text style={styles.docSubtitle}>10-character PAN of the business owner</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Attached</Text>
            </View>
          </View>

          <AppInput
            label="PAN Number"
            value={panNum}
            onChangeText={setPanNum}
            autoCapitalize="characters"
            maxLength={10}
            placeholder="e.g. ABCDE1234F"
            required
          />
        </View>

        {/* 5. STORE PHOTOS GALLERY (3 to 10 photos) */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIcon}>
              <Ionicons name="images-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.docTitleWrap}>
              <Text style={styles.docTitle}>5. Store Photos ({storePhotos.length}/10)</Text>
              <Text style={styles.docSubtitle}>Storefront board, billing counter & grocery aisles</Text>
            </View>
          </View>

          <View style={styles.photosGrid}>
            {storePhotos.map((uri, idx) => (
              <View key={idx} style={styles.photoThumbWrap}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => handleRemovePhoto(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
                <View style={styles.photoIndexBadge}>
                  <Text style={styles.photoIndexText}>#{idx + 1}</Text>
                </View>
              </View>
            ))}

            {storePhotos.length < 10 && (
              <TouchableOpacity
                style={styles.addPhotoBtn}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <AppButton
            title="Review & Confirm Documents"
            onPress={handleNext}
            variant="primary"
            size="large"
            fullWidth
            rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>

      {/* Document Image Preview Modal */}
      <Modal visible={!!previewImageUri} transparent animationType="fade">
        <View style={styles.previewBackdrop}>
          <View style={styles.previewBox}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Document Preview</Text>
              <TouchableOpacity onPress={() => setPreviewImageUri(null)} style={styles.closePreviewBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {previewImageUri && (
              <Image source={{ uri: previewImageUri }} style={styles.fullPreviewImg} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  docTitleWrap: {
    flex: 1,
  },
  docTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  docSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  verifiedText: {
    ...typography.caption,
    color: '#065F46',
    fontWeight: '700',
    fontSize: 10,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  previewBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  replaceBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  photoIndexText: {
    ...typography.caption,
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 10,
  },
  footer: {
    marginBottom: spacing.xxl,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  previewBox: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closePreviewBtn: {
    padding: spacing.xs,
  },
  fullPreviewImg: {
    width: '100%',
    height: 320,
    borderRadius: borderRadius.md,
  },
});
