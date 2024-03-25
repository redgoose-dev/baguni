import { Database } from 'bun:sqlite'

const {} = import.meta.env
const db = new Database(':memory:')
