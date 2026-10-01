import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { AuthStackParamList, RootStackParamList, VerificationState } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AppButton } from '../../components/common/AppButton';
import { StatusChip } from '../../components/common/StatusChip';
import { storeService } from '../../services/storeService';

type G9NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'G9VerificationStatus'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface G9VerificationStatusScreenProps {
  navigation: G9NavigationProp;
}

export const G9VerificationStatusScreen: React.FC<G9VerificationStatusScreenProps> = ({ navigation }) => {
  const [currentStatus, setCurrentStatus] = useState<VerificationState>(
    storeService.getStoreDetails().verificationStatus
  );

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setCurrentStatus(storeService.getStoreDetails().verificationStatus);
    });

    const onBackPress = () => {
      return true; // Block hardware back
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    const navListener = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault(); // Block software back navigation
      }
    });

    return () => {
      unsub();
      backHandler.remove();
      navListener();
    };
  }, [navigation]);

  const handleSwitchState = (status: VerificationState) => {
    storeService.setVerificationState(status);
    setCurrentStatus(status);
  };

  const handleEnterMainApp = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const renderStateContent = () => {
    switch (currentStatus) {
      case 'Under Review':
        return (
          <View style={styles.statusBox}>
            <View style={[styles.iconLarge, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="hourglass-outline" size={48} color="#D97706" />
            </View>
            <StatusChip status="Under Review" size="medium" style={styles.chip} />
            <Text style={styles.statusTitle}>Store Application Under Review</Text>
            <Text style={styles.statusDesc}>
              Our compliance team is verifying your FSSAI license, GSTIN, and store location. Average turnaround is under 4 business hours.
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <Text style={styles.infoText}>Estimated Verification Time: 2h 45m</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.infoText}>Field executive might call for a quick 2-min verification</Text>
              </View>
            </View>
          </View>
        );

      case 'Needs Changes':
        return (
          <View style={styles.statusBox}>
            <View style={[styles.iconLarge, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="alert-circle-outline" size={48} color="#C2410C" />
            </View>
            <StatusChip status="Needs Changes" size="medium" style={styles.chip} />
            <Text style={styles.statusTitle}>Action Required: Update License Photo</Text>
            <Text style={styles.statusDesc}>
              The FSSAI certificate image uploaded is blurry or corners are clipped. Please re-upload a clear scanned copy to complete approval.
            </Text>

            <AppButton
              title="Re-Upload FSSAI Certificate"
              onPress={() => navigation.navigate('G3DocumentsUpload')}
              variant="secondary"
              style={styles.actionBtn}
              leftIcon={<Ionicons name="cloud-upload" size={18} color={colors.textInverse} />}
            />
          </View>
        );

      case 'Rejected':
        return (
          <View style={styles.statusBox}>
            <View style={[styles.iconLarge, { backgroundColor: colors.errorLight }]}>
              <Ionicons name="close-circle-outline" size={48} color={colors.error} />
            </View>
            <StatusChip status="Rejected" size="medium" style={styles.chip} />
            <Text style={styles.statusTitle}>Application Rejected</Text>
            <Text style={styles.statusDesc}>
              Reason: GSTIN state jurisdiction (29) did not match the store's physical operating address in Bengaluru.
            </Text>

            <AppButton
              title="Contact Partner Support"
              onPress={() => alert('Dialing OneBuddy Partner Desk: 1800-123-9988')}
              variant="outline"
              style={styles.actionBtn}
              leftIcon={<Ionicons name="headset" size={18} color={colors.primary} />}
            />
          </View>
        );

      case 'Approved':
      default:
        return (
          <View style={styles.statusBox}>
            <View style={[styles.iconLarge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
            </View>
            <StatusChip status="Approved" size="medium" style={styles.chip} />
            <Text style={styles.statusTitle}>Congratulations! Store Approved</Text>
            <Text style={styles.statusDesc}>
              Your grocery store <Text style={styles.bold}>{storeService.getStoreDetails().storeName}</Text> is verified and ready to accept live customer orders on OneBuddy!
            </Text>

            <View style={styles.successHighlight}>
              <Ionicons name="flash" size={20} color={colors.secondary} />
              <Text style={styles.successHighlightText}>
                Express Store Pickup & Handover is ACTIVE
              </Text>
            </View>

            <AppButton
              title="ENTER STORE DASHBOARD"
              onPress={handleEnterMainApp}
              variant="primary"
              size="large"
              style={styles.enterAppBtn}
              rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
            />
          </View>
        );
    }
  };

  const allStates: VerificationState[] = ['Approved', 'Under Review', 'Needs Changes', 'Rejected'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Verification Status"
        subtitle="Onboarding Final Step"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Testing State Switcher Bar */}
        <View style={styles.testerCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="flask-outline" size={16} color="#38BDF8" />
            <Text style={styles.testerLabel}>Interactive Verification State Tester:</Text>
          </View>
          <Text style={styles.testerSub}>Tap any status pill below to test UI response across all 4 states:</Text>
          <View style={styles.testerPillsRow}>
            {allStates.map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.testPill, currentStatus === st && styles.testPillActive]}
                onPress={() => handleSwitchState(st)}
                activeOpacity={0.7}
              >
                <Text style={[styles.testPillText, currentStatus === st && styles.testPillTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current State Detailed View */}
        {renderStateContent()}
      </ScrollView>
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
    paddingBottom: spacing.xxl + 24,
  },
  testerCard: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  testerLabel: {
    ...typography.caption,
    color: '#38BDF8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  testerSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  testerPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  testPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  testPillText: {
    ...typography.caption,
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 11,
  },
  testPillTextActive: {
    color: colors.textInverse,
    fontWeight: '800',
  },
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  iconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  chip: {
    marginBottom: spacing.sm,
  },
  statusTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statusDesc: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  bold: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  actionBtn: {
    width: '100%',
    marginTop: spacing.md,
  },
  successHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  successHighlightText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  enterAppBtn: {
    width: '100%',
  },
});
