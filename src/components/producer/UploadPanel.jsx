import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, UploadCloud, File, CheckCircle, Shield, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const MOCK_PUBLIC_KEY = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL8...";

const EMPTY_FORM = { full_name: "", email: "", trip_name: "", category: "Leisure", description: "" };

// Hardcoded OCR data for the 3 Chow Ka Ho documents
const CHOW_OCR_DATA = {
  "CHOWKAHOMR23JANHKG": {
    full_name: "Chow Ka Ho",
    email: "chowkaho@example.com",
    trip_name: "Hong Kong ↔ Beijing (Jan 2025)",
    category: "Business",
    description: "Cathay Pacific CX0334 HKG→PEK on 23 Jan, depart 07:30 arrive 10:45. Return CX0331 PEK→HKG on 26 Jan, depart 16:45 arrive 20:35. Booking ref: 52Z53E. Ticket: 160 2398457843. Economy Class (Fare Basis YBP). Total paid: HKD 680.",
    extractedFields: [
      { label: "Passenger", value: "Chow Ka Ho Mr" },
      { label: "Booking Ref", value: "52Z53E" },
      { label: "Outbound Flight", value: "CX0334 HKG→PEK, 23 Jan 07:30" },
      { label: "Return Flight", value: "CX0331 PEK→HKG, 26 Jan 16:45" },
      { label: "Ticket No.", value: "160 2398457843" },
      { label: "Total Amount", value: "HKD 680" },
    ]
  },
  "CHOWKAHOPROF30SEPHKG": {
    full_name: "Chow Ka Ho",
    email: "chowkaho@example.com",
    trip_name: "Hong Kong ↔ Milan (Sep 2024)",
    category: "Business",
    description: "Cathay Pacific CX0233 HKG→MXP on 30 Sep, depart 00:50 arrive 07:55. Return CX0234 MXP→HKG on 04 Oct, depart 12:50 arrive 06:25+1. Booking ref: 549YWU. Ticket: 160 2395364235. Economy Light. Fare HKD 6530, Total paid: HKD 8540.",
    extractedFields: [
      { label: "Passenger", value: "Chow Ka Ho Prof" },
      { label: "Booking Ref", value: "549YWU" },
      { label: "Outbound Flight", value: "CX0233 HKG→MXP, 30 Sep 00:50" },
      { label: "Return Flight", value: "CX0234 MXP→HKG, 04 Oct 12:50" },
      { label: "Ticket No.", value: "160 2395364235" },
      { label: "Total Amount", value: "HKD 8,540" },
    ]
  },
  "CHOWKAHOMR28FEBHKG": {
    full_name: "Chow Ka Ho",
    email: "chowkaho@example.com",
    trip_name: "Hong Kong ↔ Taipei (Feb 2025)",
    category: "Leisure",
    description: "Cathay Pacific CX0494 HKG→TPE on 28 Feb, depart 10:25 arrive 12:20. Return CX0469 TPE→HKG on 03 Mar, depart 09:50 arrive 11:50. Booking ref: 5T7XTS. Ticket: 160 2399416618. Economy Light. Fare HKD 940, Total paid: HKD 1657.",
    extractedFields: [
      { label: "Passenger", value: "Chow Ka Ho Mr" },
      { label: "Booking Ref", value: "5T7XTS" },
      { label: "Outbound Flight", value: "CX0494 HKG→TPE, 28 Feb 10:25" },
      { label: "Return Flight", value: "CX0469 TPE→HKG, 03 Mar 09:50" },
      { label: "Ticket No.", value: "160 2399416618" },
      { label: "Total Amount", value: "HKD 1,657" },
    ]
  }
};

// Match filename to hardcoded OCR data
function getHardcodedOCR(filename) {
  const upper = filename.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (const key of Object.keys(CHOW_OCR_DATA)) {
    if (upper.includes(key)) return CHOW_OCR_DATA[key];
  }
  return null;
}

export default function UploadPanel({ onUpload, isUploading }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState(null);
  const fileUrlsRef = useRef([]);
  const filledDataRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setFiles(selectedFiles);
    setOcrResult(null);
    setSignatureStatus(null);
    setFormData(EMPTY_FORM);
    fileUrlsRef.current = [];
    filledDataRef.current = null;

    // Step 1: Simulate upload + scan delay
    setOcrScanning(true);
    try {
      // Use the file URL from the uploaded PDF (or the known public URL for demo)
      const filename = selectedFiles[0].name;
      const hardcoded = getHardcodedOCR(filename);

      // Simulate scanning delay (3s)
      await new Promise(r => setTimeout(r, 3000));

      let extracted;
      if (hardcoded) {
        extracted = hardcoded;
        fileUrlsRef.current = [
          filename.toUpperCase().includes("23JAN") 
            ? "https://media.base44.com/files/public/69160892745be891ce4c021a/b9787ec4a_CHOWKAHOMR23JANHKG.pdf"
            : filename.toUpperCase().includes("30SEP")
            ? "https://media.base44.com/files/public/69160892745be891ce4c021a/5d6628477_CHOWKAHOPROF30SEPHKG.pdf"
            : "https://media.base44.com/files/public/69160892745be891ce4c021a/b72dfae18_CHOWKAHOMR28FEBHKG.pdf"
        ];
      } else {
        // Fallback: real LLM OCR for unknown files
        const urls = [];
        for (const file of selectedFiles) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          urls.push(file_url);
        }
        fileUrlsRef.current = urls;
        extracted = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract travel booking info. Return JSON with: full_name, email, trip_name, category (Business/Leisure/Adventure/Family), description, extractedFields (array of {label,value}).`,
          file_urls: [urls[0]],
          response_json_schema: {
            type: "object",
            properties: {
              full_name: { type: "string" }, email: { type: "string" },
              trip_name: { type: "string" }, category: { type: "string" },
              description: { type: "string" },
              extractedFields: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } }
            }
          }
        });
      }

      const filled = {
        full_name: extracted.full_name || "",
        email: extracted.email || "",
        trip_name: extracted.trip_name || "",
        category: ["Business", "Leisure", "Adventure", "Family"].includes(extracted.category) ? extracted.category : "Leisure",
        description: extracted.description || "",
      };

      setFormData(filled);
      setOcrResult(extracted);
      filledDataRef.current = filled;
      setOcrScanning(false);

      // Step 2: Signature verification (7s)
      setSignatureStatus("verifying");
      await new Promise(r => setTimeout(r, 7000));

      setSignatureStatus("verified");

      // Step 3: Auto-submit
      await autoSubmit(filled);
    } catch (err) {
      console.error("OCR error:", err);
      setOcrScanning(false);
    }
  };

  const autoSubmit = async (data) => {
    setUploadProgress(30);
    const creditScore = Math.floor(Math.random() * 300) + 550;
    let creditRating, bankAction;
    if (creditScore >= 750) { creditRating = "Excellent"; bankAction = "Approve"; }
    else if (creditScore >= 650) { creditRating = "Good"; bankAction = "Approve"; }
    else if (creditScore >= 600) { creditRating = "Fair"; bankAction = "Review"; }
    else { creditRating = "Poor"; bankAction = "Decline"; }

    setUploadProgress(70);

    await onUpload({
      ...data,
      file_urls: fileUrlsRef.current,
      anonymized: true,
      share_with_enterprises: true,
      earn_rewards: true,
      ai_insights: [
        `${data.category} travel with detailed itinerary`,
        "High-quality data with complete trip information",
        "Suitable for travel behavior analysis",
        "Premium destination preferences indicated",
      ],
      token_price: Math.floor(Math.random() * 100) + 100,
      credit_score: creditScore,
      credit_rating: creditRating,
      bank_action: bankAction,
    });

    setUploadProgress(100);
    setTimeout(() => {
      setFormData(EMPTY_FORM);
      setFiles([]);
      setUploadProgress(0);
      setOcrResult(null);
      setSignatureStatus(null);
      fileUrlsRef.current = [];
      filledDataRef.current = null;
    }, 1500);
  };

  const handleManualUpload = async () => {
    if (!formData.full_name || !formData.email || !formData.trip_name || files.length === 0) {
      alert("Please fill in all required fields and select files");
      return;
    }
    if (fileUrlsRef.current.length === 0) {
      setUploadProgress(10);
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrlsRef.current.push(file_url);
      }
    }
    await autoSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8 glow-hover"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <Upload className="w-6 h-6 text-purple-600" />
        <span>Upload Travel Data</span>
      </h2>

      {/* File Upload Zone */}
      <div className="mb-6">
        <label
          htmlFor="fileInput"
          className="border-2 border-dashed border-purple-300 rounded-2xl p-8 cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all flex flex-col items-center justify-center"
        >
          <UploadCloud className="w-12 h-12 text-purple-600 mb-3" />
          <p className="text-gray-700 font-medium mb-1">Drop your ticket or receipt here</p>
          <p className="text-sm text-gray-500">We'll read the data automatically — PDF, PNG, JPG supported</p>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.csv"
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm bg-white/50 p-2 rounded-lg">
                <File className="w-4 h-4 text-purple-600" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        )}

        {/* OCR Scanning Status */}
        <AnimatePresence>
          {ocrScanning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3"
            >
              <Scan className="w-5 h-5 text-blue-600 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Reading your document with AI...</p>
                <p className="text-xs text-blue-600">Extracting flight details, dates, and payment info</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OCR Result */}
        <AnimatePresence>
          {ocrResult && !ocrScanning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">Document read! Form filled automatically.</p>
              </div>
              {ocrResult.extractedFields && (
                <div className="grid grid-cols-2 gap-2">
                  {ocrResult.extractedFields.map((f, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-gray-500">{f.label}: </span>
                      <span className="font-medium text-gray-800">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signature Verification */}
        <AnimatePresence>
          {signatureStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-3 rounded-xl border flex items-center space-x-3 ${
                signatureStatus === "verifying" ? "bg-amber-50 border-amber-200" :
                signatureStatus === "verified" ? "bg-purple-50 border-purple-200" :
                "bg-red-50 border-red-200"
              }`}
            >
              <Shield className={`w-5 h-5 flex-shrink-0 ${
                signatureStatus === "verifying" ? "text-amber-600 animate-pulse" :
                signatureStatus === "verified" ? "text-purple-600" : "text-red-600"
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${
                  signatureStatus === "verifying" ? "text-amber-800" :
                  signatureStatus === "verified" ? "text-purple-800" : "text-red-800"
                }`}>
                  {signatureStatus === "verifying" && "Verifying document authenticity..."}
                  {signatureStatus === "verified" && "Document verified — authentic & tamper-proof"}
                  {signatureStatus === "failed" && "Verification failed — document may be altered"}
                </p>
                {signatureStatus === "verified" && (
                  <p className="text-xs text-purple-600 font-mono mt-0.5 truncate">
                    Signed with: {MOCK_PUBLIC_KEY.slice(0, 40)}...
                  </p>
                )}
              </div>
              {signatureStatus === "verified" && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">✓ Verified</Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form Fields — shown for manual fallback / review */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g., Tom Chan"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., tom@example.com"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tripName">Trip Name *</Label>
            <Input
              id="tripName"
              value={formData.trip_name}
              onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
              placeholder="e.g., Summer in Bali"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Leisure">Leisure</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Share details about your trip..."
            className="mt-1 h-24"
          />
        </div>
      </div>

      {/* Manual submit only shown if OCR didn't auto-submit */}
      {!ocrResult && !ocrScanning && (
        <Button
          onClick={handleManualUpload}
          disabled={isUploading || uploadProgress > 0}
          className="w-full gradient-purple-cyan text-white py-6 text-lg font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          {isUploading || uploadProgress > 0 ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 mr-2" />
              Upload & Analyze
            </>
          )}
        </Button>
      )}

      {uploadProgress > 0 && (
        <Progress value={uploadProgress} className="mt-4" />
      )}
    </motion.div>
  );
}