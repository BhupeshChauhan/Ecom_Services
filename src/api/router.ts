import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from 'common/src/utils/authUtil';
import * as app from './v1/app';
import * as product from './v1/product';
const appRoutes = new Hono();

appRoutes.get('/apps', authMiddleware, app.listApps)
appRoutes.post('/apps', authMiddleware, app.createApp)
appRoutes.put('/apps/:id', authMiddleware, app.updateApp)
appRoutes.put('/apps/:id/toggle-status', authMiddleware, app.toggleAppStatus)

appRoutes.get('/products', authMiddleware, product.listProducts)
appRoutes.post('/products', authMiddleware, product.createProduct)
appRoutes.put('/products/:id', authMiddleware, product.updateProduct)
appRoutes.put('/products/:id/toggle-status', authMiddleware, product.toggleProductStatus)


export default appRoutes;
