import { getBuildingById } from './BuildingRegistry';
import { ActivityEngine } from './ActivityEngine';

export class IsometricGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = 40; // Base tile size
    this.data = Array(rows).fill().map(() => Array(cols).fill(null));
    this.activity = new ActivityEngine(this);
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
    const hw = (this.tileSize * 2 * zoom) / 2;
    const hh = (this.tileSize * zoom) / 2;

    const dx = (screenX - offsetX) / hw;
    const dy = (screenY - offsetY) / hh;

    const col = (dy + dx) / 2;
    const row = (dy - dx) / 2;

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
        ctx.strokeStyle = isHovered 
          ? (isNight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)') 
          : (isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)');
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Minimalist Geometric "Buildings"
        if (currentType === 'building' || currentType === 'park') {
          if (ghost) ctx.globalAlpha = 0.5;
          this.drawGeometricFeature(ctx, x, y, halfWidth, halfHeight, currentType, isNight, currentData, zoom);
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // Update and Draw Activity
    this.activity.update(ctx.canvas.width, ctx.canvas.height);
    this.drawActivity(ctx, offsetX, offsetY, zoom, isNight);
  }

  drawActivity(ctx, offsetX, offsetY, zoom, isNight) {
    const hw = (this.tileSize * 2 * zoom) / 2;
    const hh = (this.tileSize * zoom) / 2;

    // Draw Cars...
    this.activity.cars.forEach(car => {
      const p1 = this.getScreenCoords(car.row, car.col, offsetX, offsetY, zoom);
      const p2 = this.getScreenCoords(car.targetRow, car.targetCol, offsetX, offsetY, zoom);
      const x = p1.x + (p2.x - p1.x) * car.progress;
      const y = p1.y + (p2.y - p1.y) * car.progress;
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.arc(x, y + hh, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Particles...
    this.activity.particles.forEach(p => {
      ctx.globalAlpha = p.life / 1.5;
      if (p.type === 'text') {
        ctx.fillStyle = isNight ? '#fbbf24' : '#1e293b';
        ctx.font = `bold ${Math.floor(14 * zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      }
    });

    // Draw Birds
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1 * zoom;
    this.activity.birds.forEach(b => {
      ctx.beginPath();
      const s = 4 * zoom;
      const w = Math.sin(b.wingPhase) * s;
      ctx.moveTo(b.x - s, b.y - w);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x + s, b.y - w);
      ctx.stroke();
    });

    // Draw Clouds
    if (!isNight) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.activity.clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.3, c.y + 10, c.size * 0.4, 0, Math.PI * 2);
        ctx.arc(c.x - c.size * 0.3, c.y + 10, c.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  drawConnectedFeature(ctx, row, col, x, y, hw, hh, type, isNight) {
    const color = type === 'road' 
      ? (isNight ? '#334155' : '#475569') 
      : (isNight ? '#2563eb' : '#3b82f6');
    ctx.fillStyle = color;

    if (type === 'water') {
      // Full tile fill for merging water bodies
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + hw, y + hh);
      ctx.lineTo(x, y + hh * 2);
      ctx.lineTo(x - hw, y + hh);
      ctx.fill();
      return; // No connectors needed for water
    }

    // Road logic (remains narrow)
    ctx.beginPath();
    ctx.moveTo(x, y + hh * 0.5);
    ctx.lineTo(x + hw * 0.5, y + hh);
    ctx.lineTo(x, y + hh * 1.5);
    ctx.lineTo(x - hw * 0.5, y + hh);
    ctx.fill();

    // Check neighbors
    const n = row > 0 && this.getBuildingIdAt(row - 1, col) === type;
    const s = row < this.rows - 1 && this.getBuildingIdAt(row + 1, col) === type;
    const w = col > 0 && this.getBuildingIdAt(row, col - 1) === type;
    const e = col < this.cols - 1 && this.getBuildingIdAt(row, col + 1) === type;

    // Draw connectors
    if (n) this.drawConnector(ctx, x, y, hw, hh, 'n', color);
    if (s) this.drawConnector(ctx, x, y, hw, hh, 's', color);
    if (w) this.drawConnector(ctx, x, y, hw, hh, 'w', color);
    if (e) this.drawConnector(ctx, x, y, hw, hh, 'e', color);
  }

  getBuildingIdAt(row, col) {
    const data = this.data[row][col];
    if (!data) return null;
    return getBuildingById(data)?.type || null; // Connect by type
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

  drawGeometricFeature(ctx, x, y, hw, hh, type, isNight, data, zoom) {
    ctx.save();
    ctx.translate(x, y + hh);
    
    // Shadow
    ctx.fillStyle = isNight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, hw * 0.8, hh * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const h = (data.height || 1.0) * hh * 2 * zoom;
    const seed = (ctx.currentDrawRow * 3 + ctx.currentDrawCol * 7) % 5;
    
    // Character Emoji (Illustration) - Larger & Prominent
    if (data.emoji) {
      ctx.font = `${Math.floor(36 * zoom)}px serif`; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(data.emoji, 0, -h - (24 * zoom));
    }

    // COLORS
    const baseColor = isNight ? this.adjustColor(data.color, -50) : data.color;
    const sideColor = this.adjustColor(baseColor, -15);
    const darkSideColor = this.adjustColor(baseColor, -30);

    // FRONT SIDE (Left)
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    ctx.lineTo(0, hh);
    ctx.lineTo(0, hh - h);
    ctx.lineTo(-hw, -h);
    ctx.fill();

    // RIGHT SIDE
    ctx.fillStyle = darkSideColor;
    ctx.beginPath();
    ctx.moveTo(hw, 0);
    ctx.lineTo(0, hh);
    ctx.lineTo(0, hh - h);
    ctx.lineTo(hw, -h);
    ctx.fill();

    // ROOF AND ORNAMENTS
    if (data.id === 'house' || data.id === 'school' || data.id === 'villa') {
      // Gabled Roof
      const roofColor = data.id === 'school' ? '#b91c1c' : '#78350f';
      ctx.fillStyle = isNight ? this.adjustColor(roofColor, -40) : roofColor;
      ctx.beginPath();
      ctx.moveTo(-hw, -h);
      ctx.lineTo(0, -h - (hh * 0.8)); // Peak
      ctx.lineTo(hw, -h);
      ctx.lineTo(0, -h + hh);
      ctx.fill();
    } else {
      // Flat Modern Roof
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(0, -h + hh);
      ctx.lineTo(hw, -h);
      ctx.lineTo(0, -h - hh);
      ctx.lineTo(-hw, -h);
      ctx.fill();

      // Rooftop Equipment (AC Units/Antennas)
      if (type === 'building' && h > 40 * zoom) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-hw * 0.2, -h - hh * 0.4, hw * 0.3, hh * 0.4);
        if (data.id === 'skyscraper') {
          ctx.strokeStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(0, -h - hh);
          ctx.lineTo(0, -h - hh * 2); // Antenna
          ctx.stroke();
        }
      }
    }

    // Windows
    const windowRows = Math.floor(h / (12 * zoom));
    for(let i=1; i<windowRows; i++) {
      const yOffset = -h + (i * 12 * zoom);
      // Daytime: Subtle glass blue, Night: Glowing amber
      ctx.fillStyle = isNight ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-hw * 0.4, yOffset, 2 * zoom, 2 * zoom);
      ctx.fillRect(hw * 0.4, yOffset, 2 * zoom, 2 * zoom);
    }

    // CUSTOM ASSET DETAILS
    if (data.id === 'hospital') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2*zoom, -h - 12*zoom, 4*zoom, 12*zoom);
      ctx.fillRect(-6*zoom, -h - 8*zoom, 12*zoom, 4*zoom);
    }
    
    if (data.id === 'school') {
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(0, -h - 4*zoom, 6*zoom, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#334155'; ctx.fillRect(-0.5*zoom, -h - 8*zoom, 1*zoom, 4*zoom); // Hands
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

  place(row, col, tool, screenX, screenY) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.data[row][col] = tool;
      
      if (tool) {
        const item = getBuildingById(tool);
        let text = "+1";
        if (item?.type === 'building') text = "+10 Pop";
        if (item?.type === 'commercial') text = "+$100";
        this.activity.addTextParticle(screenX, screenY, text);
      }
    }
  }
}
