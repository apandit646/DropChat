import { useState } from "react";

export default function VerifyOtp() {
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setNumber(value);
      setError("");
    } else {
      setError("Please enter a valid 4-digit number.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Enter 4-Digit Number</h2>
        <input
          type="text"
          value={number}
          onChange={handleChange}
          className="form-control block w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={4}
          placeholder="1234"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}