import { getBuildingById } from './BuildingRegistry';

export class IsometricGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = 40; // Base tile size
    this.data = Array(rows).fill().map(() => Array(cols).fill(null));
  }
  // Convert (row, col) to screen (x, y)
  // Isometric formula:
  // screenX = (col - row) * (width / 2)
  // screenY = (col + row) * (height / 2)
  getScreenCoords(row, col, offsetX, offsetY, zoom) {
    const halfWidth = (this.tileSize * 2 * zoom) / 2;
    const halfHeight = (this.tileSize * zoom) / 2;
    
    const x = offsetX + (col - row) * halfWidth;
    const y = offsetY + (col + row) * halfHeight;
    
    return { x, y };
  }

  // Convert screen (x, y) to (row, col)
  // Inverse Isometric formula:
  // row = (y / halfHeight - x / halfWidth) / 2
  // col = (y / halfHeight + x / halfWidth) / 2
  getGridCoords(screenX, screenY, offsetX, offsetY, zoom) {
    const halfWidth = (this.tileSize * 2 * zoom) / 2;
    const halfHeight = (this.tileSize * zoom) / 2;

    const relX = screenX - offsetX;
    const relY = screenY - halfHeight; // Adjust for the top point of the first tile

    const col = (relY / halfHeight + relX / halfWidth) / 2;
    const row = (relY / halfHeight - relX / halfWidth) / 2;

    return { row: Math.floor(row), col: Math.floor(col) };
  }

  draw(ctx, offsetX, offsetY, zoom, hoveredTile = null, isNight = false, activeTool = null) {
    const halfWidth = (this.tileSize * 2 * zoom) / 2;
    const halfHeight = (this.tileSize * zoom) / 2;

    for (let row = 0; row < this.rows; row++) {
      ctx.currentDrawRow = row; // Pass metadata to helper
      for (let col = 0; col < this.cols; col++) {
        ctx.currentDrawCol = col;
        const { x, y } = this.getScreenCoords(row, col, offsetX, offsetY, zoom);
        const isHovered = hoveredTile && hoveredTile.row === row && hoveredTile.col === col;

        // Draw tile diamond
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + halfWidth, y + halfHeight);
        ctx.lineTo(x, y + halfHeight * 2);
        ctx.lineTo(x - halfWidth, y + halfHeight);
        ctx.closePath();

        // Fill
        const tile = this.data[row][col];
        const ghost = isHovered && activeTool && !tile;
        const toolData = activeTool ? getBuildingById(activeTool) : null;
        const tileData = tile ? getBuildingById(tile) : null;
        
        const currentData = ghost ? toolData : tileData;
        const currentType = currentData?.type;

        if (currentType === 'water') {
          ctx.fillStyle = isNight ? '#1e3a8a' : currentData.color;
        } else if (currentType === 'road') {
          ctx.fillStyle = isNight ? '#0f172a' : currentData.color;
        } else if (currentType === 'building') {
          ctx.fillStyle = isNight ? '#0f172a' : '#1e293b';
        } else if (currentType === 'park') {
          ctx.fillStyle = isNight ? '#064e3b' : currentData.color;
        } else {
          ctx.fillStyle = isHovered 
            ? (isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') 
            : (isNight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)');
        }
        
        if (ghost) ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Roads/Water connectivity
        if (currentType === 'road' || currentType === 'water') {
          this.drawConnectedFeature(ctx, row, col, x, y, halfWidth, halfHeight, currentType, isNight, currentData?.color);
        }

        // Stroke
        ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Minimalist Geometric "Buildings"
        if (currentType === 'building' || currentType === 'park') {
          if (ghost) ctx.globalAlpha = 0.5;
          this.drawGeometricFeature(ctx, x, y, halfWidth, halfHeight, currentType, isNight, currentData);
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  drawConnectedFeature(ctx, row, col, x, y, hw, hh, type, isNight) {
    const color = type === 'road' 
      ? (isNight ? '#334155' : '#475569') 
      : (isNight ? '#2563eb' : '#3b82f6');
    ctx.fillStyle = color;

    // Check neighbors
    const n = row > 0 && this.data[row - 1][col] === type;
    const s = row < this.rows - 1 && this.data[row + 1][col] === type;
    const w = col > 0 && this.data[row][col - 1] === type;
    const e = col < this.cols - 1 && this.data[row][col + 1] === type;

    // Draw central block
    ctx.beginPath();
    ctx.moveTo(x, y + hh * 0.5);
    ctx.lineTo(x + hw * 0.5, y + hh);
    ctx.lineTo(x, y + hh * 1.5);
    ctx.lineTo(x - hw * 0.5, y + hh);
    ctx.fill();

    // Draw connectors
    if (n) this.drawConnector(ctx, x, y, hw, hh, 'n', color);
    if (s) this.drawConnector(ctx, x, y, hw, hh, 's', color);
    if (w) this.drawConnector(ctx, x, y, hw, hh, 'w', color);
    if (e) this.drawConnector(ctx, x, y, hw, hh, 'e', color);
  }

  drawConnector(ctx, x, y, hw, hh, dir, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (dir === 'n') {
      ctx.moveTo(x, y);
      ctx.lineTo(x + hw * 0.5, y + hh * 0.5);
      ctx.lineTo(x, y + hh);
      ctx.lineTo(x - hw * 0.5, y + hh * 0.5);
    } else if (dir === 's') {
      ctx.moveTo(x, y + hh);
      ctx.lineTo(x + hw * 0.5, y + hh * 1.5);
      ctx.lineTo(x, y + hh * 2);
      ctx.lineTo(x - hw * 0.5, y + hh * 1.5);
    } else if (dir === 'w') {
      ctx.moveTo(x - hw, y + hh);
      ctx.lineTo(x - hw * 0.5, y + hh * 0.5);
      ctx.lineTo(x, y + hh);
      ctx.lineTo(x - hw * 0.5, y + hh * 1.5);
    } else if (dir === 'e') {
      ctx.moveTo(x, y + hh);
      ctx.lineTo(x + hw * 0.5, y + hh * 0.5);
      ctx.lineTo(x + hw, y + hh);
      ctx.lineTo(x + hw * 0.5, y + hh * 1.5);
    }
    ctx.fill();
  }

  drawGeometricFeature(ctx, x, y, hw, hh, type, isNight, data) {
    ctx.save();
    ctx.translate(x, y + hh);
    
    const seed = (ctx.currentDrawRow * 13 + ctx.currentDrawCol * 7) % 3;

    if (type === 'building') {
      const dayColor = data.color;
      const nightColors = ['#4338ca', '#3730a3', '#312e81'];
      ctx.fillStyle = isNight ? nightColors[seed] : dayColor;
      
      const heightMult = data.height || (0.5 + seed * 0.3);
      
      // Cube
      ctx.beginPath();
      ctx.moveTo(0, -hh * heightMult);
      ctx.lineTo(hw * 0.5, -hh * (heightMult * 0.5));
      ctx.lineTo(0, 0);
      ctx.lineTo(-hw * 0.5, -hh * (heightMult * 0.5));
      ctx.fill();
      
      // Side shading
      ctx.fillStyle = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(hw * 0.5, -hh * (heightMult * 0.5));
      ctx.lineTo(hw * 0.5, hh * 0.5);
      ctx.lineTo(0, hh);
      ctx.fill();

      // Accessories
      if (data.accessory === 'cross') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-2, -hh * heightMult - 6, 4, 12);
        ctx.fillRect(-6, -hh * heightMult - 2, 12, 4);
      } else if (data.accessory === 'neon' && isNight) {
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.strokeRect(-hw * 0.2, -hh * heightMult * 0.8, hw * 0.4, hh * 0.4);
      }

      // Night Lights
      if (isNight) {
        ctx.fillStyle = '#fbbf24';
        const lightLevels = Math.floor(heightMult * 2);
        for (let i = 0; i < lightLevels; i++) {
          ctx.beginPath();
          ctx.arc(seed === 0 ? -2 : 2, -hh * 0.2 - (i * 10), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // CHARACTER: Draw Emoji
      if (data.emoji) {
        ctx.font = `${Math.floor(14 * (zoom + 0.5))}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillText(data.emoji, 0, -hh * heightMult - 15);
        ctx.shadowBlur = 0;
      }
    } else if (type === 'park') {
      ctx.fillStyle = isNight ? '#064e3b' : data.color;
      
      const heightMult = 0.5;

      if (data.accessory === 'fountain') {
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(0, 0, hw * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (seed === 0) {
        ctx.beginPath();
        ctx.arc(0, -hh * 0.3, hw * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(-hw * 0.3, 0);
        ctx.lineTo(0, -hh * 0.6);
        ctx.lineTo(hw * 0.3, 0);
        ctx.fill();
      }

      if (data.emoji) {
        ctx.font = `${Math.floor(12 * (zoom + 0.5))}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(data.emoji, 0, -hh * heightMult - 10);
      }
    }
    ctx.restore();
  }

  drawBackground(ctx, width, height, isNight) {
    if (!isNight) return;
    
    ctx.save();
    ctx.fillStyle = 'white';
    for (let i = 0; i < 100; i++) {
      const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 678.90) * 0.5 + 0.5) * height;
      const size = (Math.sin(i + Date.now() * 0.001) * 0.5 + 0.5) * 1.5;
      ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  place(row, col, type) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.data[row][col] = type;
    }
  }
}
