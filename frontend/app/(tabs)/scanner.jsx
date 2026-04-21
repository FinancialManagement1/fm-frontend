console.log("SCANNER SCREEN LOADED");
import { AuthError, useAiScan } from "@/hooks/useAiScan";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useCategories } from "../../hooks/useCategories";

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showAmountOptions, setShowAmountOptions] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);

  const {
    scanResult,
    scanLoading,
    confirmLoading,
    error,
    performScan,
    confirmTransaction,
    resetScan,
  } = useAiScan();

  const [scanData, setScanData] = useState({
    scanId: null,
    status: null,
    amount: null,
    amountCandidates: [],
    merchant: null,
    date: null,
    suggestedCategory: null,
    suggestedType: null,
    description: null,
    currency: null,
    confidence: {},
    rawText: null,
  });

  const [manualCategory, setManualCategory] = useState(null);
  const { incomeCategories, expenseCategories, fetchAllCategories } = useCategories();

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleImageSelect = async (source) => {
    console.log("IMAGE SELECT TRIGGERED:", source);
    let result;

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required to take photos");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery permission is required to select photos");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (result.canceled) return;

    const selectedAsset = result.assets[0];
    console.log("SELECTED ASSET:", selectedAsset);
    setSelectedImage(selectedAsset.uri);

    const imageFile = {
      uri: selectedAsset.uri,
      mimeType: selectedAsset.mimeType || "image/jpeg",
      fileName: selectedAsset.fileName || "receipt.jpg",
    };

    try {
      const apiResult = await performScan(imageFile, "receipt");
      console.log("🔴 FULL API RESULT:", apiResult);

      if (apiResult) {
        setScanData({
          scanId: apiResult.scanId || null,
          status: apiResult.status || null,
          amount: apiResult.amount || null,
          amountCandidates: apiResult.amountCandidates || [],
          merchant: apiResult.merchant || null,
          date: apiResult.date || null,
          suggestedCategory: apiResult.suggestedCategory || null,
          suggestedType: apiResult.suggestedType || null,
          description: apiResult.description || null,
          currency: apiResult.currency || null,
          confidence: apiResult.confidence || {},
          rawText: apiResult.rawText || null,
        });
        setSelectedAmount(apiResult.amount || null);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        router.push("/login");
      }
    }
  };

  const validCategories =
    scanData.suggestedType === "income" ? incomeCategories : expenseCategories;

  const matchedCategory = validCategories.find(
    (c) => c.name.toLowerCase() === (scanData.suggestedCategory || "").toLowerCase(),
  );

  const finalCategory =
    manualCategory ||
    (matchedCategory ? matchedCategory.name : validCategories[0]?.name);

  const handleConfirm = async () => {
    console.log("DEBUG - finalCategory:", finalCategory);
    console.log("DEBUG - suggestedType:", scanData.suggestedType);

    const confirmData = {
      scanId: scanData.scanId,
      type: (scanData.suggestedType || "").toLowerCase(),
      amount: Number(selectedAmount || scanData.amount),
      category: finalCategory,
      date: (scanData.date || "").split("T")[0],
      description: scanData.description || "",
      currency: scanData.currency || "EUR",
    };

    if (!finalCategory) {
      Alert.alert("Error", "Please select a valid category");
      return;
    }

    if (
      scanData.status === "failed" ||
      !scanData.scanId ||
      !scanData.suggestedType ||
      !(selectedAmount || scanData.amount) ||
      !scanData.date
    ) {
      Alert.alert("Error", "Missing required fields. Please review the scan data.");
      return;
    }

    try {
      console.log("CONFIRM DATA:", confirmData);
      await confirmTransaction(confirmData);
      Alert.alert("Success", "Transaction saved successfully", [
        {
          text: "OK",
          onPress: () => {
            resetScan();
            setSelectedImage(null);
            setSelectedAmount(null);
            setManualCategory(null);
          },
        },
      ]);
    } catch (err) {
      console.log("SCAN ERROR:", err);
      if (err instanceof AuthError) {
        router.push("/login");
      }
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return theme.income;
    if (score >= 0.7) return theme.accent;
    return theme.error;
  };

  const getConfidenceBorder = (score) => {
    if (score >= 0.9) return styles.highConfidence;
    if (score >= 0.7) return styles.mediumConfidence;
    return styles.lowConfidence;
  };

  const renderUploadScreen = () => (
    <View style={styles.uploadContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.headerBox}>
        <Ionicons name="scan" size={40} color={theme.accent} />
        <Text style={styles.title}>AI Receipt Scanner</Text>
        <Text style={styles.subtitle}>
          Upload a receipt and let AI extract the details
        </Text>
      </View>

      <View style={styles.aiInfoBox}>
        <Ionicons name="sparkles" size={32} color={theme.accent} />
        <Text style={styles.aiTitle}>AI-Powered Scanning</Text>
        <Text style={styles.aiSubtitle}>
          Automatically extract merchant, amount, date, and category from your receipts
        </Text>
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageSelect("gallery")}
      >
        <Ionicons name="cloud-upload-outline" size={32} color={theme.text} />
        <Text style={styles.uploadText}>Upload Receipt</Text>
        <Text style={styles.uploadSubtext}>Click to select from gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => handleImageSelect("camera")}
      >
        <Ionicons name="camera" size={24} color="#0D0D0D" />
        <Text style={styles.cameraText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={styles.loadingText}>Processing...</Text>
      <Text style={styles.loadingSubtext}>Scanning... Extracting... Analyzing...</Text>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          setSelectedImage(null);
          resetScan();
        }}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultScreen = () => (
    <ScrollView
      style={styles.resultContainer}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButtonResult} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Success Banner */}
      <View style={styles.successBanner}>
        <Ionicons name="checkmark-circle" size={24} color={theme.income} />
        <Text style={styles.successText}>
          {scanData.status === "success" && "Scan Successful!"}
          {scanData.status === "partial" && "Review Required"}
          {scanData.status === "failed" && "Scan Failed"}
        </Text>
        <Text style={styles.successSubtext}>Review the details below</Text>
      </View>

      {/* Receipt Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="receipt-outline" size={60} color={theme.muted} />
            <Text style={styles.imagePlaceholderText}>Receipt Image</Text>
          </View>
        </View>
      )}

      {/* Extracted Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Extracted Details</Text>

        {/* Merchant */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Merchant</Text>
          <View style={[styles.fieldInputContainer, getConfidenceBorder(scanData.confidence?.merchant)]}>
            <TextInput
              style={styles.fieldInput}
              value={scanData.merchant || ""}
              onChangeText={(text) => setScanData({ ...scanData, merchant: text })}
              placeholder="Merchant name"
              placeholderTextColor={theme.muted}
            />
            {scanData.confidence?.merchant && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(scanData.confidence.merchant) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(scanData.confidence.merchant * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount and Category Row */}
        <View style={styles.rowContainer}>

          {/* Amount */}
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Amount</Text>
            {scanData.amountCandidates?.length > 0 ? (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[styles.amountDropdown, getConfidenceBorder(scanData.confidence?.amount)]}
                  onPress={() => {
                    setShowAmountOptions(!showAmountOptions);
                    setShowCategoryOptions(false);
                  }}
                >
                  <Text style={styles.amountText}>${selectedAmount || scanData.amount}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.text} />
                </TouchableOpacity>
                {showAmountOptions &&
                  scanData.amountCandidates.map((amt, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedAmount(amt);
                        setShowAmountOptions(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>${amt}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : (
              <View style={[styles.fieldInputContainer, getConfidenceBorder(scanData.confidence?.amount)]}>
                <TextInput
                  style={styles.fieldInput}
                  value={String(scanData.amount || "")}
                  onChangeText={(text) => {
                    const value = parseFloat(text);
                    if (isNaN(value)) {
                      setScanData({ ...scanData, amount: null });
                    } else {
                      setScanData({ ...scanData, amount: value });
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.muted}
                />
              </View>
            )}
            {scanData.confidence?.amount && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(scanData.confidence.amount) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(scanData.confidence.amount * 100)}%
                </Text>
              </View>
            )}
          </View>

          {/* Category */}
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[styles.amountDropdown, getConfidenceBorder(scanData.confidence?.category)]}
                onPress={() => {
                  setShowCategoryOptions(!showCategoryOptions);
                  setShowAmountOptions(false);
                }}
              >
                <Text style={styles.categoryText}>
                  {finalCategory || "Select category"}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.text} />
              </TouchableOpacity>

              {showCategoryOptions && (
                <View style={styles.categoryDropdownList}>
                  {(scanData.suggestedType === "income" ? incomeCategories : expenseCategories)?.map((cat, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        finalCategory === cat.name && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setManualCategory(cat.name);
                        setShowCategoryOptions(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        finalCategory === cat.name && styles.dropdownItemTextSelected,
                      ]}>
                        {cat.name}
                      </Text>
                      {finalCategory === cat.name && (
                        <Ionicons name="checkmark" size={16} color={theme.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

        </View>
        {/* rowContainer ends here ✅ */}

        {/* Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={[styles.fieldInputContainer, getConfidenceBorder(scanData.confidence?.date)]}>
            <TextInput
              style={styles.fieldInput}
              value={scanData.date || ""}
              onChangeText={(text) => setScanData({ ...scanData, date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
            />
            {scanData.confidence?.date && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(scanData.confidence.date) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(scanData.confidence.date * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description</Text>
          <View style={styles.fieldInputContainer}>
            <TextInput
              style={[styles.fieldInput, styles.multilineInput]}
              value={scanData.description || ""}
              onChangeText={(text) => setScanData({ ...scanData, description: text })}
              placeholder="Generated description"
              placeholderTextColor={theme.muted}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, scanData.suggestedType === "expense" && styles.typeButtonActive]}
              onPress={() => setScanData({ ...scanData, suggestedType: "expense" })}
            >
              <Text style={[styles.typeButtonText, scanData.suggestedType === "expense" && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, scanData.suggestedType === "income" && styles.typeButtonActive]}
              onPress={() => setScanData({ ...scanData, suggestedType: "income" })}
            >
              <Text style={[styles.typeButtonText, scanData.suggestedType === "income" && styles.typeButtonTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Raw Text Expander */}
        <TouchableOpacity
          style={styles.rawTextToggle}
          onPress={() => setShowRawText(!showRawText)}
        >
          <Text style={styles.rawTextToggleText}>
            {showRawText ? "Hide" : "Show"} Raw OCR Text (Debug)
          </Text>
          <Ionicons
            name={showRawText ? "chevron-up" : "chevron-down"}
            size={16}
            color={theme.muted}
          />
        </TouchableOpacity>

        {showRawText && scanData.rawText && (
          <View style={styles.rawTextContainer}>
            <Text style={styles.rawText}>{scanData.rawText}</Text>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, scanData.status === "failed" && { opacity: 0.5 }]}
          onPress={() => {
            console.log("CONFIRM BUTTON CLICKED");
            handleConfirm();
          }}
          disabled={scanData.status === "failed"}
        >
          <Ionicons name="checkmark" size={20} color="#0D0D0D" />
          <Text style={styles.confirmButtonText}>Confirm Transaction</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelScanButton}
          onPress={() => {
            setSelectedImage(null);
            setScanData({
              scanId: null,
              status: null,
              amount: null,
              amountCandidates: [],
              merchant: null,
              date: null,
              suggestedCategory: null,
              suggestedType: null,
              description: null,
              currency: null,
              confidence: {},
              rawText: null,
            });
            setManualCategory(null);
          }}
        >
          <Text style={styles.cancelScanText}>Scan Another Receipt</Text>
        </TouchableOpacity>

      </View>
      {/* detailsContainer ends here ✅ */}

    </ScrollView>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {!selectedImage && renderUploadScreen()}
      {selectedImage && scanLoading && renderLoadingScreen()}
      {selectedImage && !scanLoading && scanData.scanId && renderResultScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  backButton: { position: "absolute", top: 16, left: 16, padding: 8, zIndex: 10 },
  backButtonResult: { flexDirection: "row", alignItems: "center", padding: 16, gap: 8 },
  backButtonText: { fontSize: 16, fontWeight: "600", color: theme.text },
  uploadContainer: { flex: 1, padding: 20, justifyContent: "center", gap: 16, position: "relative" },
  headerBox: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "800", color: theme.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: theme.muted, textAlign: "center", marginTop: 8 },
  aiInfoBox: { backgroundColor: theme.accent, borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16 },
  aiTitle: { fontSize: 18, fontWeight: "700", color: "#0D0D0D", marginTop: 12 },
  aiSubtitle: { fontSize: 13, color: "#0D0D0D", textAlign: "center", marginTop: 8, opacity: 0.8 },
  uploadButton: { backgroundColor: theme.card, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: theme.border, borderStyle: "dashed" },
  uploadText: { fontSize: 16, fontWeight: "600", color: theme.text, marginTop: 12 },
  uploadSubtext: { fontSize: 12, color: theme.muted, marginTop: 4 },
  cameraButton: { backgroundColor: theme.accent, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  cameraText: { fontSize: 16, fontWeight: "700", color: "#0D0D0D" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { fontSize: 18, fontWeight: "700", color: theme.text, marginTop: 20 },
  loadingSubtext: { fontSize: 14, color: theme.muted, marginTop: 8, textAlign: "center" },
  cancelButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: theme.card },
  cancelText: { fontSize: 14, color: theme.error, fontWeight: "600" },
  resultContainer: { flex: 1 },
  successBanner: { backgroundColor: `${theme.income}20`, padding: 16, alignItems: "center", margin: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.income },
  successText: { fontSize: 16, fontWeight: "700", color: theme.income, marginTop: 8 },
  successSubtext: { fontSize: 12, color: theme.muted, marginTop: 4 },
  imagePreviewContainer: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: "hidden", backgroundColor: theme.card },
  imagePlaceholder: { height: 200, alignItems: "center", justifyContent: "center", backgroundColor: theme.input },
  imagePlaceholderText: { fontSize: 14, color: theme.muted, marginTop: 8 },
  detailsContainer: { padding: 16 },
  detailsTitle: { fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 16 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: theme.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: theme.card, borderRadius: 12, borderWidth: 2, borderColor: theme.border, paddingHorizontal: 12 },
  fieldInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: theme.text },
  multilineInput: { minHeight: 60, textAlignVertical: "top" },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  confidenceText: { fontSize: 11, fontWeight: "700", color: "#0D0D0D" },
  highConfidence: { borderColor: theme.income },
  mediumConfidence: { borderColor: theme.accent },
  lowConfidence: { borderColor: theme.error },
  rowContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dropdownContainer: { position: "relative" },
  amountDropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.card, borderRadius: 12, borderWidth: 2, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 12 },
  amountText: { fontSize: 18, fontWeight: "700", color: theme.accent },
  categoryText: { fontSize: 15, fontWeight: "600", color: theme.accent },
  categoryDropdownList: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginTop: 4, overflow: "hidden" },
  dropdownItem: { backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownItemText: { fontSize: 15, color: theme.text },
  dropdownItemSelected: { backgroundColor: `${theme.accent}20` },
  dropdownItemTextSelected: { color: theme.accent, fontWeight: "700" },
  typeContainer: { flexDirection: "row", gap: 12 },
  typeButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: theme.card, alignItems: "center", borderWidth: 1, borderColor: theme.border },
  typeButtonActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  typeButtonText: { fontSize: 14, fontWeight: "600", color: theme.text },
  typeButtonTextActive: { color: "#0D0D0D" },
  rawTextToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, marginTop: 8, marginBottom: 8 },
  rawTextToggleText: { fontSize: 13, color: theme.muted, fontWeight: "600" },
  rawTextContainer: { backgroundColor: theme.card, borderRadius: 12, padding: 12, marginBottom: 16 },
  rawText: { fontSize: 11, color: theme.muted, fontFamily: "monospace", lineHeight: 16 },
  confirmButton: { backgroundColor: theme.accent, borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  confirmButtonText: { fontSize: 16, fontWeight: "700", color: "#0D0D0D" },
  cancelScanButton: { paddingVertical: 16, alignItems: "center", marginTop: 8 },
  cancelScanText: { fontSize: 14, color: theme.muted, fontWeight: "600" },
});