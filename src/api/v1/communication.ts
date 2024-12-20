import { Hono, Context } from 'hono';
import { ResponseUtility } from '../../api/utils/ResponseUtility';
import { prepareTemplateAndSendEmail } from './helper';

type Bindings = {
	JWT_SECRET: string;
	SENDGRID_API_KEY: string;
	SENDGRID_URL: string;
	SG_API_KEY:string;
	INTERVIEW_SUPPORT_EMAIL: string;
	SUPPORT_EMAIL: string;
};

const v1 = new Hono<{ Bindings: Bindings }>();

export const sendEmail = async (c: any) => {
	const postBody = await c.req.json();
	const { template, body } = postBody; //"interview-invite"
	try {
		console.log("Send Email got called", template)
		await prepareTemplateAndSendEmail(template, body, c);

		return ResponseUtility.ok(null, 'Email sent successfully');
	} catch (error: any) {
		return ResponseUtility.internalServerError(error.message);
	}
};

export default v1;
