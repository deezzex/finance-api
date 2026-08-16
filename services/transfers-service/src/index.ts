import app from './app.ts';
import { config } from './config/index.ts';

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`transfers-service listening on port ${PORT}`);
});
