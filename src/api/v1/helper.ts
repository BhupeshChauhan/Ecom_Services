import { ResponseUtility } from '../utils/ResponseUtility';

export const prepareTemplateAndSendEmail = async (template: string, body: any, c: any) => {
	try {
        let fromEmail = "";
		let toEmail = body.toEmail;
		let html = '';
		let subject = '';

		switch (template) {
			case 'interview-invite':
                fromEmail = c.env.INTERVIEW_SUPPORT_EMAIL;
				subject = `Thank you for applying to ${body.companyName} | Next Step`;
				html = interviewInvite;
				html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{jobRole}}/g, body.jobRole)
					.replace(/{{aiInterviewLink}}/g, body.aiInterviewLink + '')
					.replace(/{{screeningLink}}/g, body.screeningLink + '')
					.replace(/{{companyName}}/g, body.companyName);

				break;

			case 'interview-cancel':
				// Required - recipientName, jobRole, companyName, toEmail
                fromEmail = c.env.INTERVIEW_SUPPORT_EMAIL;
				subject = `${body.companyName} | Application  Follow-Up`;
				html = cancelInvite;
                html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{jobRole}}/g, body.jobRole)
					.replace(/{{companyName}}/g, body.companyName);
				break;

			case 'email-verification':
				//Required - recipientName, companyName, verifyEmailLink
                fromEmail = c.env.SUPPORT_EMAIL;
				subject = `Verify Your Email Address`;
				html = verifyEmail;
                html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{companyName}}/g, body.companyName)
					.replace(/{{verifyEmailLink}}/g, body.verifyEmailLink);
				break;

			case 'password-reset':
				//Required - recipientName, companyName, resetPasswordLink
                fromEmail = c.env.SUPPORT_EMAIL;
				subject = `Reset Your Password`;
				html = resetPassword;
                html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{companyName}}/g, body.companyName)
					.replace(/{{resetPasswordLink}}/g, body.resetPasswordLink);
				break;

			case 'welcome-email':
				//Required - recipientName, companyName, loginLink, temporaryPassword, supportEmail
                fromEmail = c.env.SUPPORT_EMAIL;
				subject = `Welcome to ${body.companyName} - Let's Revolutionize Your Hiring Process!`;
				html = welcomeEmail;
                html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{companyName}}/g, body.companyName)
					.replace(/{{loginLink}}/g, body.loginLink)
					.replace(/{{temporaryPassword}}/g, body.temporaryPassword)
                    .replace(/{{supportEmail}}/g, c.env.SUPPORT_EMAIL);
				break;

            case 'team-invite':
                fromEmail = c.env.SUPPORT_EMAIL;
				subject = `${body.companyName} | Team Invite`;
				html = teamInvite;
                html = html
					.replace(/{{recipientName}}/g, body.recipientName)
					.replace(/{{companyName}}/g, body.companyName)
					.replace(/{{invitationLink}}/g, body.invitationLink)
                    .replace(/{{senderName}}/g, body.senderName);    

			default:
				//do nothing
				break;
		}

		await sendEmailWithSendgrid(fromEmail, toEmail, subject, html, c);
        return ResponseUtility.ok({}, 'Email Sent Successfully');
	} catch (error: any) {
		console.log('Error sending email:', error);
        return ResponseUtility.internalServerError(`Failed to send email. Error: ${error.message}`);
	}
};