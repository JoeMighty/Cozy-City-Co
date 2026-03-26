import { useState, useRef, useEffect } from 'react'
import { Hammer, Pickaxe, Trees, Droplets, Map as MapIcon, Plus, Minus } from 'lucide-react'
import { IsometricGrid } from './engine/IsometricGrid'
import './styles/index.css'

function App() {
  const canvasRef = useRef(null)
  const [activeTool, setActiveTool] = useState('building')
  const [zoom, setZoom] = useState(0.8)
  const [offset, setOffset] = useState({ x: 0, y: 100 })
  const [grid, setGrid] = useState(new IsometricGrid(40, 40))
  const [hoveredTile, setHoveredTile] = useState(null)
  
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setOffset(prev => ({ x: canvas.width / 2, y: 100 }))
    }

    const render = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      grid.draw(ctx, offset.x, offset.y, zoom, hoveredTile)
    }

    let animationFrame;
    const loop = () => {
      render()
      animationFrame = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', resize)
    resize()
    loop()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrame)
    }
  }, [grid, zoom, offset, hoveredTile])

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isDragging.current = true
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    } else if (e.button === 0) {
      // Place building
      const { row, col } = grid.getGridCoords(e.clientX, e.clientY, offset.x, offset.y, zoom)
      grid.place(row, col, activeTool)
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
    <div className="game-container">
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
        <h1>Cozy City Co.</h1>
        <div className="resource-bar">
          <div className="resource"><span>Population:</span> <span>150</span></div>
          <div className="resource"><span>Balance:</span> <span>$ ∞</span></div>
        </div>
      </div>

      <div className="sidebar">
        <button 
          className={activeTool === 'road' ? 'active' : ''} 
          onClick={() => setActiveTool('road')}
        >
          <MapIcon size={24} />
          <span>Roads</span>
        </button>
        <button 
          className={activeTool === 'building' ? 'active' : ''} 
          onClick={() => setActiveTool('building')}
        >
          <Hammer size={24} />
          <span>Buildings</span>
        </button>
        <button 
          className={activeTool === 'park' ? 'active' : ''} 
          onClick={() => setActiveTool('park')}
        >
          <Trees size={24} />
          <span>Parks</span>
        </button>
        <button 
          className={activeTool === 'water' ? 'active' : ''} 
          onClick={() => setActiveTool('water')}
        >
          <Droplets size={24} />
          <span>Water</span>
        </button>
        <button 
          className={activeTool === null ? 'active' : ''} 
          onClick={() => setActiveTool(null)}
        >
          <Pickaxe size={24} />
          <span>Clear</span>
        </button>
      </div>

      <div className="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><Plus size={20} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}><Minus size={20} /></button>
      </div>
    </div>
  )
}

export default App
