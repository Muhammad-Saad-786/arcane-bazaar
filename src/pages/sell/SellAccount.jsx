import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from "react-icons/hi";
import useCreateListingStore from "../../stores/useCreateListingStore";
import GameSelectStep from "../../components/sell/GameSelectStep";
import CategorySelectStep from "../../components/sell/CategorySelectStep";
import ListingDetailsStep from "../../components/sell/ListingDetailsStep";
import PreviewStep from "../../components/sell/PreviewStep";
import Button from "../../components/ui/Button";

const steps = ["Select Game", "Category", "Details", "Preview"];

export default function SellAccount() {
  const {
    currentStep,
    totalSteps,
    loading,
    fetchGames,
    nextStep,
    prevStep,
    validateCurrentStep,
    submitListing,
    reset,
  } = useCreateListingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleNext = () => {
    // Validate current step before advancing
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    const result = await submitListing();
    if (result.success) {
      reset();
      navigate("/seller-dashboard/listings");
    }
  };

  return (
    <div className="min-h-screen bg-[#141319] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Create Listing
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Fill in the details to list your game assets or services for sale
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i + 1 <= currentStep
                    ? "bg-arcane-gold text-[#141319]"
                    : "bg-[#1E1D24] text-text-muted"
                }`}
              >
                {i + 1 < currentStep ? "✓" : i + 1}
              </div>
              <span
                className={`hidden sm:block text-sm ${
                  i + 1 <= currentStep
                    ? "text-arcane-gold font-medium"
                    : "text-text-muted"
                }`}
              >
                {step}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    i + 1 < currentStep ? "bg-arcane-gold" : "bg-[#2A2932]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8 bg-[#18171E] border border-[#2A2932] rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <GameSelectStep />}
              {currentStep === 2 && <CategorySelectStep />}
              {currentStep === 3 && <ListingDetailsStep />}
              {currentStep === 4 && <PreviewStep />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2A2932]">
            <button
              type="button"
              onClick={currentStep === 1 ? () => navigate(-1) : prevStep}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />{" "}
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} variant="gold" size="md">
                Next <HiOutlineArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="gold"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  "Publishing..."
                ) : (
                  <>
                    <HiOutlineCheck className="w-5 h-5" /> Publish Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
