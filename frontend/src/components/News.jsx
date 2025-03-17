import { useState, useEffect } from 'react';

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');

  // Simulated news data - in a real application, you would fetch this from an API
  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch with timeout
    setTimeout(() => {
      const sampleArticles = [
        {
          id: 1,
          title: "New Climate Policy Announced",
          description: "Government officials unveiled a comprehensive climate policy aimed at reducing carbon emissions by 30% by 2030.",
          imageUrl: "/api/placeholder/600/300",
          source: "Climate News",
          publishedAt: "2025-03-16T09:30:00Z",
          category: "environment"
        },
        {
          id: 2,
          title: "Tech Company Releases Revolutionary Product",
          description: "A leading tech firm has announced a groundbreaking new device that promises to transform how we interact with technology.",
          imageUrl: "/api/placeholder/600/300",
          source: "Tech Daily",
          publishedAt: "2025-03-17T08:45:00Z",
          category: "technology"
        },
        {
          id: 3,
          title: "Stock Market Reaches Record High",
          description: "Global markets surged today, with several indices reaching unprecedented levels amid positive economic forecasts.",
          imageUrl: "/api/placeholder/600/300",
          source: "Financial Times",
          publishedAt: "2025-03-17T10:15:00Z",
          category: "business"
        },
        {
          id: 4,
          title: "Major Sports Upset in Championship Game",
          description: "In a stunning turn of events, the underdog team claimed victory in last night's championship match.",
          imageUrl: "/api/placeholder/600/300",
          source: "Sports Network",
          publishedAt: "2025-03-16T23:50:00Z",
          category: "sports"
        },
        {
          id: 5,
          title: "Health Researchers Announce Breakthrough",
          description: "Scientists have made significant progress in treatment options for a previously incurable condition.",
          imageUrl: "/api/placeholder/600/300",
          source: "Health Today",
          publishedAt: "2025-03-15T14:20:00Z",
          category: "health"
        }
      ];
      
      // Filter by category if not 'general'
      const filteredArticles = category === 'general' 
        ? sampleArticles 
        : sampleArticles.filter(article => article.category === category);
      
      setArticles(filteredArticles);
      setLoading(false);
    }, 1000);
    
  }, [category]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading news: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Daily News</h1>
        <div className="flex justify-center space-x-4 mb-4">
          <button 
            onClick={() => handleCategoryChange('general')}
            className={`px-4 py-2 rounded ${category === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleCategoryChange('technology')}
            className={`px-4 py-2 rounded ${category === 'technology' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Technology
          </button>
          <button 
            onClick={() => handleCategoryChange('business')}
            className={`px-4 py-2 rounded ${category === 'business' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Business
          </button>
          <button 
            onClick={() => handleCategoryChange('sports')}
            className={`px-4 py-2 rounded ${category === 'sports' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Sports
          </button>
          <button 
            onClick={() => handleCategoryChange('health')}
            className={`px-4 py-2 rounded ${category === 'health' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Health
          </button>
          <button 
            onClick={() => handleCategoryChange('environment')}
            className={`px-4 py-2 rounded ${category === 'environment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Environment
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading news...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500">No articles found for this category.</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div key={article.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-gray-700 mb-4">{article.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{article.source}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;