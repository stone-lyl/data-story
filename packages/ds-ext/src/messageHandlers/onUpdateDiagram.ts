import { MessageHandler } from '../MessageHandler';

export const onUpdateDiagram: MessageHandler = async ({
  event,
  document,
}) => {
  document.update(new TextEncoder().encode(JSON.stringify(event.diagram)));
  await document.save();
};