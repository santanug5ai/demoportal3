import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dataStore } from '../store/dataStore';
import { generateToken } from '../middleware/auth';
import type { LoginRequest, AuthResponse } from '@ob-digital-portal/shared';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const { username, password } = validation.data;

    const user = dataStore.getUserByUsername(username);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
      return;
    }

    // In seed data, password is already hashed with bcrypt
    // For demo, all users have password "password123"
    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
      return;
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user as any;

    const token = generateToken(userWithoutPassword);

    const response: AuthResponse = {
      token,
      user: userWithoutPassword,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
