import React from 'react';

function App() {
  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h1>Form Builder - Dinamik Kurallı Form Tasarımcısı</h1>
        <p>Backend API: <a href="http://localhost:3000/health" target="_blank" rel="noreferrer">http://localhost:3000/health</a></p>
      </header>
      <main style={{ padding: '20px' }}>
        <h2>Proje Özellikleri:</h2>
        <ul>
          <li>Sürükle-bırak form tasarımı</li>
          <li>Dinamik doğrulama kuralları</li>
          <li>Kural motoru ile koşullu görünürlük</li>
          <li>React + TypeScript frontend</li>
          <li>NestJS + PostgreSQL backend</li>
        </ul>
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Backend Durumu:</h3>
          <p>Backend çalışıyor: <a href="http://localhost:3000/health" target="_blank" rel="noreferrer">Test et</a></p>
          <p>Frontend çalışıyor: <strong>✓</strong> (şu anda bu sayfayı görüyorsun)</p>
        </div>
      </main>
    </div>
  );
}

export default App;