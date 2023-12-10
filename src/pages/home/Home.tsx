import { Link } from "react-router-dom";

export const Home = () => (
  <>
    <h1>multiconverter-json-ts</h1>
    <div className="card">
      <Link to="graphql-nest">
        <button>nest graphql model</button>
      </Link>
    </div>
  </>
);
