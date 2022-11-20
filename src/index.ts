import "source-map-support/register";

import formatValidators from "ajv-formats";
import Express from "express";
import morgan from "morgan";
import OpenAPIBackend, {Document, Request} from "openapi-backend";
import * as swaggerUi from 'swagger-ui-express';

import $RefParser from "@apidevtools/json-schema-ref-parser";

import schema from "../api/pets.json";

const pets = [
    {name: "shitzu", "petType": "Cat", createdDate: new Date().toISOString(), huntingSkill: "clueless"},
    {name: "siamese", "petType": "Cat", createdDate: new Date().toISOString(), huntingSkill: "lazy"},
    {name: "poodle", "petType": "Dog", createdDate: new Date().toISOString(), packSize: 3},
    {name: "alsatian", "petType": "Dog", createdDate: new Date().toISOString(), packSize: 1},
];

(async () => {
    const definition = (await $RefParser.dereference(schema)) as Document;
    const app = Express();
    
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(definition));
    app.use(Express.json());
    // console.log(JSON.stringify(definition, null, 4))

    const api = new OpenAPIBackend({
        apiRoot: "/api",
        definition,
        ajvOpts: {
            discriminator: true,
        },
        customizeAjv: (ajv) => formatValidators(ajv),
        handlers: {
            getPets: async (c, req: Express.Request, res: Express.Response) => {
                res.status(200)
                    .json({operationId: c.operation.operationId, pets})
            },
            getCats: async (c, req: Express.Request, res: Express.Response) => {
                res.status(200)
                    .json({operationId: c.operation.operationId, cats: pets.filter(pet => pet.petType === "Cat")})
            },
            
            getPetById: async (c, req: Express.Request, res: Express.Response) =>
                res.status(200)
                    .json({operationId: c.operation.operationId}),

            createPet: async (c, req: Express.Request, res: Express.Response) =>
                res.status(201)
                    .json({operationId: c.operation.operationId}),
            createCat: async (c, req: Express.Request, res: Express.Response) =>
                res.status(201)
                    .json({operationId: c.operation.operationId}),

            validationFail: async (c, req: Express.Request, res: Express.Response) =>
                res.status(400)
                    .json({err: c.validation.errors}),
            notFound: async (c, req: Express.Request, res: Express.Response) => res.status(404).json({message: "not found"}),
        },
    });

    api.init();
    app.use(morgan("combined"));
    app.use((req, res) => api.handleRequest(req as Request, req, res));

    app.listen(9000, () => console.info("api listening at http://localhost:9000"));
})();