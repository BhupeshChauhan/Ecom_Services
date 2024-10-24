import { Hono } from 'hono';
import { cors } from 'hono/cors';
import communicationRoutes from './api/router';

type Bindings = {};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.options('*', (c) => {
	return c.text('', 204);
});

app.route('/api/v1/communication', communicationRoutes);

export default app;
