export class ActivityEngine {
  constructor(grid) {
    this.grid = grid;
    this.cars = []; // {row, col, targetRow, targetCol, progress, color}
    this.particles = []; // {row, col, x, y, vx, vy, life, text, color, type}
    this.clouds = []; // {x, y, size, speed}
    this.birds = []; // {x, y, speed, wingPhase}
    this.lastUpdate = Date.now();
    
    // Initial clouds
    for(let i=0; i<5; i++) this.spawnCloud(true);
  }

  update(width, height) {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Update Cars... (existing)
    this.cars.forEach((car, i) => {
      car.progress += dt * 1.5;
      if (car.progress >= 1) {
        car.row = car.targetRow;
        car.col = car.targetCol;
        car.progress = 0;
        this.findNextRoadTarget(car);
        if (car.targetRow === null) this.cars.splice(i, 1);
      }
    });

    // Update Particles... (existing)
    this.particles.forEach((p, i) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    });

    // Update Clouds
    this.clouds.forEach((c, i) => {
      c.x += c.speed * dt;
      if (c.x > width + 200) this.clouds.splice(i, 1);
    });
    if (this.clouds.length < 8 && Math.random() < 0.01) this.spawnCloud();

    // Update Birds
    this.birds.forEach((b, i) => {
      b.x += b.speed * dt;
      b.y += Math.sin(Date.now() * 0.005) * 0.5;
      b.wingPhase = (Date.now() * 0.01) % (Math.PI * 2);
      if (b.x > width + 100) this.birds.splice(i, 1);
    });
    if (this.birds.length < 5 && Math.random() < 0.005) this.spawnBird();

    // Spawn Cars
    if (this.cars.length < 25 && Math.random() < 0.05) this.spawnCar();
  }

  spawnCloud(randomX = false) {
    this.clouds.push({
      x: randomX ? Math.random() * 2000 : -200,
      y: Math.random() * 600,
      size: 40 + Math.random() * 80,
      speed: 5 + Math.random() * 15
    });
  }

  spawnBird() {
    this.birds.push({
      x: -50,
      y: 100 + Math.random() * 500,
      speed: 50 + Math.random() * 50,
      wingPhase: 0
    });
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
