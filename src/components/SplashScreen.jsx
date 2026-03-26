import { useState, useEffect } from 'react'

export function SplashScreen({ onComplete }) {
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleStart = (initialBalance) => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onComplete(initialBalance)
    }, 800)
  }

  if (!isVisible) return null

  return (
    <div className={`splash-screen ${isClosing ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-icon">🏙️</div>
          <h1>Cozy City Co.</h1>
          <p>A minimalist isometric builder for peaceful minds.</p>
        </div>
        
        <div className="splash-features">
          <div className="feature-pill">✨ Unique 3D Assets</div>
          <div className="feature-pill">🌊 Dynamic Water</div>
          <div className="feature-pill">👩‍🏫 Interactive Guide</div>
        </div>

        <div className="mode-selection">
          <button className="mode-button standard" onClick={() => handleStart(100000)}>
            <div className="mode-icon">💰</div>
            <div className="mode-info">
              <h3>Standard</h3>
              <span>Start with $100,000</span>
            </div>
          </button>
          
          <button className="mode-button sandbox" onClick={() => handleStart(9999999)}>
            <div className="mode-icon">♾️</div>
            <div className="mode-info">
              <h3>Sandbox</h3>
              <span>Infinite Possibilities</span>
            </div>
          </button>
        </div>

        <div className="splash-footer">
          Created with <span className="heart">❤</span> by JoeMighty
        </div>
      </div>
      
      <div className="splash-bg-overlay"></div>
    </div>
  )
}
