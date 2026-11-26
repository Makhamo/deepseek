import Link from 'next/link';
import { Badge, Card, CardBody, CardTitle } from '@uhs/ui';

export default function Page() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Admin Portal</CardTitle>
          <Badge tone="neutral">Advanced</Badge>
        </div>
        <CardBody>
          Full administration backed by the auth database. Manage users, roles, passwords,
          organization membership and permissions. Default admin: <strong>admin@gmail.com</strong> / <strong>password123</strong>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/register" className="block">
          <Card className="h-full transition hover:border-teal-400">
            <CardTitle>Register Member</CardTitle>
            <CardBody>Create doctors, lab techs, pharmacists, nurses, admins or patients with real credentials.</CardBody>
          </Card>
        </Link>

        <Link href="/admin/users" className="block">
          <Card className="h-full transition hover:border-teal-400">
            <CardTitle>Users & Roles</CardTitle>
            <CardBody>View users, change roles, set passwords, and assign organization membership.</CardBody>
          </Card>
        </Link>

        <Card>
          <CardTitle>Auth Controls</CardTitle>
          <CardBody>Role assignment, password reset, organization membership and permission listing are live against the auth database.</CardBody>
        </Card>
      </div>
    </div>
  );
}
