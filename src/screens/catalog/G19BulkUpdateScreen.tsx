import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { BulkCsvModal } from '../../components/catalog/BulkCsvModal';
import { PriceAdjustmentModal } from '../../components/catalog/PriceAdjustmentModal';
import { catalogService } from '../../services/catalogService';

interface G19BulkUpdateScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BulkUpdate'>;
}

export const G19BulkUpdateScreen: React.FC<G19BulkUpdateScreenProps> = ({ navigation }) => {
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [priceAdjVisible, setPriceAdjVisible] = useState(false);

  const handleBulkMarkAllInStock = () => {
    const products = catalogService.getProducts();
    catalogService.bulkSetAvailability(products.map(p => p.id), true);
    Alert.alert('Catalog Updated', 'All products in store marked AVAILABLE.');
  };

  const handleBulkMarkAllOutOfStock = () => {
    const products = catalogService.getProducts();
    catalogService.bulkSetAvailability(products.map(p => p.id), false);
    Alert.alert('Catalog Updated', 'All products in store marked OUT OF STOCK.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Bulk Catalog Operations"
        subtitle="Spreadsheet Sync & Bulk Controls"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="flash" size={24} color={colors.secondary} />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Mass Inventory & Price Management</Text>
            <Text style={styles.bannerSubtitle}>
              Update hundreds of SKUs simultaneously without manual per-item editing.
            </Text>
          </View>
        </View>

        {/* TOOL 1: CSV / EXCEL IMPORT & EXPORT */}
        <Card style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="document-text" size={24} color={colors.info} />
            </View>
            <View style={styles.toolTitleWrap}>
              <Text style={styles.toolTitle}>1. Excel / CSV Import & Export</Text>
              <Text style={styles.toolSub}>Download catalog sheet, edit on PC, upload back</Text>
            </View>
          </View>

          <Text style={styles.toolDesc}>
            Export your entire store catalog with SKUs, barcodes, MRPs, and selling prices. Automated parser validates strict MRP limits row-by-row before applying changes.
          </Text>

          <View style={styles.btnRow}>
            <AppButton
              title="Download Catalog XLSX"
              onPress={() => Alert.alert('Download Complete', 'OneBuddy_Catalog_Export.xlsx saved to phone.')}
              variant="outline"
              size="medium"
              style={styles.flex1}
              textStyle={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              leftIcon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
            />
            <AppButton
              title="Upload Updated CSV"
              onPress={() => setCsvModalVisible(true)}
              variant="primary"
              size="medium"
              style={styles.flex1}
              textStyle={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              leftIcon={<Ionicons name="cloud-upload" size={18} color={colors.textInverse} />}
            />
          </View>
        </Card>

        {/* TOOL 2: PERCENTAGE PRICE ADJUSTMENT */}
        <Card style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="trending-down" size={24} color={colors.primaryDark} />
            </View>
            <View style={styles.toolTitleWrap}>
              <Text style={styles.toolTitle}>2. Percentage Price Adjustment Tool</Text>
              <Text style={styles.toolSub}>Apply storewide discount or margin increase</Text>
            </View>
          </View>

          <Text style={styles.toolDesc}>
            Quickly apply flat discounts (e.g. -5% storewide festive promo) or price adjustments. The system automatically enforces the invariant ceiling: <Text style={styles.bold}>sellingPrice &lt;= MRP</Text>.
          </Text>

          <AppButton
            title="Launch % Price Adjustment Tool"
            onPress={() => setPriceAdjVisible(true)}
            variant="primary"
            size="medium"
            leftIcon={<Ionicons name="calculator-outline" size={18} color={colors.textInverse} />}
          />
        </Card>

        {/* TOOL 3: BULK AVAILABILITY TOGGLES */}
        <Card style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="toggle" size={24} color="#B45309" />
            </View>
            <View style={styles.toolTitleWrap}>
              <Text style={styles.toolTitle}>3. Instant Bulk Availability Switches</Text>
              <Text style={styles.toolSub}>Emergency stock management</Text>
            </View>
          </View>

          <Text style={styles.toolDesc}>
            Quickly toggle all items in stock or pause entire catalog during stock-taking or seasonal holidays.
          </Text>

          <View style={styles.btnRow}>
            <AppButton
              title="Mark All In Stock"
              onPress={handleBulkMarkAllInStock}
              variant="outline"
              size="medium"
              style={styles.flex1}
              textStyle={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />}
            />
            <AppButton
              title="Mark All Out of Stock"
              onPress={handleBulkMarkAllOutOfStock}
              variant="outline"
              size="medium"
              style={styles.flex1}
              textStyle={{ color: colors.error, flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              leftIcon={<Ionicons name="close-circle-outline" size={18} color={colors.error} />}
            />
          </View>
        </Card>
      </ScrollView>

      {/* CSV Validation Preview Modal */}
      <BulkCsvModal
        visible={csvModalVisible}
        onClose={() => setCsvModalVisible(false)}
        onApplyValidRows={(c) => Alert.alert('Bulk Sync Done', `Applied updates to ${c} catalog products.`)}
      />

      {/* Price Adjustment Modal */}
      <PriceAdjustmentModal
        visible={priceAdjVisible}
        onClose={() => setPriceAdjVisible(false)}
        onApplyAdjustment={(p) => {
          const res = catalogService.bulkAdjustPrices(p);
          setPriceAdjVisible(false);
          Alert.alert('Price Adjustment Applied', `Adjusted selling prices across ${res.updatedCount} items.`);
        }}
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
    backgroundColor: colors.secondaryLight,
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
    color: colors.secondaryDark,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  toolCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toolTitleWrap: {
    flex: 1,
  },
  toolTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  toolSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
});
