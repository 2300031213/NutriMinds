import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Flame,
  ImagePlus,
  Info,
  Layers,
  LoaderCircle,
  Plus,
  RotateCcw,
  Scale,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
  Zap,
} from "lucide-react";

import api from "../api/axios";

function getMealTypeFromHour() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  if (hour >= 16 && hour < 19) return "Snack";
  return "Dinner";
}

function FoodScanner() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Multi-dish scan state
  const [detectedItems, setDetectedItems] = useState([]);
  const [isMultiItem, setIsMultiItem] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [mealType, setMealType] = useState(getMealTypeFromHour());

  // Meal logging state
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);
  const [addedSummary, setAddedSummary] = useState(null);

  // Food correction modal
  const [correctionModalItem, setCorrectionModalItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle file upload
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageName(file.name);
    setScanned(false);
    setDetectedItems([]);
    setAddedSuccessfully(false);
    setAddedSummary(null);

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const openFilePicker = () => {
    stopCamera();
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      removeImage();
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please check camera permissions or upload a food photo instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImageName("Live Camera Photo.jpg");
        const imageUrl = URL.createObjectURL(blob);
        setSelectedImage(imageUrl);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const removeImage = () => {
    stopCamera();
    setSelectedImage(null);
    setImageFile(null);
    setImageName("");
    setScanned(false);
    setIsScanning(false);
    setDetectedItems([]);
    setAddedSuccessfully(false);
    setAddedSummary(null);
    setCorrectionModalItem(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Run AI food recognition
  const scanFood = async () => {
    const file = imageFile || fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select or capture a food photo first.");
      return;
    }

    setIsScanning(true);
    setScanned(false);
    setAddedSuccessfully(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/food/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      setIsMultiItem(Boolean(data.is_multi_item));

      const rawItems = data.detected_items || [];
      const items = rawItems.map((item, idx) => ({
        ...item,
        id: item.id || `item_${idx + 1}`,
        selected: true,
        multiplier: item.serving_multiplier || 1.0,
        customGrams: item.nutrition?.serving_weight_g || 150.0,
        baseNutrition: { ...item.nutrition },
        currentNutrition: { ...item.nutrition },
        showExplain: false,
      }));

      setDetectedItems(items);
      setScanned(true);
    } catch (error) {
      console.error("Food scan failed:", error);
      alert(error?.response?.data?.detail || "Unable to analyze the food image. Please try another photo.");
    } finally {
      setIsScanning(false);
    }
  };

  // Portion multiplier change
  const handleMultiplierChange = (itemId, newMultiplier) => {
    const updated = detectedItems.map((item) => {
      if (item.id !== itemId) return item;
      const base = item.baseNutrition;
      const baseWeight = base?.serving_weight_g || 150.0;
      const newGrams = roundVal(baseWeight * newMultiplier, 0);
      const scaled = scaleNutritionLocally(base, newMultiplier);
      return {
        ...item,
        multiplier: newMultiplier,
        customGrams: newGrams,
        currentNutrition: scaled,
      };
    });
    setDetectedItems(updated);
  };

  // Custom gram weight change
  const handleCustomGramsChange = (itemId, grams) => {
    const numGrams = Math.max(10, Math.min(2000, Number(grams) || 100));
    const updated = detectedItems.map((item) => {
      if (item.id !== itemId) return item;
      const base = item.baseNutrition;
      const baseWeight = base?.serving_weight_g || 150.0;
      const multiplier = numGrams / baseWeight;
      const scaled = scaleNutritionLocally(base, multiplier);
      return {
        ...item,
        multiplier: roundVal(multiplier, 2),
        customGrams: numGrams,
        currentNutrition: scaled,
      };
    });
    setDetectedItems(updated);
  };

  const scaleNutritionLocally = (base, ratio) => {
    if (!base) return null;
    return {
      ...base,
      serving_size: ratio === 1.0 ? base.serving_size : `${base.serving_size} (x${ratio.toFixed(1)})`,
      serving_weight_g: roundVal((base.serving_weight_g || 150) * ratio, 1),
      calories: roundVal((base.calories || 0) * ratio, 1),
      protein: roundVal((base.protein || 0) * ratio, 1),
      carbohydrates: roundVal((base.carbohydrates || 0) * ratio, 1),
      fats: roundVal((base.fats || 0) * ratio, 1),
      fibre: roundVal((base.fibre || 0) * ratio, 1),
      sugar: roundVal((base.sugar || 0) * ratio, 1),
      sodium: roundVal((base.sodium || 0) * ratio, 1),
      micronutrients: {
        calcium_mg: roundVal((base.micronutrients?.calcium_mg || 0) * ratio, 1),
        iron_mg: roundVal((base.micronutrients?.iron_mg || 0) * ratio, 2),
        vitamin_c_mg: roundVal((base.micronutrients?.vitamin_c_mg || 0) * ratio, 1),
      },
    };
  };

  const toggleItemSelection = (itemId) => {
    setDetectedItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, selected: !it.selected } : it))
    );
  };

  const toggleExplainDrawer = (itemId) => {
    setDetectedItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, showExplain: !it.showExplain } : it))
    );
  };

  // Food correction
  const openCorrectionModal = (item) => {
    setCorrectionModalItem(item);
    setSearchQuery("");
    setSearchResults([]);
  };

  const closeCorrectionModal = () => {
    setCorrectionModalItem(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchCatalog = async (q) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/food/search?q=${encodeURIComponent(q.trim())}`);
      setSearchResults(res.data.results || []);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const applyFoodCorrection = async (targetFoodKey) => {
    if (!correctionModalItem) return;
    const targetItemId = correctionModalItem.id;

    try {
      const res = await api.post("/food/correct", {
        food_name: targetFoodKey,
        serving_multiplier: correctionModalItem.multiplier || 1.0,
      });

      const newNutrition = res.data.nutrition;
      setDetectedItems((prev) =>
        prev.map((it) => {
          if (it.id !== targetItemId) return it;
          return {
            ...it,
            food: targetFoodKey,
            display_name: newNutrition.display_name || newNutrition.name || targetFoodKey,
            category: newNutrition.category || "Food",
            baseNutrition: { ...newNutrition },
            currentNutrition: { ...newNutrition },
            score: 99.0,
          };
        })
      );
      closeCorrectionModal();
    } catch (err) {
      console.error("Failed to correct food:", err);
      alert("Unable to fetch nutrition for selected food.");
    }
  };

  // Log confirmed meal to today's journal
  const logMealToToday = async () => {
    const selected = detectedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      alert("Please select at least one food item to log.");
      return;
    }

    setIsAdding(true);
    try {
      const batchPayload = {
        meal_type: mealType,
        items: selected.map((it) => {
          const nut = it.currentNutrition || it.baseNutrition || {};
          return {
            food_name: it.display_name || it.food,
            calories: nut.calories,
            protein: nut.protein,
            carbohydrates: nut.carbohydrates,
            fats: nut.fats,
            fibre: nut.fibre,
            sodium: nut.sodium,
            sugar: nut.sugar,
            calcium: nut.micronutrients?.calcium_mg,
            iron: nut.micronutrients?.iron_mg,
            vitamin_c: nut.micronutrients?.vitamin_c_mg,
            serving_size: nut.serving_size,
            serving_weight_g: nut.serving_weight_g,
            confidence: it.score,
            data_source: nut.data_source,
            meal_type: mealType,
          };
        }),
      };

      const res = await api.post("/nutrition/log-batch", batchPayload);
      setAddedSuccessfully(true);
      setAddedSummary(res.data);
    } catch (err) {
      console.error("Nutrition log failed:", err);
      if (err?.response?.status === 401) {
        alert("Please sign in or create an account to save meals to your nutrition journal.");
        navigate("/auth");
        return;
      }
      alert(err?.response?.data?.detail || "Unable to save meal to daily nutrition journal.");
    } finally {
      setIsAdding(false);
    }
  };

  // Active totals across selected dishes
  const selectedItems = detectedItems.filter((i) => i.selected);
  const activeCalories = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.calories || 0),
    0
  );
  const activeProtein = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.protein || 0),
    0
  );
  const activeCarbs = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.carbohydrates || 0),
    0
  );
  const activeFats = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.fats || 0),
    0
  );
  const activeFibre = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.fibre || 0),
    0
  );
  const activeSugar = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.sugar || 0),
    0
  );
  const activeSodium = selectedItems.reduce(
    (acc, it) => acc + (it.currentNutrition?.sodium || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[480px] w-[480px] rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute right-[-80px] top-40 h-[440px] w-[440px] rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-xs transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
              <ArrowLeft size={16} />
            </span>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-9 w-9 rounded-xl object-cover shadow-sm ring-2 ring-emerald-500/20"
            />
            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">NutriMind</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                Food Vision
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
        {/* Hero Section */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-xs backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-500" />
            Instant Meal Nutrition
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            What are you eating{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              today?
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Snap a picture or choose a photo. NutriMind identifies every dish on your plate and
            calculates verified calories, protein, and nutrients automatically.
          </p>
        </div>

        {/* Scanner Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ====================================================
              LEFT COLUMN: CAMERA / UPLOAD / INTERACTIVE PHOTO
          ==================================================== */}
          <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-7">
            {/* Card Subheader */}
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                  <ScanLine size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">Meal Capture</h2>
                  <p className="text-xs text-slate-400">Live Camera or Photo Upload</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  AI Vision Ready
                </span>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Viewfinder */}
            {isCameraActive ? (
              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400 bg-slate-950 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-80 w-full rounded-xl object-cover"
                />

                {/* Modern Viewfinder Reticle */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                    <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-emerald-400" />
                    <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-emerald-400" />
                    <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-emerald-400" />
                    <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-emerald-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="rounded-lg bg-black/50 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-xs">
                        Point at your meal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shutter controls */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
                  <button
                    onClick={stopCamera}
                    className="rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-slate-900"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95"
                  >
                    <Camera size={16} />
                    Capture Photo
                  </button>
                </div>
              </div>
            ) : !selectedImage ? (
              /* Upload Area */
              <UploadDropzone onClick={openFilePicker} onCamera={startCamera} />
            ) : (
              /* Photo Preview with Interactive Bounding Boxes */
              <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-slate-950 sm:min-h-[420px]">
                <img
                  src={selectedImage}
                  alt="Captured Meal"
                  className="h-full min-h-[380px] w-full object-cover sm:min-h-[420px]"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

                {/* Scanning Animation */}
                {isScanning && (
                  <>
                    <div className="absolute inset-x-8 top-1/2 h-0.5 animate-pulse bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.5)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-2xl border border-white/20 bg-slate-950/80 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-md">
                        <LoaderCircle size={24} className="mx-auto animate-spin text-emerald-400" />
                        <p className="mt-2 text-sm font-bold">Scanning Your Meal...</p>
                        <p className="mt-0.5 text-xs text-slate-300">
                          Recognizing dishes and calculating authentic nutrition
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Interactive Bounding Box Overlays */}
                {!isScanning &&
                  scanned &&
                  detectedItems.map((item) => {
                    if (!item.box || item.box.length < 4) return null;
                    const [x1, y1, x2, y2] = item.box;
                    if (x1 === 0 && y1 === 0 && x2 === 100 && y2 === 100) return null;

                    const isHovered = hoveredItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        onClick={() => toggleItemSelection(item.id)}
                        style={{
                          left: `${x1}%`,
                          top: `${y1}%`,
                          width: `${x2 - x1}%`,
                          height: `${y2 - y1}%`,
                        }}
                        className={`absolute cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          isHovered
                            ? "border-emerald-300 bg-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                            : item.selected
                            ? "border-emerald-400/90 bg-emerald-500/15"
                            : "border-slate-400/40 bg-slate-900/40 opacity-50"
                        }`}
                      >
                        <span className="absolute -top-7 left-1 flex items-center gap-1 rounded-md bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {item.display_name}
                        </span>
                      </div>
                    );
                  })}

                {/* Dismiss button */}
                {!isScanning && (
                  <button
                    onClick={removeImage}
                    className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-slate-900/60 text-white backdrop-blur-md transition hover:bg-red-500"
                    title="Remove Image"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* Image footer strip */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-2.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 truncate">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <ImagePlus size={14} />
                    </div>
                    <span className="truncate text-xs font-semibold text-slate-200">
                      {imageName || "Meal Photo"}
                    </span>
                  </div>

                  {scanned && (
                    <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      {detectedItems.length} {detectedItems.length === 1 ? "Dish" : "Dishes"} Detected
                    </span>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Action Buttons */}
            {selectedImage && (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={scanFood}
                  disabled={isScanning}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isScanning ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Analyzing Meal...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      {scanned ? "Re-Scan Photo" : "Analyze Meal"}
                      <ChevronRight size={16} className="transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <button
                  onClick={removeImage}
                  disabled={isScanning}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            )}
          </section>

          {/* ====================================================
              RIGHT COLUMN: DETECTED DISHES / PORTIONS / SUMMARY / LOG
          ==================================================== */}
          <div className="space-y-6">
            {!scanned ? (
              <HowItWorksCard onStartUpload={openFilePicker} onStartCamera={startCamera} />
            ) : (
              <div className="space-y-5">
                {/* Meal Classification Header */}
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                      <Utensils size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        {isMultiItem
                          ? `Multi-Dish Meal (${detectedItems.length} items detected)`
                          : `Identified Dish`}
                      </h3>
                      <p className="text-[11px] text-emerald-700">
                        Adjust portions or change any dish before saving to your journal.
                      </p>
                    </div>
                  </div>

                  {/* Meal Timing Picker */}
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                    <Clock size={12} className="text-emerald-600" />
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snack">Snack</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                {/* Detected Food Items List */}
                <div className="space-y-4">
                  {detectedItems.map((item) => {
                    const nut = item.currentNutrition || item.baseNutrition || {};
                    const isHovered = hoveredItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        className={`rounded-3xl border bg-white p-5 shadow-xs transition duration-200 ${
                          isHovered
                            ? "border-emerald-400 ring-2 ring-emerald-100"
                            : item.selected
                            ? "border-slate-200"
                            : "border-slate-200/60 opacity-60"
                        }`}
                      >
                        {/* Item Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-extrabold text-slate-900">
                                  {item.display_name}
                                </h4>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  {item.score}% Match
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{item.category}</p>
                            </div>
                          </div>

                          {/* Change dish button */}
                          <button
                            onClick={() => openCorrectionModal(item)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Edit3 size={12} />
                            Change Dish
                          </button>
                        </div>

                        {/* Nutrient Cards */}
                        <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                          <div className="rounded-xl bg-white p-2 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Calories
                            </p>
                            <p className="text-base font-black text-rose-600">
                              {nut.calories ?? "--"}
                              <span className="text-[10px] font-medium text-slate-400 ml-0.5">kcal</span>
                            </p>
                          </div>
                          <div className="rounded-xl bg-white p-2 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Protein
                            </p>
                            <p className="text-base font-black text-emerald-600">
                              {nut.protein ?? "--"}
                              <span className="text-[10px] font-medium text-slate-400 ml-0.5">g</span>
                            </p>
                          </div>
                          <div className="rounded-xl bg-white p-2 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Carbs
                            </p>
                            <p className="text-base font-black text-blue-600">
                              {nut.carbohydrates ?? "--"}
                              <span className="text-[10px] font-medium text-slate-400 ml-0.5">g</span>
                            </p>
                          </div>
                          <div className="rounded-xl bg-white p-2 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Fat
                            </p>
                            <p className="text-base font-black text-amber-600">
                              {nut.fats ?? "--"}
                              <span className="text-[10px] font-medium text-slate-400 ml-0.5">g</span>
                            </p>
                          </div>
                        </div>

                        {/* Portion Adjuster */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-1.5">
                            <Scale size={13} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Portion:</span>
                            <div className="flex gap-1">
                              {[0.5, 1.0, 1.5, 2.0].map((mult) => (
                                <button
                                  key={mult}
                                  onClick={() => handleMultiplierChange(item.id, mult)}
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    item.multiplier === mult
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {mult}x
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <input
                              type="number"
                              min="10"
                              max="2000"
                              step="10"
                              value={item.customGrams || 150}
                              onChange={(e) => handleCustomGramsChange(item.id, e.target.value)}
                              className="w-16 rounded-lg border border-slate-200 px-2 py-0.5 text-center font-bold text-slate-800 outline-none focus:border-emerald-400"
                            />
                            <span className="text-[11px] font-semibold text-slate-400">grams</span>
                          </div>
                        </div>

                        {/* Nutrition Details Drawer */}
                        <div className="mt-3">
                          <button
                            onClick={() => toggleExplainDrawer(item.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition"
                          >
                            <Info size={12} />
                            {item.showExplain ? "Hide Nutrition Details" : "Detailed Nutrients & Vitamins"}
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${item.showExplain ? "rotate-180" : ""}`}
                            />
                          </button>

                          {item.showExplain && (
                            <div className="mt-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs space-y-2">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-semibold">Fiber:</span>
                                <span className="font-bold text-slate-900">{nut.fibre ?? 0}g</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-semibold">Natural Sugar:</span>
                                <span className="font-bold text-slate-900">{nut.sugar ?? 0}g</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-semibold">Sodium:</span>
                                <span className="font-bold text-slate-900">{nut.sodium ?? 0}mg</span>
                              </div>

                              <div className="border-t border-slate-200/60 pt-2">
                                <p className="font-semibold text-slate-700 mb-1">Key Micronutrients:</p>
                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                                    <p className="text-[10px] text-slate-400">Calcium</p>
                                    <p className="font-bold text-slate-800">
                                      {nut.micronutrients?.calcium_mg || 0}mg
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                                    <p className="text-[10px] text-slate-400">Iron</p>
                                    <p className="font-bold text-slate-800">
                                      {nut.micronutrients?.iron_mg || 0}mg
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                                    <p className="text-[10px] text-slate-400">Vitamin C</p>
                                    <p className="font-bold text-slate-800">
                                      {nut.micronutrients?.vitamin_c_mg || 0}mg
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <p className="text-[10px] italic text-slate-400 pt-1">
                                Portion estimated from photo. Natural preparation methods and added cooking oils
                                may vary actual calories by ±10%.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Combined Meal Total Card */}
                <div className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Total Meal Nutrition
                      </p>
                      <h4 className="text-xl font-black">
                        {selectedItems.length} {selectedItems.length === 1 ? "Dish" : "Dishes"} Selected
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3.5 py-1.5 text-emerald-400">
                      <Flame size={17} />
                      <span className="text-xl font-black">{roundVal(activeCalories, 0)}</span>
                      <span className="text-xs">kcal</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2.5 text-center sm:grid-cols-6">
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Protein</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeProtein, 1)}g</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Carbs</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeCarbs, 1)}g</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Fats</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeFats, 1)}g</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Fibre</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeFibre, 1)}g</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Sugar</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeSugar, 1)}g</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="text-[10px] text-slate-400">Sodium</p>
                      <p className="text-sm font-bold text-white">{roundVal(activeSodium, 0)}mg</p>
                    </div>
                  </div>

                  {/* Add to Daily Journal Button */}
                  <div className="mt-6">
                    {addedSuccessfully ? (
                      <div className="rounded-2xl bg-emerald-500/20 p-4 text-center">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400">
                          <Check size={18} />
                          Meal logged to your daily journal!
                        </div>
                        {addedSummary && (
                          <p className="mt-1 text-xs text-slate-300">
                            Today's Intake: {addedSummary.today_totals?.calories} kcal ·{" "}
                            {addedSummary.today_totals?.protein}g protein
                          </p>
                        )}
                        <div className="mt-3 flex justify-center gap-2">
                          <button
                            onClick={() => navigate("/nutrition")}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400"
                          >
                            View Today's Journal
                          </button>
                          <button
                            onClick={removeImage}
                            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                          >
                            Scan Another Meal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={logMealToToday}
                        disabled={isAdding || selectedItems.length === 0}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isAdding ? (
                          <>
                            <LoaderCircle size={18} className="animate-spin" />
                            Recording to Journal...
                          </>
                        ) : (
                          <>
                            <Plus size={18} />
                            Log {selectedItems.length} {selectedItems.length === 1 ? "Dish" : "Dishes"} to {mealType}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Food Correction Modal */}
        {correctionModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Choose Correct Dish</h3>
                  <p className="text-xs text-slate-400">
                    Currently detected: <span className="font-bold text-slate-700">{correctionModalItem.display_name}</span>
                  </p>
                </div>
                <button
                  onClick={closeCorrectionModal}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Suggested Alternatives
                </p>
                <div className="mt-2 space-y-1.5">
                  {(correctionModalItem.top_predictions || []).slice(0, 4).map((cand) => (
                    <button
                      key={cand.food}
                      onClick={() => applyFoodCorrection(cand.food)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-2.5 text-left text-xs transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{cand.display_name}</span>
                        <span className="ml-2 text-[10px] text-slate-400">{cand.category}</span>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                        {cand.score}% Match
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search catalog */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Or Search Food Directory
                </p>
                <div className="relative mt-2">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Type food name (e.g. Dosa, Chicken Tikka, Rice, Apple)..."
                    value={searchQuery}
                    onChange={(e) => handleSearchCatalog(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {isSearching && (
                  <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                    <LoaderCircle size={16} className="animate-spin text-emerald-600" />
                    <span className="ml-2">Searching food directory...</span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100">
                    {searchResults.map((res) => (
                      <button
                        key={res.food_key}
                        onClick={() => applyFoodCorrection(res.food_key)}
                        className="flex w-full items-center justify-between p-2.5 text-left text-xs transition hover:bg-emerald-50"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{res.name}</p>
                          <p className="text-[10px] text-slate-400">{res.category}</p>
                        </div>
                        <span className="font-bold text-emerald-700">{res.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function roundVal(num, dec = 1) {
  if (num === null || num === undefined) return 0;
  return Number(Number(num).toFixed(dec));
}

// Clean and warm upload dropzone
function UploadDropzone({ onClick, onCamera }) {
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/40 p-8 text-center sm:min-h-[420px]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-xl shadow-emerald-100 transition duration-300 hover:scale-105">
        <Camera size={34} strokeWidth={1.8} />
      </div>

      <h3 className="mt-6 text-xl font-extrabold text-slate-950">Add your meal</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        Take a live photo or upload an image of your food to get instant nutritional insights.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
        >
          <ImagePlus size={15} />
          Upload Food Photo
        </button>

        <button
          onClick={onCamera}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
        >
          <Camera size={15} />
          Use Camera
        </button>
      </div>

      <p className="mt-4 text-[11px] text-slate-400 font-medium">Supports JPG, PNG, and WEBP images</p>
    </div>
  );
}

// User-friendly How It Works card
function HowItWorksCard({ onStartUpload, onStartCamera }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xs backdrop-blur-xl sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Smart Vision</p>
            <h3 className="text-base font-extrabold text-slate-900">How to get the best scan</h3>
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          <TipRow
            icon="📸"
            title="Good Lighting & Angle"
            desc="Hold your phone directly above or at a 45° angle with clear lighting."
          />
          <TipRow
            icon="🥗"
            title="Separated Dishes"
            desc="Meals with distinct bowls or dishes are detected individually with separate calories."
          />
          <TipRow
            icon="⚖️"
            title="Adjustable Portions"
            desc="You can easily adjust portion sizes (0.5x, 1x, 2x, or grams) after scanning."
          />
        </div>
      </div>

      {/* Trust & Accuracy Card */}
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-6 shadow-2xs">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h4 className="text-xs font-black uppercase tracking-wider">Verified Nutrition Data</h4>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-emerald-950 font-medium">
          NutriMind cross-references dish ingredients against official nutritional research standards to
          calculate authentic calories, proteins, carbohydrates, and healthy fats.
        </p>
      </div>
    </div>
  );
}

function TipRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default FoodScanner;
