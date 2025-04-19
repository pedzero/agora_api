import app from './app.js';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});