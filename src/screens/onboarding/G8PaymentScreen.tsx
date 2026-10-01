import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { storeService } from '../../services/storeService';

interface G8PaymentScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G8Payment'>;
}

type PaymentMethodType = 'upi' | 'wallet' | 'card' | 'netbanking' | null;

const POPULAR_UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', logoSource: require('../../assets/upi/gpay.png') },
  { id: 'phonepe', name: 'PhonePe', logoSource: require('../../assets/upi/phonepe.png') },
  { id: 'paytm', name: 'Paytm', logoSource: require('../../assets/upi/paytm.png') },
  { id: 'cred', name: 'CRED', logoSource: require('../../assets/upi/cred.png') },
];

const UPI_HANDLES = ['@okhdfcbank', '@okicici', '@okaxis', '@ybl', '@paytm'];

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' },
];

export const G8PaymentScreen: React.FC<G8PaymentScreenProps> = ({ navigation }) => {
  // No default selection initially
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(null);

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiUsername, setUpiUsername] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('@okhdfcbank');

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [customBankName, setCustomBankName] = useState('');

  // Payment Processing & Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Determine whether the pay button should be enabled
  const isPayEnabled = (): boolean => {
    if (!selectedMethod) return false;
    if (selectedMethod === 'upi') {
      return selectedUpiApp !== null || upiUsername.trim().length >= 3;
    }
    if (selectedMethod === 'wallet') {
      return true;
    }
    if (selectedMethod === 'card') {
      return cardNumber.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCvv.length >= 3;
    }
    if (selectedMethod === 'netbanking') {
      return selectedBank !== null || customBankName.trim().length >= 3;
    }
    return false;
  };

  // Get dynamic pay button label
  const getPayButtonLabel = (): string => {
    if (!selectedMethod) return 'Select a Payment Method to Proceed';
    if (selectedMethod === 'upi') {
      if (selectedUpiApp) {
        const app = POPULAR_UPI_APPS.find(a => a.id === selectedUpiApp);
        return `Pay ₹3,000.00 with ${app?.name || 'UPI'}`;
      }
      if (upiUsername.trim()) {
        return `Pay ₹3,000.00 with ${upiUsername}${selectedHandle}`;
      }
      return 'Pay ₹3,000.00 with UPI';
    }
    if (selectedMethod === 'wallet') {
      return 'Pay ₹3,000.00 with One Buddy Wallet';
    }
    if (selectedMethod === 'card') {
      return 'Pay ₹3,000.00 with Card';
    }
    if (selectedMethod === 'netbanking') {
      const bank = POPULAR_BANKS.find(b => b.id === selectedBank);
      return `Pay ₹3,000.00 with ${bank?.name || customBankName || 'Net Banking'}`;
    }
    return 'Pay ₹3,000.00';
  };

  // Handle Pay Action
  const handlePayNow = () => {
    if (!isPayEnabled()) return;

    setIsProcessing(true);

    // Simulate 1.2s gateway processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      storeService.setVerificationState('Approved');

      // Show success modal for 1.8 seconds then navigate to Congratulations approved page
      setTimeout(() => {
        setIsSuccess(false);
        navigation.navigate('G9VerificationStatus');
      }, 1800);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Partner Onboarding Payment"
        subtitle="256-bit Encrypted • 100% Refundable Deposit"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Overview Card */}
          <View style={styles.depositCard}>
            <View style={styles.depositTopRow}>
              <View>
                <Text style={styles.depositLabel}>One-Time Security Deposit</Text>
                <Text style={styles.depositSub}>Full Refund on Store Closure</Text>
              </View>
              <Text style={styles.depositAmount}>₹3,000<Text style={styles.depositDecimals}>.00</Text></Text>
            </View>

            <View style={styles.depositBadgesRow}>
              <View style={styles.secureBadge}>
                <Ionicons name="shield-checkmark" size={13} color={colors.primaryDark} />
                <Text style={styles.secureBadgeText}>RBI Compliant Gateway</Text>
              </View>
              <View style={styles.secureBadge}>
                <Ionicons name="refresh" size={13} color={colors.primaryDark} />
                <Text style={styles.secureBadgeText}>Instant Invoice Generated</Text>
              </View>
            </View>
          </View>

          {/* Section Heading */}
          <View style={styles.sectionHeadingWrap}>
            <Text style={styles.sectionHeading}>Select Payment Method</Text>
            <Text style={styles.sectionSub}>Choose your preferred mode to complete payment</Text>
          </View>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* METHOD 1: UPI */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.85}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>UPI</Text>
                  <View style={styles.fastestBadge}>
                    <Ionicons name="flash" size={10} color="#047857" />
                    <Text style={styles.fastestText}>FASTEST</Text>
                  </View>
                </View>
                <Text style={styles.methodSubtitle}>Google Pay, PhonePe, Paytm, CRED & UPI ID</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'upi' && styles.radioCircleActive]}>
                {selectedMethod === 'upi' && <View style={styles.radioDot} />}
              </View>
            </View>

            {/* UPI Expanded Section */}
            {selectedMethod === 'upi' && (
              <View style={styles.expandedSection}>
                <Text style={styles.subHeading}>Popular UPI Apps:</Text>
                <View style={styles.upiAppsGrid}>
                  {POPULAR_UPI_APPS.map((app) => {
                    const isAppSelected = selectedUpiApp === app.id;
                    return (
                      <TouchableOpacity
                        key={app.id}
                        style={[styles.upiAppBtn, isAppSelected && styles.upiAppBtnActive]}
                        onPress={() => {
                          setSelectedUpiApp(app.id);
                          setUpiUsername('');
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.upiAppIconWrap}>
                          <Image source={app.logoSource} style={styles.upiAppImage} resizeMode="contain" />
                        </View>
                        <Text style={[styles.upiAppName, isAppSelected && styles.upiAppNameActive]} numberOfLines={1}>
                          {app.name}
                        </Text>
                        {isAppSelected && (
                          <View style={styles.appCheckmark}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Enter UPI ID / VPA */}
                <Text style={[styles.subHeading, { marginTop: spacing.md }]}>Or Enter UPI ID / VPA:</Text>
                <View style={styles.vpaInputRow}>
                  <TextInput
                    style={styles.vpaInput}
                    placeholder="username / mobile"
                    placeholderTextColor={colors.textMuted}
                    value={upiUsername}
                    onChangeText={(t) => {
                      setUpiUsername(t);
                      if (t.trim()) setSelectedUpiApp(null);
                    }}
                    autoCapitalize="none"
                  />
                  <View style={styles.handleBadge}>
                    <Text style={styles.handleText}>{selectedHandle}</Text>
                  </View>
                </View>

                {/* Handle quick-selector pills */}
                <View style={styles.handlePillsRow}>
                  {UPI_HANDLES.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.handlePill, selectedHandle === h && styles.handlePillActive]}
                      onPress={() => setSelectedHandle(h)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.handlePillText, selectedHandle === h && styles.handlePillTextActive]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* METHOD 2: ONE BUDDY WALLET */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'wallet' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('wallet')}
            activeOpacity={0.85}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="wallet-outline" size={20} color="#0284C7" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>One Buddy Wallet</Text>
                <Text style={styles.methodSubtitle}>Available Balance: ₹500.00</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'wallet' && styles.radioCircleActive]}>
                {selectedMethod === 'wallet' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedMethod === 'wallet' && (
              <View style={styles.expandedSection}>
                <View style={styles.walletNotice}>
                  <Ionicons name="information-circle-outline" size={18} color="#0369A1" />
                  <Text style={styles.walletNoticeText}>
                    ₹500 will be used from your wallet balance and remaining ₹2,500 will be settled via linked bank account.
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* METHOD 3: CREDIT / DEBIT CARDS */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.85}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="card-outline" size={20} color="#DC2626" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Credit / Debit Cards</Text>
                <Text style={styles.methodSubtitle}>Visa, MasterCard, RuPay, Maestro & Amex</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'card' && styles.radioCircleActive]}>
                {selectedMethod === 'card' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedMethod === 'card' && (
              <View style={styles.expandedSection}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.cardInputWrap}>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    maxLength={19}
                  />
                  <Ionicons name="card" size={20} color={colors.textMuted} />
                </View>

                <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>Name on Card</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Venkatesh Rao"
                  placeholderTextColor={colors.textMuted}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="words"
                />

                <View style={styles.cardDualRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>Valid Thru</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      value={cardExpiry}
                      onChangeText={handleExpiryChange}
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="123"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').substring(0, 4))}
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* METHOD 4: NET BANKING */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'netbanking' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('netbanking')}
            activeOpacity={0.85}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="business-outline" size={20} color="#7C3AED" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Net Banking</Text>
                <Text style={styles.methodSubtitle}>HDFC, ICICI, SBI, Axis & 50+ Indian banks</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'netbanking' && styles.radioCircleActive]}>
                {selectedMethod === 'netbanking' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedMethod === 'netbanking' && (
              <View style={styles.expandedSection}>
                <Text style={styles.subHeading}>Popular Banks:</Text>
                <View style={styles.banksGrid}>
                  {POPULAR_BANKS.map((b) => {
                    const isBankSelected = selectedBank === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[styles.bankTile, isBankSelected && styles.bankTileActive]}
                        onPress={() => {
                          setSelectedBank(b.id);
                          setCustomBankName('');
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="business" 
                          size={18} 
                          color={isBankSelected ? colors.primaryDark : colors.textSecondary} 
                        />
                        <Text style={[styles.bankTileName, isBankSelected && styles.bankTileNameActive]} numberOfLines={1}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Enter official bank account names */}
                <Text style={[styles.subHeading, { marginTop: spacing.md }]}>Or Enter Official Bank Name:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Bank of Baroda, Canara Bank, Union Bank..."
                  placeholderTextColor={colors.textMuted}
                  value={customBankName}
                  onChangeText={(t) => {
                    setCustomBankName(t);
                    if (t.trim()) setSelectedBank(null);
                  }}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Guarantee Security Strip */}
          <View style={styles.securityStrip}>
            <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            <Text style={styles.securityStripText}>
              Secured by Razorpay • 256-bit SSL Encryption • PCI-DSS Certified
            </Text>
          </View>
        </ScrollView>

        {/* Floating Bottom Pay Bar with proper clearance above bottom navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.payButton,
              isPayEnabled() ? styles.payButtonEnabled : styles.payButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={!isPayEnabled() || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <>
                <Ionicons 
                  name={isPayEnabled() ? "lock-closed" : "alert-circle-outline"} 
                  size={18} 
                  color={isPayEnabled() ? colors.textInverse : colors.textMuted} 
                />
                <Text style={[styles.payButtonText, !isPayEnabled() && styles.payButtonTextDisabled]}>
                  {getPayButtonLabel()}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* POPUP MODAL: PAYMENT SUCCESSFUL (Auto disappears after 1.8s) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={44} color={colors.success} />
            </View>
            <Text style={styles.modalSuccessTitle}>Payment Successful!</Text>
            <Text style={styles.modalSuccessAmount}>₹3,000.00</Text>
            <Text style={styles.modalSuccessDesc}>
              Your partner security deposit has been verified and credited.
            </Text>
            <View style={styles.modalTxnRow}>
              <Text style={styles.modalTxnLabel}>Transaction ID:</Text>
              <Text style={styles.modalTxnValue}>TXN_OB_{Date.now().toString().slice(-8)}</Text>
            </View>
            <View style={styles.modalLoadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.modalRedirectText}>Approving store profile...</Text>
            </View>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 250,
  },
  depositCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  depositTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  depositLabel: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  depositSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  depositAmount: {
    ...typography.h2,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  depositDecimals: {
    fontSize: 16,
    color: colors.textMuted,
  },
  depositBadgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight + '50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  secureBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeadingWrap: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Method Cards
  methodCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  fastestText: {
    ...typography.caption,
    color: '#047857',
    fontSize: 9,
    fontWeight: '800',
  },
  methodSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  // Expanded Section
  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subHeading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: spacing.xs + 2,
  },
  upiAppsGrid: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    justifyContent: 'space-between',
  },
  upiAppBtn: {
    flex: 1,
    height: 76,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  upiAppBtnActive: {
    borderColor: colors.success,
    backgroundColor: '#DCFCE7', // Light green background
  },
  upiAppIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  upiAppImage: {
    width: '100%',
    height: '100%',
  },
  upiAppName: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  upiAppNameActive: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  appCheckmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  vpaInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  vpaInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  handleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  handleText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  handlePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
  handlePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handlePillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  handlePillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  handlePillTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  walletNotice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#F0F9FF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  walletNoticeText: {
    ...typography.caption,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 11,
  },
  cardInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  cardInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  textInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  cardDualRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  bankTile: {
    width: '31%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  bankTileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '30',
  },
  bankTileName: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  bankTileNameActive: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  securityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  securityStripText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  // Floating Bottom Pay Bar
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 4 : spacing.lg + 8,
    marginBottom: Platform.OS === 'android' ? 12 : 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  payButton: {
    height: 52,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonEnabled: {
    backgroundColor: colors.primary,
  },
  payButtonDisabled: {
    backgroundColor: colors.surfaceTertiary,
    opacity: 0.7,
  },
  payButtonText: {
    ...typography.buttonMedium,
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 15,
  },
  payButtonTextDisabled: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  // Modal Backdrop & Card
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successModalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalSuccessTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  modalSuccessAmount: {
    ...typography.h2,
    color: colors.primaryDark,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  modalSuccessDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  modalTxnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  modalTxnLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  modalTxnValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  modalLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRedirectText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
