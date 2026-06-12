import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ParticlesProvider } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine } from "@tsparticles/engine";
import "./index.css";
import App from "./App";

const initParticles = async (engine: Engine) => {
  await loadFull(engine);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ParticlesProvider init={initParticles}>
        <App />
      </ParticlesProvider>
    </BrowserRouter>
  </StrictMode>
);
