"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
// import body-parser from 'bodyParser'
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const router_1 = __importDefault(require("./modules/authUsers/router"));
const Port = process.env.PORT || 2000;
// MongoDB connection
const uri = process.env.MONGODB_URI;
mongoose_1.default
    .connect(uri)
    .then(() => {
    console.log('Connected to DB');
})
    .catch((error) => {
    console.error('Error connecting to DB:', error);
});
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.use(bodyParder())
// routes
app.use('/api', router_1.default);
app.listen(Port, () => {
    console.log('connected');
});
