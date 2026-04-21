import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getInboxNotifications } from '@/lib/notifications/inbox';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));

  const notifications = await getInboxNotifications({ userId: session.user.id, page, pageSize });
  return NextResponse.json({ notifications, page, pageSize });
}
