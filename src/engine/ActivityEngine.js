export class ActivityEngine {
  constructor(grid) {
    this.grid = grid;
    this.cars = []; // {row, col, targetRow, targetCol, progress, color}
    this.particles = []; // {x, y, vx, vy, life, text, color, type}
    this.lastUpdate = Date.now();
  }

  update() {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Update Cars
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.progress += dt * 1.5; // Speed
      if (car.progress >= 1) {
        // Move to next tile if possible
        car.row = car.targetRow;
        car.col = car.targetCol;
        car.progress = 0;
        this.findNextRoadTarget(car);
        if (!car.targetRow && car.targetRow !== 0) {
          this.cars.splice(i, 1);
        }
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Spawn Cars occasionally
    if (this.cars.length < 20 && Math.random() < 0.05) {
      this.spawnCar();
    }
  }

  spawnCar() {
    // Find a random road
    const roads = [];
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (this.grid.data[r][c] === 'road') roads.push({r, c});
      }
    }
    if (roads.length === 0) return;
    const start = roads[Math.floor(Math.random() * roads.length)];
    const car = {
      row: start.r,
      col: start.c,
      targetRow: start.r,
      targetCol: start.c,
      progress: 0,
      color: ['#ef4444', '#f59e0b', '#facc15', '#f8fafc'][Math.floor(Math.random() * 4)]
    };
    this.findNextRoadTarget(car);
    if (car.targetRow !== null) this.cars.push(car);
  }

  findNextRoadTarget(car) {
    const neighbors = [
      {r: car.row - 1, c: car.col},
      {r: car.row + 1, c: car.col},
      {r: car.row, c: car.col - 1},
      {r: car.row, c: car.col + 1}
    ].filter(n => 
      n.r >= 0 && n.r < this.grid.rows && 
      n.c >= 0 && n.c < this.grid.cols && 
      this.grid.data[n.r][n.c] === 'road'
    );
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      car.targetRow = next.r;
      car.targetCol = next.c;
    } else {
      car.targetRow = null;
    }
  }

  addTextParticle(x, y, text, color = '#fbbf24') {
    this.particles.push({
      x, y, 
      vx: (Math.random() - 0.5) * 20,
      vy: -50 - Math.random() * 50,
      life: 1.5,
      text,
      color,
      type: 'text'
    });
  }

  addSmokeParticle(x, y) {
    this.particles.push({
      x, y,
      vx: 10 + Math.random() * 20,
      vy: -20 - Math.random() * 20,
      life: 2.0,
      color: 'rgba(200, 200, 200, 0.4)',
      type: 'smoke',
      size: 4 + Math.random() * 6
    });
  }
}
