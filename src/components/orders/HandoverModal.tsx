import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';

interface HandoverModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onHandoverSuccess: () => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  visible,
  order,
  onClose,
  onHandoverSuccess,
}) => {
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const handleVerify = () => {
    setErrorMsg('');
    const codeToVerify = pickupCodeInput.trim() || order.rider?.pickupCode || '4821';


    const result = orderService.verifyHandover(order.id, codeToVerify);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPickupCodeInput('');
        onHandoverSuccess();
      }, 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Rider Handover Verification"
      subtitle={`Order ${order.shortId} (${order.id})`}
      contentStyle={{ paddingBottom: 80 }}
    >
      {isSuccess ? (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Handover Verified!</Text>
          <Text style={styles.successSub}>
            Order {order.shortId} marked completed. Payout added to your earnings.
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Rider Details Card */}
          {order.rider && (
            <View style={styles.riderCard}>
              <Image source={{ uri: order.rider.photoUrl }} style={styles.riderAvatar} />
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.riderVehicle}>
                  Vehicle: <Text style={styles.bold}>{order.rider.vehicleNumber}</Text>
                </Text>
                <View style={styles.arrivedPill}>
                  <Ionicons name="location" size={12} color={colors.success} />
                  <Text style={styles.arrivedPillText}>At Store Counter</Text>
                </View>
              </View>
            </View>
          )}

          {/* Bag Count Confirmation Notice */}
          <View style={styles.bagConfirmBox}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
            <Text style={styles.bagConfirmText}>
              Handing over <Text style={styles.bold}>{order.bagCount} Sealed Bag{order.bagCount > 1 ? 's' : ''}</Text> to rider
            </Text>
          </View>

          {/* 4-digit Code Input */}
          <View style={styles.codeInputSection}>
            <Text style={styles.codeLabel}>Ask Rider for 4-Digit Pickup Code:</Text>
            <AppInput
              placeholder="e.g. 4821"
              value={pickupCodeInput}
              onChangeText={(text) => {
                setPickupCodeInput(text);
                setErrorMsg('');
              }}
              keyboardType="number-pad"
              maxLength={4}
              error={errorMsg}
              helperText={`Demo Code for testing: ${order.rider?.pickupCode || '4821'}`}
              inputStyle={styles.codeTextInput}
              containerStyle={styles.inputBox}
            />
          </View>

          <View style={styles.btnRow}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.btnFlex}
            />
            <AppButton
              title="Verify & Complete"
              onPress={handleVerify}
              variant="primary"
              style={styles.btnFlex}
            />
          </View>
        </View>
      )}
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceTertiary,
    marginRight: spacing.md,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  riderVehicle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  arrivedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  arrivedPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
  },
  bagConfirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight + '50',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  bagConfirmText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    flex: 1,
  },
  codeInputSection: {
    marginBottom: spacing.md,
  },
  codeLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputBox: {
    marginBottom: spacing.xs,
  },
  codeTextInput: {
    ...typography.h2,
    textAlign: 'center',
    letterSpacing: 8,
    color: colors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btnFlex: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  successSub: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
