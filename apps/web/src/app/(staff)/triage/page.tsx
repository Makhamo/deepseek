import { Badge, Card, CardBody, CardTitle } from '@uhs/ui';

export default function Page() {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <CardTitle>Triage</CardTitle>
        <Badge tone="neutral">Scaffold</Badge>
      </div>
      <CardBody>AI-assisted triage assessments and acuity.</CardBody>
      <CardBody>
        This workspace is intentionally empty. Its service, contracts and permissions are wired;
        screens and endpoints arrive with the implementation phases.
      </CardBody>
    </Card>
  );
}
