import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");  // Fixed: Added phone state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { firstName, lastName, email, phone, password, confirmPassword };
    navigate("/verify")

    try {
      const response = await fetch("http://localhost:8000/verify/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      alert("✨ Registration Successful! 🚀");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");  // Clear phone state
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
      
    } catch (error) {
      alert(`❌ Registration Failed: ${error.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 flex items-center justify-center p-4"
    >
      <motion.div
        className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border-4 border-sky-300"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h1 className="text-4xl font-bold text-center text-sky-600 mb-8 tracking-wide">
          Sign Up
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: "First Name", type: "text", value: firstName, onChange: setFirstName },
            { label: "Last Name", type: "text", value: lastName, onChange: setLastName },
            { label: "Email", type: "email", value: email, onChange: setEmail },
            { label: "Phone Number", type: "tel", value: phone, onChange: setPhone }, // Fixed: Added phone input
            { label: "Password", type: "password", value: password, onChange: setPassword },
            { label: "Confirm Password", type: "password", value: confirmPassword, onChange: setConfirmPassword }
          ].map(({ label, type, value, onChange }) => (
            <motion.div 
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block text-sky-700 font-medium mb-2">{label}</label>
              <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-sky-50 border-2 border-sky-300 rounded-xl text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </motion.div>
          ))}
          
          <motion.button 
            type="submit" 
            className="w-full bg-sky-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-sky-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Account
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
