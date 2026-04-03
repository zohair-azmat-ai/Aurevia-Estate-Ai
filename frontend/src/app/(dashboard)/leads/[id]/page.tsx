import { LeadDetailPage } from "../../../../components/leads/lead-detail-page";

export default function LeadDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  return <LeadDetailPage leadId={params.id} />;
}
