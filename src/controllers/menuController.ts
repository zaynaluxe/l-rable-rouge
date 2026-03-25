import { Request, Response } from 'express';
import pool from '../db.ts';

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des catégories.',
      details: error.message 
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description, display_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, description, display_order) VALUES ($1, $2, $3) RETURNING *',
      [name, description, display_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie.' });
  }
};

// Menu Items
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      LEFT JOIN categories c ON m.category_id = c.id 
      ORDER BY c.display_order, m.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu.' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  const { category_id, name, description, price, is_available } = req.body;
  const photo_url = req.file ? (req.file as any).path : null;

  try {
    const result = await pool.query(
      'INSERT INTO menu_items (category_id, name, description, price, photo_url, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [category_id, name, description, price, photo_url, is_available !== undefined ? is_available : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'article.' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category_id, name, description, price, is_available } = req.body;
  const photo_url = req.file ? (req.file as any).path : undefined;

  try {
    let query = 'UPDATE menu_items SET category_id = $1, name = $2, description = $3, price = $4, is_available = $5';
    let params = [category_id, name, description, price, is_available];
    
    if (photo_url) {
      query += ', photo_url = $6 WHERE id = $7 RETURNING *';
      params.push(photo_url, id);
    } else {
      query += ' WHERE id = $6 RETURNING *';
      params.push(id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article.' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    res.json({ message: 'Article supprimé.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};
