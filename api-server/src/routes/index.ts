import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fortuneRouter from "./fortune";
import tarotRouter from "./tarot";
import palmRouter from "./palm";
import horoscopeRouter from "./horoscope";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fortuneRouter);
router.use(tarotRouter);
router.use(palmRouter);
router.use(horoscopeRouter);

export default router;
