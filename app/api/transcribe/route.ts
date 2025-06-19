import { NextRequest, NextResponse } from 'next/server'
import * as OSS from 'ali-oss'
import Client from '@alicloud/tingwu-20230930'
import * as $OpenApi from '@alicloud/openapi-client'
import { writeFile } from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('audio') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempName = nanoid() + '.mp3'
    const tempPath = path.join('/tmp', tempName)
    await writeFile(tempPath, buffer)

    // 上传到 OSS
    const ossClient = new OSS({
      region: process.env.OSS_REGION!,
      accessKeyId: process.env.ALI_ACCESS_KEY!,
      accessKeySecret: process.env.ALI_SECRET!,
      bucket: process.env.OSS_BUCKET!,
    })
    const result = await ossClient.put(tempName, tempPath)
    const fileUrl = result.url

    // 调用听悟
    const tingwuClient = new Client(
      new $OpenApi.Config({
        accessKeyId: process.env.ALI_ACCESS_KEY!,
        accessKeySecret: process.env.ALI_SECRET!,
      })
    )

    const task = await tingwuClient.submitTask({
      fileUrl,
      serviceCode: 'tingwu',
    })

    return NextResponse.json({ taskId: task.body?.data?.taskId, fileUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 })
  }
}
