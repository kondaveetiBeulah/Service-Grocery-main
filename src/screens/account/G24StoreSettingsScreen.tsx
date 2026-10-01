import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { AppButton } from '../../components/common/AppButton';
import { storeService } from '../../services/storeService';

interface G24StoreSettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoreSettings'>;
}

export const G24StoreSettingsScreen: React.FC<G24StoreSettingsScreenProps> = ({ navigation }) => {
  const store = storeService.getStoreDetails();

  // Settings states
  const [holidayMode, setHolidayMode] = useState(false);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [thermalPrintOnAccept, setThermalPrintOnAccept] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Telugu'>('English');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleToggleHolidayMode = (val: boolean) => {
    setHolidayMode(val);
    if (val) {
      storeService.toggleStoreStatus(false, 'Holiday Mode Activated');
      Alert.alert('Holiday Mode Activated', 'Store marked offline. No customer orders will be accepted.');
    } else {
      storeService.toggleStoreStatus(true);
      Alert.alert('Store Re-opened', 'Store is online and ready for incoming orders.');
    }
  };

  const languages: ('English' | 'Hindi' | 'Telugu')[] = ['English', 'Hindi', 'Telugu'];

  const handleDeleteAccount = () => {
    setDeleteModalVisible(false);
    Alert.alert('Account Deletion Requested', 'A verification link has been sent to your registered email.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Store Settings"
        subtitle="Operations, Bluetooth & Preferences"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECTION 1: STORE OPERATIONS & SLOTS */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Store Operations & Operating Hours</Text>

          <ToggleSwitch
            label="Holiday Mode (Pause All Orders)"
            description="Temporarily shut store for festival/vacation without affecting rating."
            value={holidayMode}
            onValueChange={handleToggleHolidayMode}
            activeColor={colors.error}
          />

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Daily Operating Shifts</Text>
              <Text style={styles.infoVal}>Shift 1: 06:30 AM - 01:30 PM</Text>
              <Text style={styles.infoVal}>Shift 2: 04:30 PM - 10:30 PM</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Edit Hours', 'Redirecting to Slot manager...')} style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 2: DELIVERY & ORDER DISPATCH SETTINGS */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery & Order Dispatch Settings</Text>

          <ToggleSwitch
            label="Auto-Accept Express Orders"
            description="Automatically moves incoming express orders to picking stage."
            value={autoAcceptOrders}
            onValueChange={setAutoAcceptOrders}
          />

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Delivery Service Radius</Text>
              <Text style={styles.settingSub}>{store.deliveryRadiusKm} km coverage area</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Adjust Radius', 'Radius can be adjusted in Delivery settings.')}
              style={styles.pillBtn}
            >
              <Text style={styles.pillBtnText}>{store.deliveryRadiusKm} km</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Max Concurrent Express Orders</Text>
              <Text style={styles.settingSub}>{store.maxOrdersPerSlot} orders per hour cap</Text>
            </View>
            <TouchableOpacity style={styles.pillBtn}>
              <Text style={styles.pillBtnText}>{store.maxOrdersPerSlot} Orders</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 3: BLUETOOTH & THERMAL PRINTER SETTINGS */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Bluetooth & Thermal Printer</Text>

          <ToggleSwitch
            label="Auto-Print Bag Tag on Accept"
            description="Prints 2-inch manifest stickers on thermal receipt printer."
            value={thermalPrintOnAccept}
            onValueChange={setThermalPrintOnAccept}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.printerRow}
            onPress={() => Alert.alert('Bluetooth Thermal Printer', 'Connected: POS-58 Thermal Bluetooth Printer (Online)')}
            activeOpacity={0.7}
          >
            <Ionicons name="print" size={20} color={colors.primary} />
            <View style={styles.printerInfo}>
              <Text style={styles.printerName}>POS-58 Bluetooth Thermal Printer</Text>
              <Text style={styles.printerStatus}>Connected & Ready (58mm Rolls)</Text>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </Card>

        {/* SECTION 4: NOTIFICATIONS & SOUND ALERTS */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>

          <ToggleSwitch
            label="High-Priority Sound Siren on New Order"
            description="Plays loud alert chime when new customer order is placed."
            value={soundAlerts}
            onValueChange={setSoundAlerts}
          />
        </Card>

        {/* SECTION 5: APP LANGUAGE SELECTOR */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Partner App Language</Text>
          <Text style={styles.cardSub}>Choose your preferred dashboard language:</Text>

          <View style={styles.langPillsRow}>
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langPill, isSelected && styles.langPillSelected]}
                  onPress={() => setSelectedLanguage(lang)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langPillText, isSelected && styles.langPillTextSelected]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* SECTION 6: SUPPORT & LEGAL */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Support & About</Text>

          <TouchableOpacity
            style={styles.menuLink}
            onPress={() => Linking.openURL('tel:18001239988')}
            activeOpacity={0.7}
          >
            <Ionicons name="headset-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLinkText}>24x7 Merchant Helpdesk Hotline</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuLink}
            onPress={() => Linking.openURL('https://onebuddy.com/partner-terms')}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLinkText}>Partner Terms & Commission Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>


        </Card>

        {/* LOGOUT & DANGER ZONE */}
        <View style={styles.dangerSection}>
          <AppButton
            title="Logout of Store Account"
            onPress={() => {
              Alert.alert('Logout', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive', 
                  onPress: () => navigation.reset({
                    index: 0,
                    routes: [{ name: 'AuthStack' as any }],
                  }) 
                },
              ]);
            }}
            variant="outline"
            style={styles.logoutBtn}
            textStyle={{ color: colors.error }}
          />

          <TouchableOpacity
            style={styles.deleteLink}
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteLinkText}>Delete Partner Account & Store Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <ModalWrapper
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Store Account?"
        subtitle="This action will permanently delete all store catalog, records, and ratings."
      >
        <View style={styles.deleteModalContent}>
          <Ionicons name="warning" size={40} color={colors.error} style={styles.warnIcon} />
          <Text style={styles.deleteWarningText}>
            Are you sure you want to permanently close <Text style={styles.bold}>{store.storeName}</Text>? Pending settlements will be credited to your verified bank account within 3 business days.
          </Text>

          <View style={styles.modalBtnRow}>
            <AppButton
              title="Keep Store"
              onPress={() => setDeleteModalVisible(false)}
              variant="outline"
              style={styles.btnFlex}
            />
            <AppButton
              title="Confirm Delete"
              onPress={handleDeleteAccount}
              variant="danger"
              style={styles.btnFlex}
            />
          </View>
        </View>
      </ModalWrapper>
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
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoVal: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  editText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs + 2,
  },
  settingLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  settingSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pillBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  pillBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  printerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  printerStatus: {
    ...typography.caption,
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  langPillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  langPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  langPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  langPillTextSelected: {
    color: colors.primaryDark,
  },
  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  menuLinkText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  dangerSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderColor: colors.error,
  },
  deleteLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  deleteLinkText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  deleteModalContent: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  warnIcon: {
    marginBottom: spacing.sm,
  },
  deleteWarningText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  btnFlex: {
    flex: 1,
  },
});
