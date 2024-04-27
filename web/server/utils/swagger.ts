import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {version} from '../package.json'
import {Express, Request, Response} from "express";
import {log} from "./logger";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Captive Portal API",
            version
        }
    },
    apis: ["./routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express, backendUrl: string): void => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    })
    log.info(`Docs available at ${backendUrl}/docs`);
}