import app from './app.js';
import env from './config/env.js';
import suratKuasaRoutes from './routes/suratkuasa.routes.js';

app.use('/api/surat-kuasa', suratKuasaRoutes);


const PORT = env.port;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
