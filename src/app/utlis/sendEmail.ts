/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import appError from "../errorsHelpers/appErrors.js";
import config from "../config/index.js";

const transporter = nodemailer.createTransport({
    // port: config.EMAIL_SENDER.SMTP_PORT,
    secure: true,
    auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
    },
    port: Number(config.smtp_port),
    host: config.smtp_host
})

interface SendEmailOptions {
    to: string,
    subject: string;
    templateName: string;
    templateData?: Record<string, any>
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendEmail = async ({
    to,
    subject,
    templateName,
    templateData,
    attachments
}: SendEmailOptions) => {
    try {
        const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: config.smtp_from,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })
        console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
        console.log("email sending error", error.message);
        throw new appError(401, "Email error")
    }

}