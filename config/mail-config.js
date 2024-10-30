import nodemailer from 'nodemailer';
import 'dotenv/config';

// console.log('Lösenord:', process.env.MAIL_PASS);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    // secure: false,
    auth: {
        user: 'pulseproject23bth@gmail.com',
        
        // pass: process.env.MAIL_PASS,
    },
});

export default transporter;
