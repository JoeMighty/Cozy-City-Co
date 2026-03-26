import { useState, useEffect } from 'react'

export function SplashScreen({ onComplete }) {
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleStart = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onComplete()
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

        <button className="start-button" onClick={handleStart}>
          <span className="button-text">Start Building</span>
          <div className="button-glow"></div>
        </button>

        <div className="splash-footer">
          Created with <span className="heart">❤</span> by JoeMighty
        </div>
      </div>
      
      <div className="splash-bg-overlay"></div>
    </div>
  )
}
