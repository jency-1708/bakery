const { convert } = require("html-to-text");
const nodemailer = require("nodemailer");
const path = require("path");
const pug = require("pug");

const Logger = require("../logger/index.logger");

class MailService {
    constructor(to, username) {
        const {
            MAIL_HOST,
            MAIL_USER,
            MAIL_PASSWORD,
            MAIL_PORT,
            MAIL_FROM
        } = process.env;

        if (
            !MAIL_HOST ||
            !MAIL_USER ||
            !MAIL_PASSWORD ||
            !MAIL_PORT ||
            !MAIL_FROM
        ) {
            throw new Error("Mail credentials are missing.");
        }

        this.to = to;
        this.from = MAIL_FROM;
        this.username = username;

        // Mail credentials
        this.host = MAIL_HOST;
        this.password = MAIL_PASSWORD;
        this.port = Number(MAIL_PORT);
        this.user = MAIL_USER;
    }

    // Generate transporter
    newTransporter() {
        return nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.port === 465,

            auth: {
                user: this.user,
                pass: this.password
            },

            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Send mail
    async send(template, subject, data = {}) {

        const html = pug.renderFile(
            path.resolve(
                __dirname,
                "../views",
                `${template}.view.pug`
            ),
            {
                subject,
                ...data
            }
        );

        // Mail options
        const mailOptions = {
            to: this.to,
            from: this.from,
            subject,
            html,
            text: convert(html, {
                wordwrap: 130
            })
        };

        // Create transporter and send mail
        try {

            const sendMail =
                await this.newTransporter().sendMail(
                    mailOptions
                );

            Logger.info(
                `Mail has been sent successfully: ${sendMail.response}`
            );

            return;

        } catch (error) {

            Logger.error(
                `Mail sending function error: ${error?.message}`
            );

            return;
        }
    }

    // ------------------ ADMIN MAILS ------------------ //

    // Forget password
    async adminForgetPassword(url) {

        const data = {
            email: this.to,
            username: this.username,
            url
        };

        await this.send(
            "admin-forget-password",
            "Reset password instructions!",
            data
        );
    }

    // Password reset notification
    async adminResetPassword(url) {

        const data = {
            url,
            username: this.username
        };

        await this.send(
            "admin-reset-password",
            "Password updated!",
            data
        );
    }

    // Inquiry
    async contactInquiryConfirmation() {

        const data = {
            email: this.to,
            username: this.username
        };

        await this.send(
            "contact-inquiry-confirmation",
            "We've received your inquiry!",
            data
        );
    }
}

module.exports = MailService;