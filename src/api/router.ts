import { Hono } from 'hono';
import { sendEmail } from './v1/communication';

const communicationRoutes = new Hono();

communicationRoutes.post('/send-interview-invite', sendEmail); //createJob


export default communicationRoutes;
