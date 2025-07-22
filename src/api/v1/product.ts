import { Hono, Context } from 'hono';
import { ResponseUtility } from '../utils/ResponseUtility';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, like, asc, desc } from 'drizzle-orm';
import { product } from 'common/src/db/schema';

type Bindings = {
  DB: D1Database;
};

const v1 = new Hono<{ Bindings: Bindings }>();

export const listProducts = async (c: Context) => {
    console.log("listProducts got called")
  try {
    const db = drizzle(c.env.DB);
    const query = c.req.query();

    const { search = '', status = 'all', sortBy = 'title', sortOrder = 'desc', page = 1, limit = 10 } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const searchConditions = [
      like(product.title, `%${search}%`),
      like(product.description, `%${search}%`),
    ];

    let statusCondition;
    if (status !== 'all') {
      statusCondition = eq(product.status, status);
    }

    let conditions = undefined;
    if (search) {
      conditions = or(...searchConditions);
    }
    if (statusCondition) {
      conditions = conditions ? and(conditions, statusCondition) : statusCondition;
    }

    const totalProducts = await db.select().from(product).where(conditions).execute();
    const total = totalProducts.length;
    const totalPages = Math.ceil(total / limit);

    const products = await db
      .select()
      .from(product)
      .where(conditions)
      .orderBy(sortOrder === 'asc' ? asc(product.createdAt) : desc(product.createdAt))
      .limit(Number(limit))
      .offset(offset)
      .execute();

    return ResponseUtility.ok({
      list: products,
      total,
      page: Number(page),
      totalPages
    }, 'Products fetched successfully');

  } catch (error: any) {
    return ResponseUtility.internalServerError(error.message);
  }
};

export const createProduct = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const { title, description, appId, status = 'draft', ...otherFields } = body;

    if (!title || !appId) {
      return ResponseUtility.badRequest('Product title and appId are required');
    }

    // Check if product with same title exists for the app
    const existingProduct = await db
      .select()
      .from(product)
      .where(and(
        eq(product.title, title),
        eq(product.appId, appId)
      ))
      .get();

    if (existingProduct) {
      return ResponseUtility.conflict('A product with this title already exists in this app');
    }

    // Create new product
    const result = await db
      .insert(product)
      .values({
        title,
        description,
        appId,
        status,
        ...otherFields
      })
      .returning()
      .get();

    return ResponseUtility.created(result, 'Product created successfully');

  } catch (error: any) {
    return ResponseUtility.internalServerError(error.message);
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return ResponseUtility.badRequest('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.id, Number(id)))
      .get();

    if (!existingProduct) {
      return ResponseUtility.notFound('Product not found');
    }

    // Update product
    const updatedProduct = await db
      .update(product)
      .set(updateData)
      .where(eq(product.id, Number(id)))
      .returning()
      .get();

    return ResponseUtility.ok(updatedProduct, 'Product updated successfully');

  } catch (error: any) {
    return ResponseUtility.internalServerError(error.message);
  }
};

export const toggleProductStatus = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const { id } = body;

    if (!id) {
      return ResponseUtility.badRequest('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.id, Number(id)))
      .get();

    if (!existingProduct) {
      return ResponseUtility.notFound('Product not found');
    }

    // Toggle status between 'active' and 'inactive'
    const newStatus = existingProduct.status === 'active' ? 'inactive' : 'active';

    // Update status
    const updatedProduct = await db
      .update(product)
      .set({ status: newStatus })
      .where(eq(product.id, Number(id)))
      .returning()
      .get();

    return ResponseUtility.ok(updatedProduct, `Product ${newStatus} successfully`);

  } catch (error: any) {
    return ResponseUtility.internalServerError(error.message);
  }
};

export default v1; 