import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const filePath = path.join(process.cwd(), 'deep_object.json');

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Stream the file for efficiency
    const fileStream = fs.createReadStream(filePath);

    // @ts-ignore - ReadableStream/ReadStream compatibility
    return new NextResponse(fileStream, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
