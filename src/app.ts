import apicache from "apicache";
import axios from "axios";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";

const app = express();

const PORT = 3001;

app.use(express.json());
app.use(helmet());
app.use(cors());

const cacheMiddleware = apicache.middleware;

app.use(
  morgan(`:remote-addr - [:date[web]] ":method :status +:total-time[2]ms :res[content-length]" ":user-agent" - :url`),
);

const router = express.Router();

const Proxy = z.object({
  proxy: z.string(),
});

router.get("/vectortiles", cacheMiddleware(`1 minute`), async (req, res) => {
  const query = Proxy.safeParse(req.query);

  if (!query.success) {
    res.status(422).send(query.error);
    return;
  }

  try {
    const response = await axios.get(`http://localhost:7800${query.data.proxy}`, { headers: req.headers });
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use("/", router);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
