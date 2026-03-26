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

  draw(ctx, offsetX, offsetY, zoom, hoveredTile = null) {
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
        if (tile === 'water') {
          ctx.fillStyle = '#1e40af'; // Blue-800
        } else if (tile === 'road') {
          ctx.fillStyle = '#1e293b'; // Slate-900
        } else if (tile === 'building') {
          ctx.fillStyle = '#1e293b'; // Dark base for building
        } else if (tile === 'park') {
          ctx.fillStyle = '#065f46'; // Emerald-900
        } else {
          ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.5)';
        }
        ctx.fill();

        // Roads/Water connectivity
        if (tile === 'road' || tile === 'water') {
          this.drawConnectedFeature(ctx, row, col, x, y, halfWidth, halfHeight, tile);
        }

        // Stroke
        ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Minimalist Geometric "Buildings"
        if (tile === 'building' || tile === 'park') {
          this.drawGeometricFeature(ctx, x, y, halfWidth, halfHeight, tile);
        }
      }
    }
  }

  drawConnectedFeature(ctx, row, col, x, y, hw, hh, type) {
    const color = type === 'road' ? '#475569' : '#3b82f6';
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

  drawGeometricFeature(ctx, x, y, hw, hh, type) {
    ctx.save();
    ctx.translate(x, y + hh);
    
    // Use a simple hash based on row/col for variety
    const seed = (ctx.currentDrawRow * 13 + ctx.currentDrawCol * 7) % 3;

    if (type === 'building') {
      const colors = ['#fbbf24', '#f59e0b', '#d97706'];
      ctx.fillStyle = colors[seed];
      
      const heightMult = 0.5 + seed * 0.3;
      
      // Cube
      ctx.beginPath();
      ctx.moveTo(0, -hh * heightMult);
      ctx.lineTo(hw * 0.5, -hh * (heightMult * 0.5));
      ctx.lineTo(0, 0);
      ctx.lineTo(-hw * 0.5, -hh * (heightMult * 0.5));
      ctx.fill();
      
      // Side shading
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(hw * 0.5, -hh * (heightMult * 0.5));
      ctx.lineTo(hw * 0.5, hh * 0.5);
      ctx.lineTo(0, hh);
      ctx.fill();
    } else if (type === 'park') {
      const parkColors = ['#34d399', '#10b981', '#059669'];
      ctx.fillStyle = parkColors[seed];
      
      if (seed === 0) {
        // Round Tree
        ctx.beginPath();
        ctx.arc(0, -hh * 0.3, hw * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (seed === 1) {
        // Geometric Bush
        ctx.beginPath();
        ctx.moveTo(-hw * 0.3, 0);
        ctx.lineTo(0, -hh * 0.6);
        ctx.lineTo(hw * 0.3, 0);
        ctx.fill();
      } else {
        // Multi-tier tree
        ctx.beginPath();
        ctx.arc(0, -hh * 0.2, hw * 0.25, 0, Math.PI * 2);
        ctx.arc(0, -hh * 0.5, hw * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  place(row, col, type) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.data[row][col] = type;
    }
  }
}
