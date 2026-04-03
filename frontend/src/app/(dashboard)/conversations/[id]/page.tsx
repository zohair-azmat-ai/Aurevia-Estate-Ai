import { ConversationDetailPage } from "../../../../components/conversations/conversation-detail-page";

export default function ConversationRoute({
  params,
}: {
  params: { id: string };
}) {
  return <ConversationDetailPage conversationId={params.id} />;
}
