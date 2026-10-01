import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface CsvRowPreview {
  rowNum: number;
  productName: string;
  mrp: number;
  sellingPrice: number;
  available: boolean;
  error?: string;
}

interface BulkCsvModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyValidRows: (count: number) => void;
}

export const BulkCsvModal: React.FC<BulkCsvModalProps> = ({
  visible,
  onClose,
  onApplyValidRows,
}) => {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const sampleCsvRows: CsvRowPreview[] = [
    { rowNum: 1, productName: 'Amul Taaza Milk 500ml', mrp: 27, sellingPrice: 26, available: true },
    { rowNum: 2, productName: 'Farm Fresh Tomato 1kg', mrp: 45, sellingPrice: 38, available: true },
    { rowNum: 3, productName: 'Aashirvaad Atta 5kg', mrp: 310, sellingPrice: 285, available: true },
    { 
      rowNum: 4, 
      productName: 'Tata Salt 1kg', 
      mrp: 28, 
      sellingPrice: 32, 
      available: true,
      error: 'CRITICAL ERROR: Selling price (₹32) exceeds MRP (₹28). Violates pricing policy.',
    },
    { rowNum: 5, productName: 'Surf Excel Matic 2kg', mrp: 440, sellingPrice: 399, available: false },
  ];

  const handleSimulateUpload = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setHasUploaded(true);
    }, 900);
  };

  const handleDownloadTemplate = () => {
    Alert.alert('Template Downloaded', 'OneBuddy_Catalog_Template.xlsx saved to your downloads folder.');
  };

  const validCount = sampleCsvRows.filter(r => !r.error).length;

  const handleConfirmImport = () => {
    onApplyValidRows(validCount);
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Bulk Catalog Excel / CSV Tool"
      subtitle="Import price updates & stock status via spreadsheet"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasUploaded ? (
          <View style={styles.uploadContainer}>
            <View style={styles.dropZone}>
              <Ionicons name="document-text-outline" size={48} color={colors.primary} />
              <Text style={styles.dropTitle}>Upload Updated CSV / Excel</Text>
              <Text style={styles.dropSubtitle}>
                Supported formats: .csv, .xlsx (Max 5,000 SKUs)
              </Text>

              <AppButton
                title={isValidating ? 'Validating Pricing Rules...' : 'Select File to Upload'}
                onPress={handleSimulateUpload}
                loading={isValidating}
                variant="primary"
                style={styles.uploadBtn}
                textStyle={{ textAlign: 'center' }}
              />
            </View>

            <TouchableOpacity
              style={styles.templateRow}
              onPress={handleDownloadTemplate}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
              <Text style={styles.templateText}>Download Sample CSV Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Validation Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <Text style={styles.summaryTitle}>Validation Summary</Text>
              </View>
              <View style={styles.summaryStats}>
                <Text style={styles.statItem}>Total Rows: <Text style={styles.bold}>5</Text></Text>
                <Text style={[styles.statItem, { color: colors.success }]}>
                  Valid: <Text style={styles.bold}>{validCount}</Text>
                </Text>
                <Text style={[styles.statItem, { color: colors.error }]}>
                  Errors: <Text style={styles.bold}>1</Text>
                </Text>
              </View>
            </View>

            {/* Row-by-Row Preview Table */}
            <Text style={styles.tableHeading}>Parsed Rows Preview:</Text>
            {sampleCsvRows.map((row) => (
              <View
                key={row.rowNum}
                style={[styles.rowItem, row.error ? styles.rowItemError : styles.rowItemValid]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.rowNumText}>Row {row.rowNum}:</Text>
                  <Text style={styles.rowProdName} numberOfLines={1}>{row.productName}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowMetaText}>
                    MRP: ₹{row.mrp} • SP: ₹{row.sellingPrice} • Stock: {row.available ? 'ON' : 'OFF'}
                  </Text>
                </View>
                {row.error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="warning" size={14} color={colors.error} />
                    <Text style={styles.errorBoxText}>{row.error}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.btnRow}>
              <AppButton
                title="Upload Again"
                onPress={() => setHasUploaded(false)}
                variant="outline"
                style={styles.btnFlex}
                textStyle={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              />
              <AppButton
                title={`Import ${validCount} Valid SKUs`}
                onPress={handleConfirmImport}
                variant="primary"
                style={styles.btnFlex}
                textStyle={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  uploadContainer: {
    paddingVertical: spacing.sm,
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dropTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  dropSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  uploadBtn: {
    width: '100%',
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  templateText: {
    ...typography.bodySmallBold,
    color: colors.primary,
  },
  resultsContainer: {
    paddingVertical: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  summaryTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  statItem: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: '800',
  },
  tableHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  rowItem: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
  },
  rowItemValid: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  rowItemError: {
    backgroundColor: colors.errorLight + '20',
    borderColor: colors.error,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowNumText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rowProdName: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
    flex: 1,
  },
  rowMeta: {
    marginTop: 2,
  },
  rowMetaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.errorLight,
    padding: 4,
    borderRadius: borderRadius.xs,
    marginTop: 4,
  },
  errorBoxText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 10,
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  btnFlex: {
    flex: 1,
  },
});
