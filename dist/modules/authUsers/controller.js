"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.handleUserResgistration = void 0;
const user_schemal_1 = __importDefault(require("../../model/user.schemal"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const JWT_SECRET = process.env.JWT_SECRET;
const handleUserResgistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, phoneNumber, password } = req.body;
    if (!username || !email || !phoneNumber || !password) {
        return res.status(401).json({ message: 'all input fields required' });
    }
    const existEmail = yield user_schemal_1.default.findOne({ email });
    if (existEmail) {
        return res.status(401).json({ message: 'email already exist' });
    }
    const existPhoneNumber = yield user_schemal_1.default.findOne({ phoneNumber });
    if (existPhoneNumber) {
        return res.status(401).json({ message: 'phone number already exist' });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield user_schemal_1.default.create(Object.assign(Object.assign({}, req.body), { password: hashedPassword, isVerified: false }));
        // Generate verification token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '1h', // Consider increasing if needed
        });
        // Set up email transporter
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // your SMTP password
            },
        });
        // Create verification link
        const verificationLink = `http://localhost:8000/api/verify-email/${token}`;
        // Send verification email
        yield transporter.sendMail({
            to: email,
            subject: `e-Recharge Verify Your Email Address`,
            html: `<p>Welcome to eRecharge, ${username}! Please verify your email by clicking the link below:</p>
               <p><a href="${verificationLink}">Verify Email</a></p>`,
        });
        return res.status(200).json({ message: `Registered successful` });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.handleUserResgistration = handleUserResgistration;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield user_schemal_1.default.findOne({ where: { id: decoded.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.redirect('https://e-recharge.netlify/login'); // Redirect to login page
        }
        user.isVerified = true;
        yield user.save();
        return res.redirect('https://e-recharge.netlify.app/dashboard'); // Redirect to welcome page
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.verifyEmail = verifyEmail;
