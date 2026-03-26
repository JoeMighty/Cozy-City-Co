import { useState, useEffect } from 'react';
import { NEWS_ALERTS } from '../engine/NewsData';

export function NewsTicker({ cityName }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const updateNews = () => {
      const nextIndex = (index + 1) % NEWS_ALERTS.length;
      setIndex(nextIndex);
      const rawText = NEWS_ALERTS[nextIndex].replace('{cityName}', cityName || 'Cozy City');
      setDisplayText(rawText);
    };

    const interval = setInterval(updateNews, 8000);
    updateNews();
    return () => clearInterval(interval);
  }, [index, cityName]);

  return (
    <div className="news-ticker">
      <div className="news-label">LATEST</div>
      <div className="news-content">
        <span key={index}>{displayText}</span>
      </div>
    </div>
  );
}
破
