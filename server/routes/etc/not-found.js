/**
 * [404] Not found
 */

export default async (req, res) => {
  res.status(404).json({
    message: 'not found',
  })
}
