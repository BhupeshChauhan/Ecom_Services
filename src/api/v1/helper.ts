import { welcomeEmail, interviewInvite, cancelInvite, resetPassword, verifyEmail } from '../../templates';

const sgMail = require('@sendgrid/mail');

export const prepareTemplateAndSendEmail = async (template: string, body: any, c: any) => {
	console.log('preparing template and sending email');
	try {
		let toEmail = '';
		let html = '';
		let subject = '';

		switch (template) {
			case 'interview-invite':
				toEmail = body.user.email;
				subject = `Thank you for applying to ${body.clientDetails.name} | Next Step`;
				html = interviewInvite;
				html = html
					.replace(/{{candidateName}}/g, body.user.name || body.user.username)
					.replace(/{{jobRole}}/g, body.jobDetails.title)
					.replace(/{{aiInterviewLink}}/g, body.interviewLink + '')
					.replace(/{{screeningLink}}/g, body.screeningLink + '')
					.replace(/{{companyName}}/g, body.clientDetails.name);

				break;

			case 'interview-cancel':
				// Required - userName, jobRole, companyName
				toEmail = body.user.email;
				subject = `${body.clientDetails.name} | Application  Follow-Up`;
				html = cancelInvite;
				break;

			case 'email-verification':
				//Required - userName, companyName, verifyEmailLink
				toEmail = body.user.email;
				subject = `Your interview with ${body.clientDetails.name} has been cancelled`;
				html = verifyEmail;
				break;

			case 'password-reset':
				//Required - userName, companyName, resetPasswordLink
				toEmail = body.user.email;
				subject = `Your interview with ${body.clientDetails.name} has been cancelled`;
				html = resetPassword;
				break;

			case 'welcome-email':
                //Required - userName, companyName, loginLink, supportEmail
				toEmail = body.user.email;
				subject = `Your interview with ${body.clientDetails.name} has been cancelled`;
				html = welcomeEmail;
				break;

			default:
				//do nothing
				break;
		}

		await sendEmail(toEmail, subject, html, c);
	} catch (error: any) {
		console.log('Error sending email:', error);
		throw new Error(`Failed to send email. Error: ${error}`);
	}
};

export const sendEmail = async (toEmail, subject, html, c) => {
	sgMail.setApiKey(c.env.SG_API_KEY);

	console.log('Sending email to ', toEmail);

	let msg: any = {
		to: toEmail,
		from: c.env.SENDGRID_SENDER_EMAIL,
		subject: subject,
		html: html,
		trackingSettings: {
			clickTracking: {
				enable: false,
				enableText: false,
			},
			subscriptionTracking: {
				enable: false,
			},
		},
	};

	await sgMail.send(msg);
};
