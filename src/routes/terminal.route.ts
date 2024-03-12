import {Router} from 'express'
import { add_request_to_queue_terminal } from '../controllers/terminal.controller'

const router = Router();

router.post('/', add_request_to_queue_terminal);

export {router as terminalRouter}