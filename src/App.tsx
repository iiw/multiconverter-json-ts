import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/home/Home";
import { NestGraphQLModel } from "./pages/nest-graphql-model/NestGraphQLModel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />}></Route>
        <Route path="graphql-nest" element={<NestGraphQLModel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
