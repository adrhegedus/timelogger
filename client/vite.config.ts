import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import svgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svgr(), react()],
	resolve: {
		alias: {
			"~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
			"@styles": path.resolve(__dirname, "src/Styles"),
			"~": path.resolve(__dirname, "src"),
		}
	}
})