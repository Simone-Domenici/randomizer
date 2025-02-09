// pages/Randomizer.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Converte coordinate polari in coordinate cartesiane
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

// Crea la descrizione di un arco in SVG per disegnare uno spicchio
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = (endAngle - startAngle) <= 180 ? "0" : "1";
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

// Genera un colore casuale in formato HEX
const getRandomColor = () =>
  '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

/**
 * Calcola la rotazione (in gradi) da applicare all'etichetta di uno spicchio,
 * in modo che il testo risulti orientato "dal centro verso l'esterno" e, idealmente,
 * rimanga leggibile (ossia con un angolo assoluto minore o uguale a 90°).
 *
 * Il calcolo prevede due opzioni (aggiungendo o sottraendo 90°) e sceglie quella con
 * valore assoluto minore; in caso di parità viene scelta la seconda opzione.
 */
function getTextRotation(midAngle) {
  let option1 = midAngle - 90;
  let option2 = midAngle + 90;
  // Normalizza in [-180, 180]:
  option1 = ((option1 + 180) % 360) - 180;
  option2 = ((option2 + 180) % 360) - 180;
  if (Math.abs(option1) === Math.abs(option2)) {
    return option2;
  }
  return Math.abs(option1) < Math.abs(option2) ? option1 : option2;
}

function Randomizer() {
  const [items, setItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [copies, setCopies] = useState(1);
  const [spinAngle, setSpinAngle] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // Aggiunge uno o più oggetti (con colore casuale iniziale)
  const addItem = (e) => {
    e.preventDefault();
    if (!itemInput.trim()) return;
    const newItems = [];
    for (let i = 0; i < copies; i++) {
      newItems.push({
        id: Date.now() + Math.random(),
        name: itemInput.trim(),
        color: getRandomColor(),
      });
    }
    setItems([...items, ...newItems]);
    setItemInput('');
    setCopies(1);
  };

  // Rimuove una copia in base all'ID
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Rimuove tutte le copie aventi lo stesso nome
  const removeAllOfName = (name) => {
    setItems(items.filter(item => item.name !== name));
  };

  // Mescola l'array degli oggetti
  const shuffleItems = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  };

  // Ordina alfabeticamente gli oggetti
  const sortItemsAlphabetically = () => {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    setItems(sorted);
  };

  // Aggiorna il colore di un oggetto tramite color picker
  const updateColor = (id, newColor) => {
    setItems(items.map(item => item.id === id ? { ...item, color: newColor } : item));
  };

  // Funzione per far girare la ruota
  const spinWheel = () => {
    if (items.length === 0) return;
    setSpinning(true);
    const n = items.length;
    const segmentAngle = 360 / n;
    const randomIndex = Math.floor(Math.random() * n);
    // Per lo spicchio vincente definiamo in modo standard inizio e fine
    const startAngle = randomIndex * segmentAngle;
    const endAngle = (randomIndex + 1) * segmentAngle;
    const margin = Math.min(5, segmentAngle / 4);
    const randomAngle = startAngle + margin + Math.random() * (segmentAngle - 2 * margin);
    // Calcola la rotazione target affinché il punto scelto arrivi in alto (0°)
    const currentRotation = spinAngle % 360;
    const targetRotation = (360 - randomAngle) % 360;
    let additionalRotation = targetRotation - currentRotation;
    if (additionalRotation < 0) additionalRotation += 360;
    additionalRotation += 360 * 3; // almeno 3 giri completi
    const newSpinAngle = spinAngle + additionalRotation;
    setSpinAngle(newSpinAngle);
    setTimeout(() => {
      setSelectedItem(items[randomIndex]);
      setSpinning(false);
    }, 4000);
  };

  // Gira nuovamente la ruota (nasconde il popup e richiama spinWheel())
  const spinAgain = () => {
    setSelectedItem(null);
    spinWheel();
  };

  // Parametri per il rendering SVG della ruota
  const svgSize = 400;
  const radius = 180;
  const center = svgSize / 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#1e293b] text-white p-8">
      <h1 className="text-5xl font-bold text-center mb-12">Wheel</h1>
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Colonna della ruota */}
        <div className="flex-1 flex flex-col items-center relative">
          <div className="relative" style={{ width: svgSize, height: svgSize }}>
            <motion.svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              animate={{ rotate: spinAngle }}
              transition={{ duration: 4, ease: 'easeOut' }}
            >
              <g transform={`translate(${center},${center})`}>
                {items.length === 0 ? (
                  // Ruota placeholder con colore diverso dal background
                  <g>
                    <circle cx="0" cy="0" r={radius} fill="#2d3748" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x="0"
                      y="0"
                      fill="#fff"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      style={{ fontSize: '24px' }}
                    >
                      Ruota vuota
                    </text>
                  </g>
                ) : items.length === 1 ? (
                  // Se c'è un solo elemento, disegna un cerchio intero con il colore dell'oggetto
                  (() => {
                    const item = items[0];
                    return (
                      <g>
                        <circle cx="0" cy="0" r={radius} fill={item.color} stroke="#ffffff" strokeWidth="2" />
                        <text
                          x="0"
                          y="0"
                          fill="#fff"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          style={{ fontSize: '20px', pointerEvents: 'none' }}
                        >
                          {item.name}
                        </text>
                      </g>
                    );
                  })()
                ) : (
                  // Con due o più elementi, disegna ciascuno spicchio
                  items.map((item, index) => {
                    const n = items.length;
                    const startAngle = index * (360 / n);
                    const endAngle = (index + 1) * (360 / n);
                    const path = describeArc(0, 0, radius, startAngle, endAngle);
                    const midAngle = (startAngle + endAngle) / 2;
                    const textPos = polarToCartesian(0, 0, radius * 0.6, midAngle);
                    const rotation = getTextRotation(midAngle);
                    return (
                      <g key={item.id}>
                        <path d={path} fill={item.color} stroke="#ffffff" strokeWidth="2" />
                        <text
                          x={textPos.x}
                          y={textPos.y}
                          transform={`rotate(${rotation}, ${textPos.x}, ${textPos.y})`}
                          fill="#fff"
                          textAnchor="middle"
                          // Impostiamo alignmentBaseline a "text-after-edge" (o "alphabetic")
                          // così che la "base" del testo (cioè il lato che dovrebbe puntare verso il centro)
                          // risulti ben posizionata.
                          alignmentBaseline="text-after-edge"
                          style={{ fontSize: '16px', pointerEvents: 'none' }}
                        >
                          {item.name}
                        </text>
                      </g>
                    );
                  })
                )}
              </g>
            </motion.svg>
            {/* Puntatore fisso: il triangolo (definito con "0,0 100,0 50,100") è posizionato in alto */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <svg width="40" height="40" viewBox="0 0 100 100">
                <polygon points="0,0 100,0 50,100" fill="#ffffff" />
              </svg>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <button
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
              onClick={spinWheel}
              disabled={spinning || items.length === 0}
            >
              {spinning ? 'Girando...' : 'Gira la ruota'}
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
              onClick={shuffleItems}
              disabled={spinning || items.length === 0}
            >
              Shuffle
            </button>
            <button
              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 disabled:opacity-50"
              onClick={sortItemsAlphabetically}
              disabled={spinning || items.length === 0}
            >
              Ordina Alfabeticamente
            </button>
          </div>
        </div>
        {/* Colonna dei controlli */}
        <div className="flex-1">
          <form onSubmit={addItem} className="mb-8 bg-gray-800 p-6 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Aggiungi Oggetto</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                placeholder="Nome oggetto"
                className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <label className="font-semibold">Numero di copie:</label>
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  min="1"
                  className="w-16 px-2 py-1 rounded bg-gray-700 border border-gray-600 focus:outline-none"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500">
                Aggiungi alla ruota
              </button>
            </div>
          </form>
          <div className="bg-gray-800 p-6 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Modifica e Rimuovi Oggetti</h2>
            {items.length === 0 ? (
              <p className="text-gray-400 italic">Nessun oggetto aggiunto.</p>
            ) : (
              <ul className="space-y-4">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span className="w-1/3">{item.name}</span>
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => updateColor(item.id, e.target.value)}
                      className="w-10 h-10 p-0 border-none bg-transparent"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="px-3 py-1 bg-red-600 rounded hover:bg-red-500"
                    >
                      Rimuovi
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Modal popup per il risultato */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
            <h2 className="text-2xl mb-4">Estratto: {selectedItem.name}</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <button
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
                onClick={spinAgain}
              >
                Gira nuovamente
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
                onClick={() => {
                  removeItem(selectedItem.id);
                  setSelectedItem(null);
                }}
              >
                Rimuovi questo oggetto
              </button>
              <button
                className="px-4 py-2 bg-red-800 rounded hover:bg-red-700"
                onClick={() => {
                  removeAllOfName(selectedItem.name);
                  setSelectedItem(null);
                }}
              >
                Rimuovi tutti &quot;{selectedItem.name}&quot;
              </button>
            </div>
            <button
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              onClick={() => setSelectedItem(null)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Randomizer;
