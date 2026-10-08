import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/packing-checklist/",
    build: { sourcemap: false },
    plugins: [react()],
});
