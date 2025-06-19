export default async function handler(req, res) {
  const body = {
    grant_type: 'client_credentials',
    client_id: process.env.LTAI5tFtKSmMHVPR3StYWK1b,
    client_secret: process.env.Rm9MV8KDWh0RMwsVvyCX1LKq2maxXM
  }

  const resp = await fetch('https://nls-meta.cn-shanghai.aliyuncs.com/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await resp.json()
  res.status(200).json(data)
}
