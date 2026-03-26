export const BUILDING_CATEGORIES = {
  RESIDENTIAL: {
    id: 'residential',
    title: 'Residential',
    items: [
      { id: 'house', name: 'Small House', color: '#fbbf24', height: 0.6, type: 'building', emoji: '🏠' },
      { id: 'villa', name: 'Modern Villa', color: '#f59e0b', height: 0.8, type: 'building', emoji: '🏡' },
      { id: 'apartment', name: 'Apartment', color: '#d97706', height: 1.5, type: 'building', emoji: '🏢' },
      { id: 'skyscraper', name: 'Skyscraper', color: '#b45309', height: 3.0, type: 'building', emoji: '🏙️' }
    ]
  },
  COMMERCIAL: {
    id: 'commercial',
    title: 'Commercial',
    items: [
      { id: 'shop', name: 'Corner Shop', color: '#3b82f6', height: 0.5, type: 'building', emoji: '🏪' },
      { id: 'cinema', name: 'Cinema', color: '#2563eb', height: 0.9, type: 'building', accessory: 'neon', emoji: '🎬' },
      { id: 'mall', name: 'Shopping Mall', color: '#1e40af', height: 1.2, type: 'building', emoji: '🛍️' },
      { id: 'office', name: 'Office Tower', color: '#1d4ed8', height: 2.5, type: 'building', emoji: '🏢' }
    ]
  },
  CIVIC: {
    id: 'civic',
    title: 'Civic',
    items: [
      { id: 'police', name: 'Police Station', color: '#312e81', height: 0.8, type: 'building', accessory: 'blue-light', emoji: '👮' },
      { id: 'fire', name: 'Fire Station', color: '#b91c1c', height: 0.8, type: 'building', accessory: 'red-light', emoji: '🚒' },
      { id: 'hospital', name: 'Hospital', color: '#ef4444', height: 1.5, type: 'building', accessory: 'cross', emoji: '🏥' },
      { id: 'school', name: 'School', color: '#facc15', height: 1.0, type: 'building', emoji: '🏫' },
      { id: 'gallery', name: 'Art Gallery', color: '#8b5cf6', height: 1.1, type: 'building', accessory: 'statue', emoji: '🖼️' },
      { id: 'library', name: 'Library', color: '#6d28d9', height: 0.9, type: 'building', emoji: '📚' }
    ]
  },
  NATURE: {
    id: 'nature',
    title: 'Nature',
    items: [
      { id: 'park', name: 'Small Park', color: '#10b981', type: 'park', emoji: '🌳' },
      { id: 'plaza', name: 'Fountain Plaza', color: '#059669', type: 'park', accessory: 'fountain', emoji: '⛲' },
      { id: 'forest', name: 'Forest', color: '#064e3b', type: 'park', emoji: '🌲' },
      { id: 'pond', name: 'Small Pond', color: '#60a5fa', type: 'water' },
      { id: 'lake', name: 'Deep Lake', color: '#2563eb', type: 'water' },
      { id: 'river', name: 'Wide River', color: '#1d4ed8', type: 'water' }
    ]
  },
  INFRASTRUCTURE: {
    id: 'infra',
    title: 'Infrastructure',
    items: [
      { id: 'road', name: 'Asphalt Road', color: '#334155', type: 'road' },
      { id: 'dirt-road', name: 'Dirt Path', color: '#78350f', type: 'road' },
      { id: 'pavement', name: 'Stone Pavement', color: '#94a3b8', type: 'road' }
    ]
  }
}

export const getBuildingById = (id) => {
  for (const cat of Object.values(BUILDING_CATEGORIES)) {
    const item = cat.items.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}
