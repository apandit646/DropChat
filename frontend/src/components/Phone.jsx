import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Phone = ({ setIsLoggedIn }) => {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });

  const navigate = useNavigate();

  const countryCodes = [
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "IN" },
    { code: "+61", country: "AU" },
    { code: "+86", country: "CN" },
    { code: "+81", country: "JP" },
    { code: "+65", country: "SG" },
    { code: "+971", country: "UAE" },
  ];

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      setMessage("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: `${countryCode}${phone}` }),
      });

      const data = await response.json();
      setMessage(data.message || "OTP sent successfully!");
      setShowOtpInput(true);
    } catch (error) {
      setMessage("Error sending OTP. Please try again.");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setMessage("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
      });

      const data = await response.json();
      console.log(data, "<<<<<<<<<<<<<");
      if (response.ok) {
        setMessage("OTP verified successfully!");
        setShowUserDetailsModal(true);
      }
    } catch (error) {
      setMessage("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOtp = () => {
    setOtp("");
    sendOtp();
  };

  const handleUserDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!userDetails.name || !userDetails.email) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/user/details ", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: `${countryCode}${phone}`,
          name: userDetails.name,
          email: userDetails.email,
        }),
      });

      const data = await response.json();
      console.log(data, "<<<<<<<<<<<<<");
      if (response.status === 200) {
        await localStorage.setItem("token", data.token);
        await localStorage.setItem("name", data.name);
        await localStorage.setItem("userId", data.id);
        await localStorage.setItem("email", data.email);
        setIsLoggedIn(true);
        navigate("/chat");
      }
    } catch (error) {
      setMessage("Error saving details. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Phone Verification
        </h2>

        {!showOtpInput ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} {country.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Enter Phone Number"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 text-center mb-4">
              OTP sent to {countryCode} {phone}
              <button
                onClick={() => setShowOtpInput(false)}
                className="ml-2 text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full text-blue-500 text-sm hover:text-blue-600"
            >
              Resend OTP
            </button>
          </div>
        )}

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("Error") || message.includes("Invalid")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Complete Your Profile
            </h3>
            <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userDetails.email}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save Details"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserDetailsModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phone;
