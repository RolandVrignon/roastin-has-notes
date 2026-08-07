import type { ParsedConversation } from "@/domain/report";

export type ParticipantAlias = { sourceName: string; displayName: string };

export class ParticipantAliasError extends Error {}

export function applyParticipantAliases(conversation: ParsedConversation, aliases: ParticipantAlias[]) {
  if (!aliases.length) return conversation;
  const knownNames = new Set(conversation.participants.map(({ name }) => name));
  const names = new Map<string, string>();

  for (const { sourceName, displayName } of aliases) {
    const resolvedName = displayName.trim();
    if (!knownNames.has(sourceName) || names.has(sourceName) || !resolvedName) throw new ParticipantAliasError();
    names.set(sourceName, resolvedName);
  }

  const resolvedNames = conversation.participants.map(({ name }) => names.get(name) ?? name);
  const uniqueNames = new Set(resolvedNames.map((name) => name.toLocaleLowerCase("en")));
  if (uniqueNames.size !== resolvedNames.length) throw new ParticipantAliasError();

  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({ ...message, author: names.get(message.author) ?? message.author })),
    participants: conversation.participants.map((participant) => ({ ...participant, name: names.get(participant.name) ?? participant.name })),
  };
}
