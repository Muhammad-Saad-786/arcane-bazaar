import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from "react-icons/hi";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const nationalities = [
  "American",
  "British",
  "Canadian",
  "Australian",
  "Filipino",
  "Indonesian",
  "Malaysian",
  "Pakistani",
  "Indian",
  "Singaporean",
  "Other",
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Philippines",
  "Indonesia",
  "Malaysia",
  "Pakistan",
  "India",
  "Singapore",
  "Other",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - 18 - i,
);

export default function SellerDetails() {
  const navigate = useNavigate();
  const [sellerType, setSellerType] = useState("individual");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    nationality: "",
    personalCode: "",
    street: "",
    city: "",
    country: "",
    postalCode: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to Terms of Service and Seller Agreement");
      return;
    }
    if (
      !form.firstName ||
      !form.lastName ||
      !form.nationality ||
      !form.country
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    // In production: redirect to Ondato
    setTimeout(() => {
      setLoading(false);
      toast.success("Redirecting to Ondato for ID verification...");
      // window.location.href = 'ONDA TO_VERIFICATION_URL'
      navigate("/seller-dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineShieldCheck className="w-8 h-8 text-arcane-purple" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Seller ID{" "}
            <span className="text-arcane-gold-light">Verification</span>
          </h1>
          <p className="text-text-secondary mt-3">
            Please fill out the form below to verify your identity. Make sure
            your details are correct as changes won't be possible during this
            attempt.
          </p>
        </motion.div>

        {/* Seller Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Seller Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSellerType("individual")}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                sellerType === "individual"
                  ? "border-arcane-purple bg-arcane-purple/10"
                  : "border-arcane-border hover:border-white/10"
              }`}
            >
              <HiOutlineUser
                className={`w-6 h-6 ${sellerType === "individual" ? "text-arcane-purple" : "text-text-muted"} mb-2`}
              />
              <h3 className="text-white font-semibold text-sm">Individual</h3>
              <p className="text-text-muted text-xs mt-1">
                I'm selling as a private individual
              </p>
            </button>
            <button
              onClick={() => setSellerType("company")}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                sellerType === "company"
                  ? "border-arcane-purple bg-arcane-purple/10"
                  : "border-arcane-border hover:border-white/10"
              }`}
            >
              <HiOutlineOfficeBuilding
                className={`w-6 h-6 ${sellerType === "company" ? "text-arcane-purple" : "text-text-muted"} mb-2`}
              />
              <h3 className="text-white font-semibold text-sm">Company</h3>
              <p className="text-text-muted text-xs mt-1">
                I'm selling on behalf of a registered business
              </p>
            </button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
        >
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">
              Enter Your Details
            </h2>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="input-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  placeholder="Middle name"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="input-glass"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Date of Birth *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  name="birthYear"
                  value={form.birthYear}
                  onChange={handleChange}
                  className="input-glass"
                  required
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  name="birthMonth"
                  value={form.birthMonth}
                  onChange={handleChange}
                  className="input-glass"
                  required
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  name="birthDay"
                  value={form.birthDay}
                  onChange={handleChange}
                  className="input-glass"
                  required
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nationality & TIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Nationality *
                </label>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="input-glass"
                  required
                >
                  <option value="">Select nationality</option>
                  {nationalities.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Personal Code / TIN *
                </label>
                <input
                  type="text"
                  name="personalCode"
                  value={form.personalCode}
                  onChange={handleChange}
                  placeholder="Personal code/TIN"
                  className="input-glass"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street address"
                className="input-glass"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="input-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Country *
                </label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="input-glass"
                  required
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Enter code"
                  className="input-glass"
                  required
                />
              </div>
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-3 pt-4 border-t border-arcane-border">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-arcane-border bg-arcane-surface text-arcane-purple focus:ring-arcane-purple"
              />
              <label className="text-sm text-text-secondary">
                By clicking Continue, you agree to{" "}
                <Link
                  to="/terms"
                  className="text-arcane-purple hover:text-arcane-gold-light"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/terms"
                  className="text-arcane-purple hover:text-arcane-gold-light"
                >
                  Seller Agreement
                </Link>
                .
              </label>
            </div>

            {/* Ondato Notice */}
            <div className="p-4 rounded-xl bg-arcane-purple/5 border border-arcane-purple/10 flex items-start gap-3">
              <HiOutlineShieldCheck className="w-5 h-5 text-arcane-purple flex-shrink-0 mt-0.5" />
              <p className="text-text-secondary text-xs">
                You'll be redirected to{" "}
                <span className="text-white font-medium">Ondato</span> to
                confirm your ID using a passport, ID card, or driver's license.
                It only takes a few minutes.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "Redirecting to Ondato..."
              ) : (
                <>
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Continue to Ondato Verification
                  <HiOutlineArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
