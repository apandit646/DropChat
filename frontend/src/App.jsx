import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navebar from './components/Navebar';
import VerifyOtp from './components/VerifyOtp';
import Phone from './components/Phone';

function App() {
  return (
    <BrowserRouter>
      <Navebar />
      <Routes>
        <Route path="/" element={<Phone />} />
        <Route path="/verify" element={<VerifyOtp />} />
      </Routes>
     
    </BrowserRouter>
  );
}

export default App;
