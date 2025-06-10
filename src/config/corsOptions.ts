import { CorsOptions } from "cors"
import { allowedOrigins } from "./allowedOrigins"

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
            callback(null , true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
}