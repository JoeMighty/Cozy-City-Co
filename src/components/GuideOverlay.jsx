import { useState, useEffect } from 'react'

const STEPS = [
  {
    id: 'welcome',
    text: "Welcome to Cozy City Co.! I'm Namratha. I'll be your guide as we build a beautiful, cozy space together.",
    nextText: "Let's start!"
  },
  {
    id: 'roads',
    text: "Every great city starts with a path. Select the 'Roads' tool below and click on the grid to lay down some connections.",
    nextText: "Got it"
  },
  {
    id: 'buildings',
    text: "Perfect! Now, let's add some life. Select 'Buildings' to place minimalist geometric homes and offices.",
    nextText: "Next"
  },
  {
    id: 'nature',
    text: "A cozy city needs nature. Use 'Parks' and 'Water' to create serene spots for your citizens.",
    nextText: "Let's build!"
  }
]

export function GuideOverlay() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const step = STEPS[currentStep]

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsVisible(false)
    }
  }

  return (
    <div className="guide-overlay">
      <div className="guide-content">
        <div className="guide-avatar">
          <img src="/assets/namratha.png" alt="Namratha" />
          <div className="avatar-ring"></div>
        </div>
        <div className="guide-message">
          <h3>Namratha</h3>
          <p>{step.text}</p>
          <button onClick={next}>{step.nextText}</button>
        </div>
      </div>
    </div>
  )
}
