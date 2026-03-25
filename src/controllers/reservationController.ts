import { Request, Response } from 'express';
import pool from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const createReservation = async (req: AuthRequest, res: Response) => {
  const { reservation_date, reservation_time, number_of_guests, special_requests } = req.body;
  const user_id = req.user?.id;

  try {
    const result = await pool.query(
      'INSERT INTO reservations (user_id, reservation_date, reservation_time, number_of_guests, special_requests, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, reservation_date, reservation_time, number_of_guests, special_requests, 'en_attente']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réservation.' });
  }
};

export const getReservations = async (req: AuthRequest, res: Response) => {
  const user_id = req.user?.id;
  const role = req.user?.role;

  try {
    let query = 'SELECT * FROM reservations';
    let params = [];

    if (role !== 'admin') {
      query += ' WHERE user_id = $1::uuid';
      params.push(user_id);
    }

    query += ' ORDER BY reservation_date DESC, reservation_time DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des réservations.',
      details: error.message
    });
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation.' });
  }
};
