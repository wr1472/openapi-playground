import "source-map-support/register";

import Express from "express";
import morgan from "morgan";
import type {Document, Request} from "openapi-backend";
import OpenAPIBackend from "openapi-backend";
import swaggerUi from 'swagger-ui-express';

import definition from "../api/pets.json";

const pets = [
    {name: "shitzu", "petType": "Cat", huntingSkill: "clueless"},
    {name: "siamese", "petType": "Cat", huntingSkill: "lazy"},
    {name: "poodle", "petType": "Dog", packSize: 3},
    {name: "alsatian", "petType": "Dog", packSize: 1},
];

const app = Express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(definition));
app.use(Express.json());

// define api
const api = new OpenAPIBackend({
    apiRoot: "/api",
    definition: definition as Document,
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

// logging
app.use(morgan("combined"));

// use as express middleware
app.use((req, res) => api.handleRequest(req as Request, req, res));

// start server
app.listen(9000, () => console.info("api listening at http://localhost:9000"));