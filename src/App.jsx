import { useState, useRef, useEffect } from 'react'
import { Hammer, Pickaxe, Trees, Droplets, Map as MapIcon, Plus, Minus } from 'lucide-react'
import { IsometricGrid } from './engine/IsometricGrid'
import { GuideOverlay } from './components/GuideOverlay'
import { BUILDING_CATEGORIES, getBuildingById } from './engine/BuildingRegistry'
import './styles/index.css'

function App() {
  const canvasRef = useRef(null)
  const [activeTool, setActiveTool] = useState('building')
  const [zoom, setZoom] = useState(0.8)
  const [offset, setOffset] = useState({ x: window.innerWidth / 2, y: 100 })
  const [grid, setGrid] = useState(new IsometricGrid(40, 40))
  const [hoveredTile, setHoveredTile] = useState(null)
  const [isNight, setIsNight] = useState(false)
  const [cityName, setCityName] = useState(() => localStorage.getItem('cozy-city-name') || 'Cozy City')
  
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // Initialize City Name persistence
  useEffect(() => {
    localStorage.setItem('cozy-city-name', cityName)
  }, [cityName])

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setOffset({ x: canvas.width / 2, y: 100 })
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrame;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      grid.drawBackground(ctx, canvas.width, canvas.height, isNight)
      grid.draw(ctx, offset.x, offset.y, zoom, hoveredTile, isNight, activeTool)
      animationFrame = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(animationFrame)
  }, [grid, zoom, offset, hoveredTile, isNight, activeTool])

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isDragging.current = true
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    } else if (e.button === 0) {
      // Place building
      const { row, col } = grid.getGridCoords(e.clientX, e.clientY, offset.x, offset.y, zoom)
      grid.place(row, col, activeTool, e.clientX, e.clientY)
      setGrid(Object.assign(Object.create(Object.getPrototypeOf(grid)), grid)) // Trigger re-render
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    } else {
      const { row, col } = grid.getGridCoords(e.clientX, e.clientY, offset.x, offset.y, zoom)
      if (row >= 0 && row < grid.rows && col >= 0 && col < grid.cols) {
        setHoveredTile({ row, col })
      } else {
        setHoveredTile(null)
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(z => Math.max(0.2, Math.min(z + delta, 3)))
  }

  return (
    <div className={`game-container ${isNight ? 'night' : ''}`}>
      <canvas 
        ref={canvasRef} 
        className="game-canvas" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* UI Overlay */}
      <div className="ui-header">
        <div className="city-info">
          <div className="city-name-wrapper">
            <input 
              type="text" 
              className="city-name-input" 
              value={cityName} 
              onChange={(e) => setCityName(e.target.value)}
              spellCheck="false"
              style={{ width: `${Math.max(cityName.length * 22, 180)}px` }}
            />
            <span className="city-suffix">Co.</span>
          </div>
          <div className="header-credits">
            Created by <a href="https://github.com/JoeMighty" target="_blank" rel="noreferrer">JoeMighty</a>
          </div>
        </div>
        
        <div className="resource-bar">
          <button className="theme-toggle" onClick={() => setIsNight(!isNight)}>
            {isNight ? '🌙 Night' : '☀️ Day'}
          </button>
          <div className="resource"><span>Population:</span> <span>150</span></div>
          <div className="resource"><span>Balance:</span> <span>$ ∞</span></div>
        </div>
      </div>


      <div className="build-menu">
        <div className="categories">
          {Object.values(BUILDING_CATEGORIES).map(cat => (
            <div key={cat.id} className="category-section">
              <h4>{cat.title}</h4>
              <div className="items">
                {cat.items.map(item => (
                  <button 
                    key={item.id}
                    className={activeTool === item.id ? 'active' : ''} 
                    onClick={() => setActiveTool(item.id)}
                    title={item.name}
                  >
                    <div className="item-preview" style={{ background: item.color }}></div>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button 
            className={`tool-button ${activeTool === null ? 'active' : ''}`} 
            onClick={() => setActiveTool(null)}
          >
            <Pickaxe size={20} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><Plus size={20} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}><Minus size={20} /></button>
      </div>

      <GuideOverlay cityName={cityName} setCityName={setCityName} />
    </div>
  )
}

export default App
