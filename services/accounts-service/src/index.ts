import app from './app.ts';
import { config } from './config/index.ts';

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`accounts-service listening on port ${PORT}`);
});
