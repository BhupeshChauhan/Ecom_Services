import { Hono } from 'hono';
import { sendEmail } from './v1/communication';

const communicationRoutes = new Hono();

communicationRoutes.post('/send-email', sendEmail);


export default communicationRoutes;
