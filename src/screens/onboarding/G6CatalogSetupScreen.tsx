import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { BulkCsvModal } from '../../components/catalog/BulkCsvModal';

interface G6CatalogSetupScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G6CatalogSetup'>;
}

export const G6CatalogSetupScreen: React.FC<G6CatalogSetupScreenProps> = ({ navigation }) => {
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('csv');

  const catalogImportOptions = [
    {
      id: 'csv',
      title: 'Import CSV / Excel Spreadsheet',
      subtitle: 'Upload your store inventory export file. Automatically maps barcodes, MRPs & your custom selling prices.',
      icon: 'document-text' as const,
      badge: 'BULK IMPORT',
      badgeColor: colors.infoLight,
      badgeText: colors.info,
    },
    {
      id: 'pricelist',
      title: 'Upload Wholesaler Price List',
      subtitle: 'Upload a photo of your price board or wholesaler bill. OneBuddy AI transcribes it to digital catalog within 2 hours.',
      icon: 'camera' as const,
      badge: 'AI DIGITIZE',
      badgeColor: colors.secondaryLight,
      badgeText: colors.secondaryDark,
    },
  ];

  const handleSelectOption = (id: string) => {
    setSelectedMethod(id);
    if (id === 'csv') {
      setCsvModalVisible(true);
    } else if (id === 'pricelist') {
      Alert.alert(
        'Upload Price List Photo',
        'Select a photo of your price board or wholesaler invoice for automated transcription.',
        [
          { text: 'Upload Photo', onPress: () => Alert.alert('Processing', 'Document queued for catalog extraction.') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={4}
        title="Catalog Setup"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="basket" size={24} color={colors.primary} />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Populate Your Store Catalog</Text>
            <Text style={styles.bannerSubtitle}>
              Choose how you want to add items. You can customize selling prices and availability in the next step.
            </Text>
          </View>
        </View>

        {/* Options Cards */}
        <View style={styles.optionsList}>
          {catalogImportOptions.map((opt) => {
            const isSelected = selectedMethod === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelectOption(opt.id)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={isSelected ? colors.textInverse : colors.primary}
                    />
                  </View>
                  <View style={[styles.badge, { backgroundColor: opt.badgeColor }]}>
                    <Text style={[styles.badgeText, { color: opt.badgeText }]}>{opt.badge}</Text>
                  </View>
                </View>

                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {opt.title}
                </Text>
                <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>

                <View style={styles.cardBottom}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.selectPrompt, isSelected && styles.selectPromptSelected]}>
                    {isSelected ? 'Selected Import Method' : 'Tap to select'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <AppButton
            title="Proceed to Catalog Review"
            onPress={() => navigation.navigate('G7CatalogReview')}
            variant="primary"
            size="large"
            fullWidth
            rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>

      {/* Bulk CSV Modal */}
      <BulkCsvModal
        visible={csvModalVisible}
        onClose={() => setCsvModalVisible(false)}
        onApplyValidRows={(count) => Alert.alert('CSV Imported', `Successfully mapped ${count} items into catalog.`)}
      />
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
    paddingBottom: spacing.xxxl,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.bodyMediumBold,
    color: colors.primaryDark,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  optionsList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
  },
  optionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionTitleSelected: {
    color: colors.primaryDark,
  },
  optionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  selectPrompt: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selectPromptSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
