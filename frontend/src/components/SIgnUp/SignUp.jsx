import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../supabaseClient";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    SignUpNewUser,
    signInWithGoogle,
    signInWithGitHub,
    refreshUserProfile,
  } = UserAuth();
  const navigate = useNavigate();

  // Password validation helper
  const validatePassword = (pwd) => {
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!specialChar.test(pwd))
      return "Password must contain at least one special character.";
    return "";
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const err = validatePassword(e.target.value);
    setPasswordError(err);
    // Also check confirm password if already entered
    if (confirmPassword && e.target.value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      toast.error("Full name is required.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (passwordError) {
      setError(passwordError);
      toast.error(passwordError);
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      toast.error(confirmPasswordError);
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const {
        success,
        data,
        error: signUpError,
      } = await SignUpNewUser(email, password, fullName);
      setLoading(false);
      if (!success) {
        let isInvalidEmail = false;
        let isEmailExists = false;
        if (
          signUpError?.toLowerCase().includes("already exists") ||
          signUpError?.toLowerCase().includes("already registered") ||
          signUpError?.toLowerCase().includes("duplicate")
        ) {
          isEmailExists = true;
        }
        if (
          signUpError?.toLowerCase().includes("email") ||
          signUpError?.toLowerCase().includes("invalid")
        ) {
          isInvalidEmail = true;
        }
        if (signUpError?.toLowerCase().includes("network")) {
          setError(
            "Network error. Please check your connection and try again."
          );
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else if (isEmailExists) {
          setError("This email is already registered. Please login.");
          toast.error("This email is already registered. Please login.");
        } else if (isInvalidEmail) {
          setError("Invalid email address.");
          toast.error("Invalid email address.");
        } else {
          setError(signUpError || "Sign up failed. Please try again.");
          toast.error(signUpError || "Sign up failed. Please try again.");
        }
        setTimeout(() => setError(null), 3000);
        return; // Do not navigate if email is invalid or already exists
      }
      // Only navigate if signup succeeded and OTP is sent
      toast.success(
        "Registration successful! Please check your email for an OTP to verify your account."
      );
      navigate("/otp-verification", {
        state: {
          email: email,
          type: "signup_confirmation",
        },
      });
    } catch (err) {
      setLoading(false);
      setError("Unexpected error. Please try again.");
      toast.error("Unexpected error. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-[#F3F6F2] bg-opacity-50 backdrop-blur-lg shadow-xl rounded-lg p-8 sm:p-10 transform scale-95 animate-[popIn_0.3s_ease-out_forwards]"
      >
        <div className="relative flex items-center justify-center">
          {" "}
          {}
          <h2 className="text-2xl font-bold pb-2 text-center text-[#C79745]">
            {" "}
            {}
            Create Account
          </h2>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute right-0 top-0 p-1"
          >
            <XMarkIcon className="h-8 w-8 p-1 text-[#2B3333] hover:bg-[#C79745] rounded-full" />
          </button>
        </div>
        <p className="text-center text-sm text-gray-700 mb-6">
          {" "}
          {}
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-[#C79745] hover:text-[#b3863c] hover:underline"
          >
            {" "}
            {}
            Sign in
          </Link>
        </p>

        <div className="flex flex-col py-2">
          <input
            onChange={(e) => setFullName(e.target.value)}
            className="p-3 mt-1 border border-gray-300 text-[#2b3333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745]"
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Full Name"
            required
            value={fullName}
          />
        </div>
        <div className="flex flex-col py-2">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="p-3 mt-1 border border-gray-300 text-[#2b3333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745]"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            required
          />
        </div>
        <div className="flex flex-col py-2 relative">
          <input
            onChange={handlePasswordChange}
            value={password}
            className="p-3 pr-10 mt-1 border border-gray-300 text-[#2b3333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745]"
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[1.7rem] text-[#2b3333] hover:text-[#C79745]"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {passwordError && (
            <p className="text-red-600 text-xs pt-1">{passwordError}</p>
          )}
        </div>

        <div className="flex flex-col py-2 relative">
          <input
            onChange={handleConfirmPasswordChange}
            value={confirmPassword}
            className="p-3 pr-10 mt-1 border border-gray-300 text-[#2b3333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745]"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-[1.7rem] text-[#2b3333] hover:text-[#C79745]"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {confirmPasswordError && (
            <p className="text-red-600 text-xs pt-1">{confirmPasswordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-4 py-3 rounded-lg text-white transition duration-300 ${
            loading
              ? "bg-[#2B3333]/70 cursor-not-allowed"
              : "bg-[#2B3333] hover:shadow-lg shadow-[#2B3333]"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating Account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <div className="flex flex-col py-2">
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-2"
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);

              const { success, error: googleError } = await signInWithGoogle();
              setLoading(false);
              if (!success) {
                setError(googleError || "Google sign-up failed.");
                toast.error(googleError || "Google sign-up failed.");
              } else {
                toast.success("Signed up with Google! ");
              }
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5 mr-2"
            />
            Continue with Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const { success, error: githubError } = await signInWithGitHub();
              setLoading(false);
              if (!success) {
                setError(githubError || "GitHub sign-up failed.");
                toast.error(githubError || "GitHub sign-up failed.");
              } else {
                toast.success(
                  "Signed up with GitHub! Check email for OTP if new user."
                );
              }
            }}
          >
            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub"
              className="h-5 w-5 mr-2"
            />
            Continue with GitHub
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-center pt-4 text-sm">{error}</p>
        )}
      </form>
      {}
      <style>
        {`
          @keyframes popIn {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
            input::-ms-reveal,

            input::-ms-clear {
            display: none;
          }

            input::-webkit-credentials-auto-fill-button {
              display: none !important;
            }

        `}
      </style>
    </div>
  );
};

export default SignUp;
