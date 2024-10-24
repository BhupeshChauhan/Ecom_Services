import { Hono, Context } from 'hono';
import { ResponseUtility } from '../../api/utils/ResponseUtility';
import { prepareTemplateAndSendEmail } from './helper';

type Bindings = {
	JWT_SECRET: string;
	SENDGRID_API_KEY: string;
	SENDGRID_SENDER_EMAIL: string;
	SENDGRID_URL: string;
};

const v1 = new Hono<{ Bindings: Bindings }>();

export const sendEmail = async (c: any) => {
	const body = await c.req.json();
	const { template, data } = body; //"interview-invite"
	try {
		await prepareTemplateAndSendEmail(template, data, c);

		ResponseUtility.ok(null, 'Email sent successfully');
	} catch (error: any) {
		ResponseUtility.internalServerError(error.message);
	}
};

export const testAPI = async (c: any) => {
	// await prepareTemplateAndSendEmail({name:"Aaleen", email:"aaleen@technest.ventures"}, {title:"React Developer"}, {name:"Uplers"}, "https://www.google.com", "https://www.google.com", 'interview-invite', c);
	// return ResponseUtility.ok(null, 'Test API called successfully');
};
export default v1;
