import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/authRoutes.js';
import motorcycleRoutes from './routes/motorcycleRoutes.js';
import serviceRecordRoutes from './routes/serviceRecordRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';

const app = express();
const port = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Motorcycle Maintenance Tracker API is running',
    docs: '/api-docs'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/motorcycles', motorcycleRoutes);
app.use('/api/service-records', serviceRecordRoutes);
app.use('/api/maintenance-reminders', reminderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Motorcycle Maintenance Tracker API running on port ${port}`);
  console.log(`Swagger docs available at /api-docs`);
});
