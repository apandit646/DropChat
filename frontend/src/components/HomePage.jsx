import {
  MessageSquare,
  Newspaper,
  Users,
  ArrowRight,
  Bell,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // Importing the external CSS file
import chatImg from "../img/chat.webp"; // Importing the chat image

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <img
            src={chatImg}
            alt="chat"
            style={{
              width: "300px",
              height: "300px",
              marginLeft: "187px",
              backgroundColor: "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
            }}
          />

          <h1 className="hero-title">Welcome to DropChat</h1>
          <p className="hero-subtitle">
            Connect with friends, join groups, read the latest news, and chat
            seamlessly online.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Everything You Need</h2>
        <div className="feature-grid">
          {[
            {
              icon: MessageSquare,
              title: "Chat with Friends",
              text: "Send and receive messages in real-time.",
              link: "/chat",
            },
            {
              icon: Newspaper,
              title: "Latest News",
              text: "Stay updated with top news sources.",
              link: "/news",
            },
            {
              icon: Users,
              title: "Group Chats",
              text: "Create or join group conversations.",
              link: "/group-chat",
            },
          ].map(({ icon: Icon, title, text, link }, index) => (
            <div key={index} className="card">
              <div className="icon-container">
                <Icon size={48} />
              </div>
              <div className="card-content">
                <h3>{title}</h3>
                <p>{text}</p>
                <button className="btn link" onClick={() => navigate(link)}>
                  Learn More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="extra-features">
        <h2 className="section-title">Why Choose Web Chat?</h2>
        <div className="extra-feature-list">
          {[
            {
              icon: Shield,
              title: "Secure Messaging",
              text: "End-to-end encryption keeps your conversations private.",
            },
            {
              icon: Bell,
              title: "Real-time Notifications",
              text: "Instant alerts for important messages.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <div key={index} className="extra-feature-item">
              <div className="icon-bg">
                <Icon size={24} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to get connected?</h2>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
