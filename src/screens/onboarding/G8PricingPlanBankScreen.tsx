import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Card } from '../../components/common/Card';
import { storeService } from '../../services/storeService';

interface G8PricingPlanBankScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G8PricingPlanBank'>;
}

export const G8PricingPlanBankScreen: React.FC<G8PricingPlanBankScreenProps> = ({ navigation }) => {
  const store = storeService.getStoreDetails();

  const [selectedTier, setSelectedTier] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [accountNumber, setAccountNumber] = useState(store.bankDetails.accountNumber);
  const [confirmAccNumber, setConfirmAccNumber] = useState(store.bankDetails.accountNumber);
  const [ifscCode, setIfscCode] = useState(store.bankDetails.ifscCode);
  const [holderName, setHolderName] = useState(store.bankDetails.accountHolderName);
  const [upiId, setUpiId] = useState(store.bankDetails.upiId || '');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const tiers = [
    {
      id: 'Starter' as const,
      name: 'Starter Tier',
      commission: '12.5%',
      payoutFrequency: 'Weekly Settlements (Every Monday)',
      benefits: [
        'Standard Store Listing on OneBuddy',
        'Customer Support via Email & Chat',
        'Standard 10-20 min Express Routing',
      ],
      badge: 'LOW MINIMUM',
    },
    {
      id: 'Growth' as const,
      name: 'Growth Partner Tier',
      commission: '9.0%',
      payoutFrequency: 'T+1 Daily Direct Bank Settlement (08:00 AM)',
      benefits: [
        'Priority Search & Home Carousel Placement',
        'Daily Direct Payouts to Bank/UPI',
        'Dedicated Store Account Manager',
        'Automated Invoice & GST Reports',
      ],
      badge: 'MOST POPULAR',
      recommended: true,
    },
    {
      id: 'Enterprise' as const,
      name: 'ENTERPRISE SUPERMARKET — 500+ ORDERS/MONTH',
      commission: '6.5%',
      payoutFrequency: 'Same-Day Settlement',
      benefits: [
        'POS / ERP Direct API Synchronization',
        'Custom Delivery Radius — Up to 10 km',
        'No Packaging Surcharge Deduction',
        'Volume-Based Incentives',
      ],
      badge: 'HIGH VOLUME',
    },
  ];

  const handleSaveAndSubmit = () => {
    if (!holderName.trim() || !accountNumber.trim() || !confirmAccNumber.trim() || !ifscCode.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required bank details to proceed.');
      return;
    }
    if (accountNumber !== confirmAccNumber) {
      Alert.alert('Mismatch', 'Bank Account Numbers do not match.');
      return;
    }

    storeService.updateStoreDetails({
      commissionTier: selectedTier,
      bankDetails: {
        accountNumber,
        ifscCode,
        accountHolderName: holderName,
        upiId,
        bankName: 'HDFC Bank, Koramangala Branch',
      },
    });
    navigation.navigate('G8Payment');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={6}
        title="Commission & Bank Details"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* SECTION 1: COMMISSION TIERS */}
          <Text style={styles.sectionHeading}>1. Select Partner Commission Tier</Text>
          <Text style={styles.sectionSub}>Choose your commercial agreement and payout frequency:</Text>

          <View style={styles.tiersList}>
            {tiers.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <Card
                  key={tier.id}
                  style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                  onPress={() => setSelectedTier(tier.id)}
                >
                  <View style={styles.tierTop}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={[styles.tierName, isSelected && styles.tierNameSelected]}>
                        {tier.name}
                      </Text>
                      <Text style={styles.tierRate}>{tier.commission} <Text style={styles.rateSub}>Commission / Order</Text></Text>
                    </View>
                    <View style={[styles.badgePill, isSelected ? styles.badgePillActive : styles.badgePillDefault]}>
                      <Text style={[styles.badgePillText, isSelected && styles.badgePillTextActive]}>
                        {tier.badge}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.payoutRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.primaryDark} />
                    <Text style={styles.payoutText}>{tier.payoutFrequency}</Text>
                  </View>

                  <View style={styles.benefitsList}>
                    {tier.benefits.map((b, i) => (
                      <View key={i} style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={styles.benefitText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              );
            })}
          </View>

          {/* SECTION 2: BANK DETAILS FORM */}
          <View style={styles.bankFormCard}>
            <View style={styles.formHeader}>
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              <View style={styles.formHeaderText}>
                <Text style={styles.formTitle}>Bank Account for Daily Settlements</Text>
                <Text style={styles.formSubtitle}>Earnings will be credited to this verified account</Text>
              </View>
            </View>

            <AppInput
              label="Account Holder Name (as per Bank Passbook)"
              value={holderName}
              onChangeText={setHolderName}
              placeholder="e.g. SRI LAKSHMI SUPERMART ENTERPRISES"
              required
            />

            <AppInput
              label="Bank Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              placeholder="e.g. 50100123456789"
              required
            />

            <AppInput
              label="Re-enter Bank Account Number"
              value={confirmAccNumber}
              onChangeText={setConfirmAccNumber}
              keyboardType="number-pad"
              placeholder="e.g. 50100123456789"
              required
            />

            <AppInput
              label="Bank IFSC Code"
              value={ifscCode}
              onChangeText={setIfscCode}
              autoCapitalize="characters"
              placeholder="e.g. HDFC0001234"
              helperText="Verified: HDFC Bank, Koramangala Branch"
              required
            />

            <AppInput
              label="UPI ID / VPA for Instant Payouts (Optional)"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="srilakshmi.store@okhdfcbank"
            />
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
            </View>
            <Text style={styles.termsText}>
              I accept the <Text style={styles.termsLink}>OneBuddy Grocery Partner Terms of Service</Text>, Commission Structure, and Daily Direct Bank Settlement Policy.
            </Text>
          </TouchableOpacity>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title="Proceed to Onboarding Deposit (₹3,000)"
              onPress={handleSaveAndSubmit}
              disabled={!acceptedTerms}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
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
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tiersList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tierCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  tierCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15',
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  tierName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  tierNameSelected: {
    color: colors.primaryDark,
  },
  tierRate: {
    ...typography.h2,
    color: colors.primaryDark,
    marginTop: 2,
  },
  rateSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badgePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgePillDefault: {
    backgroundColor: colors.surfaceSecondary,
  },
  badgePillActive: {
    backgroundColor: colors.primary,
  },
  badgePillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  badgePillTextActive: {
    color: colors.textInverse,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  payoutText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
  },
  benefitsList: {
    gap: 6,
    marginTop: spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  bankFormCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formHeaderText: {
    flex: 1,
  },
  formTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
