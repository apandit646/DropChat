import { useState, useEffect } from "react";
import axios from "axios";

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const API_KEY = "b5ebfa0f30854d0396db583bb8149982"; // Use environment variable
        const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;

        const response = await axios.get(url);
        setArticles(response.data.articles || []);
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Get unique categories from articles
  const categories = [
    "all",
    ...new Set(
      articles
        .map((article) => article.source?.name || "uncategorized")
        .filter(Boolean)
    ),
  ];

  // Filter articles based on selected category
  const filteredArticles =
    activeFilter === "all"
      ? articles
      : articles.filter((article) => article.source?.name === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6">
      {/* Glass morphism header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 mb-8 shadow-lg border border-white border-opacity-20">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Welcome to Dropchat News
        </h1>
        <p className="text-center text-blue-200 mt-2">
          Stay informed with the latest News and Headlines
        </p>
      </header>

      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg text-center mx-auto max-w-md">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Category filters */}
      {!loading && !error && articles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeFilter === category
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white bg-opacity-10 hover:bg-opacity-20"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* No articles message */}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-blue-200">No news articles available.</p>
        </div>
      )}

      {/* News grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:bg-opacity-10 hover:scale-102 hover:shadow-xl border border-white border-opacity-10"
          >
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/400/200";
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                <span className="text-blue-200 text-opacity-50">
                  No image available
                </span>
              </div>
            )}

            <div className="p-6">
              {article.source?.name && (
                <span className="inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs text-blue-200 mb-3">
                  {article.source.name}
                </span>
              )}

              <h3 className="text-xl font-bold mb-2 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-gray-300 line-clamp-3 mb-4">
                {article.description || "No description available."}
              </p>

              {article.publishedAt && (
                <p className="text-xs text-blue-300 mb-4">
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                Read Article
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
