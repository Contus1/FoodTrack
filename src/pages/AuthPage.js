import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (isSignUp && formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          username: formData.username,
        });

        if (error) {
          setMessage(error.message);
        } else {
          setSuccess(true);
          setMessage(
            `Account created! Please check your email (${formData.email}) to confirm your account before signing in.`,
          );
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          setMessage(error.message);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setMessage(
        isSignUp
          ? "Signup failed. Please try again."
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setMessage("");
    setSuccess(false);
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🍽️</h1>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp
              ? "Start tracking your food journey today"
              : "Sign in to your Food Diary account"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success && isSignUp ? (
            <div className="text-center">
              <div className="text-green-600 text-lg mb-4">
                ✅ Account Created!
              </div>
              <div className="text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium mb-2">📧 Check Your Email</p>
                <p>We've sent a confirmation email to:</p>
                <p className="font-medium text-blue-600">{formData.email}</p>
                <p className="mt-2">
                  Please click the confirmation link before signing in.
                </p>
              </div>
              <button
                onClick={switchMode}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required={isSignUp}
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                {isSignUp && (
                  <p className="mt-1 text-xs text-gray-500">
                    ⚠️ You'll need to confirm this email address
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={
                      isSignUp
                        ? "Create a password (min 6 characters)"
                        : "Enter your password"
                    }
                  />
                </div>
                {isSignUp && (
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 6 characters required
                  </p>
                )}
              </div>

              {message && (
                <div
                  className={`text-sm text-center p-3 rounded-md ${
                    success
                      ? "text-green-700 bg-green-50 border border-green-200"
                      : "text-red-700 bg-red-50 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? isSignUp
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    onClick={switchMode}
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    {isSignUp ? "Sign in here" : "Sign up here"}
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
