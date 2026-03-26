import { useState, useEffect } from 'react'
import namrathaImg from '../assets/namratha.png'

export function GuideOverlay({ cityName, setCityName, stats, grid }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const STEPS = [
    {
      id: 'welcome',
      text: `Welcome to ${cityName || 'your city'}! I'm Namratha. Let's build a cozy space together. First, give your city a name!`,
      nextText: "Let's Go!",
      check: () => cityName.length > 3
    },
    {
      id: 'roads',
      text: "Every great city starts with a path. Use the 'Roads' tool to place at least 5 segments.",
      nextText: "I'm on it",
      check: () => {
        let count = 0;
        grid.data.forEach(r => r.forEach(c => { if(c === 'road' || c === 'dirt-road') count++ }));
        return count >= 5;
      }
    },
    {
      id: 'population',
      text: "We need some citizens! Build enough Houses or Apartments to reach a population of 20.",
      nextText: "Working on it",
      check: () => stats.population >= 20
    },
    {
      id: 'parks',
      text: "Beautiful! Now let's add a touch of nature. Place 3 Parks or Ponds to keep everyone happy.",
      nextText: "Nature calls!",
      check: () => {
        let count = 0;
        grid.data.forEach(r => r.forEach(c => { 
          const b = getBuildingById(c);
          if(b?.type === 'park' || b?.type === 'water') count++;
        }));
        return count >= 3;
      }
    },
    {
      id: 'done',
      text: "You're doing amazing! You've mastered the basics. Keep building your masterpiece!",
      nextText: "Finish Guide",
      check: () => true
    }
  ]

  const step = STEPS[currentStep]
  const isSatisfied = step.check()

  if (!isVisible) return null

  const next = () => {
    if (isSatisfied) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setIsVisible(false)
      }
    }
  }

  return (
    <div className="guide-overlay">
      <div className="guide-content">
        <div className="guide-avatar">
          <img src={namrathaImg} alt="Namratha" />
          <div className="avatar-ring"></div>
        </div>
        <div className="guide-message">
          <h3>Namratha</h3>
          <p>{step.text}</p>
          
          {step.id === 'welcome' && (
            <div className="guide-input-field">
              <input type="text" value={cityName} onChange={(e) => setCityName(e.target.value)} autoFocus />
            </div>
          )}
          
          <div className="guide-task-status">
            {isSatisfied ? "✅ Task Complete!" : "⏳ In Progress..."}
          </div>

          <button onClick={next} disabled={!isSatisfied} className={!isSatisfied ? 'disabled' : ''}>
            {step.nextText}
          </button>
        </div>
      </div>
    </div>
  )
}
