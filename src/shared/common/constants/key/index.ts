/**
 * Chave legada utilizada apenas para migração
 * de notificações antigas de chat direto.
 */
const LEGACY_PENDING_DIRECT_CHAT_STORAGE_KEY = "@fitmap:pending_direct_chat_push";

const PENDING_PUSH_NAVIGATION_STORAGE_KEY = "@fitmap:pending_push_navigation";

const LAST_SYNCED_DEVICE_KEY = "@app:last_synced_device_token";

const KEYS = {
  LEGACY_PENDING_DIRECT_CHAT_STORAGE_KEY,
  PENDING_PUSH_NAVIGATION_STORAGE_KEY,
  LAST_SYNCED_DEVICE_KEY,
};

/**
 * EXPORTS
 */
export { KEYS };
