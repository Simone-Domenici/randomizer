import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Randomizer from './pages/Randomizer';
import './index.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <motion.h1 
          className="text-4xl font-bold my-10" 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Randomizer App
        </motion.h1>
        <Routes>
          <Route path="/" element={<Randomizer />} />
        </Routes>
      </div>
    </Router>
  );
}
