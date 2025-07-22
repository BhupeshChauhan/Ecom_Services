import { Hono, Context } from 'hono';
import { ResponseUtility } from '../utils/ResponseUtility';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, like, asc, desc } from 'drizzle-orm';
import { app } from 'common/src/db/schema';

type Bindings = {
  DB: D1Database;
};

const v1 = new Hono<{ Bindings: Bindings }>();

export const listApps = async (c: Context) => {
	try {
		const db = drizzle(c.env.DB);
		const query = c.req.query();

		// Extracting query parameters for pagination, search, filtering, and sorting
		const { search = '', status = 'all', sortBy = 'name', sortOrder = 'desc', page = 1, limit = 10 } = query;

		// Calculate offset for pagination
		const offset: any = (Number(page) - 1) * Number(limit);

		// Search conditions
		const searchConditions = [
			like(app.name, `%${search}%`),
		];

		// Status condition
		let statusCondition;
		if (status !== 'all') {
			statusCondition = eq(app.status, status);
		}

		// Build where clause
		let conditions = undefined;
		if (search) {
			conditions = or(...searchConditions);
		}
		if (statusCondition) {
			conditions = conditions ? and(conditions, statusCondition) : statusCondition;
		}

		// Get total count
		const totalApps = await db.select().from(app).where(conditions).execute();
		const total = totalApps.length;
		const totalPages = Math.ceil(total / limit);

		// Get paginated results
		const apps = await db
			.select()
			.from(app)
			.where(conditions)
			.orderBy(sortOrder === 'asc' ? asc(app.createdAt) : desc(app.createdAt))
			.limit(Number(limit))
			.offset(offset)
			.execute();

		return ResponseUtility.ok({
			list: apps,
			total,
			page: Number(page),
			totalPages
		}, 'Apps fetched successfully');

	} catch (error: any) {
		return ResponseUtility.internalServerError(error.message);
	}
};

export const createApp = async (c: Context) => {
	try {
		const db = drizzle(c.env.DB);
		const body = await c.req.json();
		const { name, type, status = 'draft' } = body;

		if (!name || !type) {
			return ResponseUtility.badRequest('App name and type are required');
		}

		// Check if app with same name exists
		const existingApp = await db
			.select()
			.from(app)
			.where(eq(app.name, name))
			.get();

		if (existingApp) {
			return ResponseUtility.conflict('An app with this name already exists');
		}

		// Create new app
		const result = await db
			.insert(app)
			.values({
				name,
				type,
				status
			})
			.returning()
			.get();

		return ResponseUtility.created(result, 'App created successfully');

	} catch (error: any) {
		return ResponseUtility.internalServerError(error.message);
	}
};

export const updateApp = async (c: Context) => {
	try {
		const db = drizzle(c.env.DB);
		const body = await c.req.json();
		const { id, ...updateData } = body;

		if (!id) {
			return ResponseUtility.badRequest('App ID is required');
		}

		// Check if app exists
		const existingApp = await db
			.select()
			.from(app)
			.where(eq(app.id, Number(id)))
			.get();

		if (!existingApp) {
			return ResponseUtility.badRequest('App not found');
		}

		// Update app
		const updatedApp = await db
			.update(app)
			.set(updateData)
			.where(eq(app.id, Number(id)))
			.returning()
			.get();

		return ResponseUtility.ok(updatedApp, 'App updated successfully');

	} catch (error: any) {
		return ResponseUtility.internalServerError(error.message);
	}
};

export const toggleAppStatus = async (c: Context) => {
	try {
		const db = drizzle(c.env.DB);
		const body = await c.req.json();
		const { id } = body;

		if (!id) {
			return ResponseUtility.badRequest('App ID is required');
		}

		// Check if app exists
		const existingApp = await db
			.select()
			.from(app)
			.where(eq(app.id, Number(id)))
			.get();

		if (!existingApp) {
			return ResponseUtility.badRequest('App not found');
		}

		// Toggle status between 'active' and 'closed'
		const newStatus = existingApp.status === 'active' ? 'closed' : 'active';

		// Update status
		const updatedApp = await db
			.update(app)
			.set({ status: newStatus })
			.where(eq(app.id, Number(id)))
			.returning()
			.get();

		return ResponseUtility.ok(updatedApp, `App ${newStatus} successfully`);

	} catch (error: any) {
		return ResponseUtility.internalServerError(error.message);
	}
};

export default v1;
