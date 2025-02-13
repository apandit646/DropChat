import { useState } from "react";

const Phone = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/otp/send-otp",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone }),

      })
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Error sending OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/otp/verify-otp",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp }),
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Phone OTP Verification</h2>
        
        <input
          type="tel"
          placeholder="Enter Phone Number"
          className="w-full px-4 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-4 py-2 border rounded-md mt-4 focus:ring-2 focus:ring-green-500"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition mt-3 disabled:bg-gray-400"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default Phone;
