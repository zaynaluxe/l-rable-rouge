import { Request, Response } from 'express';
import pool from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items, order_type, delivery_address } = req.body;
  const user_id = req.user?.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Order
    console.log(`[DEBUG] Creating order for user_id: ${user_id}`);
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, order_type, status) VALUES ($1, $2, $3) RETURNING id',
      [user_id, order_type, 'en attente']
    );
    const orderId = orderResult.rows[0].id;

    let totalAmount = 0;

    // 2. Create Order Items
    for (const item of items) {
      const { menu_item_id, quantity } = item;
      const menuResult = await client.query('SELECT price FROM menu_items WHERE id = $1', [menu_item_id]);
      const unitPrice = menuResult.rows[0].price;
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, menu_item_id, quantity, unitPrice]
      );
    }

    // 3. Update Order Total
    await client.query('UPDATE orders SET total_amount = $1 WHERE id = $2', [totalAmount, orderId]);

    // 4. Create Delivery if needed
    if (order_type === 'livraison' && delivery_address) {
      await client.query(
        'INSERT INTO deliveries (order_id, delivery_address) VALUES ($1, $2)',
        [orderId, delivery_address]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: orderId, total_amount: totalAmount });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  } finally {
    client.release();
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const user_id = req.user?.id;
  const role = req.user?.role;

  console.log(`[DEBUG] Fetching orders for user_id: ${user_id}, role: ${role}`);

  try {
    let query = `
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        d.delivery_address, d.delivery_status,
        p.methode as payment_method, p.statut as payment_status, p.transaction_id,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'name', mi.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          ))
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN deliveries d ON o.id = d.order_id
      LEFT JOIN payments p ON o.id = p.order_id
    `;
    let params = [];

    if (role !== 'admin') {
      query += ' WHERE o.user_id = $1::uuid';
      params.push(user_id);
    }

    query += ' ORDER BY o.created_at DESC';
    
    console.log(`[DEBUG] Executing query: ${query}`);
    console.log(`[DEBUG] Params: ${JSON.stringify(params)}`);

    const result = await pool.query(query, params);
    
    console.log(`[DEBUG] Found ${result.rows.length} orders`);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des commandes.',
      details: error.message,
      query: process.env.NODE_ENV !== 'production' ? error.query : undefined
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update Order Status
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    const order = result.rows[0];

    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // 2. If status is "en route", handle delivery
    if (status === 'en route' && order.order_type === 'livraison') {
      // Ensure delivery entry exists and update its status
      const deliveryCheck = await client.query('SELECT id FROM deliveries WHERE order_id = $1', [id]);
      
      if (deliveryCheck.rows.length > 0) {
        await client.query(
          'UPDATE deliveries SET delivery_status = $1 WHERE order_id = $2',
          ['en cours', id]
        );
      } else {
        // This shouldn't happen if createOrder worked correctly, but let's be safe
        // If it doesn't exist, we might not have the address here.
        // Let's try to find if we can get an address from anywhere else or just log it.
        console.warn(`[WARN] Delivery entry missing for order ${id} during "en route" update`);
      }
    }
    
    // 3. If status is "livré", update delivery status too
    if (status === 'livré' && order.order_type === 'livraison') {
      await client.query(
        'UPDATE deliveries SET delivery_status = $1, actual_delivery_time = CURRENT_TIMESTAMP WHERE order_id = $2',
        ['livré', id]
      );
    }

    // 4. If status is "livré", update cash payment status to "payé"
    if (status === 'livré') {
      await client.query(
        "UPDATE payments SET statut = 'payé' WHERE order_id = $1 AND methode = 'cash' AND statut = 'en attente'",
        [id]
      );
    }

    await client.query('COMMIT');
    res.json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  } finally {
    client.release();
  }
};
