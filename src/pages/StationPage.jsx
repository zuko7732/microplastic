import { Link, useParams } from "react-router-dom";

function StationPage() {
  const { category } = useParams();

  const stations = Array.from({ length: 55 }, (_, index) => index + 1);

  return (
    <div className="page">
      <div className="station-container">
        <Link to="/" className="back-link">
          ← Back
        </Link>

        <h1 className="title">
          {category.charAt(0).toUpperCase() + category.slice(1)} Stations
        </h1>

        <div className="station-grid">
          {stations.map((station) => (
            <div key={station} className="station-card">
              Station {String(station).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StationPage;